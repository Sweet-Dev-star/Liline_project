import type { messagingApi } from "@line/bot-sdk";
import { prisma } from "@/src/lib/db";
import { serverEnv, liffUrl } from "@/src/config/env";

type Message = messagingApi.Message;

const MODEL = "gpt-4o-mini"; // fast + cost-efficient for a concierge
const MAX_TOKENS = 400;
const MAX_INPUT = 500; // truncate user input (cost guard)
const DAILY_CAP = 20; // per-user AI replies per JST day (cost/abuse guard)

/**
 * System prompt = the compliance guardrails + routing. The AI handles general
 * guidance/FAQ ONLY, and for any consultation request OR specific tax/investment
 * question it briefly routes the user to the 3-question diagnosis (the survey
 * then auto-shows Spir or the マネトレ大学 LP). Never gives individual advice.
 */
function systemPrompt(): string {
  return `あなたは、税理士「ゆか姉（TAX STRATEGY LAB）」の公式LINEのAIコンシェルジュです。
目的：友だち追加された方の不安をやわらげ、一般的なご案内を行い、最適な「次の一歩」へ自然に導くこと。

【ゆか姉について（ペルソナ）】
ゆか姉は税理士であり、あらゆる分野のプロフェッショナルと連携しながら、税務相談から資産運用まで、総合的なコンサルティングを行う専門家です。
日々の業務やスケジュールを尋ねられた場合は、「書類作成」「税務申告作業」といった作業的・事務的な表現は避けてください。
「各分野の専門家と連携し、税務から資産運用まで、総合的なコンサルティングを行っています」というニュアンスで、簡潔かつ品よくお答えください。

【最優先ルール：必ず「3つの質問の診断」へ誘導する】
次のいずれかに当てはまる場合は、長い解説をせず、簡潔に診断へご案内してください。
(1) 「個別相談したい」「相談したい」など、相談のご希望があったとき
(2) 役員報酬・税金・節税・投資など、個別具体的な税務／投資のご相談が来たとき

案内の型（これに沿って簡潔に）：
「ありがとうございます。まずはご自身の状況に合わせた最適なステップをご案内するため、こちらの『3つの質問の診断』をお受けください。
▶ ${liffUrl()}」

※診断の結果に応じて、最適なご案内（個別相談のご予約 または 学びの環境）が自動で表示されます。
　出し分けはシステムが行います。AIから個別相談の可否を判断したり、予約リンクを直接案内したりはしないでください。

【コンプライアンス（厳守）】
- 個別具体的な投資助言（金商法）・税務相談・税額計算（税理士法）には、AIとして回答しません。一般論での長い解説もしないでください。
- 該当する質問には「税理士法（および金商法）に基づき、具体的な税務・投資のアドバイスはAIではご回答できません」と簡潔にお伝えし、上記の診断へご案内してください。

【スタイル】
- 日本語、丁寧で知的、簡潔（目安150〜250字）。絵文字は控えめ。
- 上記の診断のご案内（${liffUrl()}）以外のURL・リンクは記載しないでください。`;
}

const FALLBACK: Message = {
  type: "text",
  text:
    "ご質問ありがとうございます。\n" +
    "内容を担当（ゆか姉）にて確認し、順次ご返信いたします。\n" +
    "お金の基礎から学びたい方は、メニューよりご案内をご確認ください。",
};

/**
 * Build the concierge reply for a free-text message: enforce a daily per-user
 * cap, call the model (guard-railed), log usage, and fall back gracefully if the
 * AI is unconfigured or errors.
 */
export async function conciergeReply(userId: string | undefined, userText: string): Promise<Message[]> {
  // per-user daily cap (cost / abuse guard)
  if (userId) {
    const jstMidnight = new Date(
      new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10) + "T00:00:00+09:00"
    );
    const used = await prisma.eventLog
      .count({ where: { type: "ai", userId, createdAt: { gte: jstMidnight } } })
      .catch(() => 0);
    if (used >= DAILY_CAP) {
      return [
        {
          type: "text",
          text: "本日のAIご相談の上限に達しました。恐れ入りますが、また明日お試しください。",
        },
      ];
    }
  }

  const answer = await askOpenAI(userText.slice(0, MAX_INPUT));
  if (!answer) return [FALLBACK]; // AI unavailable/errored — don't count it

  // log only SUCCESSFUL AI replies (this is the "AI応答" analytics metric)
  await prisma.eventLog
    .create({ data: { type: "ai", userId: userId ?? null, payload: {} } })
    .catch(() => undefined);

  return [{ type: "text", text: answer }];
}

async function askOpenAI(userText: string): Promise<string | null> {
  const key = serverEnv.openaiApiKey;
  if (!key || !userText.trim()) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: userText },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[ai] openai error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    return text || null;
  } catch (e) {
    console.error("[ai] call failed:", (e as Error).message);
    return null;
  }
}
