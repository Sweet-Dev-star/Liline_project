/**
 * Shared 3-axis funnel types + branch logic. Pure & testable.
 * Used by both the LIFF survey (client) and the survey API (server).
 */
export type AssetBand = "over_100m" | "m1000_5000" | "under_1000";
export type IncomeBand = "over_2000" | "m800_1500" | "under_800";
/** delegate = 時間を守る(任せる) / learn = 見識を持つ(自分で) */
export type Stance = "delegate" | "learn";
export type Branch = "ifa" | "school" | "nurture";

export interface SurveyInput {
  assets: AssetBand;
  income: IncomeBand;
  stance: Stance;
}

export function decideBranch({ assets, income, stance }: SurveyInput): Branch {
  const financiallyTop = assets === "over_100m" && income === "over_2000";
  if (financiallyTop) return stance === "delegate" ? "ifa" : "school";

  const futureWealthy =
    (assets === "m1000_5000" || assets === "over_100m") &&
    (income === "m800_1500" || income === "over_2000");
  if (futureWealthy) return "school";

  return "nurture";
}

export const ASSET_VALUES: AssetBand[] = ["over_100m", "m1000_5000", "under_1000"];
export const INCOME_VALUES: IncomeBand[] = ["over_2000", "m800_1500", "under_800"];
export const STANCE_VALUES: Stance[] = ["delegate", "learn"];
