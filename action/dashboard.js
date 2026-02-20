import { db } from "@/lib/prisma";
import { getUser } from "@/lib/user";
import { serializeTransaction } from "@/lib/utils";

export async function getDashboardData() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}


