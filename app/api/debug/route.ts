import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { lineClient } from "@/src/lib/line/client";
import { serverEnv } from "@/src/config/env";
import { buildGreeting } from "@/src/features/messaging/greeting";

// Diagnostic endpoint — guarded by CRON_SECRET so it isn't public.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // auth: require ?secret=<CRON_SECRET> (reuse the existing secret)
  const secret = serverEnv.cronSecret;
  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (url.searchParams.get("check") === "line") {
    const tok = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
    const fp = tok ? `len=${tok.length} ${tok.slice(0, 4)}...${tok.slice(-4)}` : "(empty)";
    try {
      const info = await lineClient().getBotInfo();
      return NextResponse.json({
        lineToken: "ok",
        fingerprint: fp,
        basicId: info.basicId, // the @xxxx ID — MUST match the OA you added as a friend
        displayName: info.displayName,
        chatMode: info.chatMode, // "chat" = Chat mode ON (intercepts replies!) | "bot" = OK
        markAsReadMode: info.markAsReadMode,
      });
    } catch (e) {
      return NextResponse.json({ lineToken: "FAILED", fingerprint: fp, error: (e as Error).message });
    }
  }

  // Show the most recent inbound webhook events (durably logged). Send "menu"
  // from the phone, then open this: if a fresh "message" event appears, real
  // messages ARE reaching the handler -> the reply side is the problem.
  if (url.searchParams.get("check") === "events") {
    const rows = await prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
    const now = Date.now();
    return NextResponse.json({
      count: rows.length,
      events: rows.map((r) => ({
        type: r.type,
        userId: r.userId,
        at: r.createdAt,
        secondsAgo: Math.round((now - r.createdAt.getTime()) / 1000),
      })),
    });
  }

  // Ask LINE directly: what is the webhook URL set to, is it active, and can
  // LINE reach it right now? This is the truth source for "menu got no reply".
  if (url.searchParams.get("check") === "webhook") {
    const tok = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
    const headers = { Authorization: `Bearer ${tok}` };
    try {
      const epRes = await fetch("https://api.line.me/v2/bot/channel/webhook/endpoint", { headers });
      const endpoint = await epRes.json(); // { endpoint, active }
      const testRes = await fetch("https://api.line.me/v2/bot/channel/webhook/test", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
      });
      const test = await testRes.json(); // { success, statusCode, reason, detail, timestamp }
      const expected = (process.env.PUBLIC_BASE_URL ?? "https://yukatax.netlify.app") + "/api/webhook";
      return NextResponse.json({
        configuredEndpoint: endpoint?.endpoint ?? "(none)",
        active: endpoint?.active ?? null,
        expectedEndpoint: expected,
        urlMatches: endpoint?.endpoint === expected,
        reachTest: test,
      });
    } catch (e) {
      return NextResponse.json({ webhook: "FAILED", error: (e as Error).message });
    }
  }

  // Check the LINE monthly message quota. Free plan = 200 PUSH msgs/month.
  // If consumption >= quota, all push/multicast (drips, branch cards) silently drop.
  if (url.searchParams.get("check") === "quota") {
    const tok = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
    const headers = { Authorization: `Bearer ${tok}` };
    try {
      const [qRes, cRes] = await Promise.all([
        fetch("https://api.line.me/v2/bot/message/quota", { headers }),
        fetch("https://api.line.me/v2/bot/message/quota/consumption", { headers }),
      ]);
      const quota = await qRes.json();
      const consumption = await cRes.json();
      const limit = quota?.value ?? null;
      const used = consumption?.totalUsage ?? null;
      const exhausted =
        quota?.type === "limited" && limit != null && used != null && used >= limit;
      return NextResponse.json({
        plan: quota?.type, // "none" = unlimited (paid), "limited" = capped (free)
        limit,
        used,
        remaining: limit != null && used != null ? limit - used : null,
        exhausted,
      });
    } catch (e) {
      return NextResponse.json({ quota: "FAILED", error: (e as Error).message });
    }
  }

  if (url.searchParams.get("check") === "env") {
    return NextResponse.json({
      mainVideo: process.env.NEXT_PUBLIC_MAIN_VIDEO_URL ?? "(unset)",
      ifaVideo: process.env.NEXT_PUBLIC_IFA_VIDEO_URL ?? "(unset)",
      schoolVideo: process.env.NEXT_PUBLIC_SCHOOL_VIDEO_URL ?? "(unset)",
      publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "(unset)",
      ifaBooking: process.env.IFA_BOOKING_URL ?? "(unset)",
      schoolLink: process.env.SCHOOL_LINK_URL ?? "(unset)",
      ifaSite: process.env.IFA_SITE_URL ?? "(unset)",
      schoolSite: process.env.SCHOOL_SITE_URL ?? "(unset)",
      liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "(unset)",
    });
  }

  // Push the greeting card to the most recent user (or ?to=<userId>) and
  // surface the EXACT LINE API error in the HTTP response — no log digging.
  if (url.searchParams.get("check") === "greeting") {
    const to =
      url.searchParams.get("to") ??
      (await prisma.user.findFirst({ orderBy: { registeredAt: "desc" } }))?.id;
    if (!to) return NextResponse.json({ error: "no user to send to" }, { status: 404 });

    const messages = buildGreeting(null);
    try {
      await lineClient().pushMessage({ to, messages });
      return NextResponse.json({ greeting: "SENT", to, liffUri: (messages[0] as { contents?: { footer?: { contents?: Array<{ action?: { uri?: string } }> } } }).contents?.footer?.contents?.[0]?.action?.uri });
    } catch (e) {
      const err = e as { originalError?: { response?: { data?: unknown } }; statusCode?: number };
      return NextResponse.json(
        {
          greeting: "FAILED",
          to,
          statusCode: err.statusCode,
          lineError: err.originalError?.response?.data ?? (e as Error).message,
        },
        { status: 200 }
      );
    }
  }

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true, surveys: true, scheduled: true },
    take: 50,
  });
  return NextResponse.json({ count: users.length, users });
}
