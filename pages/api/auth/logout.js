export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'whop_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  res.redirect('/');
}
