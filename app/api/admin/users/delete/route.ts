import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Delete selected subscribers. Bearer-token guarded (CRON_SECRET).
 * POST /api/admin/users/delete   body: { ids: string[] }
 * Children are removed before the users to satisfy FK constraints.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!serverEnv.cronSecret || token !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids)
    ? (body!.ids as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  if (!ids.length) {
    return NextResponse.json({ error: "no ids provided" }, { status: 400 });
  }

  // delete children before parents (FK), then the users themselves
  await prisma.scheduledMessage.deleteMany({ where: { userId: { in: ids } } });
  await prisma.surveyResponse.deleteMany({ where: { userId: { in: ids } } });
  await prisma.userTag.deleteMany({ where: { userId: { in: ids } } });
  await prisma.eventLog.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
  const deleted = await prisma.user.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ ok: true, deleted: deleted.count });
}
