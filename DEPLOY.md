# Deployment (Netlify)

Live: **https://yukatax.netlify.app**

## LINE console (set once — permanent domain)
- Webhook URL  : `https://yukatax.netlify.app/api/webhook`
- LIFF Endpoint: `https://yukatax.netlify.app/liff`

## Environment variables (Netlify → Site settings → Environment variables)
- LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET
- LIFF_CHANNEL_ID, NEXT_PUBLIC_LIFF_ID
- DATABASE_URL  (Neon POOLED — host has "-pooler"; used at runtime)
- DIRECT_URL    (Neon DIRECT — host WITHOUT "-pooler"; used only by `prisma db push`/migrations)
- NEXT_PUBLIC_MAIN_VIDEO_URL=/main.mp4
- NEXT_PUBLIC_IFA_VIDEO_URL=/ifa.mp4
- NEXT_PUBLIC_SCHOOL_VIDEO_URL=/school.mp4
- IFA_BOOKING_URL, SCHOOL_LINK_URL
- CRON_SECRET           (a long random string)
- PUBLIC_BASE_URL=https://yukatax.netlify.app
- DRIP_TEST_MODE=0      (production: 翌日/翌々日/3日後 @20:00 JST)

## Drip cron
The Netlify Scheduled Function `netlify/functions/drip-cron.ts` handles this
natively — it runs every 15 minutes and pings the dispatcher. No external cron
is required.

⚠️ Do NOT also run an external per-minute cron against the dispatcher. Polling
the DB every minute keeps Neon's free-tier compute awake 24/7 and exhausts the
monthly compute quota (the DB then returns "exceeded compute time quota" errors).
If you previously set up an external cron (e.g. cron-job.org) hitting:

  URL    : https://yukatax.netlify.app/api/cron/dispatch
  Header : Authorization: Bearer <CRON_SECRET>  (or query: ?secret=<CRON_SECRET>)

…then either DELETE it or set its interval to 15 minutes, so it doesn't fight
the Netlify schedule and re-exhaust the quota.

## Notes
- vercel.json is vestigial (Netlify uses @netlify/plugin-nextjs). Cron lives in cron-job.org, not vercel.json.
- Videos currently served from public/ (main 14.4MB, ifa 6.7MB, school 8.9MB). Fine for now; move to object storage if bandwidth grows.
