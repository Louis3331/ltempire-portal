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

export function verifySession(req) {
  const cookies = parseCookies(req);
  const token = cookies.whop_session;
  if (!token) return null;
  try {
    const [payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', process.env.NEXTAUTH_SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.expires < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'No session' });
  res.json(session);
}
