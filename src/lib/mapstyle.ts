// Builds the MapLibre style: OpenFreeMap vector tiles (cached by the service worker for offline use)
// layered over a bundled world outline that always works offline.
import type { StyleSpecification, LayerSpecification } from 'maplibre-gl';

export const OFM = 'https://tiles.openfreemap.org';
export type BaseStyleName = 'liberty' | 'positron' | 'bright' | 'dark';

const STYLE_URL = (n: BaseStyleName) => `${OFM}/styles/${n}`;

async function fetchJSON(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const LS_TILES = 'pc.tiles.template';
export function pinnedTileTemplate(): string | null {
  try {
    return localStorage.getItem(LS_TILES);
  } catch {
    return null;
  }
}
export function setPinnedTileTemplate(t: string) {
  try {
    localStorage.setItem(LS_TILES, t);
  } catch {
    /* ignore */
  }
}

function colorOf(v: unknown, fallback: string): string {
  if (typeof v === 'string') return v;
  // zoom stops {stops: [[z, color]...]} or interpolate expressions: take the last literal color
  try {
    const s = JSON.stringify(v);
    const m = s.match(/"(#[0-9a-fA-F]{3,8}|rgba?\([^"]+\)|hsla?\([^"]+\))"/g);
    if (m && m.length) return JSON.parse(m[m.length - 1]);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function fallbackStyle(dark: boolean): StyleSpecification {
  const water = dark ? '#0b1320' : '#aad3df';
  const land = dark ? '#1c1d22' : '#f2efe9';
  return {
    version: 8,
    name: 'offline-fallback',
    sources: {
      world: { type: 'geojson', data: '/data/world.json', attribution: 'Natural Earth' },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': water } },
      { id: 'world-land', type: 'fill', source: 'world', filter: ['==', ['get', 'k'], 'land'], paint: { 'fill-color': land } },
      {
        id: 'world-border',
        type: 'line',
        source: 'world',
        filter: ['==', ['get', 'k'], 'border'],
        paint: { 'line-color': dark ? '#3a3b44' : '#c9bfb0', 'line-width': 0.8 },
      },
    ],
  };
}

/** Loads the remote base style, pins tile URLs, and adds the offline world underlay. */
export async function buildStyle(name: BaseStyleName, dark: boolean): Promise<{ style: StyleSpecification; remote: boolean; hasGlyphs: boolean }> {
  try {
    const style = (await fetchJSON(STYLE_URL(name))) as StyleSpecification;
    // Resolve TileJSON so tile URLs are stable (enables offline cache hits).
    for (const [key, src] of Object.entries(style.sources)) {
      const s = src as { type: string; url?: string; attribution?: string };
      if (s.type === 'vector' && s.url) {
        try {
          const tj = await fetchJSON(s.url, 6000);
          if (Array.isArray(tj.tiles) && tj.tiles.length) {
            style.sources[key] = {
              type: 'vector',
              tiles: tj.tiles,
              minzoom: tj.minzoom ?? 0,
              maxzoom: tj.maxzoom ?? 14,
              attribution: tj.attribution ?? s.attribution,
            };
            setPinnedTileTemplate(tj.tiles[0]);
          }
        } catch {
          const pinned = pinnedTileTemplate();
          if (pinned) style.sources[key] = { type: 'vector', tiles: [pinned], minzoom: 0, maxzoom: 14, attribution: s.attribution };
        }
      }
    }
    // underlay: ocean-colored background + world land, so missing tiles still show a map
    const bgLayer = style.layers.find((l) => l.type === 'background') as LayerSpecification | undefined;
    const waterLayer = style.layers.find((l) => l.type === 'fill' && /water/.test(l.id) && !/name|line/.test(l.id)) as LayerSpecification | undefined;
    const landColor = colorOf((bgLayer as { paint?: Record<string, unknown> })?.paint?.['background-color'], dark ? '#1c1d22' : '#f2efe9');
    const waterColor = colorOf((waterLayer as { paint?: Record<string, unknown> })?.paint?.['fill-color'], dark ? '#0b1320' : '#aad3df');
    style.sources.world = { type: 'geojson', data: '/data/world.json' };
    const bgIdx = style.layers.findIndex((l) => l.type === 'background');
    const under: LayerSpecification[] = [
      { id: 'pc-ocean', type: 'background', paint: { 'background-color': waterColor } },
      { id: 'pc-world-land', type: 'fill', source: 'world', filter: ['==', ['get', 'k'], 'land'], paint: { 'fill-color': landColor } },
    ];
    if (bgIdx >= 0) style.layers.splice(bgIdx, 1, ...under);
    else style.layers.unshift(...under);
    return { style, remote: true, hasGlyphs: Boolean(style.glyphs) };
  } catch {
    return { style: fallbackStyle(dark), remote: false, hasGlyphs: false };
  }
}

export const STYLE_URLS = (['liberty', 'positron', 'bright', 'dark'] as BaseStyleName[]).map(STYLE_URL);
