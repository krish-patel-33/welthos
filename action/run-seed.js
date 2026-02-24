import { seedTransactions } from "./seed.js";

async function run() {
  console.log("Starting seed...");
  try {
    const result = await seedTransactions();
    console.log("Result:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

run();
