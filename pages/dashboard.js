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
      .then(r => { if (!r.ok) { router.push('/'); return null; } return r.json(); })
      .then(data => {
        if (!data) return;
        setSession(data);
        return fetch('/api/membership').then(r => r.json()).then(d => {
          if (d.error) setError(d.error);
          else setMemberships(d.memberships || []);
        });
      })
      .catch(() => setError('Could not load membership data.'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadAccounts = () => {
    setAccountsLoading(true);
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(d.accounts || [])).catch(() => {}).finally(() => setAccountsLoading(false));
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

  const fmtMs = (ms) => {
    if (!ms) return '—';
    return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusColor = (s) => ({ active: '#3ECF8E', trialing: '#C9A84C', expired: '#E05252', canceled: '#E05252' }[s] || '#888');
  const statusLabel = (s) => ({ active: 'Active', trialing: 'Trial', expired: 'Expired', canceled: 'Canceled', past_due: 'Past Due', completed: 'Active' }[s] || s);

  if (loading) return <Loader />;
  if (!session) return null;

  const email = session.user?.email || session.email || '';

  return (
    <>
      <Head>
        <title>LT Empire | Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="grid" aria-hidden="true" />

        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="logo-circle"><span className="logo-text">LT</span></div>
            <div>
              <div className="brand-name">LT Empire</div>
              <div className="brand-sub">Member Portal</div>
            </div>
          </div>
          <div className="topbar-right">
            <span className="logged-as">{email}</span>
            <button className="logout-btn" onClick={() => { window.location.href = '/api/auth/logout'; }}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="main">
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'licenses' ? 'tab-active' : ''}`} onClick={() => setTab('licenses')}>
              License Keys
            </button>
            <button className={`tab-btn ${tab === 'accounts' ? 'tab-active' : ''}`} onClick={() => { setTab('accounts'); loadAccounts(); }}>
              Accounts
            </button>
          </div>

          {error && (
            <div className="error-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* License Keys Tab */}
          {tab === 'licenses' && !error && (
            memberships.length === 0 ? (
              <div className="empty">
                <p style={{ color: '#888', fontSize: 14 }}>No memberships found for this account.</p>
                <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>Make sure you used the same email as your Whop purchase.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <div className="table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        {['License Key', 'Status', 'Plan', 'Registered', 'Expires', 'Valid'].map(h => (
                          <th key={h} className="th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((m) => (
                        <tr key={m.id} className="tr">
                          <td className="td">
                            <div className="key-cell">
                              <code className="key-code">{m.license_key || '—'}</code>
                              {m.license_key && (
                                <button className="copy-btn" onClick={() => copy(m.license_key, m.id)} title="Copy">
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
                          <td className="td">
                            <span className="pill" style={{ background: statusColor(m.status) + '20', color: statusColor(m.status), border: `1px solid ${statusColor(m.status)}40` }}>
                              <span className="dot" style={{ background: statusColor(m.status) }} />
                              {statusLabel(m.status)}
                            </span>
                          </td>
                          <td className="td" style={{ color: '#C9A84C', fontSize: 13 }}>{m.plan?.name || '—'}</td>
                          <td className="td" style={{ color: '#888', fontSize: 13 }}>{fmt(m.renewal_period_start)}</td>
                          <td className="td" style={{ color: '#888', fontSize: 13 }}>{fmt(m.renewal_period_end)}</td>
                          <td className="td">
                            <span style={{ color: m.valid ? '#3ECF8E' : '#E05252', fontWeight: 700, fontSize: 13 }}>
                              {m.valid ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view for license keys */}
                <div className="mobile-cards">
                  {memberships.map((m) => (
                    <div key={m.id} className="mobile-card">
                      <div className="mc-row">
                        <span className="mc-label">License Key</span>
                        <div className="key-cell">
                          <code className="key-code" style={{ fontSize: 12 }}>{m.license_key || '—'}</code>
                          {m.license_key && (
                            <button className="copy-btn" onClick={() => copy(m.license_key, m.id)}>
                              {copied === m.id ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Status</span>
                        <span className="pill" style={{ background: statusColor(m.status) + '20', color: statusColor(m.status), border: `1px solid ${statusColor(m.status)}40` }}>
                          <span className="dot" style={{ background: statusColor(m.status) }} />{statusLabel(m.status)}
                        </span>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Plan</span>
                        <span style={{ color: '#C9A84C', fontSize: 13 }}>{m.plan?.name || '—'}</span>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Valid</span>
                        <span style={{ color: m.valid ? '#3ECF8E' : '#E05252', fontWeight: 700, fontSize: 13 }}>{m.valid ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Accounts Tab */}
          {tab === 'accounts' && (
            <div className="table-wrap">
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      {['License Key', 'Account No.', 'Name', 'Server', 'Registered', 'Last Update', ''].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accountsLoading ? (
                      <tr><td colSpan={7} className="td" style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>Loading...</td></tr>
                    ) : accounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="td" style={{ textAlign: 'center', padding: '48px 0', color: '#555', fontSize: 14 }}>
                          No trading accounts registered yet.<br />
                          <span style={{ fontSize: 12, color: '#444', marginTop: 6, display: 'block' }}>
                            Accounts appear automatically when the EA runs on MT5.
                          </span>
                        </td>
                      </tr>
                    ) : accounts.map(a => (
                      <tr key={a.id} className="tr">
                        <td className="td"><code className="key-code" style={{ fontSize: 12 }}>{a.licenseKey}</code></td>
                        <td className="td" style={{ color: '#C9A84C', fontWeight: 600 }}>{a.accountNumber}</td>
                        <td className="td">{a.accountName || '—'}</td>
                        <td className="td">{a.accountServer || '—'}</td>
                        <td className="td" style={{ color: '#888', fontSize: 12 }}>{fmtMs(a.registeredAt)}</td>
                        <td className="td" style={{ color: '#888', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</td>
                        <td className="td">
                          <button className="del-btn" onClick={() => deleteAccount(a.licenseKey, a.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view for accounts */}
              {accounts.length > 0 && (
                <div className="mobile-cards">
                  {accounts.map(a => (
                    <div key={a.id} className="mobile-card">
                      <div className="mc-row">
                        <span className="mc-label">Account No.</span>
                        <span style={{ color: '#C9A84C', fontWeight: 700 }}>{a.accountNumber}</span>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Name</span>
                        <span style={{ color: '#ccc', fontSize: 13 }}>{a.accountName || '—'}</span>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Server</span>
                        <span style={{ color: '#ccc', fontSize: 13 }}>{a.accountServer || '—'}</span>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">License</span>
                        <code className="key-code" style={{ fontSize: 11 }}>{a.licenseKey}</code>
                      </div>
                      <div className="mc-row">
                        <span className="mc-label">Last Update</span>
                        <span style={{ color: '#888', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</span>
                      </div>
                      <button className="del-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => deleteAccount(a.licenseKey, a.id)}>Delete Account</button>
                    </div>
                  ))}
                </div>
              )}

              {accountsLoading && (
                <div className="mobile-cards" style={{ padding: '32px 16px', textAlign: 'center', color: '#555' }}>Loading...</div>
              )}
              {!accountsLoading && accounts.length === 0 && (
                <div className="mobile-cards" style={{ padding: '40px 16px', textAlign: 'center', color: '#555', fontSize: 14 }}>
                  No trading accounts registered yet.<br />
                  <span style={{ fontSize: 12, color: '#444', marginTop: 6, display: 'block' }}>Accounts appear automatically when the EA runs on MT5.</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .page { min-height: 100vh; background: #0A0A0A; position: relative; }
        .grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
        }

        /* Top bar */
        .topbar {
          position: sticky; top: 0; z-index: 10;
          background: rgba(10,10,10,0.95); border-bottom: 1px solid #1e1e1e;
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px; gap: 12px;
        }
        .topbar-logo { display: flex; align-items: center; gap: 10; flex-shrink: 0; }
        .logo-circle {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #C9A84C, #9B7B2F);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .logo-text { font-size: 12px; font-weight: 800; color: #0A0A0A; }
        .brand-name { font-size: 14px; font-weight: 700; color: #F5F0E8; }
        .brand-sub { font-size: 10px; color: #C9A84C; letter-spacing: 2px; text-transform: uppercase; }
        .topbar-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .logged-as {
          font-size: 12px; color: #666; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; max-width: 200px;
        }
        .logout-btn {
          padding: 7px 14px; background: #1a1a1a; border: 1px solid #333;
          border-radius: 6px; color: #E05252; font-size: 13px; font-weight: 600;
          cursor: pointer; flex-shrink: 0; white-space: nowrap;
        }

        /* Main */
        .main { position: relative; z-index: 1; padding: 24px; max-width: 1200px; margin: 0 auto; }

        /* Tabs */
        .tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid #1e1e1e; }
        .tab-btn {
          padding: 10px 20px; background: transparent; border: none;
          border-bottom: 2px solid transparent; color: #555; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.15s; margin-bottom: -1px;
        }
        .tab-active { color: #C9A84C; border-bottom-color: #C9A84C; }

        /* Error */
        .error-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(224,82,82,0.08); border: 1px solid rgba(224,82,82,0.2);
          border-radius: 8px; padding: 14px 18px; color: #E05252; font-size: 14px; margin-bottom: 20px;
        }
        .empty { text-align: center; padding: 60px 0; }

        /* Table */
        .table-wrap { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; overflow: hidden; animation: fadeIn 0.3s ease; }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .th {
          padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
          color: #555; text-transform: uppercase; letter-spacing: 0.8px;
          border-bottom: 1px solid #1e1e1e; background: #0d0d0d; white-space: nowrap;
        }
        .td { padding: 14px 16px; font-size: 13px; color: #ccc; border-bottom: 1px solid #181818; vertical-align: middle; }
        .tr:hover td { background: rgba(201,168,76,0.03); }

        /* Key */
        .key-cell { display: flex; align-items: center; gap: 8px; }
        .key-code { font-family: monospace; font-size: 13px; color: #C9A84C; letter-spacing: 0.5px; word-break: break-all; }
        .copy-btn { background: transparent; border: none; color: #555; cursor: pointer; padding: 3px; display: flex; align-items: center; flex-shrink: 0; }

        /* Pills */
        .pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* Delete button */
        .del-btn {
          padding: 5px 12px; background: rgba(224,82,82,0.12); border: 1px solid rgba(224,82,82,0.3);
          border-radius: 5px; color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
        }

        /* Mobile cards — hidden on desktop */
        .mobile-cards { display: none; }
        .mobile-card {
          padding: 16px; border-bottom: 1px solid #1a1a1a;
        }
        .mobile-card:last-child { border-bottom: none; }
        .mc-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; gap: 12px; }
        .mc-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; flex-shrink: 0; }

        /* Responsive */
        @media (max-width: 640px) {
          .topbar { padding: 10px 16px; }
          .brand-sub { display: none; }
          .logged-as { max-width: 130px; font-size: 11px; }
          .main { padding: 16px; }
          .tab-btn { padding: 10px 16px; font-size: 13px; }

          /* Hide desktop table, show mobile cards */
          .table-scroll { display: none; }
          .mobile-cards { display: block; }
        }

        @media (max-width: 400px) {
          .logged-as { display: none; }
          .logout-btn { padding: 6px 12px; font-size: 12px; }
        }
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
