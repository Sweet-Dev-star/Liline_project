import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Wipe all funnel data (users, tags, surveys, scheduled, events).
 * DESTRUCTIVE — guarded by CRON_SECRET. Requires ?confirm=yes.
 * POST /api/admin/reset?secret=<CRON_SECRET>&confirm=yes
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = serverEnv.cronSecret;
  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (url.searchParams.get("confirm") !== "yes") {
    return NextResponse.json({ error: "missing confirm=yes" }, { status: 400 });
  }

  // delete children before parents to satisfy FK constraints
  const scheduled = await prisma.scheduledMessage.deleteMany({});
  const surveys = await prisma.surveyResponse.deleteMany({});
  const tags = await prisma.userTag.deleteMany({});
  const events = await prisma.eventLog.deleteMany({}).catch(() => ({ count: 0 }));
  const users = await prisma.user.deleteMany({});

  return NextResponse.json({
    ok: true,
    deleted: {
      scheduled: scheduled.count,
      surveys: surveys.count,
      tags: tags.count,
      events: events.count,
      users: users.count,
    },
  });
}
