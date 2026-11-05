// Computes where each person is (planned) at any instant, from the itinerary.
import type { LngLat, Person, Place, TripEvent } from '../../shared/types';
import { along, arcPath, distance, greatCircle } from './geo';
import { HOUR, MIN } from './time';
import { t as tx } from '../i18n';

export const BASE_PLACE_ID = 'base';

export type PosMode = 'home' | 'base' | 'event' | 'travel' | 'moving' | 'unknown';

export interface PersonPos {
  person: string;
  p: LngLat;
  mode: PosMode;
  label: string;
  eventId?: string;
  progress?: number;
  heading?: number;
  /** next stop label when moving */
  to?: string;
}

interface Seg {
  t0: number;
  t1: number;
  kind: 'stay' | 'move';
  from: LngLat;
  to: LngLat;
  path?: LngLat[];
  label: string;
  mode: PosMode;
  eventId?: string;
  toLabel?: string;
}

const ll = (p: Place): LngLat => [p.lon, p.lat];

export function travelPath(ev: TripEvent, from: LngLat, to: LngLat): LngLat[] {
  if (ev.path && ev.path.length > 1) return ev.path;
  if (ev.kind === 'flight') return greatCircle(from, to, 64);
  const d = distance(from, to);
  if (d > 20_000) return arcPath(from, to, 32, 0.08);
  return [from, to];
}

const isTravel = (e: TripEvent) => Boolean(e.fromPlaceId && e.toPlaceId);

function moveMinutes(d: number): number {
  if (d < 50) return 0;
  if (d < 1500) return Math.max(5, Math.round((d * 1.3) / 80)); // walking
  if (d < 25_000) return Math.min(45, 12 + Math.round(d / 400)); // tram/metro
  return Math.min(180, 30 + Math.round(d / 1500));
}

