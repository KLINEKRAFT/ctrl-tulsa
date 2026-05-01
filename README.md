# CTRL // TULSA

Personal dashboard for Tulsa OK. Single-page, real-time data, KLINEKRAFT.

## What's in here

```
ctrl-tulsa/
├── index.html       → the dashboard (HTML/CSS/JS, single file, no build step)
├── vercel.json      → Vercel config (cache headers)
├── package.json     → Node version pin for Vercel
├── README.md        → this file
└── api/
    ├── weather.js   → Edge fn proxying Open-Meteo, 5min cache
    └── alerts.js    → Edge fn proxying NWS alerts, 60s cache
```

## What's on the dashboard

- **Top bar** — `KLINEKRAFT // CTRL // TULSA OK` brand + LIVE indicator
- **Hero clock** — massive Doto pixel clock (12-hour with AM/PM)
- **Weather** — current temp, condition, wind/humid/UV/pressure
- **Hourly forecast** — next 12 hours, temp + precipitation bars
- **Upcoming holidays** — countdown to next US holiday + list
- **Severe weather ticker** — slim red strip, only when NWS has active alerts
- **AWAY MODE** — type a message, replaces the clock as the dashboard's hero,
  with a small clock that appears in the corner so you can still read time

## Why Edge Functions?

Each `api/*.js` runs as a Vercel **Edge function** — code runs at the closest
of Vercel's 200+ edge locations, ~10ms cold starts.

Three benefits over direct browser calls:

1. **Caching** — Vercel's edge cache means many visitors = 1 upstream call
2. **Reliability** — server-to-server calls don't have browser CORS issues
3. **Rate-limit safety** — your IP doesn't get blocked from polling

NWS officially asks for a User-Agent identifying the application; we send
that server-side.

## Deploy via GitHub + Vercel (web only, no terminal needed)

### One-time setup

1. **Create a new GitHub repo** named `ctrl-tulsa` (or whatever)
2. **Upload all files** using GitHub's "Add file → Upload files"
   - Make sure the `api/` folder structure is preserved
3. **Go to vercel.com**, click "Add New → Project"
4. **Import your repo**. Vercel auto-detects everything; click Deploy.

### Custom domain (e.g. ctrl.colinkline.com)

After first deploy:
1. In Vercel project → Settings → Domains
2. Add `ctrl.colinkline.com`
3. In Cloudflare DNS, add CNAME `ctrl` → `cname.vercel-dns.com`,
   proxy status: **DNS only** (grey cloud)
4. Wait ~1 min, your domain is live with HTTPS

### Updating

Edit any file in GitHub's web UI → commit → Vercel auto-deploys in ~30s.

## Smoke-testing the API endpoints

After deploy, visit these in a browser to verify:

- `https://your-domain/api/weather` → JSON with `current` and `hourly`
- `https://your-domain/api/alerts` → `{ features: [...] }` (empty is normal)

If 502, the upstream is briefly down — the dashboard shows OFFLINE for
that panel and recovers automatically.

## Tweaking

- **Change location**: edit `TULSA_LAT` / `TULSA_LON` in `api/*.js`
  AND the `TULSA` constant in `index.html`
- **Adjust cache**: change `s-maxage=N` in each function's headers
- **Change away message style**: edit `.hero-msg` font-size in CSS
