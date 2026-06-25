# TAX STRATEGY LAB — LINE Funnel v2 (Next.js unified)

Custom LINE Messaging API funnel for a tax-accountant's wealth-marketing.
Unified Next.js (App Router) + TypeScript. Frontend (simulator + LIFF survey) and
backend (webhook, survey API, cron dispatch) live in one repo.

## Stack
- Next.js (App Router) + TypeScript
- Neon (managed Postgres) + Prisma  — added at Step 4
- Scheduler: `/api/cron/dispatch` triggered by external free cron (every 1 min)
- Hosting: Vercel (free tier)

## Funnel flow (v2)
```
follow → greeting + 「こちらをクリック▶」button → LIFF app
  → main video autoplays (muted, looping, dimmed bg) + 「Q3アンケートへ進む」center button
  → survey (Q1 assets / Q2 income / Q3 refined values question)
  → 3-axis branch (ifa / school / nurture) → branch welcome + 補足動画
  → drip steps (翌日/翌々日/3日後 @20:00 JST; nurture 7日後)
  → CTA: IFA booking (tayori) / school link (leadmail)
```

## Build steps (incremental, tested vs real LINE each gate)
1. Webhook handshake + reply        ← current
2. Greeting + click button
3. LIFF page: video-bg + Q3 button
4. Survey → branch → Neon DB → welcome
5. Drip dispatch via external cron
6. Nurture + rich menu + admin/broadcast
7. Deploy to Vercel + cutover

## Local dev
```powershell
npm install
# fill LINE creds in .env (LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET)
npm run dev                      # http://localhost:3000
```
Expose over HTTPS for the LINE webhook (QUIC is reset on JP mobile -> use http2):
```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000 --protocol http2
```
Set LINE Developers -> Messaging API -> Webhook URL = `https://<tunnel>/api/webhook`
```
```
