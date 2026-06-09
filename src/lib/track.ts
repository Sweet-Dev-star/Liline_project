import { serverEnv } from "@/src/config/env";

/**
 * Conversion link targets. Each resolves to the real destination URL.
 * Buttons point at /api/go?to=<target> so we can COUNT clicks (the conversion
 * stage of the funnel) before redirecting the user to the real link.
 */
const TARGETS: Record<string, () => string> = {
  consult: () => serverEnv.consultBookingUrl, // Spir 個別相談
  school: () => serverEnv.schoolLinkUrl, // マネトレ大学 (leadmail welcome)
  mtu: () => serverEnv.schoolSiteUrl, // マネトレ大学 公式サイト (day-3)
};

/** Build a click-tracked URL (redirects via /api/go). Falls back to the direct
 *  URL if no public base is configured. */
export function conversionUrl(target: keyof typeof TARGETS): string {
  const direct = TARGETS[target]?.() || "https://example.com";
  const base = serverEnv.publicBaseUrl;
  if (!base || !/^https:\/\//.test(base)) return direct;
  return `${base}/api/go?to=${encodeURIComponent(String(target))}`;
}

/** The bridge LP (trust page) URL; falls back to the tracked school link. */
export function recommendUrl(): string {
  const base = serverEnv.publicBaseUrl;
  return base && /^https:\/\//.test(base) ? `${base}/recommend` : conversionUrl("school");
}

/** Resolve a target key to its real destination URL (used by /api/go). */
export function resolveTarget(target: string): string | null {
  const fn = TARGETS[target];
  const url = fn?.();
  return url && /^https?:\/\//.test(url) ? url : null;
}
