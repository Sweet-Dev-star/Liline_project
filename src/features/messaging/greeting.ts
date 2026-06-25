import type { messagingApi } from "@line/bot-sdk";
import { liffUrl } from "@/src/config/env";
import { theme } from "./theme";

type Message = messagingApi.Message;
type FlexComponent = messagingApi.FlexComponent;

/**
 * Greeting sent on `follow`, as a premium Navy/Gold Flex Message.
 * Tone: ゆか姉 / 知的・権威寄り・絵文字控えめ (per client direction).
 * Single gold CTA button opens the LIFF experience.
 */
export function buildGreeting(displayName: string | null): Message[] {
  const name = displayName ?? "はじめまして";

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "24px",
      spacing: "md",
      contents: [
        // brand eyebrow
        {
          type: "text",
          text: "TAX STRATEGY LAB",
          color: theme.gold,
          size: "xs",
          weight: "bold",
          // letter-spacing isn't a flex prop; mimic with wide-ish small caps text
        },
        // gold divider
        { type: "separator", color: theme.gold, margin: "md" },
        // headline
        {
          type: "text",
          text: `${name}さんへ`,
          color: theme.textMutedOnDark,
          size: "sm",
          margin: "lg",
        },
        {
          type: "text",
          text: "ゆか姉からの特別なご案内",
          color: theme.textOnDark,
          size: "xl",
          weight: "bold",
          wrap: true,
          margin: "sm",
        },
        // body copy
        {
          type: "text",
          text:
            "多忙な経営者・資産家の方が、税務と運用の両面で“守りながら増やす”ための、" +
            "2026年・富裕層の資産防衛の最新潮流をご用意しました。",
          color: theme.textMutedOnDark,
          size: "sm",
          wrap: true,
          margin: "lg",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "20px",
      paddingTop: "0px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: theme.gold,
          height: "md",
          action: { type: "uri", label: "こちらをクリック ▶", uri: liffUrl() },
        } as FlexComponent,
      ],
    },
    styles: {
      footer: { backgroundColor: theme.navy },
    },
  };

  return [
    {
      type: "flex",
      altText: "ゆか姉からの特別なご案内が届いています",
      contents: bubble,
    },
  ];
}
