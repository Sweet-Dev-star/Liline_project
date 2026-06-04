import type { PostbackEvent } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { faqMessages, aboutMessages, contactMessages } from "@/src/features/messaging/menuResponses";
import { handleReregisterYes } from "./reregister";

/** Handle postback taps (re-register Yes/No, and any rich menu postbacks). */
export async function handlePostback(event: PostbackEvent): Promise<void> {
  const data = event.postback.data;

  // existing member chose to re-register -> wipe data + restart the funnel
  if (data === "action=reregister_yes") {
    return handleReregisterYes(event.source.userId, event.replyToken);
  }
  // "action=reregister_no" is intentionally NOT handled yet (per spec).

  if (!event.replyToken) return;
  let messages;
  if (data === "menu=faq") messages = faqMessages();
  else if (data === "menu=about") messages = aboutMessages();
  else if (data === "menu=contact") messages = contactMessages();
  else return;

  await lineClient().replyMessage({ replyToken: event.replyToken, messages });
}
