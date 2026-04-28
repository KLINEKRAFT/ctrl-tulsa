// api/radar.js — proxies RainViewer's frame index
// We only proxy this metadata call; tile PNGs themselves load directly from
// tilecache.rainviewer.com (CORS-friendly, browser-optimized).

export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'radar index unavailable', detail: String(e) });
  }
}