export function buildTimeline(person: Person, events: TripEvent[], places: Record<string, Place>): Seg[] {
  const base = places[BASE_PLACE_ID];
  const home: LngLat = person.home;
  const stayFrom = person.stayFrom ? Date.parse(person.stayFrom) : NaN;
  const stayTo = person.stayTo ? Date.parse(person.stayTo) : NaN;
  const baseAt = (t: number): { p: LngLat; label: string; mode: PosMode } =>
    base && Number.isFinite(stayFrom) && t >= stayFrom && (!Number.isFinite(stayTo) || t < stayTo)
      ? { p: ll(base), label: tx('At the Žižkov base'), mode: 'base' }
      : { p: home, label: tx('Home · {city}', { city: person.homeName }), mode: 'home' };

  type Block = { t0: number; t1: number; from: LngLat; to: LngLat; ev: TripEvent; travel: boolean; label: string; toLabel?: string };
  const blocks: Block[] = [];
  for (const ev of events) {
    if (ev.status === 'cancelled' || !ev.people.includes(person.id)) continue;
    const t0 = Date.parse(ev.start);
    const t1 = Date.parse(ev.end);
    if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 < t0) continue;
    if (isTravel(ev)) {
      const a = places[ev.fromPlaceId!];
      const b = places[ev.toPlaceId!];
      if (!a || !b) continue;
      blocks.push({ t0, t1, from: ll(a), to: ll(b), ev, travel: true, label: ev.title, toLabel: b.name });
    } else if (ev.placeId && places[ev.placeId]) {
      const p = ll(places[ev.placeId]);
      blocks.push({ t0, t1, from: p, to: p, ev, travel: false, label: ev.title });
    }
  }
  blocks.sort((a, b) => a.t0 - b.t0);
  // resolve overlaps: later block starts when previous ends
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].t0 < blocks[i - 1].t1) {
      const prev = blocks[i - 1];
      // keep the shorter, more specific one: trim previous end
      prev.t1 = Math.max(prev.t0, blocks[i].t0);
    }
  }

  const segs: Seg[] = [];
  const pushStay = (t0: number, t1: number, p: LngLat, label: string, mode: PosMode, eventId?: string) => {
    if (t1 <= t0) return;
    segs.push({ t0, t1, kind: 'stay', from: p, to: p, label, mode, eventId });
  };
  const pushMove = (t0: number, t1: number, a: LngLat, b: LngLat, toLabel: string) => {
    if (t1 <= t0) return;
    segs.push({ t0, t1, kind: 'move', from: a, to: b, path: travelPath({ kind: 'transit' } as TripEvent, a, b), label: tx('On the way to {place}', { place: toLabel }), mode: 'moving', toLabel });
  };

  /** fill the gap [t0,t1] between location a and b */
  const fillGap = (t0: number, t1: number, a: LngLat, aLabel: string, aMode: PosMode, b: LngLat, bLabel: string) => {
    if (t1 <= t0) return;
    const gap = t1 - t0;
    const mid = baseAt(t0 + gap / 2);
    const aFar = distance(a, mid.p) > 80;
    const bFar = distance(b, mid.p) > 80;
    // long gaps (nights, afternoons off): go back to base/home in between
    if (gap > 3 * HOUR && (aFar || bFar) && distance(a, mid.p) < 60_000 && distance(b, mid.p) < 60_000) {
      const m1 = aFar ? Math.min(moveMinutes(distance(a, mid.p)) * MIN, gap / 4) : 0;
      const m2 = bFar ? Math.min(moveMinutes(distance(mid.p, b)) * MIN, gap / 4) : 0;
      if (m1 > 0) pushMove(t0, t0 + m1, a, mid.p, mid.mode === 'base' ? tx('the base') : tx('home'));
      pushStay(t0 + m1, t1 - m2, mid.p, mid.label, mid.mode);
      if (m2 > 0) pushMove(t1 - m2, t1, mid.p, b, bLabel);
      return;
    }
    const d = distance(a, b);
    const mv = Math.min(moveMinutes(d) * MIN, gap);
    const atBase = !aFar;
    pushStay(t0, t1 - mv, a, atBase ? mid.label : aLabel, atBase ? mid.mode : aMode);
    if (mv > 0) pushMove(t1 - mv, t1, a, b, bLabel);
  };

  const FAR_PAST = -8.64e15;
  const FAR_FUTURE = 8.64e15;
  if (!blocks.length) {
    const b = baseAt(Date.now());
    segs.push({ t0: FAR_PAST, t1: FAR_FUTURE, kind: 'stay', from: b.p, to: b.p, label: b.label, mode: b.mode });
    return segs;
  }

  // before the first block
  const first = blocks[0];
  const pre = baseAt(first.t0 - 1);
  const preMove = Math.min(moveMinutes(distance(pre.p, first.from)) * MIN, 2 * HOUR);
  pushStay(FAR_PAST, first.t0 - preMove, pre.p, pre.label, pre.mode);
  if (preMove > 0) pushMove(first.t0 - preMove, first.t0, pre.p, first.from, first.ev.title);

  let curP = first.from;
  let curLabel = pre.label;
  let curMode: PosMode = pre.mode;
  for (let i = 0; i < blocks.length; i++) {
    const bl = blocks[i];
    if (i > 0) fillGap(blocks[i - 1].t1, bl.t0, curP, curLabel, curMode, bl.from, bl.label);
    if (bl.travel) {
      segs.push({
        t0: bl.t0,
        t1: bl.t1,
        kind: 'move',
        from: bl.from,
        to: bl.to,
        path: travelPath(bl.ev, bl.from, bl.to),
        label: bl.label,
        mode: 'travel',
        eventId: bl.ev.id,
        toLabel: bl.toLabel,
      });
      curP = bl.to;
      const b = baseAt(bl.t1 + 1);
      const atBase = distance(bl.to, b.p) < 150;
      curLabel = atBase ? b.label : tx('At {place}', { place: bl.toLabel ?? '' });
      curMode = atBase ? b.mode : 'event';
    } else {
      segs.push({ t0: bl.t0, t1: bl.t1, kind: 'stay', from: bl.from, to: bl.from, label: bl.label, mode: 'event', eventId: bl.ev.id });
      curP = bl.from;
      curLabel = tx('After: {event}', { event: bl.label });
      curMode = 'event';
    }
  }
  // after the last block
  const last = blocks[blocks.length - 1];
  const post = baseAt(last.t1 + 4 * HOUR);
  if (distance(curP, post.p) > 80 && distance(curP, post.p) < 60_000) {
    const mv = moveMinutes(distance(curP, post.p)) * MIN;
    pushMove(last.t1, last.t1 + mv, curP, post.p, post.mode === 'base' ? tx('the base') : tx('home'));
    pushStay(last.t1 + mv, FAR_FUTURE, post.p, post.label, post.mode);
  } else {
    pushStay(last.t1, FAR_FUTURE, curP, distance(curP, post.p) < 80 ? post.label : curLabel, distance(curP, post.p) < 80 ? post.mode : curMode);
  }
  return segs;
}

