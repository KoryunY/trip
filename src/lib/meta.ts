import type { LucideIcon } from 'lucide-react';
import {
  Banknote,
  Beer,
  BedDouble,
  Binoculars,
  Building2,
  Bus,
  CarTaxiFront,
  ClipboardCheck,
  Coffee,
  Footprints,
  Gamepad2,
  Guitar,
  House,
  Landmark,
  Luggage,
  MapPin,
  PartyPopper,
  Plane,
  PlaneTakeoff,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  TrainFront,
  TramFront,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
  ShieldCheck,
  Package,
} from 'lucide-react';
import type { EventKind, PlaceCategory, TaskCategory } from '../../shared/types';
import { getLang, t as tx } from '../i18n';
import { CONTENT_RU } from '../i18n/content.ru';

export const KIND: Record<EventKind, { label: string; icon: LucideIcon; color: string }> = {
  flight: { label: tx('Flight'), icon: Plane, color: 'var(--k-flight)' },
  train: { label: tx('Train'), icon: TrainFront, color: 'var(--k-train)' },
  bus: { label: tx('Bus'), icon: Bus, color: 'var(--k-bus)' },
  transit: { label: tx('Transit'), icon: TramFront, color: 'var(--k-transit)' },
  walk: { label: tx('Walk'), icon: Footprints, color: 'var(--k-walk)' },
  taxi: { label: tx('Taxi'), icon: CarTaxiFront, color: 'var(--k-taxi)' },
  airport: { label: tx('Airport'), icon: PlaneTakeoff, color: 'var(--k-airport)' },
  sight: { label: tx('Sightseeing'), icon: Landmark, color: 'var(--k-sight)' },
  food: { label: tx('Food'), icon: UtensilsCrossed, color: 'var(--k-food)' },
  beer: { label: tx('Beer'), icon: Beer, color: 'var(--k-beer)' },
  concert: { label: tx('Concert'), icon: Guitar, color: 'var(--k-concert)' },
  gaming: { label: tx('Gaming'), icon: Gamepad2, color: 'var(--k-gaming)' },
  rest: { label: tx('Rest'), icon: BedDouble, color: 'var(--k-rest)' },
  party: { label: tx('Night out'), icon: PartyPopper, color: 'var(--k-party)' },
  shopping: { label: tx('Shopping'), icon: ShoppingBag, color: 'var(--k-shopping)' },
  meet: { label: tx('Meet'), icon: Users, color: 'var(--k-meet)' },
  errand: { label: tx('Errand'), icon: ClipboardCheck, color: 'var(--k-errand)' },
  other: { label: tx('Other'), icon: Sparkles, color: 'var(--k-other)' },
};
export const KIND_ORDER = Object.keys(KIND) as EventKind[];
export const TRAVEL_KINDS: EventKind[] = ['flight', 'train', 'bus', 'transit', 'walk', 'taxi'];

/** hex colors for map rendering (CSS vars can't be used in WebGL) */
export const KIND_HEX: Record<EventKind, string> = {
  flight: '#3b82f6',
  train: '#0ea5e9',
  bus: '#0891b2',
  transit: '#64748b',
  walk: '#84cc16',
  taxi: '#eab308',
  airport: '#6366f1',
  sight: '#8b5cf6',
  food: '#f97316',
  beer: '#f2a007',
  concert: '#e11d48',
  gaming: '#16a34a',
  rest: '#94a3b8',
  party: '#d946ef',
  shopping: '#ec4899',
  meet: '#14b8a6',
  errand: '#78716c',
  other: '#a8a29e',
};

