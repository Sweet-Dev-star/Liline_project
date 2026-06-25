import { prisma } from "@/src/lib/db";
import { lineClient } from "@/src/lib/line/client";
import { buildStepMessages } from "./scenarios";

export interface DispatchResult {
  due: number;
  sent: number;
  failed: number;
}

/**
 * Send all due drip messages. Called by the cron endpoint.
 * Each row is claimed atomically (pending -> sending) so concurrent/overlapping
 * cron runs can never double-send the same message.
 */
export async function dispatchDue(limit = 100): Promise<DispatchResult> {
  const now = new Date();
  const due = await prisma.scheduledMessage.findMany({
    where: { status: "pending", scheduledAt: { lte: now } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  let sent = 0;
  let failed = 0;

  for (const sm of due) {
    // atomic claim
    const claim = await prisma.scheduledMessage.updateMany({
      where: { id: sm.id, status: "pending" },
      data: { status: "sending" },
    });
    if (claim.count !== 1) continue; // another run grabbed it

    const messages = buildStepMessages(sm.branch, sm.step);
    if (messages.length === 0) {
      await prisma.scheduledMessage.update({ where: { id: sm.id }, data: { status: "failed" } });
      failed++;
      continue;
    }

    try {
      await lineClient().pushMessage({ to: sm.userId, messages });
      await prisma.scheduledMessage.update({
        where: { id: sm.id },
        data: { status: "sent", sentAt: new Date() },
      });
      sent++;
      console.log(`[dispatch] sent ${sm.branch} step${sm.step} -> ${sm.userId}`);
    } catch (e) {
      await prisma.scheduledMessage.update({ where: { id: sm.id }, data: { status: "failed" } });
      failed++;
      console.warn(`[dispatch] failed id=${sm.id}:`, (e as Error).message);
    }
  }

  return { due: due.length, sent, failed };
}
