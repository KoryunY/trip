import { applyOps, docToResponse, sanitizeOps } from '../shared/merge.js';
import { authorized, hasBackend, json, mutateDoc, readDoc } from './_lib/store.js';

export async function POST(request) {
  if (!hasBackend()) return json({ ok: false, error: 'no-backend' }, 503);
  if (!authorized(request)) return json({ ok: false, error: 'bad-key' }, 401);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400);
  }
  const ops = sanitizeOps(body?.ops);
  try {
    const doc = ops.length ? await mutateDoc((d) => applyOps(d, ops) > 0) : (await readDoc({ fresh: true })).doc;
    return json({ ...docToResponse(doc, 'vercel-blob'), accepted: ops.length }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export function OPTIONS() {
  return json({ ok: true });
}
