import type { messagingApi } from "@line/bot-sdk";
import { liffUrl } from "@/src/config/env";
import { theme } from "./theme";

type Message = messagingApi.Message;

/** Responses for the rich menu taps (FAQ / ABOUT / CONTACT). Tone: 知的・丁寧. */

export function faqMessages(): Message[] {
  return [
    {
      type: "flex",
      altText: "よくある質問",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          backgroundColor: theme.navy,
          paddingAll: "24px",
          spacing: "md",
          contents: [
            { type: "text", text: "FAQ｜よくある質問", color: theme.gold, size: "sm", weight: "bold" },
            { type: "separator", color: theme.gold, margin: "md" },
            qa("Q. 相談は無料ですか？", "A. はい。まずは3つの質問で最適なご案内を無料で行っております。"),
            qa("Q. しつこい勧誘はありませんか？", "A. ございません。あなたの状況に合った情報のみをお届けします。"),
            qa("Q. どんな人向けですか？", "A. 多忙な経営者・資産家、そして将来の富裕層を目指す方向けです。"),
          ],
        },
        footer: footerButton("3つの質問に答える", liffUrl()),
      },
    },
  ];
}

export function aboutMessages(): Message[] {
  return [
    {
      type: "flex",
      altText: "運営者について",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          backgroundColor: theme.navy,
          paddingAll: "24px",
          spacing: "md",
          contents: [
            { type: "text", text: "ABOUT｜運営者について", color: theme.gold, size: "sm", weight: "bold" },
            { type: "separator", color: theme.gold, margin: "md" },
            {
              type: "text",
              text: "“ゆか姉” | TAX STRATEGY LAB",
              color: theme.textOnDark,
              size: "lg",
              weight: "bold",
              wrap: true,
              margin: "lg",
            },
            {
              type: "text",
              text:
                "税理士として、多忙な経営者・資産家の方が税務と運用の両面で“守りながら増やす”ための戦略を発信しています。",
              color: theme.textMutedOnDark,
              size: "sm",
              wrap: true,
              margin: "md",
            },
          ],
        },
        footer: footerButton("最適なご案内を受け取る", liffUrl()),
      },
    },
  ];
}

export function contactMessages(): Message[] {
  return [
    {
      type: "text",
      text:
        "お問い合わせありがとうございます。\n" +
        "ご質問・ご相談は、このトークにそのままメッセージをお送りください。担当より順次ご返信いたします。",
    },
  ];
}

// ── helpers ──────────────────────────────────────────────
function qa(q: string, a: string): messagingApi.FlexComponent {
  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    spacing: "xs",
    contents: [
      { type: "text", text: q, color: theme.textOnDark, size: "sm", weight: "bold", wrap: true },
      { type: "text", text: a, color: theme.textMutedOnDark, size: "sm", wrap: true },
    ],
  };
}

function footerButton(label: string, uri: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: theme.navy,
    paddingAll: "20px",
    paddingTop: "0px",
    contents: [
      { type: "button", style: "primary", color: theme.gold, height: "md", action: { type: "uri", label, uri } },
    ],
  };
}
