// api/alerts.js — Edge function proxying NWS alerts for Tulsa
// NWS asks for a User-Agent identifying the application; we send one server-side.

export const config = { runtime: 'edge' };

const TULSA_LAT = 36.1540;
const TULSA_LON = -95.9928;

export default async function handler() {
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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'alerts upstream unavailable', detail: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  }
}
