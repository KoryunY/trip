// Shared merge logic (plain JS so Vercel functions run it without a TS build step).
// Types: see merge.d.ts / types.ts

export const COLLECTIONS = ['people', 'places', 'events', 'ideas', 'tasks', 'expenses', 'notes'];

export const itemKey = (col, id) => `${col}:${id}`;

export function emptyDoc() {
  return { v: 1, rev: 0, items: {}, presence: {}, log: [] };
}

/** true if incoming should replace existing (last-writer-wins, deterministic tie-break) */
export function newer(incoming, existing) {
  if (!existing) return true;
  if (incoming.u !== existing.u) return incoming.u > existing.u;
  return String(incoming.by) > String(existing.by);
}

function titleOf(data, fallback) {
  if (data && typeof data === 'object') {
    const t = data.title ?? data.name;
    if (typeof t === 'string') return t.slice(0, 80);
  }
  return fallback;
}

const MAX_LOG = 200;
const MAX_ITEM_BYTES = 64000;

export function sanitizeOps(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const o of raw.slice(0, 500)) {
    if (!o || typeof o !== 'object') continue;
    if (!COLLECTIONS.includes(o.col)) continue;
    if (typeof o.id !== 'string' || !o.id || o.id.length > 120) continue;
    if (typeof o.u !== 'number' || !Number.isFinite(o.u)) continue;
    const by = typeof o.by === 'string' ? o.by.slice(0, 40) : 'unknown';
    const data = o.data === undefined ? null : o.data;
    if (data !== null && JSON.stringify(data).length > MAX_ITEM_BYTES) continue;
    const u = Math.min(o.u, Date.now() + 86400000);
    out.push({ col: o.col, id: o.id, data, u, by });
  }
  return out;
}

/** Apply ops to doc in place. Returns number of applied ops. */
export function applyOps(doc, ops, now = Date.now()) {
  let applied = 0;
  for (const op of ops) {
    const key = itemKey(op.col, op.id);
    const existing = doc.items[key];
    if (!newer(op, existing)) continue;
    if (applied === 0) doc.rev += 1;
    applied++;
    doc.items[key] = { col: op.col, id: op.id, data: op.data, u: op.u, by: op.by, rev: doc.rev };
    const entry = {
      ts: now,
      by: op.by,
      col: op.col,
      id: op.id,
      title: titleOf(op.data ?? (existing && existing.data), op.id),
      act: op.data === null ? 'del' : existing && existing.data !== null ? 'edit' : 'add',
    };
    const last = doc.log[doc.log.length - 1];
    if (last && last.id === entry.id && last.by === entry.by && last.col === entry.col && now - last.ts < 120000 && entry.act === 'edit') {
      last.ts = now;
    } else {
      doc.log.push(entry);
    }
  }
  if (doc.log.length > MAX_LOG) doc.log.splice(0, doc.log.length - MAX_LOG);
  return applied;
}

export function sanitizePresence(o) {
  if (!o || typeof o !== 'object') return null;
  if (typeof o.person !== 'string' || !o.person) return null;
  const lat = Number(o.lat);
  const lon = Number(o.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    person: o.person.slice(0, 40),
    lat,
    lon,
    acc: num(o.acc) ?? undefined,
    heading: num(o.heading),
    speed: num(o.speed),
    ts: Math.min(num(o.ts) ?? Date.now(), Date.now() + 60000),
    battery: num(o.battery),
    status: typeof o.status === 'string' ? o.status.slice(0, 80) : null,
  };
}

export function docToResponse(doc, backend) {
  return {
    ok: true,
    rev: doc.rev,
    items: Object.values(doc.items),
    presence: doc.presence,
    log: doc.log.slice(-60),
    serverTime: Date.now(),
    backend,
  };
}
