import { hasBackend, json } from './_lib/store.js';

export function GET() {
  return json({ ok: true, backend: hasBackend() ? 'vercel-blob' : 'none', time: Date.now() }, 200, { 'Cache-Control': 'no-store' });
}
