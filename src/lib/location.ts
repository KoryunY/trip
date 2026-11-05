// Device GPS + compass. Shared singleton so every screen sees the same fix.
import { useSyncExternalStore } from 'react';
import { getSettings } from './store';
import { sendPresence } from './sync';

export interface Fix {
  lat: number;
  lon: number;
  acc: number;
  heading: number | null;
  speed: number | null;
  ts: number;
}

interface LocState {
  fix: Fix | null;
  watching: boolean;
  error: string | null;
  compass: number | null; // degrees from north (device heading)
  compassAllowed: boolean;
}

let st: LocState = { fix: null, watching: false, error: null, compass: null, compassAllowed: false };
const ls = new Set<() => void>();
function set(p: Partial<LocState>) {
  st = { ...st, ...p };
  ls.forEach((l) => l());
}
export function useLocation() {
  return useSyncExternalStore(
    (l) => {
      ls.add(l);
      return () => ls.delete(l);
    },
    () => st,
  );
}
export const getFix = () => st.fix;

let watchId: number | null = null;
export function startWatch() {
  if (watchId != null || !('geolocation' in navigator)) {
    if (!('geolocation' in navigator)) set({ error: 'No GPS in this browser' });
    return;
  }
  set({ watching: true, error: null });
  watchId = navigator.geolocation.watchPosition(
    (p) => {
      const fix: Fix = {
        lat: p.coords.latitude,
        lon: p.coords.longitude,
        acc: p.coords.accuracy,
        heading: Number.isFinite(p.coords.heading as number) ? (p.coords.heading as number) : null,
        speed: Number.isFinite(p.coords.speed as number) ? (p.coords.speed as number) : null,
        ts: p.timestamp,
      };
      set({ fix, error: null });
      if (getSettings().shareLocation) void sendPresence({ lat: fix.lat, lon: fix.lon, acc: Math.round(fix.acc), heading: fix.heading, speed: fix.speed });
    },
    (err) => {
      set({ error: err.code === 1 ? 'Location permission denied' : 'Location unavailable' });
      if (err.code === 1) stopWatch();
    },
    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
  );
}
export function stopWatch() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  set({ watching: false });
}

export async function locateOnce(): Promise<Fix | null> {
  startWatch();
  if (st.fix && Date.now() - st.fix.ts < 60_000) return st.fix;
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      un();
      resolve(st.fix);
    }, 15_000);
    const l = () => {
      if (st.fix && Date.now() - st.fix.ts < 60_000) {
        clearTimeout(t);
        un();
        resolve(st.fix);
      }
    };
    ls.add(l);
    const un = () => ls.delete(l);
  });
}

// ── compass ──
let compassOn = false;
function onOrient(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
  let h: number | null = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (e.absolute && e.alpha != null) h = (360 - e.alpha) % 360;
  if (h != null) {
    const angle = (screen.orientation?.angle ?? 0) as number;
    set({ compass: (h + angle + 360) % 360 });
  }
}
export async function startCompass(): Promise<boolean> {
  if (compassOn) return true;
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  try {
    if (DOE?.requestPermission) {
      const r = await DOE.requestPermission();
      if (r !== 'granted') return false;
    }
  } catch {
    return false;
  }
  compassOn = true;
  set({ compassAllowed: true });
  window.addEventListener('deviceorientationabsolute', onOrient as EventListener, true);
  window.addEventListener('deviceorientation', onOrient as EventListener, true);
  return true;
}
export function stopCompass() {
  compassOn = false;
  window.removeEventListener('deviceorientationabsolute', onOrient as EventListener, true);
  window.removeEventListener('deviceorientation', onOrient as EventListener, true);
}
