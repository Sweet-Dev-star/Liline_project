import type { messagingApi } from "@line/bot-sdk";
import { lineClient } from "./client";

type Message = messagingApi.Message;

function lineErr(e: unknown): string {
  const err = e as { originalError?: { response?: { data?: unknown } } };
  return JSON.stringify(err?.originalError?.response?.data ?? (e as Error).message);
}

/**
 * Deliver messages robustly.
 *
 * Prefers the (free, unlimited) reply token, but the reply token is fragile:
 * it is single-use and can be consumed by LINE's own auto-responder
 * (応答メッセージ) before our webhook runs, or expire. When the reply fails we
 * fall back to a push so the user still receives the message.
 *
 * Returns how the message was delivered (for logging / diagnostics).
 */
export async function replyOrPush(
  userId: string | undefined,
  replyToken: string | undefined,
  messages: Message[]
): Promise<"reply" | "push" | "failed"> {
  // 1) try reply first (free, doesn't consume the monthly push quota)
  if (replyToken) {
    try {
      await lineClient().replyMessage({ replyToken, messages });
      return "reply";
    } catch (e) {
      console.warn("[send] reply failed, falling back to push:", lineErr(e));
    }
  }

  // 2) fall back to push (requires the userId)
  if (userId) {
    try {
      await lineClient().pushMessage({ to: userId, messages });
      return "push";
    } catch (e) {
      console.error("[send] push FAILED:", lineErr(e));
      return "failed";
    }
  }

  console.error("[send] no replyToken succeeded and no userId for push fallback");
  return "failed";
}
