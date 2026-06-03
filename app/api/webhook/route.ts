import { NextResponse } from "next/server";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { verifyLineSignature } from "@/src/lib/line/signature";
import { routeEvents } from "@/src/features/webhook/router";
import { prisma } from "@/src/lib/db";

// LINE webhook needs the Node runtime (crypto + raw body) and must never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Thin HTTP boundary: verify signature → parse → delegate to the router.
 * All business logic lives in src/features/webhook.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(raw, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw) as WebhookRequestBody;
  // log delivered event types so we can see exactly what LINE sends (Netlify function logs)
  console.log("[webhook] received:", body.events.map((e) => e.type).join(",") || "(none)");

  // Durably record every inbound event so delivery can be verified from the
  // browser (?check=events) without digging through function logs.
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
