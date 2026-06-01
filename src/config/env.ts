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
  get ifaBookingUrl() {
    return optional("IFA_BOOKING_URL");
  },
  get schoolLinkUrl() {
    return optional("SCHOOL_LINK_URL");
  },
  /** when "1", drip steps are scheduled seconds apart (fast local testing). */
  get dripTestMode() {
    return optional("DRIP_TEST_MODE") === "1";
  },
};

/** Public config (safe to expose to the browser; NEXT_PUBLIC_*). */
export const publicEnv = {
  liffId: optional("NEXT_PUBLIC_LIFF_ID"),
  /** main education video shown in the LIFF background */
  mainVideoUrl: optional("NEXT_PUBLIC_MAIN_VIDEO_URL"),
  /** per-route 補足動画 (supplementary videos) sent at the branch divergence */
  ifaVideoUrl: optional("NEXT_PUBLIC_IFA_VIDEO_URL"),
  schoolVideoUrl: optional("NEXT_PUBLIC_SCHOOL_VIDEO_URL"),
};

/** Build the LIFF deep link the greeting button points to. */
export function liffUrl(): string {
  const id = publicEnv.liffId;
  return id ? `https://liff.line.me/${id}` : "https://example.com/liff-not-configured";
}
