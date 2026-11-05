// Local-first data store: seed (built-in) + server layer + pending local edits.
// Last-writer-wins per record. Works fully offline; syncs when a backend is reachable.
import { useSyncExternalStore } from 'react';
import type {
  Collection,
  Expense,
  Idea,
  LogEntry,
  Note,
  Person,
  Place,
  Presence,
  StateResponse,
  SyncItem,
  Task,
  TripEvent,
} from '../../shared/types';
import { itemKey, newer } from '../../shared/merge.js';
import { SEED } from '../data/seed';

const LS_SERVER = 'pc.server.v1';
const LS_PENDING = 'pc.pending.v1';
const LS_ME = 'pc.me';
const LS_SETTINGS = 'pc.settings.v1';

export interface DB {
  people: Person[];
  places: Place[];
  events: TripEvent[];
  ideas: Idea[];
  tasks: Task[];
  expenses: Expense[];
  notes: Note[];
  person: Record<string, Person>;
  place: Record<string, Place>;
  event: Record<string, TripEvent>;
  /** key -> meta for "edited by" badges */
  meta: Record<string, { u: number; by: string }>;
}

export interface Settings {
  theme: 'auto' | 'light' | 'dark';
  mapStyle: 'liberty' | 'positron' | 'bright' | 'dark';
  apiBase: string;
  tripKey: string;
  shareLocation: boolean;
  onlyMine: boolean;
  currency: string;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  mapStyle: 'liberty',
  apiBase: '',
  tripKey: '',
  shareLocation: false,
  onlyMine: false,
  currency: 'EUR',
};

// ---------- safe storage ----------
function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

// ---------- layers ----------
const seedLayer = new Map<string, SyncItem>();
(Object.keys(SEED) as Collection[]).forEach((col) => {
  for (const rec of SEED[col] as { id: string }[]) {
    seedLayer.set(itemKey(col, rec.id), { col, id: rec.id, data: rec, u: 0, by: 'seed' });
  }
});
const seedOrder = new Map<string, number>();
[...seedLayer.keys()].forEach((k, i) => seedOrder.set(k, i));

interface ServerCache {
  rev: number;
  items: SyncItem[];
  presence: Record<string, Presence>;
  log: LogEntry[];
  at: number;
}
const cached = lsGet<ServerCache | null>(LS_SERVER, null);
let serverLayer = new Map<string, SyncItem>((cached?.items ?? []).map((i) => [itemKey(i.col, i.id), i]));
let serverRev = cached?.rev ?? 0;
let presence: Record<string, Presence> = cached?.presence ?? {};
let activity: LogEntry[] = cached?.log ?? [];
let lastServerAt = cached?.at ?? 0;
const pending = new Map<string, SyncItem>((lsGet<SyncItem[]>(LS_PENDING, [])).map((i) => [itemKey(i.col, i.id), i]));

let settings: Settings = { ...DEFAULT_SETTINGS, ...lsGet<Partial<Settings>>(LS_SETTINGS, {}) };
let me: string | null = lsGet<string | null>(LS_ME, null);

// ---------- subscription ----------
const listeners = new Set<() => void>();
let version = 0;
function emit() {
  version++;
  dbCache = null;
  listeners.forEach((l) => l());
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ---------- resolve ----------
let dbCache: DB | null = null;
function resolveItem(key: string): SyncItem | undefined {
  let best: SyncItem | undefined;
  for (const layer of [seedLayer, serverLayer, pending]) {
    const it = layer.get(key);
    if (it && newer(it, best)) best = it;
  }
  return best;
}

// ---------- normalisation (synced data may be partial/old) ----------
const arr = (v: unknown) => (Array.isArray(v) ? v : []);
function normalise(col: Collection, d: any): any | null {
  if (!d || typeof d !== 'object' || typeof d.id !== 'string') return null;
  switch (col) {
    case 'events': {
      if (!Number.isFinite(Date.parse(d.start)) || !Number.isFinite(Date.parse(d.end))) return null;
      return { kind: 'other', status: 'planned', title: '(untitled)', ...d, people: arr(d.people) };
    }
    case 'places':
      if (!Number.isFinite(Number(d.lat)) || !Number.isFinite(Number(d.lon))) return null;
      return { category: 'sight', name: '(unnamed)', ...d, lat: Number(d.lat), lon: Number(d.lon) };
    case 'tasks':
      return { category: 'other', mode: 'each', title: '(untitled)', ...d, assignees: arr(d.assignees) };
    case 'people':
      return Array.isArray(d.home) && d.home.length === 2 ? { name: d.id, color: '#888', homeName: '', ...d } : null;
    case 'expenses':
      return { currency: 'CZK', ...d, amount: Number(d.amount) || 0, split: arr(d.split) };
    case 'ideas':
      return { kind: 'other', title: '(untitled)', ...d };
    case 'notes':
      return { title: '', body: '', ...d };
  }
}

function buildDB(): DB {
  const keys = new Set<string>([...seedLayer.keys(), ...serverLayer.keys(), ...pending.keys()]);
  const buckets: Record<Collection, { data: any; key: string }[]> = {
    people: [],
    places: [],
    events: [],
    ideas: [],
    tasks: [],
    expenses: [],
    notes: [],
  };
  const meta: DB['meta'] = {};
  for (const key of keys) {
    const it = resolveItem(key);
    if (!it || it.data === null || !buckets[it.col]) continue;
    const data = normalise(it.col, it.data);
    if (!data) continue;
    buckets[it.col].push({ data, key });
    if (it.u > 0) meta[key] = { u: it.u, by: it.by };
  }
  const bySeed = (a: { key: string }, b: { key: string }) =>
    (seedOrder.get(a.key) ?? 1e9) - (seedOrder.get(b.key) ?? 1e9);
  const people = buckets.people.sort(bySeed).map((x) => x.data as Person);
  const places = buckets.places.map((x) => x.data as Place).sort((a, b) => a.name.localeCompare(b.name));
  const events = buckets.events
    .map((x) => x.data as TripEvent)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || Date.parse(a.end) - Date.parse(b.end));
  const ideas = buckets.ideas.sort(bySeed).map((x) => x.data as Idea);
  const tasks = buckets.tasks.sort(bySeed).map((x) => x.data as Task);
  const expenses = buckets.expenses.map((x) => x.data as Expense).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const notes = buckets.notes.sort(bySeed).map((x) => x.data as Note);
  const idx = <T extends { id: string }>(arr: T[]) => Object.fromEntries(arr.map((x) => [x.id, x])) as Record<string, T>;
  return { people, places, events, ideas, tasks, expenses, notes, person: idx(people), place: idx(places), event: idx(events), meta };
}

