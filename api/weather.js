// api/weather.js — Edge function proxying Open-Meteo for Tulsa
// Edge runtime = runs at Vercel's CDN edge (200+ locations), ~10ms cold starts.

export const config = { runtime: 'edge' };

const TULSA_LAT = 36.1540;
const TULSA_LON = -95.9928;

export default async function handler() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${TULSA_LAT}&longitude=${TULSA_LON}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&daily=uv_index_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&pressure_unit=hPa` +
    `&timezone=auto&forecast_days=2`;

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'weather upstream unavailable', detail: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  }
}
