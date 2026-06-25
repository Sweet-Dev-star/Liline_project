import type { Config } from "@netlify/functions";

/**
 * Netlify Scheduled Function — runs every 15 minutes, natively on Netlify
 * (no external cron service needed). It simply calls our own dispatch route,
 * which sends any due drip messages.
 *
 * Why 15 min (not every minute): drip steps fire at fixed times (e.g. 20:00 JST),
 * so minute-precision isn't needed. A per-minute poll keeps the Neon database's
 * compute awake 24/7 and burns the entire free-tier compute quota. At 15-min
 * intervals Neon can scale to zero between runs, keeping usage within free limits.
 * Worst-case delivery delay for a due message is ~15 min, which is fine.
 *
 * URL is built from the deploy's own origin so it works in every context.
 */
export default async function handler() {
  const base = process.env.PUBLIC_BASE_URL || process.env.URL || "https://yukatax.netlify.app";
  const secret = process.env.CRON_SECRET ?? "";
  try {
    const res = await fetch(`${base}/api/cron/dispatch?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
    });
    const body = await res.text();
    console.log(`[drip-cron] ${res.status} ${body}`);
  } catch (e) {
    console.error("[drip-cron] error:", (e as Error).message);
  }
  return new Response("ok");
}

export const config: Config = {
  schedule: "*/15 * * * *", // every 15 minutes (free-tier friendly; see header)
};
