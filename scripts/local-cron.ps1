# Local dev cron: pings the drip dispatcher every 10s so scheduled messages
# fire automatically (simulates the production cron). Local testing only.
$secret = "local-dev-cron-secret-change-me"
while ($true) {
  try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/cron/dispatch?secret=$secret" -TimeoutSec 15 | Out-Null
  } catch {}
  Start-Sleep -Seconds 10
}
