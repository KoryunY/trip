// Walking routes via the public FOSSGIS OSRM server (OpenStreetMap). Cached for offline reuse.
import type { LngLat } from '../../shared/types';

export interface RouteResult {
  path: LngLat[];
  distance: number; // m
  duration: number; // s
  steps: { text: string; distance: number }[];
  profile: 'foot' | 'car';
}

const mem = new Map<string, RouteResult>();
const LS = 'pc.routes.v1';
function load(): Record<string, RouteResult> {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}');
  } catch {
    return {};
  }
}
function persist(key: string, r: RouteResult) {
  try {
    const all = load();
    all[key] = r;
    const keys = Object.keys(all);
    if (keys.length > 40) delete all[keys[0]];
    localStorage.setItem(LS, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function stepText(s: { maneuver: { type: string; modifier?: string }; name: string }) {
  const m = s.maneuver;
  const name = s.name ? ` onto ${s.name}` : '';
  switch (m.type) {
    case 'depart':
      return `Start${s.name ? ` on ${s.name}` : ''}`;
    case 'arrive':
      return 'Arrive at destination';
    case 'turn':
    case 'end of road':
      return `Turn ${m.modifier ?? ''}${name}`.trim();
    case 'continue':
    case 'new name':
      return `Continue${name}`;
    case 'roundabout':
    case 'rotary':
      return `Take the roundabout${name}`;
    default:
      return `${m.type.replace(/^\w/, (c) => c.toUpperCase())} ${m.modifier ?? ''}${name}`.trim();
  }
}

export async function route(from: LngLat, to: LngLat, profile: 'foot' | 'car' = 'foot'): Promise<RouteResult> {
  const key = `${profile}:${from.map((n) => n.toFixed(4)).join(',')};${to.map((n) => n.toFixed(4)).join(',')}`;
  const hit = mem.get(key) ?? load()[key];
  if (hit) return hit;
  const host = profile === 'foot' ? 'routed-foot' : 'routed-car';
  const url = `https://routing.openstreetmap.de/${host}/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson&steps=true`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`Routing failed (${r.status})`);
    const j = await r.json();
    const rt = j.routes?.[0];
    if (!rt) throw new Error('No route found');
    const res: RouteResult = {
      path: rt.geometry.coordinates,
      distance: rt.distance,
      duration: profile === 'foot' ? rt.distance / 1.3 : rt.duration,
      steps: (rt.legs?.[0]?.steps ?? []).map((s: any) => ({ text: stepText(s), distance: s.distance })),
      profile,
    };
    mem.set(key, res);
    persist(key, res);
    return res;
  } finally {
    clearTimeout(t);
  }
}
