import { kv } from '@vercel/kv';
import { verifySession } from './auth/session';

const KEY = (uid) => `journal:${uid}`;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function pruneOld(trades) {
  const cutoff = Date.now() - ONE_YEAR_MS;
  return trades.filter(t => new Date(t.closeTime).getTime() >= cutoff);
}

export default async function handler(req, res) {
  const session = verifySession(req);
  if (!session?.whopUserId) return res.status(401).json({ error: 'Not authenticated' });

  const uid = session.whopUserId;
  const key = KEY(uid);

  /* ── GET — fetch all trades ── */
  if (req.method === 'GET') {
    const trades = pruneOld((await kv.get(key)) || []);
    await kv.set(key, trades); // persist pruned list
    return res.status(200).json({ trades });
  }

  /* ── POST — add trades (import or manual) ── */
  if (req.method === 'POST') {
    const { trades: incoming } = req.body;
    if (!Array.isArray(incoming)) return res.status(400).json({ error: 'Invalid payload' });

    const existing = pruneOld((await kv.get(key)) || []);
    const existingTickets = new Set(existing.map(t => String(t.ticket)));

    const cutoff = Date.now() - ONE_YEAR_MS;
    let added = 0;
    let skipped = 0;

    for (const t of incoming) {
      const closeTs = new Date(t.closeTime).getTime();
      if (isNaN(closeTs) || closeTs < cutoff) { skipped++; continue; }
      if (existingTickets.has(String(t.ticket)))  { skipped++; continue; }
      existing.push({ ...t, ticket: String(t.ticket) });
      existingTickets.add(String(t.ticket));
      added++;
    }

    // sort by closeTime desc
    existing.sort((a, b) => new Date(b.closeTime) - new Date(a.closeTime));
    await kv.set(key, existing);

    return res.status(200).json({ ok: true, added, skipped });
  }

  /* ── DELETE — remove one trade or all ── */
  if (req.method === 'DELETE') {
    const { ticket, all } = req.query;
    if (all === 'true') {
      await kv.del(key);
      return res.status(200).json({ ok: true });
    }
    if (!ticket) return res.status(400).json({ error: 'Missing ticket' });
    let trades = (await kv.get(key)) || [];
    trades = trades.filter(t => String(t.ticket) !== String(ticket));
    await kv.set(key, trades);
    return res.status(200).json({ ok: true });
  }

  /* ── PATCH — update notes on a trade ── */
  if (req.method === 'PATCH') {
    const { ticket, notes } = req.body;
    if (!ticket) return res.status(400).json({ error: 'Missing ticket' });
    let trades = (await kv.get(key)) || [];
    trades = trades.map(t => String(t.ticket) === String(ticket) ? { ...t, notes } : t);
    await kv.set(key, trades);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
