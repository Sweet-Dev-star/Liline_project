import type { MessageEvent } from "@line/bot-sdk";
import { replyOrPush } from "@/src/lib/line/send";
import { getProfileSafe } from "@/src/lib/line/profile";
import { buildGreeting } from "@/src/features/messaging/greeting";
import { conciergeReply } from "@/src/features/ai/concierge";
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

  // "menu"/"greeting" replays the greeting; any other text → AI concierge.
  if (keyword === "menu" || keyword === "greeting") {
    const via = await replyOrPush(userId, event.replyToken, buildGreeting(null));
    console.log(`[message] greeting delivered via ${via}`);
    return;
  }

  const messages = await conciergeReply(userId, text);
  const via = await replyOrPush(userId, event.replyToken, messages);
  console.log(`[message] concierge delivered via ${via}`);
}
