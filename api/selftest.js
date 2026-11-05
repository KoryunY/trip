// Temporary: verifies Blob read/modify/write with ETag works in production.
import { applyOps } from '../shared/merge.js';
import { hasBackend, json, mutateDoc, readDoc } from './_lib/store.js';

export async function GET(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('run') !== '1') return json({ ok: true, hint: 'add ?run=1' });
  if (!hasBackend()) return json({ ok: false, error: 'no-backend' }, 503);
  const t0 = Date.now();
  try {
    const before = (await readDoc({ fresh: true })).doc.rev;
    const doc = await mutateDoc((d) => applyOps(d, [{ col: 'notes', id: '__selftest', data: null, u: Date.now(), by: 'selftest' }]) > 0);
    const after = (await readDoc({ fresh: true })).doc.rev;
    return json({ ok: true, before, written: doc.rev, after, ms: Date.now() - t0 }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e), stack: String(e?.stack || '').slice(0, 800) }, 500);
  }
}
