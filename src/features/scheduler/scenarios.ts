import type { messagingApi } from "@line/bot-sdk";
import type { Branch } from "@/src/shared/branch";
import { recommendUrl } from "@/src/lib/track";
import { theme } from "@/src/features/messaging/theme";

type Message = messagingApi.Message;
type FlexBubble = messagingApi.FlexBubble;

/** A single drip step: when to send (days after branch entry) + what to send. */
export interface StepDef {
  step: number;
  delayDays: number;
  build: () => Message[];
}

/** Small navy/gold CTA card reused by the final step of each route. */
function ctaCard(eyebrow: string, title: string, body: string, label: string, url: string): Message {
  const bubble: FlexBubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "20px",
      contents: [
        { type: "text", text: eyebrow, color: theme.gold, size: "xs", weight: "bold" },
        { type: "separator", color: theme.gold, margin: "md" },
        { type: "text", text: title, color: theme.textOnDark, size: "md", weight: "bold", wrap: true, margin: "lg" },
        { type: "text", text: body, color: theme.textMutedOnDark, size: "sm", wrap: true, margin: "md" },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "20px",
      paddingTop: "0px",
      contents: [
        { type: "button", style: "primary", color: theme.gold, height: "md", action: { type: "uri", label, uri: url } },
      ],
    },
  };
  return { type: "flex", altText: title, contents: bubble };
}

const text = (t: string): Message => ({ type: "text", text: t });

/**
 * Step delivery per route. Tone: 知的・権威寄り・絵文字控えめ.
 * consultation: no drip — the booking link is sent once, immediately (by design).
 * School: a 4-step EDUCATION nurture (value → 失敗回避 → authority → CTA), ending
 *         at the bridge LP (処方箋) so マネトレ大学 reads as a recommendation, not an ad.
 * Nurture: a soft follow + one gentle re-engagement toward the same LP.
 */
export const SCENARIOS: Record<Branch, StepDef[]> = {
  consultation: [],

  school: [
    {
      step: 1,
      delayDays: 1,
      build: () => [
        text(
          "昨日はご回答ありがとうございました。\n" +
            "資産を“増やすフェーズ”で最も差がつくのは、実は知識の「順番」です。\n" +
            "高度な節税より先に、ご自身でお金を増やす基礎体力を固めることが、結果的に最短ルートになります。"
        ),
      ],
    },
    {
      step: 2,
      delayDays: 2,
      build: () => [
        text(
          "「金融機関に勧められるまま」では、知らないうちに損をしてしまう——\n" +
            "これは資産形成の初期に、最も多い失敗です。\n" +
            "大切なのは誰かに任せきりにせず、“自分の判断軸”を持つこと。その土台が、お金の基礎リテラシーです。"
        ),
      ],
    },
    {
      step: 3,
      delayDays: 3,
      build: () => [
        text(
          "私が『マネトレ大学』を推薦する理由は、その“本質性”にあります。\n" +
            "代表はゴールドマン・サックス出身。金融と不動産を融合した実践的なカリキュラムで、" +
            "表面的なテクニックではなく、一生使える土台が身につきます。"
        ),
      ],
    },
    {
      step: 4,
      delayDays: 5,
      build: () => [
        ctaCard(
          "RECOMMENDED",
          "次の一歩を、確かなものに",
          "資産拡大フェーズの“今”こそ、基礎を固める価値があります。" +
            "ゆか姉が推奨する学習環境の詳細を、下記よりご確認ください。",
          "ゆか姉の推奨環境を見る ▶",
          recommendUrl()
        ),
      ],
    },
  ],

  nurture: [
    {
      step: 1,
      delayDays: 7,
      build: () => [
        text(
          "その後、資産形成の状況はいかがでしょうか。\n" +
            "これからの資産づくりに役立つ情報を、定期的にお届けしてまいります。" +
            "気になるテーマがあれば、いつでもメッセージでお知らせください。"
        ),
      ],
    },
    {
      step: 2,
      delayDays: 14,
      build: () => [
        ctaCard(
          "FOR YOUR FUTURE",
          "“お金の基礎”から始めませんか",
          "もし「自分の力で資産を増やす力を身につけたい」と感じられたら、" +
            "ゆか姉が推奨する学習環境を、一度のぞいてみてください。",
          "推奨環境を見てみる ▶",
          recommendUrl()
        ),
      ],
    },
  ],
};

export function buildStepMessages(branch: string, step: number): Message[] {
  const def = (SCENARIOS[branch as Branch] ?? []).find((s) => s.step === step);
  return def ? def.build() : [];
}
