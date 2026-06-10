import { NextResponse, unstable_after as after } from "next/server";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { verifyLineSignature } from "@/src/lib/line/signature";
import { routeEvents } from "@/src/features/webhook/router";
import { prisma } from "@/src/lib/db";

// LINE webhook needs the Node runtime (crypto + raw body) and must never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Thin HTTP boundary: verify signature → ACK 200 immediately → process events
 * AFTER the response (via `after`). Processing is deferred because handlers can
 * be slow (AI/OpenAI, LINE API calls); blocking the ACK made LINE's webhook time
 * out. `after()` keeps the function alive to finish the work post-response.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(raw, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw) as WebhookRequestBody;
  console.log("[webhook] received:", body.events.map((e) => e.type).join(",") || "(none)");

  after(async () => {
    try {
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
    } catch (e) {
      console.error("[webhook] processing error:", (e as Error).message);
    }
  });

  return NextResponse.json({ ok: true });
}
