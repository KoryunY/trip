import { getLang, t as tx } from '../i18n';
// Time helpers. The trip lives in Europe/Prague (CET, UTC+1 during 13–22 Nov 2026).
export const TZ = 'Europe/Prague';
export const MIN = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;

export const TRIP_START_DAY = '2026-11-13';
export const TRIP_END_DAY = '2026-11-22';

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string, opts: Intl.DateTimeFormatOptions, loc?: string) {
  const locale = loc ?? (getLang() === 'ru' ? 'ru-RU' : 'en-GB');
  const key = tz + locale + JSON.stringify(opts);
  let f = dtfCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts });
    dtfCache.set(key, f);
  }
  return f;
}

export const toMs = (v: string | number | Date) => (typeof v === 'number' ? v : typeof v === 'string' ? Date.parse(v) : v.getTime());

/** Offset (minutes) of tz at given UTC instant, e.g. +60 for Prague in Nov */
export function tzOffsetMin(utcMs: number, tz = TZ): number {
  const parts = dtf(
    tz,
    {
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    },
    'en-GB',
  ).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second'));
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / MIN);
}

/** wall-clock date+time in tz -> UTC ms */
export function zonedToUtc(dateKey: string, time: string, tz = TZ): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm || 0);
  const off1 = tzOffsetMin(guess, tz);
  let utc = guess - off1 * MIN;
  const off2 = tzOffsetMin(utc, tz);
  if (off2 !== off1) utc = guess - off2 * MIN;
  return utc;
}

const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');

/** UTC ms -> ISO string with tz offset, e.g. 2026-11-13T06:45:00+01:00 */
export function isoInTz(ms: number, tz = TZ): string {
  const off = tzOffsetMin(ms, tz);
  const local = new Date(ms + off * MIN);
  const sign = off >= 0 ? '+' : '-';
  return (
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:00${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
  );
}

/** YYYY-MM-DD of instant in tz */
export function dayKey(ms: number, tz = TZ): string {
  const p = dtf(tz, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-GB').formatToParts(new Date(ms));
  const g = (t: string) => p.find((x) => x.type === t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

/** HH:MM in tz */
export function hhmm(ms: number, tz = TZ): string {
  return dtf(tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ms));
}

export function fmtDayShort(ms: number, tz = TZ) {
  return dtf(tz, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(ms));
}
export function fmtDayLong(ms: number, tz = TZ) {
  return dtf(tz, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(ms));
}
export function fmtDayMonth(ms: number, tz = TZ) {
  return dtf(tz, { day: 'numeric', month: 'short' }).format(new Date(ms));
}
export function fmtWeekday(ms: number, tz = TZ) {
  return dtf(tz, { weekday: 'short' }).format(new Date(ms));
}
export function fmtDateTime(ms: number, tz = TZ) {
  return `${fmtDayShort(ms, tz)} · ${hhmm(ms, tz)}`;
}

/** noon of a day key in Prague -> ms (handy anchor) */
export const dayNoon = (key: string) => zonedToUtc(key, '12:00');
export const dayStart = (key: string) => zonedToUtc(key, '00:00');

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function tripDays(): string[] {
  const out: string[] = [];
  let k = TRIP_START_DAY;
  while (k <= TRIP_END_DAY) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

/** "in 3d 4h", "in 25 min", "2h ago" */
export function relTime(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  const abs = Math.abs(diff);
  const ru = getLang() === 'ru';
  const [uD, uH, uM, uMin] = ru ? ['д', 'ч', 'м', 'мин'] : ['d', 'h', 'm', 'min'];
  let s: string;
  if (abs < MIN) return ru ? 'сейчас' : 'now';
  else if (abs < HOUR) s = `${Math.round(abs / MIN)} ${uMin}`;
  else if (abs < DAY) {
    const h = Math.floor(abs / HOUR);
    const m = Math.round((abs % HOUR) / MIN);
    s = m && h < 6 ? `${h}${uH} ${m}${uM}` : `${h}${uH}`;
  } else {
    const d = Math.floor(abs / DAY);
    const h = Math.round((abs % DAY) / HOUR);
    s = h ? `${d}${uD} ${h}${uH}` : `${d}${uD}`;
  }
  if (ru) return diff > 0 ? `через ${s}` : `${s} назад`;
  return diff > 0 ? `in ${s}` : `${s} ago`;
}

export function durationLabel(ms: number): string {
  const ru = getLang() === 'ru';
  const m = Math.round(ms / MIN);
  if (m < 60) return `${m} ${ru ? 'мин' : 'min'}`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  const [uh, um] = ru ? ['ч', 'м'] : ['h', 'm'];
  return r ? `${h}${uh} ${r}${um}` : `${h}${uh}`;
}

export function countdownParts(targetMs: number, nowMs: number) {
  const d = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(d / DAY),
    hours: Math.floor((d % DAY) / HOUR),
    minutes: Math.floor((d % HOUR) / MIN),
    seconds: Math.floor((d % MIN) / 1000),
  };
}

export const TZ_LABEL: Record<string, string> = {
  'Europe/Prague': tx('Prague'),
  'Asia/Yerevan': tx('Yerevan'),
  'Europe/Zurich': tx('Zürich'),
};