export function positionAt(personId: string, segs: Seg[], t: number): PersonPos {
  // binary search
  let lo = 0;
  let hi = segs.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segs[mid].t1 <= t) lo = mid + 1;
    else {
      idx = mid;
      hi = mid - 1;
    }
  }
  if (idx === -1) idx = segs.length - 1;
  let s = segs[idx];
  if (t < s.t0 && idx > 0) s = segs[idx - 1];
  if (s.kind === 'stay' || t <= s.t0) {
    return { person: personId, p: s.kind === 'stay' ? s.from : s.from, mode: s.mode, label: s.label, eventId: s.eventId };
  }
  const f = (t - s.t0) / Math.max(1, s.t1 - s.t0);
  const path = s.path ?? [s.from, s.to];
  const a = along(path, f);
  return { person: personId, p: a.p, mode: s.mode, label: s.label, eventId: s.eventId, progress: f, heading: a.heading, to: s.toLabel };
}

/** Cache timelines per data version */
let cacheKey: unknown = null;
let cache = new Map<string, Seg[]>();
export function crewPositions(people: Person[], events: TripEvent[], places: Record<string, Place>, t: number, version: unknown): PersonPos[] {
  if (cacheKey !== version) {
    cache = new Map();
    cacheKey = version;
  }
  return people.map((p) => {
    let segs = cache.get(p.id);
    if (!segs) {
      segs = buildTimeline(p, events, places);
      cache.set(p.id, segs);
    }
    return positionAt(p.id, segs, t);
  });
}

/** Sampled path of a person between t0 and t1 (for "where we've been" trails) */
export function crewTrails(people: Person[], events: TripEvent[], places: Record<string, Place>, t0: number, t1: number, version: unknown, step = 5 * 60_000) {
  crewPositions(people, events, places, t1, version); // warms the timeline cache
  return people.map((p) => {
    const segs = cache.get(p.id)!;
    const pts: LngLat[] = [];
    let last: LngLat | null = null;
    for (let t = t0; t <= t1; t += step) {
      const pos = positionAt(p.id, segs, t);
      if (!last || Math.abs(last[0] - pos.p[0]) > 1e-5 || Math.abs(last[1] - pos.p[1]) > 1e-5) {
        pts.push(pos.p);
        last = pos.p;
      }
    }
    const end = positionAt(p.id, segs, t1).p;
    pts.push(end);
    return { person: p.id, color: p.color, path: pts };
  });
}

/** All travel legs (for drawing routes/arcs on the map) */
export function travelLegs(events: TripEvent[], places: Record<string, Place>) {
  const out: { id: string; kind: string; path: LngLat[]; people: string[]; start: number; end: number }[] = [];
  for (const ev of events) {
    if (!isTravel(ev) || ev.status === 'cancelled') continue;
    const a = places[ev.fromPlaceId!];
    const b = places[ev.toPlaceId!];
    if (!a || !b) continue;
    out.push({ id: ev.id, kind: ev.kind, path: travelPath(ev, ll(a), ll(b)), people: ev.people, start: Date.parse(ev.start), end: Date.parse(ev.end) });
  }
  return out;
}
