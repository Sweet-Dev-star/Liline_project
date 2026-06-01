# Deployment (Netlify)

Live: **https://yukatax.netlify.app**

## LINE console (set once — permanent domain)
- Webhook URL  : `https://yukatax.netlify.app/api/webhook`
- LIFF Endpoint: `https://yukatax.netlify.app/liff`

## Environment variables (Netlify → Site settings → Environment variables)
- LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET
- LIFF_CHANNEL_ID, NEXT_PUBLIC_LIFF_ID
- DATABASE_URL  (Neon pooled)
- NEXT_PUBLIC_MAIN_VIDEO_URL=/main.mp4
- NEXT_PUBLIC_IFA_VIDEO_URL=/ifa.mp4
- NEXT_PUBLIC_SCHOOL_VIDEO_URL=/school.mp4
- IFA_BOOKING_URL, SCHOOL_LINK_URL
- CRON_SECRET           (a long random string)
- PUBLIC_BASE_URL=https://yukatax.netlify.app
- DRIP_TEST_MODE=0      (production: 翌日/翌々日/3日後 @20:00 JST)

## Drip cron (Netlify has no Vercel-style cron)
An EXTERNAL cron must ping the dispatcher every minute:

  URL    : https://yukatax.netlify.app/api/cron/dispatch
  Method : GET (or POST)
  Header : Authorization: Bearer <CRON_SECRET>
           (or query: ?secret=<CRON_SECRET>)
  Every  : 1 minute

Recommended: https://cron-job.org (free).

## Notes
- vercel.json is vestigial (Netlify uses @netlify/plugin-nextjs). Cron lives in cron-job.org, not vercel.json.
- Videos currently served from public/ (main 14.4MB, ifa 6.7MB, school 8.9MB). Fine for now; move to object storage if bandwidth grows.
