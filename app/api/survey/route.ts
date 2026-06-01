import { NextResponse } from "next/server";
import { decideBranch, ASSET_VALUES, INCOME_VALUES, STANCE_VALUES } from "@/src/shared/branch";
import type { SurveyInput } from "@/src/shared/branch";
import { verifyLiffIdToken } from "@/src/features/survey/verifyToken";
import { saveSurvey } from "@/src/features/survey/saveSurvey";
import { buildBranchWelcome } from "@/src/features/messaging/branchWelcome";
import { lineClient } from "@/src/lib/line/client";
import { scheduleDrip, cancelPendingDrip } from "@/src/features/scheduler/schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * STEP 4 — receive survey -> verify token -> branch -> persist + tag -> push
 * the branch-specific welcome. (Drip scheduling is added in Step 5.)
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const { idToken, assets, income, stance } = body as Record<string, string>;
  if (
    typeof idToken !== "string" ||
    !ASSET_VALUES.includes(assets as never) ||
    !INCOME_VALUES.includes(income as never) ||
    !STANCE_VALUES.includes(stance as never)
  ) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let userId: string;
  try {
    userId = await verifyLiffIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_id_token" }, { status: 401 });
  }

  const input = { assets, income, stance } as SurveyInput;
  const branch = decideBranch(input);
  console.log(`[survey] ${userId} -> ${branch} (${assets}/${income}/${stance})`);

  await saveSurvey(userId, input, branch);

  // resubmit safety: cancel any prior pending drip before (re)scheduling
  await cancelPendingDrip(userId);

  try {
    await lineClient().pushMessage({ to: userId, messages: buildBranchWelcome(branch) });
  } catch (e) {
    console.warn("[survey] welcome push failed:", (e as Error).message);
  }

  const scheduled = await scheduleDrip(userId, branch);
  console.log(`[survey] scheduled ${scheduled} drip step(s) for ${userId} (${branch})`);

  return NextResponse.json({ ok: true, branch, scheduled });
}
