import type { AssetBand, IncomeBand, ConsultWish } from "@/src/shared/branch";

/** Survey question definitions shown in the LIFF app. */
export interface Option<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

export const Q1_ASSETS: { title: string; options: Option<AssetBand>[] } = {
  title: "現在の金融資産は、どのくらいでしょうか。",
  options: [
    { value: "over_300m", label: "3億円以上" },
    { value: "m100_300m", label: "1億 〜 3億円未満" },
    { value: "under_100m", label: "1億円未満" },
  ],
};

export const Q2_INCOME: { title: string; options: Option<IncomeBand>[] } = {
  title: "世帯年収は、どのくらいでしょうか。",
  options: [
    { value: "over_2000", label: "2,000万円以上" },
    { value: "m1000_2000", label: "1,000万 〜 2,000万円未満" },
    { value: "under_1000", label: "1,000万円未満" },
  ],
};

/** Q3 question shape — an optional `lead` paragraph (診断結果＋処方箋) + title + options. */
type Q3 = { lead?: string; title: string; options: Option<ConsultWish>[] };

/**
 * Q3 — shown to consultation-eligible respondents (資産3億円以上 かつ 年収2,000万円以上).
 * Whether they want a free 1:1 consultation with ゆか姉 (the tax accountant).
 */
export const Q3_CONSULT: Q3 = {
  title: "税理士・ゆか姉による「個別の無料相談」をご希望されますか。",
  options: [
    {
      value: "yes",
      label: "はい、個別に相談したい",
      sub: "資産・税務の最適化について、専門家と直接話したい",
    },
    {
      value: "no",
      label: "いいえ、まずは情報を受け取りたい",
      sub: "今は有益な情報の受け取りを希望する",
    },
  ],
};

/**
 * Q3 (alternate) — shown to everyone NOT consultation-eligible.
 * Framed as a "診断結果＋専門家からの処方箋" so マネトレ大学 reads as a recommendation,
 * not an affiliate pitch.
 */
export const Q3_INFO: Q3 = {
  lead:
    "ご回答ありがとうございます！\n" +
    "診断の結果、あなたは今【資産拡大フェーズ】にあります。\n\n" +
    "「資産管理法人を使った高度な税務スキーム」を構築する前に、まずは“ご自身の力で資産を増やす、投資・運用の基礎体力”を身につけることが最優先です。\n\n" +
    "私自身は現在、個別コンサルティングをお受けしておりませんが、これから資産を築く方へ、最も体系的におすすめできる学習環境として、ゴールドマン・サックス出身の代表が立ち上げた『マネトレ大学』を強く推奨しています。",
  title: "ゆか姉推奨の環境で、まずは投資の基礎を固める詳細を確認しますか？",
  options: [
    { value: "yes", label: "はい、推奨環境で基礎を固める" },
    { value: "no", label: "いいえ、今は現状維持でよい" },
  ],
};
