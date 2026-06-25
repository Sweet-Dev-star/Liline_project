import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client cached on globalThis.
 *
 * In dev, Next.js hot-reload would otherwise spawn many clients. In serverless
 * (Netlify functions), a warm container reuses this module across invocations,
 * so caching here lets the pooled connection be reused instead of opening a new
 * one every request — which on Neon's free plan leads to "too many connections".
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });

globalForPrisma.prisma = prisma;
