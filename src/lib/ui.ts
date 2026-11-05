// Global UI state: sheet stack + map intents (focus/route) so any screen can open things.
import { useSyncExternalStore } from 'react';
import type { LngLat, TripEvent, Place, Task, Idea } from '../../shared/types';
import { go } from './router';

export type SheetSpec =
  | { t: 'event'; id: string }
  | { t: 'eventEdit'; id?: string; draft?: Partial<TripEvent> }
  | { t: 'place'; id: string }
  | { t: 'placeEdit'; id?: string; draft?: Partial<Place> }
  | { t: 'task'; id: string }
  | { t: 'taskEdit'; id?: string; draft?: Partial<Task> }
  | { t: 'idea'; id: string }
  | { t: 'ideaEdit'; id?: string; draft?: Partial<Idea> }
  | { t: 'expenseEdit'; id?: string }
  | { t: 'noteEdit'; id?: string }
  | { t: 'person'; id: string }
  | { t: 'compass'; target: { lat: number; lon: number; name: string } }
  | { t: 'timeMachine' }
  | { t: 'converter' }
  | { t: 'roulette' };

let stack: SheetSpec[] = [];
const ls = new Set<() => void>();
const emit = () => ls.forEach((l) => l());
const sub = (l: () => void) => {
  ls.add(l);
  return () => ls.delete(l);
};

export function openSheet(s: SheetSpec) {
  stack = [...stack, s];
  emit();
}
export function closeSheet() {
  stack = stack.slice(0, -1);
  emit();
}
export function replaceSheet(s: SheetSpec) {
  stack = [...stack.slice(0, -1), s];
  emit();
}
export function closeAllSheets() {
  stack = [];
  emit();
}
export function useSheets() {
  return useSyncExternalStore(sub, () => stack);
}

// ── map intents ──
export interface MapIntent {
  id: number;
  focus?: { lngLat: LngLat; zoom?: number; placeId?: string };
  route?: { to: LngLat; name: string };
  person?: string;
  fitCrew?: boolean;
}
let intent: MapIntent | null = null;
let iid = 0;
export function mapIntent(i: Omit<MapIntent, 'id'>) {
  intent = { ...i, id: ++iid };
  emit();
  closeAllSheets();
  go('map');
}
export function useMapIntent() {
  return useSyncExternalStore(sub, () => intent);
}
export function clearMapIntent() {
  intent = null;
}
export function showPlaceOnMap(p: Place) {
  mapIntent({ focus: { lngLat: [p.lon, p.lat], zoom: 16, placeId: p.id } });
}
export function navigateTo(lat: number, lon: number, name: string) {
  mapIntent({ route: { to: [lon, lat], name } });
}
