// Public endpoint — called by MT5 EA to check if a license is still valid
// GET /api/validate-license?key=L-XXXX-XXXX-XXXX

export default async function handler(req, res) {
  // Allow EA to call this from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ valid: false, reason: 'No license key provided' });
  }

  try {
    // Search all memberships for this license key
    const response = await fetch(
      `https://api.whop.com/api/v2/memberships?license_key=${encodeURIComponent(key)}&per_page=10`,
      { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` } }
    );

    if (!response.ok) {
      console.error('Whop API error:', response.status);
      // Don't block the EA if our API has a temporary issue
      return res.status(200).json({ valid: true, reason: 'validation_unavailable' });
    }

    const data = await response.json();
    const memberships = data.data || [];

    // Find the membership matching this exact license key
    const match = memberships.find(m => m.license_key === key);

    if (!match) {
      return res.status(200).json({ valid: false, reason: 'License key not found' });
    }

    const isValid = match.valid === true;
    const status = match.status || 'unknown';

    console.log(`License check: ${key} → valid=${isValid} status=${status}`);

    return res.status(200).json({
      valid: isValid,
      status,
      expires_at: match.expires_at || null,
    });

  } catch (err) {
    console.error('validate-license error:', err);
    // Fail open on server errors so EA doesn't stop due to our downtime
    return res.status(200).json({ valid: true, reason: 'validation_error' });
  }
}
