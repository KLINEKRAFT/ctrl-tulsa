// api/alerts.js — proxies NWS alerts for Tulsa, 60s edge cache
// NWS asks for a User-Agent identifying the application; we send one server-side.

const TULSA_LAT = 36.1540;
const TULSA_LON = -95.9928;

export default async function handler(req, res) {
  const url = `https://api.weather.gov/alerts/active?point=${TULSA_LAT},${TULSA_LON}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': '(ctrl.colinkline.com, contact@colinkline.com)',
        'Accept': 'application/geo+json'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'alerts upstream unavailable', detail: String(e) });
  }
}
