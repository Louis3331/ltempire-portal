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

  // Step 1: Find user in Whop members list (only members of your business appear here)
  let whopUser = null;
  try {
    const url = `https://api.whop.com/api/v2/members?email=${encodeURIComponent(normalizedEmail)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    });
    const rawText = await response.text();
    console.log('Members API status:', response.status);
    console.log('Members API response:', rawText.slice(0, 1000));
    if (response.ok && rawText) {
      const data = JSON.parse(rawText);
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

  // Step 2: Try to get their memberships by user ID (may or may not work depending on permissions)
  let memberships = [];
  try {
    const mUrl = `https://api.whop.com/api/v2/memberships?user_id=${whopUser.id}&per_page=50`;
    const mRes = await fetch(mUrl, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
    });
    const mText = await mRes.text();
    console.log('Memberships API status:', mRes.status);
    console.log('Memberships API response:', mText.slice(0, 1000));
    if (mRes.ok && mText) {
      const mData = JSON.parse(mText);
      memberships = mData.data || [];
    }
  } catch (err) {
    console.log('Memberships lookup failed (non-fatal):', err.message);
  }

  // Create session — user is verified as a Whop member
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
