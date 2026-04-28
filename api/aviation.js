// api/aviation.js — proxies OpenSky Network for Tulsa airspace
// This is the function that benefits most from server-side proxying:
// OpenSky has aggressive rate limits + occasional CORS hiccups for browsers.
// We cache 30s so multiple visitors share one upstream call.

const TULSA_LAT = 36.1540;
const TULSA_LON = -95.9928;
const BOX_LAT = 0.7;   // ~78km
const BOX_LON = 0.9;   // ~80km at 36° latitude

export default async function handler(req, res) {
  const url = `https://opensky-network.org/api/states/all` +
    `?lamin=${TULSA_LAT - BOX_LAT}` +
    `&lomin=${TULSA_LON - BOX_LON}` +
    `&lamax=${TULSA_LAT + BOX_LAT}` +
    `&lomax=${TULSA_LON + BOX_LON}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'ctrl-tulsa-dashboard/3.1 (colinkline.com)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    // Trim payload to what the dashboard actually uses — saves bandwidth
    const states = (data.states || []).map(s => ({
      icao: s[0],
      callsign: (s[1] || '').trim(),
      origin: s[2],
      lon: s[5],
      lat: s[6],
      altMeters: s[7],
      onGround: s[8],
      velocity: s[9],
      heading: s[10],
      vertRate: s[11]
    })).filter(s => !s.onGround && s.altMeters != null);

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ time: data.time, states });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'aviation upstream unavailable', detail: String(e) });
  }
}
