import type { AssetBand, IncomeBand, Stance } from "@/src/shared/branch";

/** Survey question definitions shown in the LIFF app. Q3 is the refined, 富裕層-appropriate values question. */
export interface Option<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

export const Q1_ASSETS: { title: string; options: Option<AssetBand>[] } = {
  title: "現在の金融資産は、どのくらいでしょうか。",
  options: [
    { value: "over_100m", label: "1億円以上" },
    { value: "m1000_5000", label: "1,000万 〜 5,000万円" },
    { value: "under_1000", label: "1,000万円未満" },
  ],
};

export const Q2_INCOME: { title: string; options: Option<IncomeBand>[] } = {
  title: "世帯年収は、どのくらいでしょうか。",
  options: [
    { value: "over_2000", label: "2,000万円以上" },
    { value: "m800_1500", label: "800万 〜 1,500万円" },
    { value: "under_800", label: "800万円未満" },
  ],
};

/** The sophisticated Q3 — values/philosophy framing, not a sales question. */
export const Q3_STANCE: { title: string; options: Option<Stance>[] } = {
  title: "資産運用において、最も大切にされている価値観は。",
  options: [
    {
      value: "delegate",
      label: "時間という、最も希少な資産を守る",
      sub: "信頼できる専門家に託し、本業と人生の質に集中する",
    },
    {
      value: "learn",
      label: "自らの“見識”を、一生の資産とする",
      sub: "構造を理解し、誰にも左右されない判断軸を持つ",
    },
  ],
};
