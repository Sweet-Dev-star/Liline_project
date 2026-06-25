import { NextResponse } from "next/server";
import { serverEnv } from "@/src/config/env";
import { dispatchDue } from "@/src/features/scheduler/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron-triggered drip dispatcher. Called every ~1 min by an external cron
 * (cron-job.org / GitHub Actions) or Vercel Cron in production.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` (or ?secret=) so the
 * public endpoint can't be abused to spam sends.
 */
async function handle(req: Request) {
  const secret = serverEnv.cronSecret;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const qs = new URL(req.url).searchParams.get("secret") ?? "";
    if (bearer !== secret && qs !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await dispatchDue();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
