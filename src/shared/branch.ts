/**
 * Shared funnel types + branch logic. Pure & testable.
 * Used by both the LIFF survey (client) and the survey API (server).
 *
 * NEW MODEL (IFA auto-routing removed for 金商法/税理士法 compliance):
 *   - consultation: ultra-wealthy (≥ threshold) who WANT a free tax consultation
 *                   -> auto-send ゆか姉's scheduling link. No auto IFA referral.
 *   - school:       aspiring / future-wealthy with solid income -> マネトレ大学
 *   - nurture:      everyone else
 */
export type AssetBand = "over_500m" | "m300_500m" | "m100_300m" | "under_100m";
export type IncomeBand = "over_2000" | "m800_1500" | "under_800";
/** Whether the respondent wants a free 1:1 consultation with the tax accountant. */
export type ConsultWish = "yes" | "no";
export type Branch = "consultation" | "school" | "nurture";

export interface SurveyInput {
  assets: AssetBand;
  income: IncomeBand;
  consult: ConsultWish;
}

/** Asset tiers ranked high→low, for the (configurable) consultation threshold. */
const ASSET_RANK: Record<AssetBand, number> = {
  over_500m: 4, // 5億円以上
  m300_500m: 3, // 3億〜5億円
  m100_300m: 2, // 1億〜3億円
  under_100m: 1, // 1億円未満
};

/**
 * Minimum asset rank required to qualify for the consultation.
 * "500m" => 5億円以上 (default). "300m" => 3億円以上 (the client's possible future
 * widening — a pure env change, no code/redeploy of logic needed).
 */
function thresholdRank(threshold: string): number {
  return threshold === "300m" ? 3 : 4;
}

export function decideBranch(
  { assets, income, consult }: SurveyInput,
  assetThreshold = "500m"
): Branch {
  const meetsThreshold = ASSET_RANK[assets] >= thresholdRank(assetThreshold);

  // ultra-wealthy who explicitly want the free consultation -> scheduling link
  if (meetsThreshold && consult === "yes") return "consultation";

  // aspiring / future-wealthy (not yet ultra) with solid income -> マネトレ大学
  const earning = income === "over_2000" || income === "m800_1500";
  const notUltra = assets === "m100_300m" || assets === "under_100m";
  if (earning && notUltra) return "school";

  return "nurture";
}

export const ASSET_VALUES: AssetBand[] = ["over_500m", "m300_500m", "m100_300m", "under_100m"];
export const INCOME_VALUES: IncomeBand[] = ["over_2000", "m800_1500", "under_800"];
export const CONSULT_VALUES: ConsultWish[] = ["yes", "no"];
