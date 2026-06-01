import type { MessageEvent } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { buildGreeting } from "@/src/features/messaging/greeting";
import { buildEcho } from "@/src/features/messaging/echo";

/**
 * Handle inbound messages.
 * Dev helper: typing "menu" / "greeting" replays the greeting (so we can
 * re-test the click-to-LIFF button without re-adding the account).
 */
export async function handleMessage(event: MessageEvent): Promise<void> {
  if (event.message.type !== "text" || !event.replyToken) return;

  const text = event.message.text.trim();
  const keyword = text.toLowerCase();

  const messages =
    keyword === "menu" || keyword === "greeting"
      ? buildGreeting(null)
      : buildEcho(text);

  await lineClient().replyMessage({ replyToken: event.replyToken, messages });
}
