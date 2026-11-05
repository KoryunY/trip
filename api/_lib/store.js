// Vercel Blob-backed document store with optimistic concurrency (ETag ifMatch).
import { get, put, BlobPreconditionFailedError, BlobNotFoundError } from '@vercel/blob';
import { emptyDoc } from '../../shared/merge.js';

const PATH = process.env.TRIP_DOC_PATH || 'prague-crew/state.json';
let memo = null; // { doc, etag, at }

export function hasBackend() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function readDoc({ fresh = false } = {}) {
  if (!fresh && memo && Date.now() - memo.at < 2500) {
    return { doc: structuredClone(memo.doc), etag: memo.etag };
  }
  let res = null;
  try {
    res = await get(PATH, { access: 'private', useCache: false });
  } catch (e) {
    if (e instanceof BlobNotFoundError || e?.name === 'BlobNotFoundError') res = null;
    else throw e;
  }
  if (!res || res.statusCode !== 200 || !res.stream) {
    return { doc: emptyDoc(), etag: null };
  }
  const text = await new Response(res.stream).text();
  let doc;
  try {
    doc = JSON.parse(text);
  } catch {
    doc = emptyDoc();
  }
  if (!doc || typeof doc !== 'object' || !doc.items) doc = emptyDoc();
  doc.presence ||= {};
  doc.log ||= [];
  memo = { doc, etag: res.blob.etag, at: Date.now() };
  return { doc: structuredClone(doc), etag: res.blob.etag };
}

/** Read-modify-write with retries. fn(doc) returns true if it changed the doc. */
export async function mutateDoc(fn) {
  let lastErr = null;
  for (let attempt = 0; attempt < 7; attempt++) {
    const { doc, etag } = await readDoc({ fresh: true });
    const changed = fn(doc);
    if (!changed) return doc;
    try {
      const opts = {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      };
      if (etag) opts.ifMatch = etag;
      const r = await put(PATH, JSON.stringify(doc), opts);
      memo = { doc, etag: r.etag, at: Date.now() };
      return doc;
    } catch (e) {
      lastErr = e;
      if (e instanceof BlobPreconditionFailedError || e?.name === 'BlobPreconditionFailedError') {
        await sleep(40 + Math.random() * 150 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error('conflict');
}

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Trip-Key',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      ...headers,
    },
  });
}

/** Optional shared trip key: if TRIP_KEY env is set, writes must send X-Trip-Key. */
export function authorized(request) {
  const key = process.env.TRIP_KEY;
  if (!key) return true;
  return request.headers.get('x-trip-key') === key;
}
