import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/* ── Icons ─────────────────────────────────────────────── */
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="nav-icon">
    <circle cx="8" cy="15" r="4" /><path d="M12 11l8-8m-3 0l3 3m-6 0l3 3" strokeLinecap="round" />
  </svg>
);
const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="nav-icon">
    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" strokeLinecap="round" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Nav config ─────────────────────────────────────────── */
const NAV = [
  { id: 'licenses', label: 'License Keys', icon: <KeyIcon /> },
  { id: 'accounts', label: 'Accounts',     icon: <MonitorIcon /> },
];

/* ── Main component ─────────────────────────────────────── */
export default function Dashboard() {
  const [session,         setSession]         = useState(null);
  const [memberships,     setMemberships]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [tab,             setTab]             = useState('licenses');
  const [copied,          setCopied]          = useState(null);
  const [accounts,        setAccounts]        = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [animKey,         setAnimKey]         = useState(0);
  const [slideDir,        setSlideDir]        = useState('right');
  const [theme,           setTheme]           = useState('dark');
  const router = useRouter();

  /* Load session + memberships */
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

  /* Read saved theme */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lt-theme') || 'dark';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lt-theme', next); } catch {}
  };

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

  const switchTab = (newTab) => {
    if (newTab === tab) { setSidebarOpen(false); return; }
    const dir = NAV.findIndex(n => n.id === newTab) > NAV.findIndex(n => n.id === tab) ? 'right' : 'left';
    setSlideDir(dir);
    setAnimKey(k => k + 1);
    setTab(newTab);
    if (newTab === 'accounts') loadAccounts();
    setSidebarOpen(false);
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

  const email     = session.user?.email || session.email || '';
  const initial   = email[0]?.toUpperCase() || 'U';
  const pageTitle = NAV.find(n => n.id === tab)?.label || '';

  return (
    <>
      <Head>
        <title>LT Empire | Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="layout">
        <div className="grid" aria-hidden="true" />

        {/* Mobile overlay */}
        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-circle"><span className="logo-text">LT</span></div>
            <div>
              <div className="brand-name">LT Empire</div>
              <div className="brand-sub">Member Portal</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <p className="nav-section-label">Navigation</p>
            {NAV.map(item => (
              <button
                key={item.id}
                className={`nav-item ${tab === item.id ? 'nav-active' : ''}`}
                onClick={() => switchTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {tab === item.id && <span className="nav-pip" />}
              </button>
            ))}
          </nav>

          {/* Theme toggle */}
          <div className="theme-row">
            <span className="theme-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              <span className={`toggle-track ${theme === 'light' ? 'toggle-on' : ''}`}>
                <span className="toggle-thumb">
                  {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                </span>
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{initial}</div>
              <div className="user-email">{email}</div>
            </div>
            <button className="logout-btn" onClick={() => { window.location.href = '/api/auth/logout'; }}>
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main area ───────────────────────────────── */}
        <div className="main-wrap">

          {/* Mobile header */}
          <header className="mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <span className="mobile-brand">LT Empire</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="theme-toggle-sm" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <button className="logout-btn-sm" onClick={() => { window.location.href = '/api/auth/logout'; }}>
                Logout
              </button>
            </div>
          </header>

          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">
              {tab === 'licenses'
                ? 'Your active license keys and membership details'
                : 'MT5 trading accounts linked to your license'}
            </p>
          </div>

          {/* Animated content */}
          <main key={animKey} className={`main slide-${slideDir}`}>

            {error && (
              <div className="error-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* ── License Keys ── */}
            {tab === 'licenses' && !error && (
              memberships.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon"><KeyIcon /></div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>No memberships found for this account.</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6 }}>Make sure you used the same email as your Whop purchase.</p>
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
                                      <svg viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
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
                            <td className="td" style={{ color: 'var(--gold)', fontSize: 13 }}>{m.plan?.name || '—'}</td>
                            <td className="td" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(m.renewal_period_start)}</td>
                            <td className="td" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(m.renewal_period_end)}</td>
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

                  {/* Mobile cards */}
                  <div className="mobile-cards">
                    {memberships.map((m) => (
                      <div key={m.id} className="mobile-card">
                        <div className="mc-row">
                          <span className="mc-label">License Key</span>
                          <div className="key-cell">
                            <code className="key-code" style={{ fontSize: 12 }}>{m.license_key || '—'}</code>
                            {m.license_key && (
                              <button className="copy-btn" onClick={() => copy(m.license_key, m.id)}>
                                {copied === m.id
                                  ? <svg viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                }
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
                          <span style={{ color: 'var(--gold)', fontSize: 13 }}>{m.plan?.name || '—'}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">Expires</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(m.renewal_period_end)}</span>
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

            {/* ── Accounts ── */}
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
                        <tr><td colSpan={7} className="td" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>Loading...</td></tr>
                      ) : accounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="td" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontSize: 14 }}>
                            No trading accounts registered yet.<br />
                            <span style={{ fontSize: 12, color: 'var(--text-dimmer)', marginTop: 6, display: 'block' }}>
                              Accounts appear automatically when the EA runs on MT5.
                            </span>
                          </td>
                        </tr>
                      ) : accounts.map(a => (
                        <tr key={a.id} className="tr">
                          <td className="td"><code className="key-code" style={{ fontSize: 12 }}>{a.licenseKey}</code></td>
                          <td className="td" style={{ color: 'var(--gold)', fontWeight: 600 }}>{a.accountNumber}</td>
                          <td className="td">{a.accountName || '—'}</td>
                          <td className="td">{a.accountServer || '—'}</td>
                          <td className="td" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.registeredAt)}</td>
                          <td className="td" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</td>
                          <td className="td">
                            <button className="del-btn" onClick={() => deleteAccount(a.licenseKey, a.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                {!accountsLoading && accounts.length > 0 && (
                  <div className="mobile-cards">
                    {accounts.map(a => (
                      <div key={a.id} className="mobile-card">
                        <div className="mc-row">
                          <span className="mc-label">Account No.</span>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{a.accountNumber}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">Name</span>
                          <span style={{ color: 'var(--text)', fontSize: 13 }}>{a.accountName || '—'}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">Server</span>
                          <span style={{ color: 'var(--text)', fontSize: 13 }}>{a.accountServer || '—'}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">License</span>
                          <code className="key-code" style={{ fontSize: 11 }}>{a.licenseKey}</code>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">Last Update</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</span>
                        </div>
                        <button className="del-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => deleteAccount(a.licenseKey, a.id)}>Delete Account</button>
                      </div>
                    ))}
                  </div>
                )}
                {accountsLoading && (
                  <div className="mobile-cards" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>
                )}
                {!accountsLoading && accounts.length === 0 && (
                  <div className="mobile-cards" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
                    No trading accounts registered yet.<br />
                    <span style={{ fontSize: 12, color: 'var(--text-dimmer)', marginTop: 6, display: 'block' }}>Accounts appear automatically when the EA runs on MT5.</span>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      <style>{`
        /* ── CSS Variables ── */
        :root {
          --bg:               #0A0A0A;
          --bg-sidebar:       #0d0d0d;
          --bg-table:         #111111;
          --bg-table-hd:      #0d0d0d;
          --border:           #1a1a1a;
          --border-row:       #161616;
          --text:             #F5F0E8;
          --text-muted:       #888;
          --text-dim:         #555;
          --text-dimmer:      #444;
          --gold:             #C9A84C;
          --gold-dark:        #9B7B2F;
          --gold-glow:        rgba(201,168,76,0.2);
          --gold-alpha:       rgba(201,168,76,0.08);
          --gold-grid:        rgba(201,168,76,0.03);
          --row-hover:        rgba(201,168,76,0.03);
          --nav-label:        #2a2a2a;
          --avatar-bg:        #1e1e1e;
          --avatar-border:    #2a2a2a;
          --toggle-bg:        #222;
          --toggle-on-bg:     #3a2e0e;
          --shadow-sidebar:   none;
        }

        html[data-theme="light"] {
          --bg:               #F2F0EB;
          --bg-sidebar:       #FFFFFF;
          --bg-table:         #FFFFFF;
          --bg-table-hd:      #FAFAF7;
          --border:           #E4E0D8;
          --border-row:       #EDEAE3;
          --text:             #1A1817;
          --text-muted:       #7A7570;
          --text-dim:         #9A9590;
          --text-dimmer:      #B0ABA5;
          --gold:             #8B6010;
          --gold-dark:        #6B4A0A;
          --gold-glow:        rgba(139,96,16,0.15);
          --gold-alpha:       rgba(139,96,16,0.08);
          --gold-grid:        rgba(139,96,16,0.05);
          --row-hover:        rgba(139,96,16,0.03);
          --nav-label:        #D0CBC3;
          --avatar-bg:        #F0EDE6;
          --avatar-border:    #E0DDD6;
          --toggle-bg:        #DDD9D0;
          --toggle-on-bg:     #F0E8D0;
          --shadow-sidebar:   2px 0 12px rgba(0,0,0,0.06);
        }

        /* ── Reset ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; transition: background 0.25s; }

        /* ── Animations ── */
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft  { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }

        .slide-right { animation: slideRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94); }
        .slide-left  { animation: slideLeft  0.28s cubic-bezier(0.25,0.46,0.45,0.94); }

        /* ── Grid ── */
        .grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(var(--gold-grid) 1px, transparent 1px),
                            linear-gradient(90deg, var(--gold-grid) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
          transition: background-image 0.25s;
        }

        /* ── Layout ── */
        .layout { display: flex; min-height: 100vh; background: var(--bg); }

        /* ── Sidebar ── */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          box-shadow: var(--shadow-sidebar);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 20;
          transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94),
                      background 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 16px 18px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .logo-circle {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #C9A84C, #9B7B2F);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 0 20px var(--gold-glow);
        }
        .logo-text  { font-size: 13px; font-weight: 800; color: #0A0A0A; }
        .brand-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .brand-sub  { font-size: 9px; color: var(--gold); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }

        .sidebar-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .nav-section-label { font-size: 10px; color: var(--nav-label); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; padding: 0 8px 8px; }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          background: transparent; border: none;
          color: var(--text-dim); font-size: 13px; font-weight: 500;
          cursor: pointer; text-align: left; width: 100%; position: relative;
          transition: background 0.15s, color 0.15s;
        }
        .nav-item:hover { background: var(--gold-grid); color: var(--text-muted); }
        .nav-active { background: var(--gold-alpha) !important; color: var(--gold) !important; }
        .nav-pip { position: absolute; right: 10px; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
        .nav-icon { width: 17px; height: 17px; flex-shrink: 0; }

        /* ── Theme toggle ── */
        .theme-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-top: 1px solid var(--border);
        }
        .theme-label { font-size: 12px; color: var(--text-dim); font-weight: 500; }
        .theme-toggle { background: transparent; border: none; cursor: pointer; padding: 0; }
        .toggle-track {
          display: flex; align-items: center;
          width: 44px; height: 24px; border-radius: 12px;
          background: var(--toggle-bg);
          padding: 2px; transition: background 0.25s;
          position: relative;
        }
        .toggle-on { background: var(--toggle-on-bg) !important; }
        .toggle-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--bg-sidebar); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold); transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), background 0.25s;
          position: absolute; left: 2px;
        }
        .toggle-on .toggle-thumb { transform: translateX(20px); }

        /* ── Sidebar footer ── */
        .sidebar-footer {
          padding: 14px; border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
        }
        .user-info  { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .user-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: var(--avatar-bg); border: 1px solid var(--avatar-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: var(--gold);
        }
        .user-email { font-size: 11px; color: var(--text-dim); word-break: break-all; line-height: 1.3; }
        .logout-btn {
          width: 100%; padding: 8px; background: rgba(224,82,82,0.07);
          border: 1px solid rgba(224,82,82,0.2); border-radius: 6px;
          color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .logout-btn:hover { background: rgba(224,82,82,0.14); }

        /* ── Main wrap ── */
        .main-wrap { margin-left: 220px; flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; z-index: 1; }

        /* ── Mobile header ── */
        .mobile-header { display: none; }

        /* ── Page header ── */
        .page-header  { padding: 28px 32px 0; }
        .page-title   { font-size: 22px; font-weight: 700; color: var(--text); }
        .page-subtitle{ font-size: 13px; color: var(--text-dim); margin-top: 4px; }

        /* ── Content ── */
        .main { padding: 20px 32px 40px; }

        /* ── Error ── */
        .error-box {
          display: flex; align-items: center; gap: 10px;
          background: rgba(224,82,82,0.08); border: 1px solid rgba(224,82,82,0.2);
          border-radius: 8px; padding: 14px 18px; color: #E05252; font-size: 14px; margin-bottom: 20px;
        }

        /* ── Empty ── */
        .empty { text-align: center; padding: 80px 0; }
        .empty-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 56px; height: 56px; border-radius: 16px;
          background: var(--avatar-bg); border: 1px solid var(--avatar-border); color: var(--text-dim);
        }
        .empty-icon svg { width: 26px; height: 26px; }

        /* ── Table ── */
        .table-wrap   { background: var(--bg-table); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: background 0.25s, border-color 0.25s; }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table        { width: 100%; border-collapse: collapse; min-width: 600px; }
        .th {
          padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
          color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.8px;
          border-bottom: 1px solid var(--border); background: var(--bg-table-hd); white-space: nowrap;
        }
        .td { padding: 14px 16px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border-row); vertical-align: middle; }
        .tr:last-child td { border-bottom: none; }
        .tr:hover td  { background: var(--row-hover); }

        /* ── Key ── */
        .key-cell  { display: flex; align-items: center; gap: 8px; }
        .key-code  { font-family: monospace; font-size: 13px; color: var(--gold); letter-spacing: 0.5px; word-break: break-all; }
        .copy-btn  { background: transparent; border: none; color: var(--text-dim); cursor: pointer; padding: 3px; display: flex; align-items: center; flex-shrink: 0; }
        .copy-btn:hover { color: var(--text-muted); }

        /* ── Pills ── */
        .pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* ── Delete ── */
        .del-btn {
          padding: 5px 12px; background: rgba(224,82,82,0.10); border: 1px solid rgba(224,82,82,0.25);
          border-radius: 5px; color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .del-btn:hover { background: rgba(224,82,82,0.18); }

        /* ── Mobile cards ── */
        .mobile-cards { display: none; }
        .mobile-card  { padding: 16px; border-bottom: 1px solid var(--border-row); }
        .mobile-card:last-child { border-bottom: none; }
        .mc-row  { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; gap: 12px; }
        .mc-label{ font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; flex-shrink: 0; }

        /* ── Overlay + Hamburger ── */
        .overlay   { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 19; }
        .hamburger { background: transparent; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; align-items: center; }

        /* ── Mobile theme toggle (top bar) ── */
        .theme-toggle-sm {
          background: var(--avatar-bg); border: 1px solid var(--border);
          border-radius: 6px; padding: 6px; cursor: pointer;
          color: var(--gold); display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar    { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .main-wrap  { margin-left: 0; }

          .mobile-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-sidebar);
            border-bottom: 1px solid var(--border);
            position: sticky; top: 0; z-index: 10;
            backdrop-filter: blur(10px);
            transition: background 0.25s, border-color 0.25s;
          }
          .mobile-brand { font-size: 15px; font-weight: 700; color: var(--text); }
          .logout-btn-sm {
            padding: 6px 12px; background: rgba(224,82,82,0.08);
            border: 1px solid rgba(224,82,82,0.2); border-radius: 6px;
            color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
          }
          .page-header  { padding: 18px 16px 0; }
          .page-title   { font-size: 18px; }
          .page-subtitle{ font-size: 12px; }
          .main         { padding: 14px 16px 32px; }
          .table-scroll { display: none; }
          .mobile-cards { display: block; }
        }

        @media (max-width: 400px) {
          .logout-btn-sm { font-size: 11px; padding: 5px 10px; }
        }

      `}</style>
    </>
  );
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #0A0A0A)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #222', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
