import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('licenses');
  const [copied, setCopied] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => {
        if (!r.ok) { router.push('/'); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setSession(data);
        return fetch('/api/membership')
          .then(r => r.json())
          .then(d => {
            if (d.error) setError(d.error);
            else setMemberships(d.memberships || []);
          });
      })
      .catch(() => setError('Could not load membership data.'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadAccounts = () => {
    setAccountsLoading(true);
    fetch('/api/accounts')
      .then(r => r.json())
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  };

  const deleteAccount = async (licenseKey, id) => {
    if (!confirm('Remove this account? The EA will be blocked on next validation.')) return;
    await fetch(`/api/accounts?licenseKey=${encodeURIComponent(licenseKey)}&id=${id}`, { method: 'DELETE' });
    loadAccounts();
  };

  const copy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch {}
  };

  const fmt = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusColor = (s) => ({ active: '#3ECF8E', trialing: '#C9A84C', expired: '#E05252', canceled: '#E05252' }[s] || '#888');
  const statusLabel = (s) => ({ active: 'Active', trialing: 'Trial', expired: 'Expired', canceled: 'Canceled', past_due: 'Past Due' }[s] || s);

  if (loading) return <Loader />;
  if (!session) return null;

  const email = session.user?.email || session.email || '';
  const name = session.user?.name || email.split('@')[0];

  return (
    <>
      <Head>
        <title>LT Empire | Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={S.page}>
        <div style={S.grid} aria-hidden="true" />

        {/* Top bar */}
        <header style={S.topBar}>
          <div style={S.topLogo}>
            <div style={S.logoCircle}><span style={S.logoText}>LT</span></div>
            <div>
              <div style={S.brandName}>LT Empire</div>
              <div style={S.brandSub}>Member Portal</div>
            </div>
          </div>
          <div style={S.topRight}>
            <span style={S.loggedAs}>Logged in as: <strong>{email}</strong></span>
            <button style={S.logoutBtn} onClick={() => { window.location.href = '/api/auth/logout'; }}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={S.main}>
          {/* Tabs */}
          <div style={S.tabs}>
            <button style={{ ...S.tab, ...(tab === 'licenses' ? S.tabActive : {}) }} onClick={() => setTab('licenses')}>
              License Keys
            </button>
            <button style={{ ...S.tab, ...(tab === 'accounts' ? S.tabActive : {}) }} onClick={() => { setTab('accounts'); loadAccounts(); }}>
              Accounts
            </button>
          </div>

          {error && (
            <div style={S.errorBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* License Keys Tab */}
          {tab === 'licenses' && !error && (
            <>
              {memberships.length === 0 ? (
                <div style={S.empty}>
                  <p style={{ color: '#888', fontSize: 14 }}>No memberships found for this account.</p>
                  <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>Make sure you used the same email as your Whop purchase.</p>
                </div>
              ) : (
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {['License Key', 'Status', 'Plan', 'Registered', 'Expires / Renews', 'Valid'].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((m) => (
                        <tr key={m.id} style={S.tr}>
                          <td style={S.td}>
                            <div style={S.keyCell}>
                              <code style={S.keyCode}>{m.license_key || '—'}</code>
                              {m.license_key && (
                                <button style={S.copyBtn} onClick={() => copy(m.license_key, m.id)} title="Copy">
                                  {copied === m.id ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" style={{ width: 13, height: 13 }}>
                                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={{ ...S.pill, background: statusColor(m.status) + '20', color: statusColor(m.status), border: `1px solid ${statusColor(m.status)}40` }}>
                              <span style={{ ...S.dot, background: statusColor(m.status) }} />
                              {statusLabel(m.status)}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={{ color: '#C9A84C', fontSize: 13 }}>{m.plan?.name || '—'}</span>
                            {m.plan?.billing_period && <div style={{ fontSize: 11, color: '#555', marginTop: 2, textTransform: 'capitalize' }}>{m.plan.billing_period}</div>}
                          </td>
                          <td style={{ ...S.td, color: '#888', fontSize: 13 }}>{fmt(m.renewal_period_start)}</td>
                          <td style={{ ...S.td, color: '#888', fontSize: 13 }}>{fmt(m.renewal_period_end)}</td>
                          <td style={S.td}>
                            <span style={{ color: m.valid ? '#3ECF8E' : '#E05252', fontWeight: 700, fontSize: 13 }}>
                              {m.valid ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Accounts Tab */}
          {tab === 'accounts' && (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['License Key', 'Account Number', 'Account Name', 'Account Server', 'Registered', 'Last Update', 'Remove'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accountsLoading ? (
                    <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: '48px 0', color: '#555' }}>Loading...</td></tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: '48px 0', color: '#555', fontSize: 14 }}>
                        No trading accounts registered yet.<br />
                        <span style={{ fontSize: 12, color: '#444', marginTop: 6, display: 'block' }}>
                          Accounts appear here automatically when the EA runs on an MT5 account.
                        </span>
                      </td>
                    </tr>
                  ) : accounts.map(a => (
                    <tr key={a.id} style={S.tr}>
                      <td style={S.td}><code style={S.keyCode}>{a.licenseKey}</code></td>
                      <td style={{ ...S.td, color: '#C9A84C', fontWeight: 600 }}>{a.accountNumber}</td>
                      <td style={S.td}>{a.accountName || '—'}</td>
                      <td style={S.td}>{a.accountServer || '—'}</td>
                      <td style={{ ...S.td, color: '#888', fontSize: 12 }}>{new Date(a.registeredAt).toLocaleString()}</td>
                      <td style={{ ...S.td, color: '#888', fontSize: 12 }}>{new Date(a.lastUpdate).toLocaleString()}</td>
                      <td style={S.td}>
                        <button
                          onClick={() => deleteAccount(a.licenseKey, a.id)}
                          style={{ padding: '5px 12px', background: 'rgba(224,82,82,0.12)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: 5, color: '#E05252', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        table tr:hover td { background: rgba(201,168,76,0.03); }
      `}</style>
    </>
  );
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #222', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#0A0A0A', position: 'relative' },
  grid: {
    position: 'fixed', inset: 0,
    backgroundImage: `linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none', zIndex: 0,
  },
  topBar: {
    position: 'sticky', top: 0, zIndex: 10,
    background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid #1e1e1e',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 32px',
  },
  topLogo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoCircle: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontSize: 12, fontWeight: 800, color: '#0A0A0A' },
  brandName: { fontSize: 14, fontWeight: 700, color: '#F5F0E8' },
  brandSub: { fontSize: 10, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase' },
  topRight: { display: 'flex', alignItems: 'center', gap: 16 },
  loggedAs: { fontSize: 13, color: '#666' },
  logoutBtn: {
    padding: '7px 16px', background: '#1a1a1a', border: '1px solid #333',
    borderRadius: 6, color: '#E05252', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  main: { position: 'relative', zIndex: 1, padding: '32px 32px', maxWidth: 1200, margin: '0 auto' },
  tabs: { display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #1e1e1e' },
  tab: {
    padding: '10px 24px', background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent', color: '#555', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
  },
  tabActive: { color: '#C9A84C', borderBottomColor: '#C9A84C' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)',
    borderRadius: 8, padding: '14px 18px', color: '#E05252', fontSize: 14, marginBottom: 20,
  },
  empty: { textAlign: 'center', padding: '80px 0' },
  tableWrap: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden', animation: 'fadeIn 0.3s ease' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
    color: '#555', textTransform: 'uppercase', letterSpacing: 0.8,
    borderBottom: '1px solid #1e1e1e', background: '#0d0d0d',
  },
  td: { padding: '14px 16px', fontSize: 13, color: '#ccc', borderBottom: '1px solid #181818', verticalAlign: 'middle' },
  tr: { transition: 'background 0.1s' },
  keyCell: { display: 'flex', alignItems: 'center', gap: 8 },
  keyCode: { fontFamily: 'monospace', fontSize: 13, color: '#C9A84C', letterSpacing: 0.5 },
  copyBtn: { background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: 3, display: 'flex', alignItems: 'center', flexShrink: 0 },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
};
