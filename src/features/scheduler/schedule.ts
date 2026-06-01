import type { Branch } from "@/src/shared/branch";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";
import { SCENARIOS } from "./scenarios";

const TZ_OFFSET_MS = 9 * 60 * 60 * 1000; // JST = UTC+9 (no DST)
const SEND_HOUR_JST = 20;

/**
 * Compute the absolute send time for a step.
 * - test mode: `index*20s + 15s` from now (watch the whole drip in ~1 min)
 * - normal: `delayDays` later, snapped to 20:00 JST
 */
function computeSendAt(delayDays: number, index: number): Date {
  if (serverEnv.dripTestMode) {
    return new Date(Date.now() + (index + 1) * 20_000);
  }
  // "now" in JST
  const nowJst = new Date(Date.now() + TZ_OFFSET_MS);
  const target = new Date(nowJst);
  target.setUTCDate(target.getUTCDate() + delayDays);
  target.setUTCHours(SEND_HOUR_JST, 0, 0, 0);
  // convert that JST wall-clock back to a real UTC instant
  return new Date(target.getTime() - TZ_OFFSET_MS);
}

/**
 * Schedule (or reschedule) a user's full drip for a branch.
 * Idempotent per (user, branch, step) via upsert.
 */
export async function scheduleDrip(userId: string, branch: Branch): Promise<number> {
  const steps = SCENARIOS[branch] ?? [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const sendAt = computeSendAt(s.delayDays, i);
    await prisma.scheduledMessage.upsert({
      where: { userId_branch_step: { userId, branch, step: s.step } },
      update: { scheduledAt: sendAt, status: "pending", sentAt: null },
      create: { userId, branch, step: s.step, scheduledAt: sendAt, status: "pending" },
    });
  }
  return steps.length;
}

/** Cancel a user's remaining pending messages (on resubmit / convert / unfollow). */
export async function cancelPendingDrip(userId: string): Promise<number> {
  const r = await prisma.scheduledMessage.updateMany({
    where: { userId, status: "pending" },
    data: { status: "cancelled" },
  });
  return r.count;
}
