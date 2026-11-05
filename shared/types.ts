// Shared data model for the Prague Crew trip app (client + API).

export type PersonId = string; // 'koryun' | 'alexey' | 'arto' (+ any added later)

export type LngLat = [number, number]; // [lon, lat]

export interface Person {
  id: PersonId;
  name: string;
  color: string; // hex
  emoji: string;
  homeName: string; // e.g. "Yerevan"
  home: LngLat;
  /** ISO datetime the person is based at the apartment from/to (null = unknown) */
  stayFrom?: string | null;
  stayTo?: string | null;
  from?: string; // short origin description
  note?: string;
  phone?: string;
}

export type PlaceCategory =
  | 'home'
  | 'sight'
  | 'viewpoint'
  | 'beer'
  | 'food'
  | 'cafe'
  | 'nightlife'
  | 'shop'
  | 'transport'
  | 'venue'
  | 'museum'
  | 'daytrip'
  | 'service'
  | 'city';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  address?: string | null;
  area?: string | null;
  blurb?: string | null;
  hours?: string | null;
  price?: string | null;
  url?: string | null;
  tags?: string[];
  /** person -> +1 / -1 */
  votes?: Record<PersonId, number>;
  saved?: boolean;
  /** location not double-checked */
  approx?: boolean;
}

export type EventKind =
  | 'flight'
  | 'train'
  | 'bus'
  | 'transit'
  | 'walk'
  | 'taxi'
  | 'airport'
  | 'sight'
  | 'food'
  | 'beer'
  | 'concert'
  | 'gaming'
  | 'rest'
  | 'party'
  | 'shopping'
  | 'meet'
  | 'errand'
  | 'other';

export type EventStatus = 'confirmed' | 'planned' | 'tentative' | 'cancelled';

export interface TripEvent {
  id: string;
  title: string;
  kind: EventKind;
  /** ISO datetime with offset, e.g. 2026-11-13T06:45:00+01:00 */
  start: string;
  end: string;
  /** IANA tz the times are "local" to (for display), default Europe/Prague */
  tz?: string;
  /** tz of the end time if different (flights) */
  endTz?: string;
  placeId?: string | null;
  /** travel events go from -> to */
  fromPlaceId?: string | null;
  toPlaceId?: string | null;
  people: PersonId[];
  status: EventStatus;
  notes?: string | null;
  cost?: string | null;
  booking?: string | null;
  links?: { label: string; url: string }[];
  /** optional explicit travel path [lon,lat][] */
  path?: LngLat[] | null;
}

export interface Idea {
  id: string;
  title: string;
  kind: EventKind;
  placeId?: string | null;
  notes?: string | null;
  durationMin?: number;
  cost?: string | null;
  votes?: Record<PersonId, number>;
  scheduledEventId?: string | null;
  addedBy?: PersonId;
}

export type TaskCategory =
  | 'docs'
  | 'flights'
  | 'connectivity'
  | 'money'
  | 'packing'
  | 'apartment'
  | 'bookings'
  | 'gta'
  | 'concert'
  | 'apps'
  | 'other';

export interface Task {
  id: string;
  title: string;
  details?: string | null;
  category: TaskCategory;
  /** who needs to do it */
  assignees: PersonId[];
  /** 'each' = every assignee must tick; 'any' = one tick completes it */
  mode: 'each' | 'any';
  /** person -> timestamp done */
  done?: Record<PersonId, number>;
  due?: string | null; // ISO date
  priority?: 'high' | 'normal' | 'low';
  link?: string | null;
  guide?: string | null; // guide id
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string; // 'CZK' | 'EUR' | ...
  paidBy: PersonId;
  split: PersonId[];
  date: string; // ISO
  category?: string;
  note?: string | null;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  by?: PersonId;
}

export type Collection = 'people' | 'places' | 'events' | 'ideas' | 'tasks' | 'expenses' | 'notes';



/** A synced record envelope. data === null means deleted (tombstone). */
export interface SyncItem {
  col: Collection;
  id: string;
  data: unknown | null;
  /** updatedAt (ms epoch, client clock) */
  u: number;
  /** updated by person id */
  by: string;
  /** server revision when stored (set by server) */
  rev?: number;
}

export interface Presence {
  person: PersonId;
  lat: number;
  lon: number;
  acc?: number;
  heading?: number | null;
  speed?: number | null;
  ts: number;
  battery?: number | null;
  status?: string | null;
}

export interface LogEntry {
  ts: number;
  by: string;
  col: Collection;
  id: string;
  title: string;
  act: 'add' | 'edit' | 'del';
}

export interface ServerDoc {
  v: 1;
  rev: number;
  items: Record<string, SyncItem>;
  presence: Record<PersonId, Presence>;
  log: LogEntry[];
}

export interface StateResponse {
  ok: true;
  rev: number;
  items: SyncItem[];
  presence: Record<PersonId, Presence>;
  log: LogEntry[];
  serverTime: number;
  backend: string;
}
