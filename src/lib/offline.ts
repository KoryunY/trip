// "Download offline map": pre-caches vector tiles for Prague (+ low-zoom route corridor),
// the map styles, sprites and fonts into Cache Storage. The service worker serves them offline.
import { useSyncExternalStore } from 'react';
import { OFM, pinnedTileTemplate, setPinnedTileTemplate, STYLE_URLS } from './mapstyle';

export const TILE_CACHE = 'ofm-tiles';
export const ASSET_CACHE = 'ofm-assets';

interface Area {
  name: string;
  bbox: [number, number, number, number]; // w,s,e,n
  minz: number;
  maxz: number;
}

export const AREAS: Area[] = [
  { name: 'Europe → Armenia overview', bbox: [5, 38, 46, 56], minz: 0, maxz: 6 },
  { name: 'Bohemia (Plzeň, Kožlany, Kutná Hora)', bbox: [12.9, 49.55, 15.45, 50.35], minz: 7, maxz: 10 },
  { name: 'Prague (wide)', bbox: [14.22, 49.97, 14.72, 50.17], minz: 11, maxz: 12 },
  { name: 'Prague (detail)', bbox: [14.25, 50.0, 14.56, 50.13], minz: 13, maxz: 14 },
  { name: 'Plzeň centre', bbox: [13.355, 49.73, 13.405, 49.76], minz: 13, maxz: 14 },
  { name: 'Kutná Hora', bbox: [15.25, 49.94, 15.3, 49.98], minz: 13, maxz: 14 },
];

const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

export function tileList(): { z: number; x: number; y: number }[] {
  const seen = new Set<string>();
  const out: { z: number; x: number; y: number }[] = [];
  for (const a of AREAS) {
    for (let z = a.minz; z <= a.maxz; z++) {
      const x0 = lon2x(a.bbox[0], z);
      const x1 = lon2x(a.bbox[2], z);
      const y0 = lat2y(a.bbox[3], z);
      const y1 = lat2y(a.bbox[1], z);
      for (let x = x0; x <= x1; x++)
        for (let y = y0; y <= y1; y++) {
          const k = `${z}/${x}/${y}`;
          if (!seen.has(k)) {
            seen.add(k);
            out.push({ z, x, y });
          }
        }
    }
  }
  return out;
}

const FONT_RANGES = ['0-255', '256-511', '512-767', '768-1023', '1024-1279', '1280-1535', '8192-8447', '8448-8703'];

interface OfflineState {
  running: boolean;
  done: number;
  total: number;
  failed: number;
  bytes: number;
  finishedAt: number | null;
  error: string | null;
}
const LS = 'pc.offline.v1';
let st: OfflineState = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || 'null');
    if (s) return { ...s, running: false };
  } catch {
    /* ignore */
  }
  return { running: false, done: 0, total: 0, failed: 0, bytes: 0, finishedAt: null, error: null };
})();
const ls = new Set<() => void>();
function set(p: Partial<OfflineState>) {
  st = { ...st, ...p };
  ls.forEach((l) => l());
  if (!st.running) {
    try {
      localStorage.setItem(LS, JSON.stringify(st));
    } catch {
      /* ignore */
    }
  }
}
export function useOffline() {
  return useSyncExternalStore(
    (l) => {
      ls.add(l);
      return () => ls.delete(l);
    },
    () => st,
  );
}

let abort: AbortController | null = null;
export function cancelOffline() {
  abort?.abort();
}

async function cachePut(cache: Cache, url: string, signal: AbortSignal): Promise<number> {
  const hit = await cache.match(url, { ignoreVary: true });
  if (hit) return 0;
  const r = await fetch(url, { signal, mode: 'cors' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = await r.clone().arrayBuffer();
  await cache.put(url, r);
  return buf.byteLength;
}

export async function downloadOffline() {
  if (st.running) return;
  if (!('caches' in window)) {
    set({ error: 'This browser does not support offline storage.' });
    return;
  }
  abort = new AbortController();
  const signal = abort.signal;
  set({ running: true, done: 0, failed: 0, bytes: 0, error: null });
  try {
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* ignore */
    }
    const assets = await caches.open(ASSET_CACHE);
    const tiles = await caches.open(TILE_CACHE);
    // 1. styles + tilejson + sprites + fonts
    const assetUrls = new Set<string>(STYLE_URLS);
    const fonts = new Set<string>();
    let template = pinnedTileTemplate();
    for (const su of STYLE_URLS) {
      try {
        const r = await fetch(su, { signal });
        if (!r.ok) continue;
        const style = await r.clone().json();
        await assets.put(su, r);
        for (const src of Object.values(style.sources ?? {}) as { url?: string }[]) {
          if (src.url) {
            assetUrls.add(src.url);
            if (!template) {
              try {
                const tj = await (await fetch(src.url, { signal })).json();
                template = tj.tiles?.[0] ?? null;
                if (template) setPinnedTileTemplate(template);
              } catch {
                /* ignore */
              }
            }
          }
        }
        const sprites: string[] = Array.isArray(style.sprite) ? style.sprite.map((s: { url: string }) => s.url) : style.sprite ? [style.sprite] : [];
        for (const sp of sprites) for (const suf of ['.json', '.png', '@2x.json', '@2x.png']) assetUrls.add(sp + suf);
        for (const l of style.layers ?? []) {
          const tf = l.layout?.['text-font'];
          if (Array.isArray(tf) && tf.every((x: unknown) => typeof x === 'string')) fonts.add(tf.join(','));
        }
        if (style.glyphs) {
          for (const f of fonts) for (const rg of FONT_RANGES) assetUrls.add(style.glyphs.replace('{fontstack}', encodeURIComponent(f)).replace('{range}', rg));
        }
      } catch {
        /* ignore individual style failures */
      }
    }
    if (!template) template = `${OFM}/planet/latest/{z}/{x}/{y}.pbf`;
    const list = tileList();
    const total = assetUrls.size + list.length;
    set({ total });
    let done = 0;
    let failed = 0;
    let bytes = 0;
    const jobs: (() => Promise<void>)[] = [];
    for (const u of assetUrls)
      jobs.push(async () => {
        try {
          bytes += await cachePut(assets, u, signal);
        } catch {
          failed++;
        }
      });
    for (const t of list) {
      const u = template.replace('{z}', String(t.z)).replace('{x}', String(t.x)).replace('{y}', String(t.y));
      jobs.push(async () => {
        try {
          bytes += await cachePut(tiles, u, signal);
        } catch {
          failed++;
        }
      });
    }
    let i = 0;
    let lastEmit = 0;
    const worker = async () => {
      while (i < jobs.length && !signal.aborted) {
        const job = jobs[i++];
        await job();
        done++;
        const now = performance.now();
        if (now - lastEmit > 150) {
          lastEmit = now;
          set({ done, failed, bytes });
        }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    set({ running: false, done, failed, bytes, finishedAt: signal.aborted ? st.finishedAt : Date.now(), error: signal.aborted ? 'Cancelled' : null });
  } catch (e) {
    set({ running: false, error: String((e as Error)?.message || e) });
  }
}

export async function offlineCacheSize(): Promise<number | null> {
  try {
    const est = await navigator.storage?.estimate?.();
    return est?.usage ?? null;
  } catch {
    return null;
  }
}

export async function clearOffline() {
  await caches.delete(TILE_CACHE);
  await caches.delete(ASSET_CACHE);
  set({ done: 0, total: 0, failed: 0, bytes: 0, finishedAt: null, error: null });
}
