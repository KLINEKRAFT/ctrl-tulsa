# CTRL // TULSA

Personal dashboard for Tulsa OK. Single-page, real-time data, Nothing-inspired design.

## What's in here

```
ctrl-tulsa/
├── index.html       → the dashboard (HTML/CSS/JS, single file, no build step)
├── vercel.json      → Vercel config (cache headers)
├── package.json     → Node version pin for Vercel
├── README.md        → this file
└── api/
    ├── weather.js   → Edge fn proxying Open-Meteo, 5min cache
    ├── alerts.js    → Edge fn proxying NWS alerts, 60s cache
    ├── radar.js     → Edge fn proxying RainViewer index, 5min cache
    ├── aviation.js  → Edge fn proxying OpenSky aircraft, 30s cache
    └── iss.js       → Edge fn proxying wheretheiss.at, 4s cache
```

## Why Edge Functions?

Each `api/*.js` runs as a Vercel **Edge function** — code runs at the closest
of Vercel's 200+ edge locations to whoever's loading the page, instead of in
a single region. ~10ms cold starts vs. 200ms regional. Same JavaScript code.

Three benefits over direct browser calls:

1. **Caching** — Vercel's edge cache means 1000 visitors = 1 upstream call
2. **Reliability** — server-to-server calls don't have browser CORS issues
3. **Rate-limit safety** — your IP doesn't get blocked when refreshing repeatedly

OpenSky (aviation) is the function that benefits the most. NWS officially asks
for a User-Agent identifying the application; we send that server-side.

## Features

- **Massive Doto pixel clock** — dominates the top
- **Away-mode message** — type any message, scrolls Pokémon-banner style across
  the screen and as a strip ABOVE the clock on the dashboard. Persists.
- **Severe weather ticker** — slim red strip, only when NWS has active alerts
- **Hourly forecast** — next 12 hours, temp + precip bars
- **Live radar** — click to expand fullscreen. Inside the expanded view:
  - Zoom levels (30km / 60km / 125km / 250km / 500km)
  - Play/pause
  - Drag scrubber for past 2 hours + forecast
  - Animation speed (slow / med / fast)
  - Color schemes (classic / rainbow / red / black)
  - ESC or close button to collapse
- **Aviation** — live aircraft within 80km of Tulsa, callsigns and altitude
- **Holiday calendar** — countdown to next US holiday + upcoming list
- **ISS tracker** — live position with crosshair on world grid
- **Light/dark slider** — instant theme toggle, persists

## Deploy via GitHub + Vercel (web only, no terminal needed)

### One-time setup

1. **Create a new GitHub repo** named `ctrl-tulsa` (or whatever)
2. **Upload all files** from this folder using GitHub's "Add file → Upload files"
   - Make sure the `api/` folder structure is preserved
3. **Go to vercel.com**, click "Add New → Project"
4. **Import your repo**. Vercel auto-detects:
   - Framework: Other (correct, no framework needed)
   - Root directory: `./`
   - Build command: leave blank
   - Output directory: leave blank
5. **Click Deploy**. Done in ~30 seconds.

### Custom domain (e.g. ctrl.colinkline.com)

After first deploy:
1. In Vercel project → Settings → Domains
2. Add `ctrl.colinkline.com`
3. Vercel shows you a CNAME record to add
4. In Cloudflare DNS (since colinkline.com is on Cloudflare):
   - Type: CNAME
   - Name: `ctrl`
   - Target: `cname.vercel-dns.com`
   - Proxy status: **DNS only** (grey cloud) — important
5. Wait ~1 min, your domain is live with HTTPS

### Updating

Edit any file directly in GitHub's web editor → commit → Vercel auto-deploys
within 30 seconds. No terminal required.

## Smoke-testing the API endpoints

Once deployed, visit these in a browser to check each function:

- `https://your-domain/api/weather` → should return JSON with `current` and `hourly`
- `https://your-domain/api/alerts` → returns `{ features: [...] }` (empty `features` is normal — means no active alerts)
- `https://your-domain/api/radar` → returns object with `radar.past`
- `https://your-domain/api/aviation` → returns `{ time, states: [...] }`
- `https://your-domain/api/iss` → returns `{ latitude, longitude, altitude, ... }`

If any return a 502, the upstream is temporarily down — the dashboard shows
OFFLINE for that panel and recovers automatically.

## Local preview (optional)

If you want to test changes before pushing: just open `index.html` in your
browser. The `/api/*` calls will 404 (no Vercel locally), but the dashboard
still renders and you can see layout changes. To get the full thing locally
you'd need `vercel dev` from the terminal — skip that, just push and check
the live URL.

## Tweaking

- **Change location**: edit `TULSA_LAT` / `TULSA_LON` in each `api/*.js`
  AND the `TULSA` constant at the top of the script in `index.html`
- **Adjust cache**: change `s-maxage=N` in each function's `Cache-Control` header
- **Change default radar zoom**: edit `radarState.zoom` in `index.html` (5-9)
- **Change default radar color**: edit `radarState.color` (RainViewer palettes)

## Tech notes

- No build step, no bundler, no framework
- All API endpoints run as Edge functions on Vercel
- All fonts from Google Fonts CDN (Doto, Space Grotesk, Space Mono)
- Theme + away message persisted in localStorage
- Radar settings reset to defaults on each page load (by design)
- Radar tile imagery loads directly from `tilecache.rainviewer.com` (CORS-friendly)
- CartoDB basemap loads directly from their CDN

Built fast and on purpose simple. Edit and ship.
