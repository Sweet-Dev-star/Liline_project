/**
 * Shared funnel types + branch logic. Pure & testable.
 * Used by both the LIFF survey (client) and the survey API (server).
 *
 * MODEL (IFA auto-routing removed for 金商法/税理士法 compliance):
 *  - Q3 is DYNAMIC, decided by isConsultEligible(assets, income):
 *      eligible  -> "個別の無料相談を希望しますか" (yes/no)
 *      otherwise -> "有益な情報を受け取りたいですか" (yes/no)
 *  - Branch:
 *      consultation : eligible AND Q3=yes  -> ゆか姉の予約リンク
 *      school       : NOT eligible AND Q3=yes -> マネトレ大学
 *      nurture      : everyone else
 */
export type AssetBand = "over_300m" | "m100_300m" | "under_100m";
export type IncomeBand = "over_2000" | "m1000_2000" | "under_1000";
/** The Q3 yes/no answer (meaning depends on which Q3 was shown — see model). */
export type ConsultWish = "yes" | "no";
export type Branch = "consultation" | "school" | "nurture";

export interface SurveyInput {
  assets: AssetBand;
  income: IncomeBand;
  consult: ConsultWish;
}

/**
 * Who is OFFERED the consultation (and thus shown the consultation Q3):
 *  - 資産3億円以上 かつ 世帯年収2,000万円以上 のみ対象
 *  - それ以外は対象外（マネトレ大学導線のみ）
 * Used by BOTH the LIFF (to pick Q3) and the API (to interpret the answer),
 * so the two can never disagree.
 */
export function isConsultEligible(assets: AssetBand, income: IncomeBand): boolean {
  return assets === "over_300m" && income === "over_2000";
}

export function decideBranch({ assets, income, consult }: SurveyInput): Branch {
  if (isConsultEligible(assets, income)) {
    // Q3 was the consultation question
    return consult === "yes" ? "consultation" : "nurture";
  }
  // Q3 was the "有益な情報を受け取りたいか" question -> マネトレ大学 or nurture
  return consult === "yes" ? "school" : "nurture";
}

export const ASSET_VALUES: AssetBand[] = ["over_300m", "m100_300m", "under_100m"];
export const INCOME_VALUES: IncomeBand[] = ["over_2000", "m1000_2000", "under_1000"];
export const CONSULT_VALUES: ConsultWish[] = ["yes", "no"];
