import { NextResponse } from "next/server";
import { serverEnv } from "@/src/config/env";
import { sendBroadcast } from "@/src/features/admin/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send a メルマガ broadcast. Bearer-token guarded (CRON_SECRET). */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!serverEnv.cronSecret || token !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const tag = typeof body.tag === "string" && body.tag.trim() ? body.tag.trim() : null;

  const result = await sendBroadcast(tag, body.text);
  return NextResponse.json({ ok: true, ...result });
}
