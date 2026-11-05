// Place photos from Wikimedia Commons (free, no key, CORS via origin=*).
// Strategy: search by place name, then photos geotagged within ~90 m. Low-res thumbnails, cached.
import { useEffect, useState } from 'react';
import type { Place } from '../../shared/types';
import { distance } from './geo';

export interface Photo {
  thumb: string;
  page: string;
  title: string;
}

const API = 'https://commons.wikimedia.org/w/api.php';
const LS = 'pc.photos.v1';
const TTL = 10 * 24 * 3600_000;
const mem = new Map<string, Photo[]>();
const inflight = new Map<string, Promise<Photo[]>>();

function loadCache(): Record<string, { at: number; photos: Photo[] }> {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}');
  } catch {
    return {};
  }
}
function saveCache(key: string, photos: Photo[]) {
  try {
    const all = loadCache();
    all[key] = { at: Date.now(), photos };
    const keys = Object.keys(all);
    if (keys.length > 160) for (const k of keys.slice(0, keys.length - 160)) delete all[k];
    localStorage.setItem(LS, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

const BAD = /\.(svg|pdf|tif|tiff|gif|webm|ogv|ogg|mp3|djvu)$|\b(map|mapa|plan|logo|coat of arms|znak|schema|diagram|flag|signature|stamp|ticket)\b/i;

interface Page {
  title: string;
  index?: number;
  coordinates?: { lat: number; lon: number }[];
  imageinfo?: { thumburl?: string; url?: string; descriptionurl?: string; mime?: string }[];
}

async function query(params: Record<string, string>): Promise<Page[]> {
  const qs = new URLSearchParams({ action: 'query', format: 'json', origin: '*', prop: 'imageinfo|coordinates', iiprop: 'url|mime', iiurlwidth: '480', ...params });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(`${API}?${qs}`, { signal: ctrl.signal });
    if (!r.ok) return [];
    const j = await r.json();
    const pages = Object.values(j?.query?.pages ?? {}) as Page[];
    return pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

function toPhoto(p: Page): Photo | null {
  const ii = p.imageinfo?.[0];
  if (!ii?.thumburl || BAD.test(p.title) || (ii.mime && !/^image\/(jpeg|png|webp)/.test(ii.mime))) return null;
  return { thumb: ii.thumburl, page: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`, title: p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '') };
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** does a file title plausibly show this place? (≥2 significant name words, or the whole name) */
function titleMatches(title: string, name: string) {
  const T = fold(title);
  const words = fold(name)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !['the', 'and', 'pub', 'bar', 'cafe', 'praha', 'prague'].includes(w));
  if (!words.length) return false;
  if (T.includes(fold(name))) return true;
  const hits = words.filter((w) => T.includes(w)).length;
  return words.length === 1 ? hits === 1 : hits >= 2;
}

/** strip descriptive suffixes so "U Fleků" / "Prague Castle – main gate" search well */
function searchName(pl: Place) {
  return pl.name
    .replace(/\(.*?\)/g, '')
    .split(/ · | – | - |\+/)[0]
    .trim();
}

export async function fetchPhotos(pl: Place, max = 6): Promise<Photo[]> {
  const key = `${pl.id}|${pl.name}`;
  if (mem.has(key)) return mem.get(key)!;
  const cached = loadCache()[key];
  if (cached && Date.now() - cached.at < TTL) {
    mem.set(key, cached.photos);
    return cached.photos;
  }
  if (inflight.has(key)) return inflight.get(key)!;
  const job = (async () => {
    const here: [number, number] = [pl.lon, pl.lat];
    const inPrague = distance(here, [14.43, 50.08]) < 25_000;
    const name = searchName(pl);
    const [byName, nearby] = await Promise.all([
      name.length > 2
        ? query({ generator: 'search', gsrsearch: `${name} ${inPrague ? 'Praha' : ''} filetype:bitmap`.trim(), gsrnamespace: '6', gsrlimit: '10' })
        : Promise.resolve([]),
      query({ generator: 'geosearch', ggscoord: `${pl.lat}|${pl.lon}`, ggsradius: '130', ggsnamespace: '6', ggslimit: '12' }),
    ]);
    const out: Photo[] = [];
    const seen = new Set<string>();
    const add = (p: Page) => {
      const ph = toPhoto(p);
      if (ph && !seen.has(ph.thumb)) {
        seen.add(ph.thumb);
        out.push(ph);
      }
    };
    // name matches that are geotagged nearby (or not geotagged) first
    for (const p of byName) {
      const c = p.coordinates?.[0];
      const near = c ? distance(here, [c.lon, c.lat]) : null;
      if ((near != null && near < 400) || (titleMatches(p.title, name) && (near == null || near < 3000))) add(p);
    }
    // then photos taken right there, closest first
    nearby
      .map((p) => ({ p, d: p.coordinates?.[0] ? distance(here, [p.coordinates[0].lon, p.coordinates[0].lat]) : 999 }))
      .sort((a, b) => a.d - b.d)
      .forEach(({ p }) => add(p));
    const res = out.slice(0, max);
    mem.set(key, res);
    if (res.length || navigator.onLine) saveCache(key, res);
    return res;
  })();
  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

export function usePhotos(pl: Place | undefined | null, max = 6, enabled = true): { photos: Photo[]; loading: boolean } {
  const [state, setState] = useState<{ key: string; photos: Photo[]; loading: boolean }>({ key: '', photos: [], loading: false });
  const key = pl ? `${pl.id}|${pl.name}` : '';
  useEffect(() => {
    if (!pl || pl.category === 'home' || pl.category === 'city' || !enabled) {
      setState({ key, photos: mem.get(key) ?? [], loading: false });
      return;
    }
    let alive = true;
    const quick = mem.get(key);
    setState({ key, photos: quick ?? [], loading: !quick });
    if (!quick)
      fetchPhotos(pl, max).then((photos) => {
        if (alive) setState({ key, photos, loading: false });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return state.key === key ? { photos: state.photos, loading: state.loading } : { photos: [], loading: Boolean(pl) && enabled };
}
