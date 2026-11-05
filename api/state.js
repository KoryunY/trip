import { docToResponse } from '../shared/merge.js';
import { hasBackend, json, readDoc } from './_lib/store.js';

export async function GET() {
  if (!hasBackend()) return json({ ok: false, error: 'no-backend' }, 503);
  try {
    const { doc } = await readDoc();
    return json(docToResponse(doc, 'vercel-blob'), 200, {
      'Cache-Control': 'public, max-age=0, s-maxage=5, stale-while-revalidate=10',
    });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

export function OPTIONS() {
  return json({ ok: true });
}
