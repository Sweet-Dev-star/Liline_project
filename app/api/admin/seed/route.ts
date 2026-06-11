import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEMO seed: populate the funnel with realistic mock data for 2026-05-10..06-09
 * so the dashboard looks populated when shown to the client.
 * Guarded by CRON_SECRET + confirm=yes. Seed rows are identifiable (Useed_ ids,
 * payload.seed) and are cleared by the normal pre-launch DB reset.
 * POST /api/admin/seed?secret=<CRON_SECRET>&confirm=yes
 */
const ASSETS_FOR = {
  consultation: { assets: "over_300m", income: "over_2000", consult: "yes" },
  school: { assets: "m100_300m", income: "m1000_2000", consult: "yes" },
  nurture: { assets: "under_100m", income: "under_1000", consult: "no" },
} as const;

const SEI = ["田中","佐藤","鈴木","高橋","伊藤","渡辺","山本","中村","小林","加藤","吉田","山田","松本","井上","木村","林","清水","山口","森","池田"];
const MEI = ["翔太","美咲","健一","由美","大輔","彩","拓也","愛","直樹","真理","和也","美穂","隆志","裕子","誠","奈々","健太","沙織","駿","結衣"];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: readonly T[]): T => a[rand(a.length)]!;
const at = (ymd: string, h: number, m: number) =>
  new Date(`${ymd}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+09:00`);

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (serverEnv.cronSecret && url.searchParams.get("secret") !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (url.searchParams.get("confirm") !== "yes") {
    return NextResponse.json({ error: "missing confirm=yes" }, { status: 400 });
  }

  // JST day list 2026-05-10 .. 2026-06-09 (31 days)
  const start = new Date("2026-05-10T00:00:00+09:00");
  const days: string[] = [];
  for (let i = 0; i < 31; i++) {
    days.push(new Date(start.getTime() + i * 86400000 + 9 * 3600000).toISOString().slice(0, 10));
  }

  const users: Prisma.UserCreateManyInput[] = [];
  const surveys: Prisma.SurveyResponseCreateManyInput[] = [];
  const events: Prisma.EventLogCreateManyInput[] = [];
  let uc = 0;

  days.forEach((ymd, idx) => {
    const adds = 5 + Math.round(idx * 0.45) + rand(5); // gentle upward trend
    for (let j = 0; j < adds; j++) {
      const t = at(ymd, 9 + rand(12), rand(60));
      const id = `Useed_${ymd}_${uc++}`;
      const blocked = Math.random() < 0.07;

      let branch: string | null = null;
      if (Math.random() < 0.72) {
        const r = Math.random();
        branch = r < 0.05 ? "consultation" : r < 0.62 ? "school" : "nurture";
        const a = ASSETS_FOR[branch as keyof typeof ASSETS_FOR];
        const st = new Date(t.getTime() + 5 * 60000);
        surveys.push({ userId: id, assets: a.assets, income: a.income, stance: a.consult, branch, createdAt: st });
        if (branch === "consultation" && Math.random() < 0.7) {
          events.push({ type: "click_consult", payload: { seed: true }, createdAt: new Date(st.getTime() + 3 * 60000) });
        }
        if (branch === "school" && Math.random() < 0.45) {
          events.push({ type: Math.random() < 0.6 ? "click_school" : "click_mtu", payload: { seed: true }, createdAt: new Date(st.getTime() + 3 * 60000) });
        }
      }
      users.push({ id, displayName: `${pick(SEI)} ${pick(MEI)}`, status: blocked ? "blocked" : "active", branch, registeredAt: t, updatedAt: t });
    }
    const ai = Math.round(adds * 0.6) + rand(3);
    for (let k = 0; k < ai; k++) {
      events.push({ type: "ai", payload: { seed: true }, createdAt: at(ymd, 9 + rand(12), rand(60)) });
    }
  });

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  await prisma.surveyResponse.createMany({ data: surveys });
  await prisma.eventLog.createMany({ data: events });

  return NextResponse.json({
    ok: true,
    range: `${days[0]}..${days[days.length - 1]}`,
    inserted: { users: users.length, surveys: surveys.length, events: events.length },
  });
}
