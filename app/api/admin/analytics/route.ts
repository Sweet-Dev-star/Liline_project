import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JST = "+09:00";
const isYmd = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const jstDay = (d: Date) => new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

/**
 * Range analytics for any [from, to] (JST dates, inclusive). Bearer-guarded.
 * GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Single-date view uses from === to. Future dates are clamped to today.
 * Powers both the date-range chart and the single-day records view.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!serverEnv.cronSecret || token !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const today = jstDay(new Date());
  let from = isYmd(params.get("from")) ? params.get("from")! : today;
  let to = isYmd(params.get("to")) ? params.get("to")! : today;
  // no future dates; keep from <= to
  if (from > today) from = today;
  if (to > today) to = today;
  if (from > to) from = to;

  const startUtc = new Date(`${from}T00:00:00.000${JST}`);
  const endUtc = new Date(`${to}T23:59:59.999${JST}`);

  const [adds, surveys, clicks, aiEvents] = await Promise.all([
    prisma.user.findMany({
      where: { registeredAt: { gte: startUtc, lte: endUtc } },
      select: { id: true, displayName: true, branch: true, status: true, registeredAt: true },
      orderBy: { registeredAt: "desc" },
      take: 2000,
    }),
    prisma.surveyResponse.findMany({
      where: { createdAt: { gte: startUtc, lte: endUtc } },
      select: { branch: true, createdAt: true },
      take: 5000,
    }),
    prisma.eventLog.findMany({
      where: { type: { startsWith: "click_" }, createdAt: { gte: startUtc, lte: endUtc } },
      select: { type: true, createdAt: true },
      take: 5000,
    }),
    prisma.eventLog.findMany({
      where: { type: "ai", createdAt: { gte: startUtc, lte: endUtc } },
      select: { createdAt: true },
      take: 5000,
    }),
  ]);

  // build the inclusive day list (cap protects against accidental huge ranges)
  const days: string[] = [];
  let cur = from;
  while (cur <= to && days.length <= 120) {
    days.push(cur);
    cur = jstDay(new Date(new Date(`${cur}T00:00:00${JST}`).getTime() + 86400000));
  }
  const map: Record<string, { date: string; adds: number; surveys: number; clicks: number; ai: number }> = {};
  for (const d of days) map[d] = { date: d, adds: 0, surveys: 0, clicks: 0, ai: 0 };
  for (const u of adds) { const k = jstDay(u.registeredAt); if (map[k]) map[k].adds++; }
  for (const s of surveys) { const k = jstDay(s.createdAt); if (map[k]) map[k].surveys++; }
  for (const c of clicks) { const k = jstDay(c.createdAt); if (map[k]) map[k].clicks++; }
  for (const a of aiEvents) { const k = jstDay(a.createdAt); if (map[k]) map[k].ai++; }
  const daily = days.map((d) => map[d]);

  return NextResponse.json({
    from,
    to,
    daily,
    totals: {
      adds: adds.length,
      surveys: surveys.length,
      consultation: surveys.filter((s) => s.branch === "consultation").length,
      school: surveys.filter((s) => s.branch === "school").length,
      nurture: surveys.filter((s) => s.branch === "nurture").length,
      ai: aiEvents.length,
      clicks: {
        consult: clicks.filter((c) => c.type === "click_consult").length,
        school: clicks.filter((c) => c.type === "click_school").length,
        mtu: clicks.filter((c) => c.type === "click_mtu").length,
      },
    },
    records: adds.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      branch: u.branch,
      status: u.status,
      registeredAt: u.registeredAt,
    })),
  });
}
