import type { Config } from "@netlify/functions";

/**
 * Netlify Scheduled Function — runs every minute, natively on Netlify
 * (no external cron service needed). It simply calls our own dispatch route,
 * which sends any due drip messages.
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
  schedule: "* * * * *", // every minute
};
