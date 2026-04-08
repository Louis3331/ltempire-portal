import crypto from 'crypto';

function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Look up memberships by email using admin API key
  let memberships = [];
  try {
    // Use /api/v2/members endpoint (requires "Read members" permission)
    const url = `https://api.whop.com/api/v2/members?email=${encodeURIComponent(normalizedEmail)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    });
    const rawText = await response.text();
    console.log('Whop API url:', url);
    console.log('Whop API status:', response.status);
    console.log('Whop API raw response:', rawText.slice(0, 2000));
    if (!rawText) {
      return res.status(500).json({ error: 'Whop API returned empty response.' });
    }
    const data = JSON.parse(rawText);
    // v2 members response: data.data is array of member objects with .memberships inside
    const members = data.data || [];
    memberships = members.flatMap(m => m.memberships || [m]).filter(Boolean);
  } catch (err) {
    console.error('Whop API error:', err);
    return res.status(500).json({ error: 'Could not verify membership. Try again.' });
  }

  const productId = process.env.WHOP_PRODUCT_ID;
  const validMemberships = memberships.filter(
    m => m.valid && (!productId || m.product_id === productId)
  );

  if (validMemberships.length === 0) {
    console.log('No valid memberships found for:', normalizedEmail);
    return res.status(401).json({ error: 'No active LT Empire membership found for this email.' });
  }

  const whopUser = validMemberships[0].user || {};
  const session = {
    user: {
      id: whopUser.id || normalizedEmail,
      name: whopUser.username || whopUser.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
    },
    email: normalizedEmail,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  const sessionToken = signSession(session, process.env.NEXTAUTH_SECRET);
  res.setHeader('Set-Cookie', `whop_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`);
  return res.status(200).json({ ok: true });
}
