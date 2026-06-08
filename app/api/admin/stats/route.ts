import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Aggregated stats + recent users for the admin dashboard. Bearer-token guarded. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!serverEnv.cronSecret || token !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [total, active, blocked, consultation, school, nurture, pending, sent, surveys] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "blocked" } }),
    prisma.user.count({ where: { branch: "consultation" } }),
    prisma.user.count({ where: { branch: "school" } }),
    prisma.user.count({ where: { branch: "nurture" } }),
    prisma.scheduledMessage.count({ where: { status: "pending" } }),
    prisma.scheduledMessage.count({ where: { status: "sent" } }),
    prisma.surveyResponse.count(),
  ]);

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true },
    take: 100,
  });

  return NextResponse.json({
    stats: { total, active, blocked, consultation, school, nurture, pending, sent, surveys },
    users: users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      branch: u.branch,
      status: u.status,
      registeredAt: u.registeredAt,
      tags: u.tags.map((t) => t.tag),
    })),
  });
}
