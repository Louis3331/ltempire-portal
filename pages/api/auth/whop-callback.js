import crypto from 'crypto';

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach(c => {
    const [k, ...v] = c.split('=');
    list[k.trim()] = decodeURIComponent(v.join('=').trim());
  });
  return list;
}

function signSession(data, secret) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  console.log('Received state:', state);
  console.log('Received code length:', code?.length);

  if (error || !code) return res.redirect('/?error=auth_failed');
  if (!state || !state.includes('~')) return res.redirect('/?error=state_mismatch');

  // Extract codeVerifier from state (no cookie needed)
  const tildeIdx = state.indexOf('~');
  const codeVerifier = state.slice(tildeIdx + 1);
  console.log('Extracted code_verifier from state:', codeVerifier);

  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/whop-callback`,
    client_id: process.env.WHOP_CLIENT_ID,
    code_verifier: codeVerifier,
  });
  console.log('Token request body:', tokenBody.toString().replace(code, '[CODE]'));

  const tokenRes = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody,
  });

  const tokens = await tokenRes.json();
  console.log('Token response:', JSON.stringify(tokens));
  if (!tokens.access_token) return res.redirect('/?error=token_failed');

  const userRes = await fetch('https://api.whop.com/v5/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await userRes.json();
  console.log('User:', JSON.stringify(user));
  if (!user.id) return res.redirect('/?error=user_failed');

  const session = {
    user: {
      id: user.id,
      name: user.username || user.name,
      email: user.email,
      image: user.profile_pic_url,
    },
    accessToken: tokens.access_token,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  const sessionToken = signSession(session, process.env.NEXTAUTH_SECRET);
  const clear = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
  const keep = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000';

  res.setHeader('Set-Cookie', [
    `whop_cv=; ${clear}`,
    `whop_state=; ${clear}`,
    `whop_session=${sessionToken}; ${keep}`,
  ]);

  res.redirect('/dashboard');
}
