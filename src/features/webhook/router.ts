import type { WebhookEvent } from "@line/bot-sdk";
import { handleFollow } from "./handlers/follow";
import { handleMessage } from "./handlers/message";
import { handleUnfollow } from "./handlers/unfollow";
import { handlePostback } from "./handlers/postback";

/**
 * Routes a batch of webhook events to their handlers.
 * Each event is isolated: one handler throwing never blocks the others.
 * New event types (postback, unfollow, …) get a case here as features grow.
 */
export async function routeEvents(events: WebhookEvent[]): Promise<void> {
  await Promise.all(events.map((e) => routeOne(e).catch((err) => console.error("[webhook] handler error:", err))));
}

async function routeOne(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case "follow":
      return handleFollow(event);
    case "unfollow":
      return handleUnfollow(event);
    case "message":
      return handleMessage(event);
    case "postback":
      return handlePostback(event);
    default:
      console.log(`[webhook] unhandled event type: ${event.type}`);
  }
}
