import type { messagingApi } from "@line/bot-sdk";

type Message = messagingApi.Message;

/** Dev/diagnostic echo reply for free-text messages. */
export function buildEcho(text: string): Message[] {
  return [{ type: "text", text: `受信しました：「${text}」` }];
}
