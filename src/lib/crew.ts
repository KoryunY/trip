import { useMemo } from 'react';
import type { TripEvent } from '../../shared/types';
import { crewPositions, type PersonPos } from './positions';
import { useDB } from './store';
import { evStart, evEnd } from './trip';

export function useCrew(t: number): PersonPos[] {
  const db = useDB();
  // quantise to 20s so React memo isn't recomputed on every ms during playback
  const tq = Math.floor(t / 20_000) * 20_000;
  return useMemo(() => crewPositions(db.people, db.events, db.place, tq, db), [db, tq]);
}

export function nextEventFor(pid: string, events: TripEvent[], t: number) {
  return events.find((e) => e.status !== 'cancelled' && e.people.includes(pid) && evStart(e) > t);
}
export function currentEventFor(pid: string, events: TripEvent[], t: number) {
  return events.find((e) => e.status !== 'cancelled' && e.people.includes(pid) && evStart(e) <= t && evEnd(e) > t);
}
