import type { messagingApi } from "@line/bot-sdk";
import { prisma } from "@/src/lib/db";
import { getProfileSafe } from "@/src/lib/line/profile";
import { replyOrPush } from "@/src/lib/line/send";
import { buildGreeting } from "@/src/features/messaging/greeting";

type Message = messagingApi.Message;

/**
 * "Yes" on the re-register prompt: wipe the member's funnel data back to a
 * fresh-subscriber state, notify them, then restart the exact new-subscriber
 * flow (greeting card -> LIFF: main video -> Q3 survey -> branch video -> CTA).
 */
export async function handleReregisterYes(
  userId: string | undefined,
  replyToken?: string
): Promise<void> {
  if (!userId) return;

  const { displayName, pictureUrl } = await getProfileSafe(userId);

  // remove all prior funnel data (children first), then reset the user row so
  // they are indistinguishable from a brand-new subscriber.
  await prisma.scheduledMessage.deleteMany({ where: { userId } });
  await prisma.surveyResponse.deleteMany({ where: { userId } });
  await prisma.userTag.deleteMany({ where: { userId } });
  await prisma.eventLog.deleteMany({ where: { userId } }).catch(() => undefined);
  await prisma.user
    .update({
      where: { id: userId },
      data: { branch: null, status: "active", registeredAt: new Date(), displayName, pictureUrl },
    })
    .catch(() => undefined);

  const notice: Message = {
    type: "text",
    text: "登録情報をリセットしました。\nあらためて、最適なご案内をお送りします。",
  };

  const via = await replyOrPush(userId, replyToken, [notice, ...buildGreeting(displayName)]);
  console.log(`[webhook] reregister(yes): reset + restarted via ${via} (${displayName ?? "unknown"})`);
}
