// Network sync: push pending edits, poll shared state, share live location.
import { useSyncExternalStore } from 'react';
import type { Presence, StateResponse } from '../../shared/types';
import {
  applyServerState,
  getMe,
  getSettings,
  onLocalChange,
  pendingCount,
  pendingOps,
  setPresenceLocal,
} from './store';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'local' | 'error';

interface SyncState {
  status: SyncStatus;
  lastOk: number;
  error: string | null;
  backend: string | null;
  pending: number;
}

let state: SyncState = { status: 'idle', lastOk: 0, error: null, backend: null, pending: pendingCount() };
const listeners = new Set<() => void>();
function set(patch: Partial<SyncState>) {
  state = { ...state, ...patch, pending: pendingCount() };
  listeners.forEach((l) => l());
}
export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

const base = () => (getSettings().apiBase || '').replace(/\/$/, '');
function headers(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const k = getSettings().tripKey;
  if (k) h['X-Trip-Key'] = k;
  return h;
}

async function fetchJSON(url: string, init?: RequestInit, timeoutMs = 12000): Promise<{ status: number; body: any }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal, cache: 'no-store' });
    let body: any = null;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) body = await r.json().catch(() => null);
    return { status: r.status, body };
  } finally {
    clearTimeout(t);
  }
}

let flushing = false;
let flushQueued = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let backoff = 0;

function interpret(status: number, body: any): 'ok' | 'local' | 'error' {
  if (status === 200 && body?.ok) return 'ok';
  if (status === 503 || status === 404 || status === 405 || (status === 200 && !body)) return 'local';
  return 'error';
}

export async function flush() {
  if (flushing) {
    flushQueued = true;
    return;
  }
  const ops = pendingOps();
  if (!ops.length) return;
  if (!navigator.onLine) {
    set({ status: 'offline' });
    return;
  }
  flushing = true;
  set({ status: 'syncing' });
  try {
    const { status, body } = await fetchJSON(`${base()}/api/sync`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ops }),
    });
    const kind = interpret(status, body);
    if (kind === 'ok') {
      applyServerState(body as StateResponse, true);
      backoff = 0;
      set({ status: 'synced', lastOk: Date.now(), error: null, backend: body.backend });
    } else if (kind === 'local') {
      set({ status: 'local', error: null });
    } else {
      backoff = Math.min(60000, (backoff || 2000) * 2);
      set({ status: 'error', error: body?.error || `HTTP ${status}` });
      scheduleFlush(backoff);
    }
  } catch (e) {
    set({ status: navigator.onLine ? 'error' : 'offline', error: String((e as Error)?.message || e) });
    backoff = Math.min(60000, (backoff || 2000) * 2);
    scheduleFlush(backoff);
  } finally {
    flushing = false;
    if (flushQueued) {
      flushQueued = false;
      scheduleFlush(300);
    }
  }
}

function scheduleFlush(ms = 1200) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, ms);
}

let polling = false;
export async function poll() {
  if (polling) return;
  if (!navigator.onLine) {
    set({ status: 'offline' });
    return;
  }
  polling = true;
  try {
    const { status, body } = await fetchJSON(`${base()}/api/state`);
    const kind = interpret(status, body);
    if (kind === 'ok') {
      applyServerState(body as StateResponse, false);
      set({ status: pendingCount() ? 'syncing' : 'synced', lastOk: Date.now(), error: null, backend: body.backend });
      if (pendingCount()) scheduleFlush(200);
    } else if (kind === 'local') {
      set({ status: 'local', error: null, backend: null });
    } else {
      set({ status: 'error', error: body?.error || `HTTP ${status}` });
    }
  } catch (e) {
    set({ status: navigator.onLine ? 'error' : 'offline', error: String((e as Error)?.message || e) });
  } finally {
    polling = false;
  }
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;
function loop() {
  if (pollTimer) clearTimeout(pollTimer);
  const visible = document.visibilityState === 'visible';
  const interval = state.status === 'local' ? 90_000 : visible ? 20_000 : 180_000;
  pollTimer = setTimeout(async () => {
    if (document.visibilityState === 'visible') await poll();
    loop();
  }, interval);
}

let started = false;
export function startSync() {
  if (started) return;
  started = true;
  onLocalChange(() => {
    set({});
    scheduleFlush();
  });
  void poll().then(() => flush());
  loop();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void poll();
      void flush();
      loop();
    }
  });
  window.addEventListener('online', () => {
    void flush();
    void poll();
  });
  window.addEventListener('offline', () => set({ status: 'offline' }));
}

// ---------- presence (opt-in live location) ----------
let lastSent: Presence | null = null;
let lastSentAt = 0;
export async function sendPresence(p: Omit<Presence, 'person' | 'ts'>, force = false) {
  const me = getMe();
  if (!me || !getSettings().shareLocation) return;
  const now = Date.now();
  const full: Presence = { ...p, person: me, ts: now };
  setPresenceLocal(full);
  if (!navigator.onLine) return;
  if (!force && lastSent) {
    const moved = Math.hypot((full.lat - lastSent.lat) * 111_000, (full.lon - lastSent.lon) * 71_000);
    const age = now - lastSentAt;
    // keep Blob writes low: at most every 90 s, and only when moved > 60 m (or a 5-min heartbeat)
    if (age < 90_000) return;
    if (moved < 60 && age < 5 * 60_000) return;
  }
  lastSent = full;
  lastSentAt = now;
  try {
    await fetchJSON(`${base()}/api/presence`, { method: 'POST', headers: headers(), body: JSON.stringify(full) }, 8000);
  } catch {
    /* ignore */
  }
}
export async function stopPresence() {
  const me = getMe();
  if (!me) return;
  lastSent = null;
  try {
    await fetchJSON(`${base()}/api/presence`, { method: 'POST', headers: headers(), body: JSON.stringify({ person: me, off: true }) }, 8000);
  } catch {
    /* ignore */
  }
}
