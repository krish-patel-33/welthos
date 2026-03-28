"use server";

import { getUser } from "@/lib/user";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const getGeminiApiKey = () =>
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const RECEIPT_MODEL_CANDIDATES = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro-vision",
];

let discoveredReceiptModels = null;

const isModelNotFoundError = (message) =>
  message.includes("[404 Not Found]") ||
  message.includes("is not found for API version") ||
  message.includes("not supported for generateContent");

const isImageUnsupportedError = (message) =>
  message.includes("image") &&
  (message.includes("not supported") ||
    message.includes("invalid argument") ||
    message.includes("inlineData"));

async function discoverReceiptModels(apiKey) {
  if (discoveredReceiptModels) return discoveredReceiptModels;

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to list Gemini models (${response.status}).`);
  }

  const payload = await response.json();
  const listedModels =
    payload?.models
      ?.filter((model) =>
        model?.supportedGenerationMethods?.includes("generateContent")
      )
      .map((model) => model?.name?.replace(/^models\//, ""))
      .filter(Boolean) || [];

  const prioritizedListedModels = listedModels.sort((a, b) => {
    const score = (name) => {
      const n = name.toLowerCase();
      let s = 0;
      if (n.includes("vision")) s += 4;
      if (n.includes("flash")) s += 3;
      if (n.includes("pro")) s += 2;
      if (n.includes("1.5") || n.includes("2.0") || n.includes("2.5")) s += 1;
      return s;
    };
    return score(b) - score(a);
  });

  discoveredReceiptModels = [
    ...new Set([...RECEIPT_MODEL_CANDIDATES, ...prioritizedListedModels]),
  ];
  return discoveredReceiptModels;
}

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount,
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    // Get request data for Arcjet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId: user.id,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount
        : originalTransaction.amount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt({ base64, mimeType }) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error(
        "Missing Gemini API key. Set GEMINI_API_KEY (or GOOGLE_API_KEY) and restart the server."
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
- Total amount (just the number)
- Date (in ISO format)
- Description or items purchased (brief summary)
- Merchant/store name
- Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

Only respond with valid JSON in this exact format:
{
  "amount": number,
  "date": "ISO date string",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}

If its not a recipt, return an empty object`;

    const modelCandidates = await discoverReceiptModels(apiKey);
    let text = "";
    let modelLookupError = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64,
              mimeType: mimeType,
            },
          },
        ]);

        text = result.response.text();
        break;
      } catch (modelError) {
        const modelErrorMessage = modelError?.message || "";
        if (isModelNotFoundError(modelErrorMessage)) {
          modelLookupError = modelError;
          continue;
        }
        if (isImageUnsupportedError(modelErrorMessage)) {
          modelLookupError = modelError;
          continue;
        }
        throw modelError;
      }
    }

    if (!text) {
      throw new Error(
        `No compatible Gemini model available for receipt scanning. ${modelLookupError?.message || ""}`.trim()
      );
    }

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);

      // Check if empty object (not a receipt)
      if (Object.keys(data).length === 0) {
        throw new Error("This does not appear to be a receipt");
      }

      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString(),
        description: data.description || "",
        category: data.category || "",
        merchantName: data.merchantName || "",
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError, cleanedText);
      throw new Error("Could not extract receipt information. Please try another image.");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);

    const message = error?.message || "";
    if (message.includes("API key not valid")) {
      throw new Error("Your Gemini API key is invalid. Please update it in .env and restart the server.");
    }

    if (message.includes("permission") || message.includes("403")) {
      throw new Error("Gemini API access denied. Verify API key permissions and billing/quota.");
    }

    if (message.includes("No compatible Gemini model available")) {
      throw new Error("Gemini model unavailable for this API key/project. Enable Gemini API and try again.");
    }

    throw new Error(message || "Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
