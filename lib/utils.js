import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance !== undefined) {
    serialized.balance = typeof obj.balance.toNumber === "function" ? obj.balance.toNumber() : Number(obj.balance);
  }

  if (obj.amount !== undefined) {
    serialized.amount = typeof obj.amount.toNumber === "function" ? obj.amount.toNumber() : Number(obj.amount);
  }

  return serialized;
};
