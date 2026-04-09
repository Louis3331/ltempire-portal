// Dashboard accounts API — GET to list, DELETE to remove
import { kv } from '@vercel/kv';
import { verifySession } from './auth/session';

async function getMemberships(userId) {
  const res = await fetch(
    `https://api.whop.com/api/v2/memberships?user_id=${userId}&per_page=50`,
    { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).filter(m => {
    const mUserId = m.user_id || (typeof m.user === 'string' ? m.user : m.user?.id);
    return mUserId === userId;
  });
}

export default async function handler(req, res) {
  const session = verifySession(req);
  if (!session?.whopUserId) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    const memberships = await getMemberships(session.whopUserId);
    const result = [];

    for (const m of memberships) {
      if (!m.license_key) continue;
      const accounts = (await kv.get(`accounts:${m.license_key}`)) || [];
      for (const a of accounts) {
        result.push({ ...a, licenseKey: m.license_key });
      }
    }

    return res.status(200).json({ accounts: result, maxAccounts: 2 });
  }

  if (req.method === 'DELETE') {
    const { licenseKey, id } = req.query;
    if (!licenseKey || !id) return res.status(400).json({ error: 'Missing params' });

    // Verify this license belongs to the session user
    const memberships = await getMemberships(session.whopUserId);
    const owns = memberships.some(m => m.license_key === licenseKey);
    if (!owns) return res.status(403).json({ error: 'Not your license' });

    const key = `accounts:${licenseKey}`;
    let accounts = (await kv.get(key)) || [];
    accounts = accounts.filter(a => a.id !== id);
    await kv.set(key, accounts);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