export const CAT: Record<PlaceCategory, { label: string; plural: string; emoji: string; color: string; icon: LucideIcon }> = {
  home: { label: tx('Home'), plural: tx('Home'), emoji: '🏠', color: '#18171b', icon: House },
  sight: { label: tx('Sight'), plural: tx('Sights'), emoji: '🏛️', color: '#8b5cf6', icon: Landmark },
  viewpoint: { label: tx('Viewpoint'), plural: tx('Views'), emoji: '🌄', color: '#7c3aed', icon: Binoculars },
  beer: { label: tx('Beer'), plural: tx('Beer'), emoji: '🍺', color: '#e09400', icon: Beer },
  food: { label: tx('Food'), plural: tx('Food'), emoji: '🍽️', color: '#f97316', icon: UtensilsCrossed },
  cafe: { label: tx('Café'), plural: tx('Cafés'), emoji: '☕', color: '#a16207', icon: Coffee },
  nightlife: { label: tx('Nightlife'), plural: tx('Night'), emoji: '🎉', color: '#d946ef', icon: PartyPopper },
  shop: { label: tx('Shop'), plural: tx('Shops'), emoji: '🛒', color: '#ec4899', icon: Store },
  transport: { label: tx('Transport'), plural: tx('Transport'), emoji: '🚉', color: '#475569', icon: TramFront },
  venue: { label: tx('Venue'), plural: tx('Venues'), emoji: '🎸', color: '#e11d48', icon: Ticket },
  museum: { label: tx('Museum'), plural: tx('Museums'), emoji: '🖼️', color: '#6d28d9', icon: Building2 },
  daytrip: { label: tx('Day trip'), plural: tx('Day trips'), emoji: '🚆', color: '#0ea5e9', icon: TrainFront },
  service: { label: tx('Service'), plural: tx('Services'), emoji: '🧳', color: '#57534e', icon: Wrench },
  city: { label: tx('City'), plural: tx('Cities'), emoji: '📍', color: '#334155', icon: MapPin },
};
export const CAT_ORDER = Object.keys(CAT) as PlaceCategory[];

export const TASK_CAT: Record<TaskCategory, { label: string; icon: LucideIcon }> = {
  docs: { label: tx('Documents & border'), icon: ShieldCheck },
  flights: { label: tx('Flights & travel'), icon: Luggage },
  connectivity: { label: tx('Phone & data'), icon: Smartphone },
  apps: { label: tx('Apps'), icon: Smartphone },
  money: { label: tx('Money'), icon: Wallet },
  apartment: { label: tx('Apartment'), icon: House },
  gta: { label: tx('GTA VI night'), icon: Gamepad2 },
  concert: { label: tx('Korn night'), icon: Guitar },
  bookings: { label: tx('Bookings & decisions'), icon: Ticket },
  packing: { label: tx('Packing'), icon: Package },
  other: { label: tx('Other'), icon: Banknote },
};
export const TASK_CAT_ORDER = Object.keys(TASK_CAT) as TaskCategory[];


const DAY_THEMES_EN: Record<string, { title: string; emoji: string }> = {
  '2026-11-13': { title: 'Arrival · Friday the 13th', emoji: '🛬' },
  '2026-11-14': { title: 'Crew complete · Castle day', emoji: '🏰' },
  '2026-11-15': { title: 'Views & beer halls', emoji: '🍺' },
  '2026-11-16': { title: 'KORN night', emoji: '🎸' },
  '2026-11-17': { title: 'Velvet Revolution Day', emoji: '🕯️' },
  '2026-11-18': { title: 'Plzeň beer pilgrimage', emoji: '🚆' },
  '2026-11-19': { title: 'GTA VI release day', emoji: '🎮' },
  '2026-11-20': { title: 'Kutná Hora + Friday night', emoji: '💀' },
  '2026-11-21': { title: 'Last full day', emoji: '🥨' },
  '2026-11-22': { title: 'Goodbye Prague', emoji: '👋' },
};

export const DAY_THEMES: Record<string, { title: string; emoji: string }> = Object.fromEntries(
  Object.entries(DAY_THEMES_EN).map(([k, v]) => [k, { ...v, title: getLang() === 'ru' ? (CONTENT_RU.dayThemes[k] ?? v.title) : v.title }]),
);

export const SUN: Record<string, [string, string]> = {
  '2026-11-13': ['07:12', '16:21'],
  '2026-11-14': ['07:14', '16:19'],
  '2026-11-15': ['07:15', '16:18'],
  '2026-11-16': ['07:17', '16:17'],
  '2026-11-17': ['07:19', '16:15'],
  '2026-11-18': ['07:20', '16:14'],
  '2026-11-19': ['07:22', '16:13'],
  '2026-11-20': ['07:23', '16:12'],
  '2026-11-21': ['07:25', '16:11'],
  '2026-11-22': ['07:26', '16:10'],
};
