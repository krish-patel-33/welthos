export const db = globalThis.prisma || new (require("@prisma/client").PrismaClient)(); if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
