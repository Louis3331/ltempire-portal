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
      `https://api.whop.com/api/v2/memberships?product_id=${productId}&per_page=50&expand[]=plan&expand[]=product`,
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

    const shaped = relevant.map((m) => {
      // Whop uses renewal_period_end for subscriptions, expires_at for lifetime/one-time
      const expiresAt = m.renewal_period_end || m.expires_at || null;
      const startsAt  = m.renewal_period_start || m.created_at || null;

      // Plan name: try expanded plan object, fall back to product name, then billing period
      let planName = null;
      if (m.plan?.name)         planName = m.plan.name;
      else if (m.product?.name) planName = m.product.name;
      else if (m.plan?.billing_period) planName = m.plan.billing_period;

      return {
        id: m.id,
        license_key: m.license_key,
        status: m.status,
        valid: m.valid,
        quantity: m.quantity,
        renewal_period_start: startsAt,
        renewal_period_end: expiresAt,
        product_id: m.product_id,
        plan: planName ? { id: m.plan?.id, name: planName, billing_period: m.plan?.billing_period } : null,
      };
    });

    return res.status(200).json({ memberships: shaped });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch memberships' });
  }
}
