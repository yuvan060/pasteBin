import { redis } from '../repositories/redisClient.js';
import { generateId } from '../utils/idGenerator.js';
import { escapeHtml } from '../utils/htmlEscape.js';
import { nowMs } from './timeProvider.js';

function key(id) {
  return `paste:${id}`;
}

function validateCreate(body) {
  const { content, ttl_seconds, max_views } = body || {};
  if (typeof content !== 'string' || content.trim().length === 0) {
    const e = new Error('content is required');
    e.status = 400;
    throw e;
  }
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      const e = new Error('ttl_seconds must be integer >= 1');
      e.status = 400;
      throw e;
    }
  }
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      const e = new Error('max_views must be integer >= 1');
      e.status = 400;
      throw e;
    }
  }
  return { content, ttl_seconds, max_views };
}

export async function createPaste(req) {
  const { content, ttl_seconds, max_views } = validateCreate(req.body);
  const id = generateId();
  const created = nowMs(req);
  const expires_at_ms = ttl_seconds ? created + ttl_seconds * 1000 : null;

  const fields = {
    content,
    created_at_ms: String(created),
    views: '0'
  };
  if (expires_at_ms !== null) fields.expires_at_ms = String(expires_at_ms);
  if (max_views !== undefined) fields.max_views = String(max_views);

  await redis.hSet(key(id), fields);

  const base = process.env.FRONTEND_BASE_URL || '';
  return {
    id,
    url: `${base}/p/${id}`
  };
}

async function fetchAndCheck(req, countView) {
  const id = req.params.id;
  const k = key(id);
  const data = await redis.hGetAll(k);
  if (!data || !data.content) throw new Error('Not Found');

  const now = nowMs(req);

  if (data.expires_at_ms) {
    const exp = Number(data.expires_at_ms);
    if (now >= exp) {
      await redis.del(k);
      throw new Error('Expired');
    }
  }

  let views = Number(data.views || 0);
  const maxViews = data.max_views !== undefined ? Number(data.max_views) : null;

  if (countView) {
    views = await redis.hIncrBy(k, 'views', 1);
  }

  if (maxViews !== null && views > maxViews) {
    await redis.del(k);
    throw new Error('Exceeded');
  }

  const remaining_views = maxViews !== null ? Math.max(0, maxViews - views) : null;
  const expires_at = data.expires_at_ms ? new Date(Number(data.expires_at_ms)).toISOString() : null;

  return { content: data.content, remaining_views, expires_at };
}

export async function getPasteAPI(req) {
  return fetchAndCheck(req, true);
}

export async function getPasteForViewHTML(req) {
  const { content } = await fetchAndCheck(req, true);
  const safe = escapeHtml(content);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Paste</title></head>
<body><pre>${safe}</pre></body></html>`;
}
