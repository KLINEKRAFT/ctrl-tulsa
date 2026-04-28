// api/radar.js — Edge function proxying RainViewer's frame index
// We only proxy this metadata call; tile PNGs themselves load directly from
// tilecache.rainviewer.com (CORS-friendly, browser-optimized).

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const r = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=120'
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'radar index unavailable', detail: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  }
}
