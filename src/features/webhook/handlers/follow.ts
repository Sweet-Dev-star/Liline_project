import type { FollowEvent } from "@line/bot-sdk";
import { replyOrPush } from "@/src/lib/line/send";
import { getProfileSafe } from "@/src/lib/line/profile";
import { buildGreeting } from "@/src/features/messaging/greeting";
import { buildReregisterPrompt } from "@/src/features/messaging/reregister";
import { prisma } from "@/src/lib/db";

/**
 * Handle a friend-add.
 * - Brand-new user: greet with the click-to-LIFF button.
 * - Existing MEMBER (already routed to 個別相談 / School) re-adding: ask whether
 *   to re-register (Yes/No card) instead of greeting again.
 */
export async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  const { displayName, pictureUrl } = userId
    ? await getProfileSafe(userId)
    : { displayName: null, pictureUrl: null };

  // is this an existing member? read BEFORE the upsert (upsert keeps branch)
  const existing = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { branch: true } })
    : null;
  const isMember = existing?.branch === "consultation" || existing?.branch === "school";

  // persist the friend (re-activates if they had blocked before)
  if (userId) {
    await prisma.user.upsert({
      where: { id: userId },
      update: { status: "active", displayName, pictureUrl },
      create: { id: userId, status: "active", displayName, pictureUrl },
    });
  }

  // existing member -> confirm re-registration; otherwise greet as a new friend
  const messages = isMember ? buildReregisterPrompt(displayName) : buildGreeting(displayName);

  // Deliver via PUSH (pass no replyToken) — NOT the follow reply token.
  // On a re-add the follow reply token is unreliable: LINE can return 200 for the
  // reply yet never deliver it, which left the greeting invisible. Push is proven
  // reliable to an active friend, so we use it for this critical first message.
  const via = await replyOrPush(userId, undefined, messages);
  console.log(
    `[webhook] follow: ${isMember ? "reregister-prompt" : "greeted"} via ${via} (${displayName ?? "unknown"})`
  );
}
