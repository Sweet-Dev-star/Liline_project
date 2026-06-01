import type { UnfollowEvent } from "@line/bot-sdk";
import { prisma } from "@/src/lib/db";
import { cancelPendingDrip } from "@/src/features/scheduler/schedule";

/** On block/unfollow: mark the user blocked and cancel their pending drip. */
export async function handleUnfollow(event: UnfollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  await prisma.user
    .update({ where: { id: userId }, data: { status: "blocked" } })
    .catch(() => undefined); // user may not exist yet

  const cancelled = await cancelPendingDrip(userId);
  console.log(`[webhook] unfollow: ${userId} blocked, ${cancelled} drip cancelled`);
}
