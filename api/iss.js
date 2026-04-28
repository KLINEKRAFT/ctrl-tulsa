// api/iss.js — Edge function proxying wheretheiss.at for ISS position
// Short 4-second cache: the ISS moves ~7.7 km/sec, so 4s is the sweet spot
// between "feels live" and "doesn't hammer the upstream".

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();

    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      throw new Error('invalid iss payload');
    }

    return new Response(JSON.stringify({
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      timestamp: data.timestamp
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=4, stale-while-revalidate=10'
      }
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'iss upstream unavailable', detail: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  }
}
