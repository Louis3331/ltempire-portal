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
  const cookies = parseCookies(req);

  console.log('All cookies:', req.headers.cookie);
  console.log('Query state:', state, '| Cookie state:', cookies.whop_state);
  console.log('code_verifier cookie:', cookies.whop_cv);

  if (error || !code) return res.redirect('/?error=auth_failed');
  if (state !== cookies.whop_state) return res.redirect('/?error=state_mismatch');

  const codeVerifier = cookies.whop_cv;
  console.log('Using code_verifier:', codeVerifier);

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
