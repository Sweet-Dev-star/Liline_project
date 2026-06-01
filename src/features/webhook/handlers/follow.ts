import type { FollowEvent } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { getProfileSafe } from "@/src/lib/line/profile";
import { buildGreeting } from "@/src/features/messaging/greeting";

/** Handle a friend-add: greet with the click-to-LIFF button. */
export async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  const { displayName } = userId
    ? await getProfileSafe(userId)
    : { displayName: null };

  if (event.replyToken) {
    await lineClient().replyMessage({
      replyToken: event.replyToken,
      messages: buildGreeting(displayName),
    });
  }
  console.log(`[webhook] follow handled (${displayName ?? "unknown"})`);
}
