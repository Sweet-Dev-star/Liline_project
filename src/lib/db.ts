import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client. In dev, Next.js hot-reload would otherwise spawn
 * many clients and exhaust DB connections — so we cache it on globalThis.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
