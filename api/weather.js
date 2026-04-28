// api/weather.js — proxies Open-Meteo for Tulsa, adds 5-minute edge cache
// Open-Meteo is free + no key required; we proxy mostly for caching consistency

const TULSA_LAT = 36.1540;
const TULSA_LON = -95.9928;

export default async function handler(req, res) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${TULSA_LAT}&longitude=${TULSA_LON}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&daily=uv_index_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&pressure_unit=hPa` +
    `&timezone=auto&forecast_days=2`;

  try {
    const r = await fetch(url, {
      // small server-to-server timeout
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    // CDN cache 5 min, allow stale-while-revalidate for 1 min
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'weather upstream unavailable', detail: String(e) });
  }
}
