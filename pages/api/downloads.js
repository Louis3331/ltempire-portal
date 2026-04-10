import { kv } from '@vercel/kv';
import { verifySession } from './auth/session';
import crypto from 'crypto';

function isAdmin(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers.authorization === `Bearer ${secret}`;
}

export default async function handler(req, res) {

  // ── Track download + redirect (GET ?download=id) ──────────────
  if (req.method === 'GET' && req.query.download) {
    const session = verifySession(req);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    const id = req.query.download;
    const list = (await kv.get('downloads:list')) || [];
    const file = list.find(d => d.id === id && d.active !== false);
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Increment download counter (non-blocking)
    kv.incr(`downloads:count:${id}`).catch(() => {});

    return res.redirect(302, file.url);
  }

  // ── List downloads (GET) ──────────────────────────────────────
  if (req.method === 'GET') {
    const session = verifySession(req);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    const list = (await kv.get('downloads:list')) || [];
    const active = list.filter(d => d.active !== false);

    // Fetch download counts in parallel
    const counts = await Promise.all(
      active.map(d => kv.get(`downloads:count:${d.id}`).catch(() => 0))
    );

    const downloads = active.map((d, i) => ({ ...d, downloadCount: counts[i] || 0 }));
    return res.status(200).json({ downloads });
  }

  // ── Admin: add/update download (POST) ────────────────────────
  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

    const { id, name, version, description, category, filename, url, size, changelog } = req.body;
    if (!name || !url || !category) return res.status(400).json({ error: 'name, url and category are required' });

    const list = (await kv.get('downloads:list')) || [];

    if (id) {
      // Update existing
      const idx = list.findIndex(d => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      list[idx] = { ...list[idx], name, version, description, category, filename, url, size, changelog };
      await kv.set('downloads:list', list);
      return res.status(200).json({ ok: true, file: list[idx] });
    }

    // New entry
    const newFile = {
      id: crypto.randomUUID(),
      name,
      version: version || '',
      description: description || '',
      category,       // 'ea' | 'guide' | 'resource'
      filename: filename || name,
      url,
      size: size || '',
      changelog: changelog || '',
      releaseDate: new Date().toISOString().split('T')[0],
      active: true,
    };
    list.push(newFile);
    await kv.set('downloads:list', list);
    return res.status(201).json({ ok: true, file: newFile });
  }

  // ── Admin: delete download (DELETE ?id=xxx) ──────────────────
  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const list = (await kv.get('downloads:list')) || [];
    const updated = list.filter(d => d.id !== id);
    await kv.set('downloads:list', updated);
    await kv.del(`downloads:count:${id}`).catch(() => {});

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
