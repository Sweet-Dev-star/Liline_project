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

  const DAYS = 14;
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

  const [
    total, active, blocked, consultation, school, nurture, pending, sent, surveys,
    clkConsult, clkSchool, clkMtu, aiTotal,
    recentUsers, recentSurveys, recentClicks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "blocked" } }),
    prisma.user.count({ where: { branch: "consultation" } }),
    prisma.user.count({ where: { branch: "school" } }),
    prisma.user.count({ where: { branch: "nurture" } }),
    prisma.scheduledMessage.count({ where: { status: "pending" } }),
    prisma.scheduledMessage.count({ where: { status: "sent" } }),
    prisma.surveyResponse.count(),
    prisma.eventLog.count({ where: { type: "click_consult" } }),
    prisma.eventLog.count({ where: { type: "click_school" } }),
    prisma.eventLog.count({ where: { type: "click_mtu" } }),
    prisma.eventLog.count({ where: { type: "ai" } }),
    prisma.user.findMany({ where: { registeredAt: { gte: cutoff } }, select: { registeredAt: true } }),
    prisma.surveyResponse.findMany({ where: { createdAt: { gte: cutoff } }, select: { createdAt: true } }),
    prisma.eventLog.findMany({
      where: { type: { startsWith: "click_" }, createdAt: { gte: cutoff } },
      select: { createdAt: true },
    }),
  ]);

  // group the last 14 days by JST date
  const jstDay = (d: Date) => new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const days: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) days.push(jstDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  const map: Record<string, { date: string; adds: number; surveys: number; clicks: number }> = {};
  for (const d of days) map[d] = { date: d, adds: 0, surveys: 0, clicks: 0 };
  for (const u of recentUsers) { const k = jstDay(u.registeredAt); if (map[k]) map[k].adds++; }
  for (const s of recentSurveys) { const k = jstDay(s.createdAt); if (map[k]) map[k].surveys++; }
  for (const c of recentClicks) { const k = jstDay(c.createdAt); if (map[k]) map[k].clicks++; }
  const daily = days.map((d) => map[d]);

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true },
    take: 100,
  });

  return NextResponse.json({
    stats: { total, active, blocked, consultation, school, nurture, pending, sent, surveys, ai: aiTotal },
    clicks: { consult: clkConsult, school: clkSchool, mtu: clkMtu },
    daily,
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
