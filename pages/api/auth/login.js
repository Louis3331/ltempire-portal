import crypto from 'crypto';

export default function handler(req, res) {
  const state = crypto.randomBytes(16).toString('hex');

  const cookieOpts = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600';
  res.setHeader('Set-Cookie', `whop_state=${state}; ${cookieOpts}`);

  const params = new URLSearchParams({
    client_id: process.env.WHOP_CLIENT_ID,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/whop-callback`,
    response_type: 'code',
    scope: 'openid',
    state,
  });

  res.redirect(`https://whop.com/oauth?${params}`);
}
