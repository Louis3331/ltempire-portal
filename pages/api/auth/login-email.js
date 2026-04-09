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
  const productId = process.env.WHOP_PRODUCT_ID;

  // Step 1: Find user in Whop by email
  let whopUser = null;
  try {
    const url = `https://api.whop.com/api/v2/members?email=${encodeURIComponent(normalizedEmail)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    });
    if (response.ok) {
      const data = await response.json();
      whopUser = (data.data || [])[0] || null;
    }
  } catch (err) {
    console.error('Whop members API error:', err);
    return res.status(500).json({ error: 'Could not verify membership. Try again.' });
  }

  if (!whopUser) {
    return res.status(401).json({ error: 'No active LT Empire membership found for this email.' });
  }

  console.log('Found Whop user:', whopUser.id, whopUser.email);

  // Step 2: Get memberships filtered by THIS product — strictly verify ownership
  let validMembership = null;
  try {
    // Filter by product_id so we only get memberships for LT Empire specifically
    const mUrl = `https://api.whop.com/api/v2/memberships?product_id=${productId}&per_page=50`;
    const mRes = await fetch(mUrl, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    });

    if (mRes.ok) {
      const mData = await mRes.json();
      const allMemberships = mData.data || [];

      // Find a membership that belongs to THIS user AND is valid
      validMembership = allMemberships.find(m => {
        const mUserId = m.user_id || (typeof m.user === 'string' ? m.user : m.user?.id);
        return mUserId === whopUser.id && m.valid === true;
      });

      console.log('Product memberships found:', allMemberships.length, '| Matching user+valid:', !!validMembership);
    }
  } catch (err) {
    console.error('Memberships lookup error:', err.message);
    return res.status(500).json({ error: 'Could not verify membership. Try again.' });
  }

  if (!validMembership) {
    console.log('Access denied — no valid membership for:', normalizedEmail);
    return res.status(401).json({ error: 'No active LT Empire membership found for this email.' });
  }

  console.log('Valid membership confirmed:', validMembership.id, 'for', normalizedEmail);

  // Create session
  const session = {
    user: {
      id: whopUser.id,
      name: whopUser.username || whopUser.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      image: whopUser.profile_pic_url || null,
    },
    email: normalizedEmail,
    whopUserId: whopUser.id,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  const sessionToken = signSession(session, process.env.NEXTAUTH_SECRET);
  res.setHeader('Set-Cookie', `whop_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`);
  console.log('Login successful for:', normalizedEmail);
  return res.status(200).json({ ok: true });
}
