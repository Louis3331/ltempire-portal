import { verifySession } from './auth/session';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = verifySession(req);
  if (!session?.email) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.whopUserId;
  if (!userId) return res.status(200).json({ memberships: [] });

  try {
    const productId = process.env.WHOP_PRODUCT_ID;
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?product_id=${productId}&per_page=50`,
      { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` } }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.log('Memberships fetch error:', response.status, errText);
      return res.status(200).json({ memberships: [], note: 'Membership details unavailable' });
    }

    const data = await response.json();
    // Strictly filter to this user's memberships only
    const all = (data.data || []).filter(m => {
      const mUserId = m.user_id || (typeof m.user === 'string' ? m.user : m.user?.id);
      return mUserId === userId;
    });
    const relevant = all;

    const shaped = relevant.map((m) => ({
      id: m.id,
      license_key: m.license_key,
      status: m.status,
      valid: m.valid,
      quantity: m.quantity,
      renewal_period_start: m.renewal_period_start,
      renewal_period_end: m.renewal_period_end,
      product_id: m.product_id,
      plan: m.plan ? { id: m.plan.id, name: m.plan.name, billing_period: m.plan.billing_period } : null,
    }));

    return res.status(200).json({ memberships: shaped });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch memberships' });
  }
}
