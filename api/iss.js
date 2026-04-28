// api/iss.js — proxies wheretheiss.at for ISS position
// Short 4-second cache: the ISS moves ~7.7 km/sec, so 4s is the sweet spot
// between "feels live" and "doesn't hammer the upstream".

export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      throw new Error('invalid iss payload');
    }

    res.setHeader('Cache-Control', 's-maxage=4, stale-while-revalidate=10');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      timestamp: data.timestamp
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'iss upstream unavailable', detail: String(e) });
  }
}
