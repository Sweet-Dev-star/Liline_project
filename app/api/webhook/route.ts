import { NextResponse } from "next/server";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { verifyLineSignature } from "@/src/lib/line/signature";
import { routeEvents } from "@/src/features/webhook/router";
import { prisma } from "@/src/lib/db";

// LINE webhook needs the Node runtime (crypto + raw body) and must never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Thin HTTP boundary: verify signature → record events → delegate to the router.
 * NOTE: processing is synchronous (Next 14 has no `after()`); handlers stay fast
 * except the AI text path. LINE doesn't auto-retry (redelivery is off by default)
 * and reply tokens live ~1 min, so AI replies still deliver even if the ACK is a
 * few seconds. (Move to Next 15 `after()` to ACK instantly — post-launch.)
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(raw, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw) as WebhookRequestBody;
  console.log("[webhook] received:", body.events.map((e) => e.type).join(",") || "(none)");

  // durably record every inbound event (verifiable via ?check=events)
  if (body.events.length) {
    await prisma.eventLog
      .createMany({
        data: body.events.map((e) => ({
          type: e.type,
          userId: (e as { source?: { userId?: string } }).source?.userId ?? null,
          payload: JSON.parse(JSON.stringify(e)),
        })),
      })
      .catch((err) => console.error("[webhook] eventlog failed:", (err as Error).message));
  }

  await routeEvents(body.events);

  return NextResponse.json({ ok: true });
}
