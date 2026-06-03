import type { MessageEvent } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { getProfileSafe } from "@/src/lib/line/profile";
import { buildGreeting } from "@/src/features/messaging/greeting";
import { buildEcho } from "@/src/features/messaging/echo";
import { prisma } from "@/src/lib/db";

/**
 * Handle inbound messages.
 * Dev helper: typing "menu" / "greeting" replays the greeting (so we can
 * re-test the click-to-LIFF button without re-adding the account).
 *
 * Also self-heals user status: a message means the user is active again
 * (unblocking does NOT fire a `follow` event, so we recover status here).
 */
export async function handleMessage(event: MessageEvent): Promise<void> {
  if (event.message.type !== "text" || !event.replyToken) return;

  const userId = event.source.userId;
  if (userId) {
    const { displayName, pictureUrl } = await getProfileSafe(userId);
    await prisma.user
      .upsert({
        where: { id: userId },
        update: { status: "active", displayName, pictureUrl },
        create: { id: userId, status: "active", displayName, pictureUrl },
      })
      .catch((e) => console.warn("[message] upsert failed:", (e as Error).message));
  }

  const text = event.message.text.trim();
  const keyword = text.toLowerCase();

  const messages =
    keyword === "menu" || keyword === "greeting"
      ? buildGreeting(null)
      : buildEcho(text);

  try {
    await lineClient().replyMessage({ replyToken: event.replyToken, messages });
    console.log(`[message] replied (${keyword === "menu" || keyword === "greeting" ? "greeting" : "echo"})`);
  } catch (e) {
    console.error("[message] reply FAILED:", JSON.stringify((e as { originalError?: { response?: { data?: unknown } } })?.originalError?.response?.data ?? (e as Error).message));
  }
}
