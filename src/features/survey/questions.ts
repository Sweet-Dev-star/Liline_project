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
    { value: "over_500m", label: "5億円以上" },
    { value: "m300_500m", label: "3億 〜 5億円" },
    { value: "m100_300m", label: "1億 〜 3億円" },
    { value: "under_100m", label: "1億円未満" },
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

/** Q3 — whether they want a free 1:1 consultation with ゆか姉 (the tax accountant). */
export const Q3_CONSULT: { title: string; options: Option<ConsultWish>[] } = {
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
