import type { messagingApi } from "@line/bot-sdk";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";

type Message = messagingApi.Message;

const MODEL = "gpt-4o-mini"; // fast + cost-efficient for a concierge
const MAX_TOKENS = 400;
const MAX_INPUT = 500; // truncate user input (cost guard)
const DAILY_CAP = 20; // per-user AI replies per JST day (cost/abuse guard)

/**
 * System prompt = the compliance guardrails. The AI handles general guidance,
 * FAQ, and triage ONLY — never individualised investment (金商法) or tax (税理士法)
 * advice, which it routes to ゆか姉 (the licensed human).
 */
const SYSTEM = `あなたは、税理士「ゆか姉（TAX STRATEGY LAB）」の公式LINEのAIコンシェルジュです。
目的：友だち追加された方の不安をやわらげ、サービスの一般的なご案内を行い、適切な次の一歩へ自然に導くこと。

【できること】
- サービスや「3つの質問の診断（アンケート）」の説明、よくあるご質問への回答
- お金・資産形成に関する一般的な考え方の説明（教育目的の一般情報）
- ご状況に応じたご案内：基礎から学びたい方には「マネトレ大学」、資産規模が大きく個別相談をご希望の方には診断をご案内

【厳守事項（コンプライアンス）】
- 個別具体的な投資助言（銘柄・売買の推奨、利回りや価格の予測など）は行いません（金商法）。
- 個別具体的な税務相談・税額計算・節税スキームの個別設計は行いません（税理士法）。これらは必ず「ゆか姉（有資格者）」におつなぎする旨を案内します。
- 断定・保証はせず、必要に応じて「これは一般的な情報であり、税務・投資の助言ではありません」と添えます。
- わからないこと・専門的な判断は、正直に「ゆか姉にお繋ぎします」とご案内します。

【スタイル】
- 日本語、丁寧で知的、簡潔（目安200〜300字）。絵文字は控えめ。URLやリンクは記載しない（メニューや診断のご案内は言葉で促す）。
- 最後に、必要に応じて次の一歩（診断、またはマネトレ大学での学び）を一言添えます。`;

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

  // log the interaction (best-effort) — also feeds usage analytics
  await prisma.eventLog
    .create({ data: { type: "ai", userId: userId ?? null, payload: {} } })
    .catch(() => undefined);

  return answer ? [{ type: "text", text: answer }] : [FALLBACK];
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
          { role: "system", content: SYSTEM },
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
