import type { messagingApi } from "@line/bot-sdk";
import type { Branch } from "@/src/shared/branch";
import { serverEnv } from "@/src/config/env";
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
 * Step delivery per route.
 * consultation: no drip — the booking link is sent once, immediately (by design).
 * School: 3 messages on day 1 / 2 / 3.
 * Nurture: 1 soft follow on day 7.
 * Tone: 知的・権威寄り・絵文字控えめ (per client direction).
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
            "“金融機関のカモ”にならない本質的なお金の教養は、早く身につけるほど効いてきます。"
        ),
      ],
    },
    {
      step: 2,
      delayDays: 2,
      build: () => [
        text(
          "マネトレ大学の代表はゴールドマン・サックス出身。\n" +
            "金融と不動産を融合した、極めて実践的なカリキュラムが特長です。"
        ),
      ],
    },
    {
      step: 3,
      delayDays: 3,
      build: () => [
        ctaCard(
          "GATEWAY",
          "本物の富裕層を目指すあなたへ",
          "資産が1億を超えてから学ぶのでは遅い。今このステージだからこそ、登竜門で基礎を固める価値があります。",
          "マネトレ大学の詳細を見る ▶",
          serverEnv.schoolSiteUrl || "https://example.com"
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
          "その後、資産防衛の状況はいかがでしょうか。\n" +
            "これからの資産形成に役立つ情報をお届けします。気になるテーマがあれば、お気軽にメッセージください。"
        ),
      ],
    },
  ],
};

export function buildStepMessages(branch: string, step: number): Message[] {
  const def = (SCENARIOS[branch as Branch] ?? []).find((s) => s.step === step);
  return def ? def.build() : [];
}
