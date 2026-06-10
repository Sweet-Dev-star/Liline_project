import type { PostbackEvent, messagingApi } from "@line/bot-sdk";
import { lineClient } from "@/src/lib/line/client";
import { replyOrPush } from "@/src/lib/line/send";
import { faqMessages, aboutMessages, contactMessages } from "@/src/features/messaging/menuResponses";
import { handleReregisterYes } from "./reregister";

/** Handle postback taps (re-register Yes/No, and any rich menu postbacks). */
export async function handlePostback(event: PostbackEvent): Promise<void> {
  const data = event.postback.data;

  // existing member chose to re-register -> wipe data + restart the funnel
  if (data === "action=reregister_yes") {
    return handleReregisterYes(event.source.userId, event.replyToken);
  }

  // rich menu「AI CHAT」-> invite the user to type (their next messages hit the AI)
  if (data === "menu=ai") {
    const msg: messagingApi.Message = {
      type: "text",
      text:
        "AI相談へようこそ。\n" +
        "資産形成や当サービスについて、ご質問をそのまま入力してください。AIが一般的なご案内をいたします。\n" +
        "※具体的な税務・投資のご相談は、ゆか姉（税理士）がうけたまわります。",
    };
    await replyOrPush(event.source.userId, event.replyToken, [msg]);
    return;
  }

  // existing member kept their registration -> gentle, reassuring reply
  if (data === "action=reregister_no") {
    const msg: messagingApi.Message = {
      type: "text",
      text:
        "かしこまりました。\n" +
        "引き続き、どうぞよろしくお願いいたします。\n" +
        "ご不明な点やご相談がございましたら、いつでもお気軽にメッセージくださいね。",
    };
    await replyOrPush(event.source.userId, event.replyToken, [msg]);
    return;
  }

  if (!event.replyToken) return;
  let messages;
  if (data === "menu=faq") messages = faqMessages();
  else if (data === "menu=about") messages = aboutMessages();
  else if (data === "menu=contact") messages = contactMessages();
  else return;

  await lineClient().replyMessage({ replyToken: event.replyToken, messages });
}
