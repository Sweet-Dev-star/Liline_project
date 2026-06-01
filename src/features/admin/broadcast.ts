import { prisma } from "@/src/lib/db";
import { lineClient } from "@/src/lib/line/client";

export interface BroadcastResult {
  targeted: number;
  sent: number;
  failed: number;
}

/**
 * Send a text broadcast (メルマガ) to active users.
 * - tag = null  -> all active users
 * - tag = "branch:school" etc. -> only active users carrying that tag
 *
 * Uses multicast in batches of 150 (LINE's per-call limit). Blocked users are
 * excluded up front; per-batch failures are counted but don't abort the run.
 */
export async function sendBroadcast(tag: string | null, text: string): Promise<BroadcastResult> {
  const where = tag
    ? { status: "active", tags: { some: { tag } } }
    : { status: "active" };

  const users = await prisma.user.findMany({ where, select: { id: true } });
  const ids = users.map((u) => u.id);

  let sent = 0;
  let failed = 0;
  const BATCH = 150;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    try {
      await lineClient().multicast({ to: batch, messages: [{ type: "text", text }] });
      sent += batch.length;
    } catch (e) {
      failed += batch.length;
      console.warn("[broadcast] batch failed:", (e as Error).message);
    }
  }

  return { targeted: ids.length, sent, failed };
}
