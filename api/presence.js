import { sanitizePresence } from '../shared/merge.js';
import { authorized, hasBackend, json, mutateDoc } from './_lib/store.js';

export async function POST(request) {
  if (!hasBackend()) return json({ ok: false, error: 'no-backend' }, 503);
  if (!authorized(request)) return json({ ok: false, error: 'bad-key' }, 401);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400);
  }
  try {
    if (body && body.off === true && typeof body.person === 'string') {
      await mutateDoc((d) => {
        if (!d.presence[body.person]) return false;
        delete d.presence[body.person];
        return true;
      });
      return json({ ok: true });
    }
    const p = sanitizePresence(body);
    if (!p) return json({ ok: false, error: 'bad-presence' }, 400);
    const doc = await mutateDoc((d) => {
      d.presence[p.person] = p;
      return true;
    });
    return json({ ok: true, presence: doc.presence }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export function OPTIONS() {
  return json({ ok: true });
}
