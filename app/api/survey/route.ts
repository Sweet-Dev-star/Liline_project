import { NextResponse } from "next/server";
import { decideBranch, ASSET_VALUES, INCOME_VALUES, CONSULT_VALUES } from "@/src/shared/branch";
import type { SurveyInput } from "@/src/shared/branch";
import { verifyLiffIdToken } from "@/src/features/survey/verifyToken";
import { saveSurvey } from "@/src/features/survey/saveSurvey";
import { buildBranchWelcome } from "@/src/features/messaging/branchWelcome";
import { lineClient } from "@/src/lib/line/client";
import { scheduleDrip, cancelPendingDrip } from "@/src/features/scheduler/schedule";
import { prisma } from "@/src/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * STEP 4 — receive survey -> verify token -> branch -> persist + tag -> push
 * the branch-specific welcome. (Drip scheduling is added in Step 5.)
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const { idToken, assets, income, consult } = body as Record<string, string>;
  if (
    typeof idToken !== "string" ||
    !ASSET_VALUES.includes(assets as never) ||
    !INCOME_VALUES.includes(income as never) ||
    !CONSULT_VALUES.includes(consult as never)
  ) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let userId: string;
  try {
    userId = await verifyLiffIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_id_token" }, { status: 401 });
  }

  const input = { assets, income, consult } as SurveyInput;
  const branch = decideBranch(input);

  // From here the user has SUCCESSFULLY completed the survey. Persistence and drip
  // are BEST-EFFORT: a DB outage (e.g. Neon free-tier compute suspended — quota
  // exhausted) must NEVER turn a finished survey into the user-facing error screen,
  // and must NEVER block the branch welcome card (the conversion CTA, DB-free).
  // Same resilience contract as handleFollow (commit 7986149). "Retry from LINE"
  // can't help during an outage anyway — it would just loop on the same error.

  // Was this user already routed? If they re-submit the SAME branch we must NOT
  // push another welcome card or re-fire the drip — that's what produced the
  // "wrong-branch card mixed in" reports (old branch's card lingers in chat).
  // If the DB read fails we can't know the prior branch, so we default to sending
  // the card (branchChanged = true): a possible duplicate card beats no routing.
  let branchChanged = true;
  let persisted = false;
  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { branch: true },
    });
    branchChanged = existing?.branch !== branch;
    console.log(
      `[survey] ${userId} -> ${branch} (${assets}/${income}/consult:${consult}) ` +
        `[was: ${existing?.branch ?? "none"}, changed: ${branchChanged}]`
    );
    await saveSurvey(userId, input, branch);
    persisted = true;
  } catch (e) {
    console.error(
      `[survey] persist failed for ${userId} (${branch}) — routing user anyway:`,
      (e as Error).message
    );
  }

  if (persisted && !branchChanged) {
    // confirmed identical re-submission: response is recorded, but no new card / drip
    console.log(`[survey] branch unchanged for ${userId}; skipping welcome + drip`);
    return NextResponse.json({ ok: true, branch, scheduled: 0, skipped: "branch_unchanged" });
  }

  // branch is new/changed (or unknown due to a DB read failure): push the welcome.
  // The card is DB-free, so it is delivered even while the database is down.
  try {
    await lineClient().pushMessage({ to: userId, messages: buildBranchWelcome(branch) });
  } catch (e) {
    console.warn("[survey] welcome push failed:", (e as Error).message);
  }

  // Drip scheduling is DB-backed -> also best-effort. Clear prior pending drip
  // (incl. other branches), then schedule the new one.
  let scheduled = 0;
  try {
    await cancelPendingDrip(userId);
    scheduled = await scheduleDrip(userId, branch);
    console.log(`[survey] scheduled ${scheduled} drip step(s) for ${userId} (${branch})`);
  } catch (e) {
    console.error(`[survey] drip scheduling failed for ${userId} (${branch}):`, (e as Error).message);
  }

  return NextResponse.json({ ok: true, branch, persisted, scheduled });
}
