import { NextResponse } from "next/server";
import { serverEnv } from "@/src/config/env";
import { setupRichMenu } from "@/src/features/richmenu/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-time rich menu setup. Guarded by CRON_SECRET.
 * POST (or GET) /api/admin/richmenu?secret=<CRON_SECRET>
 */
async function handle(req: Request) {
  const secret = serverEnv.cronSecret;
  if (secret && new URL(req.url).searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await setupRichMenu();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
