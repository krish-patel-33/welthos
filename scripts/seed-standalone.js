// Dummy data seed script
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { subDays } = require("date-fns");
const crypto = require('crypto');

const db = new PrismaClient();

const ACCOUNT_ID = "699bd91ca68f833b384c5109";
const USER_ID = "699bd57aa68f833b384c5108";

const CATEGORIES = {
    INCOME: [
        { name: "salary", range: [5000, 8000] },
        { name: "freelance", range: [1000, 3000] },
        { name: "investments", range: [500, 2000] },
        { name: "other-income", range: [100, 1000] },
    ],
    EXPENSE: [
        { name: "housing", range: [1000, 2000] },
        { name: "transportation", range: [100, 500] },
        { name: "groceries", range: [200, 600] },
        { name: "utilities", range: [100, 300] },
        { name: "entertainment", range: [50, 200] },
        { name: "food", range: [50, 150] },
        { name: "shopping", range: [100, 500] },
        { name: "healthcare", range: [100, 1000] },
        { name: "education", range: [200, 1000] },
        { name: "travel", range: [500, 2000] },
    ],
};

function getRandomAmount(min, max) {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
    const categories = CATEGORIES[type];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const amount = getRandomAmount(category.range[0], category.range[1]);
    return { category: category.name, amount };
}

async function seedTransactions() {
    try {
        const transactions = [];
        let totalBalance = 0;

        for (let i = 90; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < transactionsPerDay; j++) {
                const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
                const { category, amount } = getRandomCategory(type);

                const transaction = {
                    type,
                    amount,
                    description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
                    date,
                    category,
                    status: "COMPLETED",
                    userId: USER_ID,
                    accountId: ACCOUNT_ID,
                    createdAt: date,
                    updatedAt: date,
                };

                totalBalance += type === "INCOME" ? amount : -amount;
                transactions.push(transaction);
            }
        }

        console.log(`Inserting ${transactions.length} transactions...`);

        // Insert transactions in batches and update account balance
        await db.$transaction(async (tx) => {
            // Clear existing transactions
            await tx.transaction.deleteMany({
                where: { accountId: ACCOUNT_ID },
            });

            // Insert new transactions
            await tx.transaction.createMany({
                data: transactions,
            });

            // Update account balance
            await tx.account.update({
                where: { id: ACCOUNT_ID },
                data: { balance: totalBalance },
            });
        });

        console.log(`Successfully seeded ${transactions.length} transactions and updated account balance.`);
        return true;
    } catch (error) {
        console.error("Error seeding transactions:", error);
        return false;
    } finally {
        await db.$disconnect();
    }
}

seedTransactions().then(() => process.exit(0));
