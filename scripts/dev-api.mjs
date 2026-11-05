// Local in-memory implementation of the sync API (same contract as /api on Vercel).
// Usage: node scripts/dev-api.mjs  (port 8787), then `API_PROXY=http://localhost:8787 npm run dev`
import http from 'node:http';
import { applyOps, docToResponse, emptyDoc, sanitizeOps, sanitizePresence } from '../shared/merge.js';

const doc = emptyDoc();
const port = Number(process.env.PORT || 8787);
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, X-Trip-Key' });
  res.end(JSON.stringify(body));
};
http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
    let body = null;
    if (req.method === 'POST') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      try {
        body = JSON.parse(Buffer.concat(chunks).toString() || 'null');
      } catch {
        return send(res, 400, { ok: false, error: 'bad-json' });
      }
    }
    if (url.pathname === '/api/health') return send(res, 200, { ok: true, backend: 'dev-memory' });
    if (url.pathname === '/api/state') return send(res, 200, docToResponse(doc, 'dev-memory'));
    if (url.pathname === '/api/sync' && req.method === 'POST') {
      const ops = sanitizeOps(body?.ops);
      applyOps(doc, ops);
      return send(res, 200, { ...docToResponse(doc, 'dev-memory'), accepted: ops.length });
    }
    if (url.pathname === '/api/presence' && req.method === 'POST') {
      if (body?.off) delete doc.presence[body.person];
      else {
        const p = sanitizePresence(body);
        if (!p) return send(res, 400, { ok: false });
        doc.presence[p.person] = p;
      }
      return send(res, 200, { ok: true });
    }
    send(res, 404, { ok: false });
  })
  .listen(port, () => console.log(`dev api on :${port}`));
