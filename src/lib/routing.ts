// Walking routes via the public FOSSGIS OSRM server (OpenStreetMap). Cached for offline reuse.
import type { LngLat } from '../../shared/types';

export interface RouteResult {
  path: LngLat[];
  distance: number; // m
  duration: number; // s
  steps: { text: string; distance: number; loc?: LngLat }[];
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

const MOD: Record<string, string> = {
  left: 'left',
  right: 'right',
  'slight left': 'slight left',
  'slight right': 'slight right',
  'sharp left': 'sharp left',
  'sharp right': 'sharp right',
  straight: 'straight',
  uturn: 'U-turn',
};
function stepText(s: { maneuver: { type: string; modifier?: string }; name: string }) {
  const m = s.maneuver;
  const name = s.name ? tx(' onto {street}', { street: s.name }) : '';
  const mod = m.modifier ? tx(MOD[m.modifier] ?? m.modifier) : '';
  switch (m.type) {
    case 'depart':
      return s.name ? tx('Start on {street}', { street: s.name }) : tx('Start');
    case 'arrive':
      return tx('Arrive at destination');
    case 'turn':
    case 'end of road':
      return (tx('Turn {dir}', { dir: mod }) + name).trim();
    case 'continue':
    case 'new name':
      return tx('Continue') + name;
    case 'roundabout':
    case 'rotary':
      return tx('Take the roundabout') + name;
    default:
      return `${tx(m.type.replace(/^\w/, (c) => c.toUpperCase()))} ${mod}${name}`.trim();
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
      steps: (rt.legs?.[0]?.steps ?? []).map((s: any) => ({ text: stepText(s), distance: s.distance, loc: s.maneuver?.location })),
      profile,
    };
    mem.set(key, res);
    persist(key, res);
    return res;
  } finally {
    clearTimeout(t);
  }
}

import { distance as dist } from './geo';
import { t as tx } from '../i18n';

/** progress of a position along a route: remaining metres, distance off the route, next instruction */
export function routeProgress(r: RouteResult, at: LngLat) {
  let best = 0;
  let bestD = Infinity;
  r.path.forEach((p, i) => {
    const d = dist(at, p);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  let remaining = bestD;
  for (let i = best + 1; i < r.path.length; i++) remaining += dist(r.path[i - 1], r.path[i]);
  let next: { text: string; inM: number } | null = null;
  for (const st of r.steps) {
    if (!st.loc) continue;
    let si = 0;
    let sd = Infinity;
    r.path.forEach((p, i) => {
      const d = dist(st.loc!, p);
      if (d < sd) {
        sd = d;
        si = i;
      }
    });
    if (si > best) {
      let m = bestD;
      for (let i = best + 1; i <= si; i++) m += dist(r.path[i - 1], r.path[i]);
      next = { text: st.text, inM: m };
      break;
    }
  }
  return { remaining, offRoute: bestD, next };
}
