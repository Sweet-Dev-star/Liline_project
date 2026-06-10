/**
 * Centralized, validated environment access.
 * Every other module reads config from here — never from process.env directly.
 * Server-only secrets are read lazily so client bundles never touch them.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

/** Server-side secrets (LINE, DB, cron). Throw if accessed without being set. */
export const serverEnv = {
  /** public https base used to build ABSOLUTE asset URLs for LINE messages */
  get publicBaseUrl() {
    return optional("PUBLIC_BASE_URL").replace(/\/$/, "");
  },
  get lineChannelAccessToken() {
    return required("LINE_CHANNEL_ACCESS_TOKEN");
  },
  get lineChannelSecret() {
    return required("LINE_CHANNEL_SECRET");
  },
  get liffChannelId() {
    return optional("LIFF_CHANNEL_ID");
  },
  get databaseUrl() {
    return optional("DATABASE_URL");
  },
  get cronSecret() {
    return optional("CRON_SECRET");
  },
  /** OpenAI API key for the AI concierge (optional — empty = AI disabled).
   *  Falls back to the ANTHROPIC_API_KEY slot so an existing key keeps working. */
  get openaiApiKey() {
    return optional("OPENAI_API_KEY") || optional("ANTHROPIC_API_KEY");
  },
  /** ゆか姉's scheduling tool (Spir) link, sent to qualified consultation leads.
   *  Defaults to the live Spir link; CONSULT_BOOKING_URL env overrides if set. */
  get consultBookingUrl() {
    return optional(
      "CONSULT_BOOKING_URL",
      "https://app.spirinc.com/t/zrHOxA9DtsuHRyCGFk6cc/as/ShQiSQQH2n1XaY0qGc5nO/confirm"
    );
  },
  /** School (マネトレ大学) conversion endpoints — unchanged */
  get schoolLinkUrl() {
    return optional("SCHOOL_LINK_URL");
  },
  get schoolSiteUrl() {
    return optional("SCHOOL_SITE_URL");
  },
  /** when "1", drip steps are scheduled seconds apart (fast local testing). */
  get dripTestMode() {
    return optional("DRIP_TEST_MODE") === "1";
  },
};

/** Public config (safe to expose to the browser; NEXT_PUBLIC_*). */
export const publicEnv = {
  liffId: optional("NEXT_PUBLIC_LIFF_ID"),
  /** main education video shown/played in the LIFF intro */
  mainVideoUrl: optional("NEXT_PUBLIC_MAIN_VIDEO_URL"),
  /** School 補足動画 (supplementary video) sent at the School branch */
  schoolVideoUrl: optional("NEXT_PUBLIC_SCHOOL_VIDEO_URL"),
};

/** Build the LIFF deep link the greeting button points to. */
export function liffUrl(): string {
  const id = publicEnv.liffId;
  return id ? `https://liff.line.me/${id}` : "https://example.com/liff-not-configured";
}