export function getDB(): DB {
  if (!dbCache) dbCache = buildDB();
  return dbCache;
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB, getDB);
}

// ---------- identity & settings ----------
export function getMe() {
  return me;
}
export function setMe(id: string | null) {
  me = id;
  lsSet(LS_ME, id);
  emit();
}
export function useMe(): string | null {
  return useSyncExternalStore(subscribe, () => me, () => me);
}
export function getSettings() {
  return settings;
}
export function setSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  lsSet(LS_SETTINGS, settings);
  emit();
}
export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings, () => settings);
}

// ---------- mutations ----------
let lastU = 0;
function stamp() {
  lastU = Math.max(Date.now(), lastU + 1);
  return lastU;
}
export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let flushHook: (() => void) | null = null;
export function onLocalChange(fn: () => void) {
  flushHook = fn;
}

function pushOp(col: Collection, id: string, data: unknown | null) {
  const op: SyncItem = { col, id, data, u: stamp(), by: me ?? 'anon' };
  pending.set(itemKey(col, id), op);
  lsSet(LS_PENDING, [...pending.values()]);
  emit();
  flushHook?.();
}

export function save<T extends { id: string }>(col: Collection, rec: T) {
  pushOp(col, rec.id, JSON.parse(JSON.stringify(rec)));
}
export function remove(col: Collection, id: string) {
  pushOp(col, id, null);
}
export function patch<T extends { id: string }>(col: Collection, id: string, fn: (cur: T) => T) {
  const cur = resolveItem(itemKey(col, id));
  if (!cur || cur.data === null) return;
  save(col, fn(JSON.parse(JSON.stringify(cur.data)) as T));
}
/** restore a record to the built-in version (drops local + server edits by writing seed data newer) */
export function resetToSeed(col: Collection, id: string) {
  const s = seedLayer.get(itemKey(col, id));
  if (s) save(col, s.data as { id: string });
}
export function isSeed(col: Collection, id: string) {
  return seedLayer.has(itemKey(col, id));
}

// ---------- sync bookkeeping (used by sync.ts) ----------
export function pendingOps(): SyncItem[] {
  return [...pending.values()];
}
export function pendingCount() {
  return pending.size;
}
let staleStreak = 0;
export function applyServerState(res: StateResponse, authoritative: boolean) {
  if (!authoritative && res.rev < serverRev) {
    staleStreak++;
    if (staleStreak < 4) return false;
  }
  staleStreak = 0;
  serverLayer = new Map(res.items.map((i) => [itemKey(i.col, i.id), i]));
  serverRev = res.rev;
  presence = res.presence || {};
  activity = res.log || [];
  lastServerAt = Date.now();
  // drop pending ops that the server already has (or has something newer)
  for (const [k, op] of pending) {
    const s = serverLayer.get(k);
    if (s && !newer(op, s)) pending.delete(k);
  }
  lsSet(LS_PENDING, [...pending.values()]);
  lsSet(LS_SERVER, { rev: serverRev, items: res.items, presence, log: activity, at: lastServerAt } satisfies ServerCache);
  emit();
  return true;
}
export function setPresenceLocal(p: Presence) {
  presence = { ...presence, [p.person]: p };
  emit();
}
export function getPresence() {
  return presence;
}
export function usePresence(): Record<string, Presence> {
  return useSyncExternalStore(subscribe, () => presence, () => presence);
}
export function useActivity(): LogEntry[] {
  return useSyncExternalStore(subscribe, () => activity, () => activity);
}
export function serverInfo() {
  return { rev: serverRev, lastServerAt, version };
}

// ---------- backup ----------
export function exportBackup() {
  const db = getDB();
  return {
    app: 'prague-crew',
    exportedAt: new Date().toISOString(),
    by: me,
    data: {
      people: db.people,
      places: db.places,
      events: db.events,
      ideas: db.ideas,
      tasks: db.tasks,
      expenses: db.expenses,
      notes: db.notes,
    },
  };
}
export function importBackup(json: any) {
  const data = json?.data;
  if (!data) throw new Error('Not a Prague Crew backup');
  const current = getDB();
  let n = 0;
  (Object.keys(data) as Collection[]).forEach((col) => {
    if (!Array.isArray(data[col])) return;
    for (const rec of data[col]) {
      if (!rec?.id) continue;
      const cur = (current as any)[col]?.find((x: any) => x.id === rec.id);
      if (cur && JSON.stringify(cur) === JSON.stringify(rec)) continue;
      save(col, rec);
      n++;
    }
  });
  return n;
}
export function clearLocalCache() {
  try {
    localStorage.removeItem(LS_SERVER);
    localStorage.removeItem(LS_PENDING);
  } catch {
    /* ignore */
  }
  serverLayer = new Map();
  pending.clear();
  serverRev = 0;
  emit();
}
