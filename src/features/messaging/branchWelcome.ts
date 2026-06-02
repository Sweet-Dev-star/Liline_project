import type { messagingApi } from "@line/bot-sdk";
import type { Branch } from "@/src/shared/branch";
import { serverEnv, publicEnv } from "@/src/config/env";
import { theme } from "./theme";

type Message = messagingApi.Message;
type FlexBubble = messagingApi.FlexBubble;

/**
 * Resolve an asset path to an ABSOLUTE https URL (LINE can't fetch relative
 * paths). Accepts either a full https url or a "/file.mp4" relative path.
 * Returns null when not usable (missing base / placeholder).
 */
function absoluteAsset(pathOrUrl: string): string | null {
  if (!pathOrUrl || /example\.com/.test(pathOrUrl)) return null;
  if (/^https:\/\//.test(pathOrUrl)) return pathOrUrl;
  const base = serverEnv.publicBaseUrl;
  if (!base || !/^https:\/\//.test(base)) return null;
  return base + (pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl);
}

/** A premium navy/gold Flex card with a single CTA button. */
function card(opts: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): Message {
  const bubble: FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: theme.navy,
      paddingAll: "24px",
      contents: [
        { type: "text", text: opts.eyebrow, color: theme.gold, size: "xs", weight: "bold" },
        { type: "separator", color: theme.gold, margin: "md" },
        { type: "text", text: opts.title, color: theme.textOnDark, size: "lg", weight: "bold", wrap: true, margin: "lg" },
        { type: "text", text: opts.body, color: theme.textMutedOnDark, size: "sm", wrap: true, margin: "md" },
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
          action: { type: "uri", label: opts.ctaLabel, uri: opts.ctaUrl },
        },
      ],
    },
  };
  return { type: "flex", altText: opts.title, contents: bubble };
}

/**
 * Branch-specific welcome, pushed right after the survey.
 * IMPORTANT: at the branch divergence each route sends its OWN 補足動画
 * (the supplementary video the client created for that route) — NOT the main
 * video. The video is sent FIRST (so the message order is: 補足動画 → card),
 * because the video is the emotional hook that justifies the CTA below it.
 * Video is sent only when its real https URL is configured (placeholder-safe).
 */
export function buildBranchWelcome(branch: Branch): Message[] {
  if (branch === "ifa") {
    const msgs: Message[] = [];
    maybeVideo(msgs, publicEnv.ifaVideoUrl); // IFA 補足動画 (分岐後) — /ifa.mp4 + /ifa.jpg
    msgs.push(
      card({
        eyebrow: "EXCLUSIVE",
        title: "基準をクリアされた方へ",
        body:
          "資産規模が一定を超えると、“自分で運用する”だけでは守り切れない局面が訪れます。" +
          "Wealth Partner社による全資産の最適化コンサルティングを、限られた方のみにご案内しています。",
        ctaLabel: "Wealth Partnerを見る ▶",
        ctaUrl: serverEnv.ifaSiteUrl || "https://example.com",
      })
    );
    return msgs;
  }

  if (branch === "school") {
    const msgs: Message[] = [];
    maybeVideo(msgs, publicEnv.schoolVideoUrl); // School 補足動画 (分岐後)
    msgs.push(
      card({
        eyebrow: "GATEWAY",
        title: "本物の富裕層を目指すあなたへ",
        body:
          "一流のプライベートバンカーに資産を託せる“本物”になるための登竜門。" +
          "金融機関の『カモ』にならない本質的な教養を、マネトレ大学で体系的に学べます。",
        ctaLabel: "マネトレ大学を見る ▶",
        ctaUrl: serverEnv.schoolSiteUrl || "https://example.com",
      })
    );
    return msgs;
  }

  // nurture
  return [
    {
      type: "text",
      text:
        "ご回答ありがとうございます。\n" +
        "これからの資産形成に役立つ情報を、定期的にお届けしてまいります。" +
        "気になるテーマがあれば、いつでもメッセージでお知らせください。",
    },
  ];
}

/**
 * Append a LINE video message. Builds absolute https URLs for both the mp4 and
 * its poster image (same path, .jpg). Skipped safely if not resolvable.
 */
function maybeVideo(msgs: Message[], path: string) {
  const videoUrl = absoluteAsset(path);
  if (!videoUrl) return;
  const previewUrl = absoluteAsset(path.replace(/\.mp4$/i, ".jpg")) ?? videoUrl;
  msgs.push({ type: "video", originalContentUrl: videoUrl, previewImageUrl: previewUrl });
}
