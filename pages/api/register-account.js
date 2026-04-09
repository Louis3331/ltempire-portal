// Called by MT5 EA on startup — validates license AND registers the trading account
// POST /api/register-account
// Body: { licenseKey, accountNumber, accountName, accountServer }

import { kv } from '@vercel/kv';

const MAX_ACCOUNTS = 2;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  const { licenseKey, accountNumber, accountName, accountServer } = req.body || {};

  if (!licenseKey || !accountNumber) {
    return res.status(200).json({ valid: false, reason: 'Missing licenseKey or accountNumber' });
  }

  const accountNumberStr = String(accountNumber).trim();

  // Step 1: Validate license with Whop
  try {
    const whopRes = await fetch(
      `https://api.whop.com/api/v2/memberships?license_key=${encodeURIComponent(licenseKey)}&per_page=5`,
      { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` } }
    );
    const whopData = await whopRes.json();
    const memberships = (whopData.data || []).filter(m => m.license_key === licenseKey);
    const membership = memberships[0];

    if (!membership || !membership.valid) {
      return res.status(200).json({ valid: false, reason: 'License expired or not found' });
    }
  } catch (err) {
    console.error('Whop validation error:', err);
    // Allow grace — don't block if Whop is temporarily down
    console.log('Whop check failed, allowing with grace');
  }

  // Step 2: Get registered accounts for this license
  const key = `accounts:${licenseKey}`;
  let accounts = (await kv.get(key)) || [];

  const existing = accounts.find(a => a.accountNumber === accountNumberStr);

  if (existing) {
    // Already registered — just update last seen
    existing.lastUpdate = Date.now();
    if (accountName)   existing.accountName   = accountName;
    if (accountServer) existing.accountServer = accountServer;
    await kv.set(key, accounts);
    console.log(`Account ${accountNumberStr} updated for license ${licenseKey}`);
    return res.status(200).json({
      valid: true,
      reason: 'Account verified',
      count: accounts.length,
      max: MAX_ACCOUNTS,
    });
  }

  // Step 3: New account — check limit
  if (accounts.length >= MAX_ACCOUNTS) {
    console.log(`Account limit reached for license ${licenseKey}: ${accounts.length}/${MAX_ACCOUNTS}`);
    return res.status(200).json({
      valid: false,
      reason: `Account limit reached (${accounts.length}/${MAX_ACCOUNTS}). Remove an account at ltempire-portal.vercel.app to add a new one.`,
      count: accounts.length,
      max: MAX_ACCOUNTS,
    });
  }

  // Step 4: Register new account
  accounts.push({
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    accountNumber: accountNumberStr,
    accountName:   accountName   || '',
    accountServer: accountServer || '',
    registeredAt:  Date.now(),
    lastUpdate:    Date.now(),
  });

  await kv.set(key, accounts);
  console.log(`New account ${accountNumberStr} registered for license ${licenseKey} (${accounts.length}/${MAX_ACCOUNTS})`);

  return res.status(200).json({
    valid: true,
    reason: 'Account registered successfully',
    count: accounts.length,
    max: MAX_ACCOUNTS,
  });
}
