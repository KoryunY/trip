// Live clock + "time machine" (timelapse) state.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { HOUR, zonedToUtc } from './time';

export interface TimeState {
  mode: 'live' | 'sim';
  sim: number;
  playing: boolean;
  /** simulated ms per real second */
  speed: number;
}

export const SPEEDS = [
  { label: '1 min/s', v: 60_000 },
  { label: '10 min/s', v: 600_000 },
  { label: '1 h/s', v: HOUR },
  { label: '3 h/s', v: 3 * HOUR },
  { label: '12 h/s', v: 12 * HOUR },
];

// Allow ?now=2026-11-16T18:00 for demos/testing
function initialOverride(): number | null {
  try {
    const q = new URLSearchParams(location.search).get('now');
    if (!q) return null;
    const ms = Date.parse(q.length <= 16 ? `${q}:00+01:00` : q);
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
}
const nowOffset = (() => {
  const o = initialOverride();
  return o ? o - Date.now() : 0;
})();
export const realNow = () => Date.now() + nowOffset;

let ts: TimeState = { mode: 'live', sim: realNow(), playing: false, speed: HOUR };
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function setTS(patch: Partial<TimeState>) {
  ts = { ...ts, ...patch };
  emit();
}
export function useTimeState(): TimeState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ts,
    () => ts,
  );
}

export function rangeBounds(): [number, number] {
  const tripStartish = zonedToUtc('2026-11-12', '20:00');
  const end = zonedToUtc('2026-11-22', '18:00');
  const start = Math.min(realNow() - HOUR, tripStartish);
  return [start, Math.max(end, realNow() + HOUR)];
}

/** returns the next "interesting" instant after t (an event boundary), or null */
let nextActivity: ((t: number) => number | null) | null = null;
export function setActivityProvider(fn: (t: number) => number | null) {
  nextActivity = fn;
}
const skipListeners = new Set<(from: number, to: number) => void>();
export function onSkip(fn: (from: number, to: number) => void) {
  skipListeners.add(fn);
  return () => {
    skipListeners.delete(fn);
  };
}

let raf = 0;
let lastFrame = 0;
let lastSkipCheck = 0;
function frame(t: number) {
  if (!ts.playing) return;
  const dt = lastFrame ? Math.min(250, t - lastFrame) : 16;
  lastFrame = t;
  const [, end] = rangeBounds();
  let next = ts.sim + (dt / 1000) * ts.speed;
  // smart skip: jump over quiet stretches (nights, days before the trip)
  if (nextActivity && t - lastSkipCheck > 120) {
    lastSkipCheck = t;
    const na = nextActivity(ts.sim);
    if (na != null && na - ts.sim > 5 * 3600_000 && ts.speed <= 3 * 3600_000) {
      const to = Math.min(end, na - 45 * 60_000);
      if (to > next) {
        skipListeners.forEach((l) => l(ts.sim, to));
        next = to;
      }
    }
  }
  if (next >= end) {
    next = end;
    setTS({ sim: next, playing: false });
    return;
  }
  setTS({ sim: next });
  raf = requestAnimationFrame(frame);
}

export const timeMachine = {
  goLive() {
    cancelAnimationFrame(raf);
    setTS({ mode: 'live', playing: false, sim: realNow() });
  },
  setSim(ms: number) {
    const [a, b] = rangeBounds();
    setTS({ mode: 'sim', sim: Math.max(a, Math.min(b, ms)) });
  },
  play() {
    if (ts.mode === 'live') setTS({ mode: 'sim', sim: realNow() });
    const [, end] = rangeBounds();
    if (ts.sim >= end - 1000) setTS({ sim: rangeBounds()[0] });
    setTS({ playing: true });
    lastFrame = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  },
  pause() {
    cancelAnimationFrame(raf);
    setTS({ playing: false });
  },
  toggle() {
    if (ts.playing) this.pause();
    else this.play();
  },
  setSpeed(v: number) {
    setTS({ speed: v });
  },
  get: () => ts,
};

/** Live clock ticking every `every` ms */
export function useNow(every = 15_000): number {
  const [now, setNow] = useState(realNow);
  useEffect(() => {
    const id = setInterval(() => setNow(realNow()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}

/** Sim cursor quantised to `quant` ms (or -1 when live), so subscribers only re-render when it moves enough */
function useSimQuantised(quant: number): number {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (ts.mode === 'live' ? -1 : quant > 0 ? Math.floor(ts.sim / quant) * quant : ts.sim),
    () => -1,
  );
}

/** Effective time for the UI: live clock or the time-machine cursor (quantised for cheap re-renders) */
export function useTripTime(every = 15_000, quant = 60_000): { t: number; live: boolean } {
  const now = useNow(every);
  const sim = useSimQuantised(quant);
  return sim === -1 ? { t: now, live: true } : { t: sim, live: false };
}
