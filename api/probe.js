// Temporary diagnostics: checks the external map/weather/routing services from Vercel's network.
import { json } from './_lib/store.js';

async function check(url, kind = 'json') {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'prague-crew-probe' } });
    const ms = Date.now() - t0;
    const cors = r.headers.get('access-control-allow-origin');
    if (kind === 'json') {
      const j = await r.json();
      return { url, status: r.status, ms, cors, j };
    }
    const b = await r.arrayBuffer();
    return { url, status: r.status, ms, cors, bytes: b.byteLength, type: r.headers.get('content-type') };
  } catch (e) {
    return { url, error: String(e?.message || e) };
  }
}

export async function GET(request) {
  const u = new URL(request.url);
  if (u.searchParams.get('k') !== 'pc-probe-2026') return json({ ok: false }, 404);
  const out = {};
  for (const name of ['liberty', 'positron', 'bright', 'dark']) {
    const r = await check(`https://tiles.openfreemap.org/styles/${name}`);
    const s = r.j;
    out[name] = s
      ? {
          status: r.status,
          cors: r.cors,
          glyphs: s.glyphs,
          sprite: s.sprite,
          sources: Object.fromEntries(Object.entries(s.sources || {}).map(([k, v]) => [k, { type: v.type, url: v.url, tiles: v.tiles }])),
          layers: (s.layers || []).length,
          bg: (s.layers || []).find((l) => l.type === 'background')?.paint,
          water: (s.layers || []).filter((l) => /water/.test(l.id)).slice(0, 3).map((l) => ({ id: l.id, type: l.type, paint: l.paint })),
          fonts: [...new Set((s.layers || []).map((l) => JSON.stringify(l.layout?.['text-font'] ?? null)))].slice(0, 8),
        }
      : r;
  }
  const tj = await check('https://tiles.openfreemap.org/planet');
  out.tilejson = { status: tj.status, cors: tj.cors, tiles: tj.j?.tiles, minzoom: tj.j?.minzoom, maxzoom: tj.j?.maxzoom };
  if (tj.j?.tiles?.[0]) out.tile = await check(tj.j.tiles[0].replace('{z}', '14').replace('{x}', '8853').replace('{y}', '5549'), 'bin');
  out.font = await check('https://tiles.openfreemap.org/fonts/Noto%20Sans%20Bold/0-255.pbf', 'bin');
  out.weather = await check('https://api.open-meteo.com/v1/forecast?latitude=50.086&longitude=14.45&daily=temperature_2m_max&timezone=Europe%2FPrague&forecast_days=16');
  if (out.weather.j) out.weather = { status: out.weather.status, cors: out.weather.cors, days: out.weather.j.daily?.time?.slice(-3), tmax: out.weather.j.daily?.temperature_2m_max?.slice(-3) };
  const rt = await check('https://routing.openstreetmap.de/routed-foot/route/v1/driving/14.4500,50.0860;14.4196,50.0870?overview=false');
  out.routing = { status: rt.status, cors: rt.cors, code: rt.j?.code, dist: rt.j?.routes?.[0]?.distance, error: rt.error };
  const fx = await check('https://open.er-api.com/v6/latest/CZK');
  out.rates = { status: fx.status, cors: fx.cors, eur: fx.j?.rates?.EUR, amd: fx.j?.rates?.AMD };
  out.carto = await check('https://a.basemaps.cartocdn.com/rastertiles/voyager/14/8853/5549.png', 'bin');
  return json(out, 200, { 'Cache-Control': 'no-store' });
}
