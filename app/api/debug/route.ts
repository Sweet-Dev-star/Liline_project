import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

// Local-only inspection endpoint (remove/guard before production).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true, surveys: true, scheduled: true },
    take: 50,
  });
  return NextResponse.json({ count: users.length, users });
}
