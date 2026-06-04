import type { messagingApi } from "@line/bot-sdk";
import { theme } from "./theme";

type Message = messagingApi.Message;
type FlexBubble = messagingApi.FlexBubble;

/**
 * Shown when an EXISTING member (already routed to IFA / School) re-adds the
 * account. Asks whether to re-register, with Yes / No postback buttons.
 * - はい  -> data "action=reregister_yes" (wipes data + restarts the funnel)
 * - いいえ -> data "action=reregister_no" (NOT handled yet, by design)
 */
export function buildReregisterPrompt(displayName: string | null): Message[] {
  const name = displayName ?? "お客様";

  const bubble: FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "24px",
      spacing: "md",
      contents: [
        { type: "text", text: "ALREADY REGISTERED", color: theme.gold, size: "xs", weight: "bold" },
        { type: "separator", color: theme.gold, margin: "md" },
        { type: "text", text: `${name}さま`, color: theme.textMutedOnDark, size: "sm", margin: "lg" },
        {
          type: "text",
          text: "すでにスクール／IFAにご登録済みです。",
          color: theme.textOnDark,
          size: "md",
          weight: "bold",
          wrap: true,
          margin: "sm",
        },
        {
          type: "text",
          text: "再登録されますか？\n※再登録すると、これまでのご回答内容はリセットされます。",
          color: theme.textMutedOnDark,
          size: "sm",
          wrap: true,
          margin: "md",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "20px",
      paddingTop: "0px",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          color: theme.gold,
          height: "md",
          action: {
            type: "postback",
            label: "はい（再登録する）",
            data: "action=reregister_yes",
            displayText: "はい（再登録する）",
          },
        },
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "postback",
            label: "いいえ",
            data: "action=reregister_no",
            displayText: "いいえ",
          },
        },
      ],
    },
  };

  return [{ type: "flex", altText: "再登録の確認", contents: bubble }];
}
