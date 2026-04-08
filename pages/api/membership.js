import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await fetch('https://api.whop.com/v5/me/memberships', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const productId = process.env.WHOP_PRODUCT_ID;

    // Filter to this product, or return all if no match
    const memberships = (data.data || []).filter(
      (m) => !productId || m.product_id === productId
    );

    const relevant = memberships.length > 0 ? memberships : (data.data || []);

    // Shape what the frontend needs
    const shaped = relevant.map((m) => ({
      id: m.id,
      license_key: m.license_key,
      status: m.status,
      valid: m.valid,
      quantity: m.quantity,
      renewal_period_start: m.renewal_period_start,
      renewal_period_end: m.renewal_period_end,
      plan: m.plan
        ? {
            id: m.plan.id,
            name: m.plan.name,
            billing_period: m.plan.billing_period,
          }
        : null,
    }));

    return res.status(200).json({ memberships: shaped });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch memberships' });
  }
}
