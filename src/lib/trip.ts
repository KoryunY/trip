import type { Person, Task, TripEvent } from '../../shared/types';
import { dayKey, dayStart, addDays, TZ, hhmm, TZ_LABEL } from './time';

export type Phase = 'past' | 'now' | 'soon' | 'future';

export function evStart(e: TripEvent) {
  return Date.parse(e.start);
}
export function evEnd(e: TripEvent) {
  return Date.parse(e.end);
}

export function phaseOf(e: TripEvent, t: number): Phase {
  const s = evStart(e);
  const en = evEnd(e);
  if (t >= en) return 'past';
  if (t >= s) return 'now';
  if (s - t < 2 * 3600_000) return 'soon';
  return 'future';
}

export function progressOf(e: TripEvent, t: number) {
  const s = evStart(e);
  const en = evEnd(e);
  if (en <= s) return t >= s ? 1 : 0;
  return Math.max(0, Math.min(1, (t - s) / (en - s)));
}

/** Events that belong to a Prague day (by start), plus ones spanning into it */
/** day an event belongs to: its start date in its own local tz (so Yerevan departures sit on the 13th) */
export function eventDay(e: TripEvent) {
  return dayKey(evStart(e), e.tz || TZ);
}

/** Events that belong to a day (by local start), plus long ones spanning into it */
export function eventsOnDay(events: TripEvent[], key: string) {
  const a = dayStart(key);
  return events.filter((e) => {
    if (eventDay(e) === key) return true;
    const s = evStart(e);
    const en = evEnd(e);
    return s < a && en > a + 3 * 3600_000 && eventDay(e) < key;
  });
}

export function isPresent(p: Person, t: number) {
  const a = p.stayFrom ? Date.parse(p.stayFrom) : NaN;
  const b = p.stayTo ? Date.parse(p.stayTo) : NaN;
  return Number.isFinite(a) && t >= a && (!Number.isFinite(b) || t < b);
}

/** people in Prague at some point during the day */
export function presentOnDay(people: Person[], key: string) {
  const a = dayStart(key);
  const b = dayStart(addDays(key, 1));
  return people.filter((p) => {
    const s = p.stayFrom ? Date.parse(p.stayFrom) : NaN;
    const e = p.stayTo ? Date.parse(p.stayTo) : NaN;
    if (!Number.isFinite(s)) return false;
    return s < b && (!Number.isFinite(e) || e > a);
  });
}

export const startTz = (e: TripEvent) => e.tz || TZ;
export const endTz = (e: TripEvent) => e.endTz || e.tz || TZ;
export const startLocal = (e: TripEvent) => hhmm(evStart(e), startTz(e));
export const endLocal = (e: TripEvent) => hhmm(evEnd(e), endTz(e));

export function timeRange(e: TripEvent) {
  return `${startLocal(e)}–${endLocal(e)}`;
}

/** label for events shown in non-Prague local time */
export function localTimeNote(e: TripEvent) {
  const a = startTz(e);
  const b = endTz(e);
  if (a === TZ && b === TZ) return null;
  if (a !== TZ && b !== TZ) return `${TZ_LABEL[a] ?? a} time`;
  if (a !== TZ) return `departs ${TZ_LABEL[a] ?? a} time`;
  return `lands ${TZ_LABEL[b] ?? b} time`;
}

export function crossesMidnight(e: TripEvent) {
  return dayKey(evStart(e)) !== dayKey(evEnd(e) - 1);
}

// ───── tasks ─────
export function taskDoneFor(t: Task, pid: string) {
  if (t.mode === 'any') return Object.keys(t.done ?? {}).length > 0;
  return Boolean(t.done?.[pid]);
}
export function taskComplete(t: Task) {
  const d = t.done ?? {};
  if (t.mode === 'any') return Object.keys(d).length > 0;
  return t.assignees.every((a) => d[a]);
}
export function myOpenTasks(tasks: Task[], pid: string) {
  return tasks.filter((t) => t.assignees.includes(pid) && !taskDoneFor(t, pid));
}
export function taskStats(tasks: Task[], pid: string) {
  const mine = tasks.filter((t) => t.assignees.includes(pid));
  const done = mine.filter((t) => taskDoneFor(t, pid)).length;
  return { total: mine.length, done, pct: mine.length ? done / mine.length : 1 };
}

export function voteScore(v?: Record<string, number>) {
  return Object.values(v ?? {}).reduce((a, b) => a + b, 0);
}

export const TRIP_START_MS = Date.parse('2026-11-13T06:45:00+01:00');
export const TRIP_END_MS = Date.parse('2026-11-22T07:20:00+01:00');

export function mapsLink(lat: number, lon: number, mode: 'transit' | 'walking' | 'driving' = 'transit', origin?: [number, number]) {
  const o = origin ? `&origin=${origin[1]},${origin[0]}` : '';
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${lat},${lon}&travelmode=${mode}`;
}
export function mapyLink(lat: number, lon: number, name?: string) {
  return `https://mapy.com/fnc/v1/showmap?mapset=basic&center=${lon},${lat}&zoom=17&marker=true${name ? `&query=${encodeURIComponent(name)}` : ''}`;
}
export function uberLink(lat: number, lon: number, name: string) {
  return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lon}&dropoff[nickname]=${encodeURIComponent(name)}`;
}
