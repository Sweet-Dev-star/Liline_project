import type { FollowEvent } from "@line/bot-sdk";
import { replyOrPush } from "@/src/lib/line/send";
import { getProfileSafe } from "@/src/lib/line/profile";
import { buildGreeting } from "@/src/features/messaging/greeting";
import { prisma } from "@/src/lib/db";

/** Handle a friend-add: persist the user, then greet with the click-to-LIFF button. */
export async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  const { displayName, pictureUrl } = userId
    ? await getProfileSafe(userId)
    : { displayName: null, pictureUrl: null };

  // persist the friend (re-activates if they had blocked before)
  if (userId) {
    await prisma.user.upsert({
      where: { id: userId },
      update: { status: "active", displayName, pictureUrl },
      create: { id: userId, status: "active", displayName, pictureUrl },
    });
  }

  const via = await replyOrPush(userId, event.replyToken, buildGreeting(displayName));
  console.log(`[webhook] follow saved + greeted via ${via} (${displayName ?? "unknown"})`);
}
