import { NextResponse } from "next/server";
import type { WebhookRequestBody } from "@line/bot-sdk";
import { verifyLineSignature } from "@/src/lib/line/signature";
import { routeEvents } from "@/src/features/webhook/router";

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
  await routeEvents(body.events);

  return NextResponse.json({ ok: true });
}
