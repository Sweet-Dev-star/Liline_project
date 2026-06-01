import type { PostbackEvent } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { faqMessages, aboutMessages, contactMessages } from "@/src/features/messaging/menuResponses";

/** Handle rich menu taps (postback data: menu=faq|about|contact). */
export async function handlePostback(event: PostbackEvent): Promise<void> {
  if (!event.replyToken) return;
  const data = event.postback.data;

  let messages;
  if (data === "menu=faq") messages = faqMessages();
  else if (data === "menu=about") messages = aboutMessages();
  else if (data === "menu=contact") messages = contactMessages();
  else return;

  await lineClient().replyMessage({ replyToken: event.replyToken, messages });
}
