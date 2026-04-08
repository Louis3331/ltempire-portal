import crypto from 'crypto';

export default function handler(req, res) {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const nonce = crypto.randomBytes(16).toString('hex');

  // Embed codeVerifier in state to bypass cookie issues
  const state = `${nonce}~${codeVerifier}`;

  console.log('Generated code_verifier:', codeVerifier);
  console.log('Generated code_challenge:', codeChallenge);
  console.log('State (nonce~verifier):', state);

  const params = new URLSearchParams({
    client_id: process.env.WHOP_CLIENT_ID,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/whop-callback`,
    response_type: 'code',
    scope: 'openid',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.redirect(`https://whop.com/oauth?${params}`);
}
