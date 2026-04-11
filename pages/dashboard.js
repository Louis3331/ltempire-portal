import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../lib/useLang';
import GuideTab from '../components/GuideTab';
import BrokersTab from '../components/BrokersTab';
import FaqTab from '../components/FaqTab';

/* ── Card tilt handler ──────────────────────────────────── */
function useTilt() {
  const onMove = useCallback((e) => {
    const card = e.currentTarget;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;   // -0.5 to 0.5
    const y = (e.clientY - top)  / height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg)`;
    card.style.boxShadow = `${-x * 4}px ${y * 4}px 16px rgba(201,168,76,0.07)`;
  }, []);

  const onLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    card.style.boxShadow = '';
  }, []);

  return { onMouseMove: onMove, onMouseLeave: onLeave };
}

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
const BrokerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="nav-icon">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
    <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
    <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="nav-icon">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" y1="7" x2="15" y2="7" strokeLinecap="round" />
    <line x1="9" y1="11" x2="13" y2="11" strokeLinecap="round" />
  </svg>
);
const FaqIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="nav-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
  </svg>
);

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
  const [toast,           setToast]           = useState(null);
  const { lang, setLang, t } = useLang();
  const tilt = useTilt();
  const router = useRouter();

  /* Nav built inside component so labels are reactive to lang */
  const NAV = [
    { id: 'licenses', label: t('nav.licenses'), icon: <KeyIcon /> },
    { id: 'accounts', label: t('nav.accounts'), icon: <MonitorIcon /> },
    { id: 'guide',    label: t('nav.guide'),    icon: <BookIcon /> },
    { id: 'brokers',  label: t('nav.brokers'),  icon: <BrokerIcon /> },
    { id: 'faq',      label: t('nav.faq'),      icon: <FaqIcon /> },
  ];

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
      .catch(() => setError(t('error.load')))
      .finally(() => setLoading(false));
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const switchLang = (l) => {
    setLang(l);
    document.documentElement.setAttribute('lang', l === 'zh' ? 'zh-CN' : 'en');
  };

  const loadAccounts = () => {
    setAccountsLoading(true);
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(d.accounts || [])).catch(() => {}).finally(() => setAccountsLoading(false));
  };

  const deleteAccount = async (licenseKey, id) => {
    if (!confirm(t('accounts.confirmDelete'))) return;
    await fetch(`/api/accounts?licenseKey=${encodeURIComponent(licenseKey)}&id=${id}`, { method: 'DELETE' });
    showToast(lang === 'zh' ? '账户已删除' : 'Account removed');
    loadAccounts();
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      showToast(lang === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const switchTab = (newTab) => {
    if (newTab === tab) { setSidebarOpen(false); return; }
    const navIds = NAV.map(n => n.id);
    const dir = navIds.indexOf(newTab) > navIds.indexOf(tab) ? 'right' : 'left';
    setSlideDir(dir);
    setAnimKey(k => k + 1);
    setTab(newTab);
    if (newTab === 'accounts') loadAccounts();
    setSidebarOpen(false);
  };

  const fmt = (ts) => {
    if (!ts) return t('label.none');
    return new Date(ts * 1000).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const fmtMs = (ms) => {
    if (!ms) return t('label.none');
    return new Date(ms).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const daysLeft = (ts) => {
    if (!ts) return null;
    return Math.ceil((ts * 1000 - Date.now()) / 86400000);
  };

  const statusColor = (s) => ({ active: '#3ECF8E', trialing: '#C9A84C', expired: '#E05252', canceled: '#E05252' }[s] || '#888');
  const statusLabel = (s) => ({
    active: t('status.active'), trialing: t('status.trial'),
    expired: t('status.expired'), canceled: t('status.canceled'),
    past_due: t('status.pastDue'), completed: t('status.active'),
  }[s] || s);

  if (loading) return <Loader />;
  if (!session) return null;

  const email     = session.user?.email || session.email || '';
  const initial   = email[0]?.toUpperCase() || 'U';
  const pageTitle    = tab === 'licenses' ? t('page.licenses.title') : tab === 'accounts' ? t('page.accounts.title') : tab === 'brokers' ? t('nav.brokers') : tab === 'faq' ? t('nav.faq') : t('nav.guide');
  const pageSubtitle = tab === 'licenses' ? t('page.licenses.subtitle') : tab === 'accounts' ? t('page.accounts.subtitle') : tab === 'brokers' ? (lang === 'zh' ? '经测试推荐与 LTE Gold EA 配合使用的经纪商' : 'Brokers tested and approved to work with LTE Gold EA') : tab === 'faq' ? (lang === 'zh' ? '关于 LTE Gold EA 的常见问题解答' : 'Common questions about LTE Gold EA answered') : (lang === 'zh' ? 'MT5 专家顾问安装步骤指南' : 'Step-by-step guide to install the MT5 Expert Advisor');

  return (
    <>
      <Head>
        <title>LT Empire | Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="layout">
        <div className="grid" aria-hidden="true" />

        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Language toggle — fixed top right */}
        <div className="lang-corner">
          <button className={`lang-pill ${lang === 'en' ? 'lang-active' : ''}`} onClick={() => switchLang('en')}>EN</button>
          <button className={`lang-pill ${lang === 'zh' ? 'lang-active' : ''}`} onClick={() => switchLang('zh')}>中文</button>
        </div>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

          <div className="sidebar-logo">
            <div className="logo-circle"><span className="logo-text">LT</span></div>
            <div>
              <div className="brand-name">LT Empire</div>
              <div className="brand-sub">Member Portal</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <p className="nav-section-label">{t('nav.section')}</p>
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

          {/* Language — sidebar only on mobile */}
          <div className="theme-row sidebar-lang-row">
            <span className="theme-label">{t('lang.label')}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`lang-pill ${lang === 'en' ? 'lang-active' : ''}`} onClick={() => switchLang('en')}>EN</button>
              <button className={`lang-pill ${lang === 'zh' ? 'lang-active' : ''}`} onClick={() => switchLang('zh')}>中文</button>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="theme-row">
            <span className="theme-label">{theme === 'dark' ? t('theme.dark') : t('theme.light')}</span>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <span className={`toggle-track ${theme === 'light' ? 'toggle-on' : ''}`}>
                <span className="toggle-thumb">
                  {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                </span>
              </span>
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{initial}</div>
              <div className="user-email">{email}</div>
            </div>
            <div className="social-links">
              <a href="https://www.youtube.com/channel/UCJJ2W0jG0SQPV4_z0wMjL8Q/" target="_blank" rel="noopener noreferrer" className="social-btn social-yt" title="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                </svg>
                YouTube
              </a>
              <a href="https://discord.gg/zxPSumfwxt" target="_blank" rel="noopener noreferrer" className="social-btn social-dc" title="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
                  <path d="M20.3 4.4A19.7 19.7 0 0 0 15.5 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.7 0A13 13 0 0 0 8.5 3a19.6 19.6 0 0 0-4.8 1.4C.5 9.1-.3 13.7.1 18.2a19.9 19.9 0 0 0 6 3 14.7 14.7 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2-.9l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4a13 13 0 0 1-2 1 14.7 14.7 0 0 0 1.3 2A19.8 19.8 0 0 0 24 18.2c.4-5.1-.9-9.6-3.7-13.8zM8 15.4c-1.2 0-2.3-1.1-2.3-2.5S6.7 10.4 8 10.4s2.3 1.1 2.3 2.5S9.3 15.4 8 15.4zm8 0c-1.2 0-2.3-1.1-2.3-2.5s1-2.5 2.3-2.5 2.3 1.1 2.3 2.5-1 2.5-2.3 2.5z"/>
                </svg>
                Discord
              </a>
            </div>
            <button className="logout-btn" onClick={() => { window.location.href = '/api/auth/logout'; }}>
              {t('sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────── */}
        <div className="main-wrap">

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
                {t('sidebar.logout')}
              </button>
            </div>
          </header>

          <div className="page-header">
            <div className="page-welcome">{lang === 'zh' ? `欢迎回来，${email.split('@')[0]}` : `Welcome back, ${email.split('@')[0]}`}</div>
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">{pageSubtitle}</p>
          </div>

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
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>{t('licenses.empty')}</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6 }}>{t('licenses.emptyHint')}</p>
                </div>
              ) : (
                <div className="table-wrap" {...tilt}>
                  <div className="table-scroll">
                    <table className="table">
                      <thead>
                        <tr>
                          {[t('th.licenseKey'), t('th.status'), t('th.plan'), t('th.registered'), t('th.expires'), t('th.valid')].map(h => (
                            <th key={h} className="th">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.map((m) => (
                          <tr key={m.id} className="tr">
                            <td className="td">
                              <div className="key-cell">
                                <code className="key-code">{m.license_key || t('label.none')}</code>
                                {m.license_key && (
                                  <button className="copy-btn" onClick={() => copy(m.license_key, m.id)} title={t('btn.copy')}>
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
                            <td className="td" style={{ color: 'var(--gold)', fontSize: 13 }}>{m.plan?.name || t('label.none')}</td>
                            <td className="td" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(m.renewal_period_start)}</td>
                            <td className="td" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                              {m.renewal_period_end ? (
                                <>
                                  {fmt(m.renewal_period_end)}
                                  {(() => { const d = daysLeft(m.renewal_period_end); if (d === null) return null; const c = d < 7 ? '#E05252' : d < 30 ? '#C9A84C' : '#3ECF8E'; return <span style={{ display: 'inline-block', marginLeft: 6, fontSize: 10, fontWeight: 700, color: c, background: c + '18', borderRadius: 4, padding: '1px 6px' }}>{d > 0 ? `${d}d` : lang === 'zh' ? '已到期' : 'Expired'}</span>; })()}
                                </>
                              ) : (
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#3ECF8E', background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.25)', borderRadius: 4, padding: '2px 8px' }}>
                                  {lang === 'zh' ? '终身' : 'Lifetime'}
                                </span>
                              )}
                            </td>
                            <td className="td">
                              <span style={{ color: m.valid ? '#3ECF8E' : '#E05252', fontWeight: 700, fontSize: 13 }}>
                                {m.valid ? t('label.yes') : t('label.no')}
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
                      <div key={m.id} className="mobile-card tilt-card" {...tilt}>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.licenseKey')}</span>
                          <div className="key-cell">
                            <code className="key-code" style={{ fontSize: 12 }}>{m.license_key || t('label.none')}</code>
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
                          <span className="mc-label">{t('th.status')}</span>
                          <span className="pill" style={{ background: statusColor(m.status) + '20', color: statusColor(m.status), border: `1px solid ${statusColor(m.status)}40` }}>
                            <span className="dot" style={{ background: statusColor(m.status) }} />{statusLabel(m.status)}
                          </span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.plan')}</span>
                          <span style={{ color: 'var(--gold)', fontSize: 13 }}>{m.plan?.name || t('label.none')}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.expires')}</span>
                          {m.renewal_period_end ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{fmt(m.renewal_period_end)}</span>
                              {(() => { const d = daysLeft(m.renewal_period_end); if (d === null) return null; const c = d < 7 ? '#E05252' : d < 30 ? '#C9A84C' : '#3ECF8E'; return <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + '18', borderRadius: 4, padding: '1px 6px' }}>{d > 0 ? `${d}d` : lang === 'zh' ? '已到期' : 'Expired'}</span>; })()}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#3ECF8E', background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.25)', borderRadius: 4, padding: '2px 8px' }}>
                              {lang === 'zh' ? '终身' : 'Lifetime'}
                            </span>
                          )}
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.valid')}</span>
                          <span style={{ color: m.valid ? '#3ECF8E' : '#E05252', fontWeight: 700, fontSize: 13 }}>{m.valid ? t('label.yes') : t('label.no')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Accounts ── */}
            {tab === 'accounts' && (
              <div className="table-wrap" {...tilt}>
                <div className="table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        {[t('th.licenseKey'), t('th.accountNo'), t('th.name'), t('th.server'), t('th.registered'), t('th.lastUpdate'), ''].map((h, i) => (
                          <th key={i} className="th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accountsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="td"><div className="skeleton" style={{ height: 13, borderRadius: 4, width: j === 0 ? 110 : j === 6 ? 52 : [80,70,90,80,80][j-1] || 80 }} /></td>
                          ))}</tr>
                        ))
                      ) : accounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="td" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontSize: 14 }}>
                            {t('accounts.empty')}<br />
                            <span style={{ fontSize: 12, color: 'var(--text-dimmer)', marginTop: 6, display: 'block' }}>{t('accounts.emptyHint')}</span>
                          </td>
                        </tr>
                      ) : accounts.map(a => (
                        <tr key={a.id} className="tr">
                          <td className="td"><code className="key-code" style={{ fontSize: 12 }}>{a.licenseKey}</code></td>
                          <td className="td" style={{ color: 'var(--gold)', fontWeight: 600 }}>{a.accountNumber}</td>
                          <td className="td">{a.accountName || t('label.none')}</td>
                          <td className="td">{a.accountServer || t('label.none')}</td>
                          <td className="td" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.registeredAt)}</td>
                          <td className="td" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</td>
                          <td className="td">
                            <button className="del-btn" onClick={() => deleteAccount(a.licenseKey, a.id)}>{t('btn.delete')}</button>
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
                      <div key={a.id} className="mobile-card tilt-card" {...tilt}>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.accountNo')}</span>
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{a.accountNumber}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.name')}</span>
                          <span style={{ color: 'var(--text)', fontSize: 13 }}>{a.accountName || t('label.none')}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.server')}</span>
                          <span style={{ color: 'var(--text)', fontSize: 13 }}>{a.accountServer || t('label.none')}</span>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('label.license')}</span>
                          <code className="key-code" style={{ fontSize: 11 }}>{a.licenseKey}</code>
                        </div>
                        <div className="mc-row">
                          <span className="mc-label">{t('th.lastUpdate')}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtMs(a.lastUpdate)}</span>
                        </div>
                        <button className="del-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => deleteAccount(a.licenseKey, a.id)}>
                          {t('btn.deleteAccount')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {accountsLoading && (
                  <div className="mobile-cards">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="mobile-card">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="mc-row">
                            <div className="skeleton" style={{ height: 11, width: 60, borderRadius: 3 }} />
                            <div className="skeleton" style={{ height: 13, width: 100, borderRadius: 3 }} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {!accountsLoading && accounts.length === 0 && (
                  <div className="mobile-cards" style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
                    {t('accounts.empty')}<br />
                    <span style={{ fontSize: 12, color: 'var(--text-dimmer)', marginTop: 6, display: 'block' }}>{t('accounts.emptyHint')}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── MT5 Guide ── */}
            {tab === 'guide' && <GuideTab lang={lang} />}

            {/* ── Brokers ── */}
            {tab === 'brokers' && <BrokersTab lang={lang} />}

            {/* ── FAQ ── */}
            {tab === 'faq' && <FaqTab lang={lang} />}

          </main>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === 'error' ? '#E0525240' : '#3ECF8E40', color: toast.type === 'error' ? '#E05252' : '#3ECF8E', background: toast.type === 'error' ? 'rgba(224,82,82,0.12)' : 'rgba(62,207,142,0.12)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {toast.msg}
        </div>
      )}

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
          --text-dim:         #777;
          --text-dimmer:      #666;
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
          --lang-bg:          #1a1a1a;
          --lang-border:      #2a2a2a;
        }
        html[data-theme="light"] {
          --bg:               #E8E3D8;
          --bg-sidebar:       #F9F6F0;
          --bg-table:         #F9F6F0;
          --bg-table-hd:      #EEE9DF;
          --border:           #CEC9BC;
          --border-row:       #E0DBD0;
          --text:             #141210;
          --text-muted:       #6A6560;
          --text-dim:         #8A8580;
          --text-dimmer:      #A8A49F;
          --gold:             #7A5010;
          --gold-dark:        #5C3C08;
          --gold-glow:        rgba(122,80,16,0.22);
          --gold-alpha:       rgba(122,80,16,0.1);
          --gold-grid:        rgba(122,80,16,0.07);
          --row-hover:        rgba(122,80,16,0.05);
          --nav-label:        #A09890;
          --avatar-bg:        #EDE8DF;
          --avatar-border:    #D4CEBC;
          --toggle-bg:        #CEC9BC;
          --toggle-on-bg:     #E8DEC0;
          --shadow-sidebar:   2px 0 24px rgba(0,0,0,0.12);
          --lang-bg:          #EDE8DF;
          --lang-border:      #D4CEBC;
        }

        /* ── Reset ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; transition: background 0.25s; }

        /* ── Animations ── */
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes pageEnterRight { from { opacity: 0; transform: translateX(22px) scale(0.985); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @keyframes pageEnterLeft  { from { opacity: 0; transform: translateX(-22px) scale(0.985); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .slide-right { animation: pageEnterRight 0.32s cubic-bezier(0.22,1,0.36,1); }
        .slide-left  { animation: pageEnterLeft  0.32s cubic-bezier(0.22,1,0.36,1); }

        /* ── Grid ── */
        .grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(var(--gold-grid) 1px, transparent 1px),
                            linear-gradient(90deg, var(--gold-grid) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
        }

        /* ── Layout ── */
        .layout { display: flex; min-height: 100vh; background: var(--bg); }

        /* ── Sidebar ── */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--bg-sidebar); border-right: 1px solid var(--border);
          box-shadow: var(--shadow-sidebar);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 20;
          transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), background 0.25s, border-color 0.25s;
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
          transition: background 0.2s, color 0.2s, transform 0.12s;
        }
        .nav-item:hover { background: var(--gold-alpha); color: var(--text-muted); }
        .nav-item:active { transform: scale(0.97); }
        .nav-active { background: var(--gold-alpha) !important; color: var(--gold) !important; }
        .nav-active::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: var(--gold);
        }
        .nav-pip { position: absolute; right: 10px; width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
        .nav-icon { width: 17px; height: 17px; flex-shrink: 0; }

        /* ── Language corner (fixed top right, desktop only) ── */
        .lang-corner {
          position: fixed; top: 14px; right: 20px; z-index: 30;
          display: flex; gap: 5px;
        }
        /* Sidebar lang row hidden on desktop, visible on mobile */
        .theme-row.sidebar-lang-row { display: none; }

        /* ── Sidebar rows (theme only now) ── */
        .theme-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; border-top: 1px solid var(--border);
        }
        .theme-label { font-size: 12px; color: var(--text-dim); font-weight: 500; }

        .lang-pills { display: flex; gap: 4px; }
        .lang-pill {
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid var(--lang-border);
          background: var(--lang-bg); color: var(--text-dim);
          transition: all 0.15s;
        }
        .lang-active {
          background: var(--gold) !important;
          border-color: var(--gold) !important;
          color: #0A0A0A !important;
        }

        /* ── Theme toggle ── */
        .theme-toggle { background: transparent; border: none; cursor: pointer; padding: 0; }
        .toggle-track {
          display: flex; align-items: center;
          width: 44px; height: 24px; border-radius: 12px;
          background: var(--toggle-bg); padding: 2px;
          transition: background 0.25s; position: relative;
        }
        .toggle-on { background: var(--toggle-on-bg) !important; }
        .toggle-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--bg-sidebar); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), background 0.25s;
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
        .social-links { display: flex; gap: 7px; }
        .social-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 7px 6px; border-radius: 6px; font-size: 11px; font-weight: 600;
          text-decoration: none; transition: opacity 0.15s; white-space: nowrap;
        }
        .social-yt  { background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.25); color: #ff4444; }
        .social-dc  { background: rgba(88,101,242,0.1); border: 1px solid rgba(88,101,242,0.3); color: #7289da; }
        .social-btn:hover { opacity: 0.75; }
        .logout-btn {
          width: 100%; padding: 8px; background: rgba(224,82,82,0.07);
          border: 1px solid rgba(224,82,82,0.2); border-radius: 6px;
          color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .logout-btn:hover { background: rgba(224,82,82,0.14); }

        /* ── Main ── */
        .main-wrap { margin-left: 220px; flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; z-index: 1; }
        .mobile-header { display: none; }
        .page-header   { padding: 28px 32px 16px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
        .page-welcome  { font-size: 11px; font-weight: 600; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; opacity: 0.8; }
        .page-title    { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
        .page-subtitle { font-size: 13px; color: var(--text-dim); margin-top: 4px; }
        .main          { padding: 24px 32px 40px; }

        /* ── Skeleton ── */
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton {
          background: linear-gradient(90deg, var(--border) 25%, var(--border-row) 50%, var(--border) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        /* ── Toast ── */
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          border: 1px solid; border-radius: 8px; padding: 10px 18px;
          font-size: 13px; font-weight: 600; z-index: 9999;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          display: flex; align-items: center; gap: 8px;
          animation: slideUp 0.2s ease; white-space: nowrap;
          backdrop-filter: blur(8px);
        }

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

        /* ── Tilt ── */
        .table-wrap, .tilt-card { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.25s, border-color 0.25s; will-change: transform; }

        /* ── Table ── */
        .table-wrap   { background: var(--bg-table); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
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
          border-radius: 5px; color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;
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

        /* ── Mobile theme toggle ── */
        .theme-toggle-sm {
          background: var(--avatar-bg); border: 1px solid var(--border);
          border-radius: 6px; padding: 6px; cursor: pointer;
          color: var(--gold); display: flex; align-items: center; justify-content: center;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .lang-corner                  { display: none; }
          .theme-row.sidebar-lang-row   { display: flex; }
          .sidebar     { transform: translateX(-100%); }
          .sidebar-open{ transform: translateX(0) !important; }
          .main-wrap   { margin-left: 0; }

          .mobile-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 16px; background: var(--bg-sidebar);
            border-bottom: 1px solid var(--border);
            position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);
            transition: background 0.25s, border-color 0.25s;
          }
          .mobile-brand  { font-size: 15px; font-weight: 700; color: var(--text); }
          .logout-btn-sm {
            padding: 6px 12px; background: rgba(224,82,82,0.08);
            border: 1px solid rgba(224,82,82,0.2); border-radius: 6px;
            color: #E05252; font-size: 12px; font-weight: 600; cursor: pointer;
          }
          .page-header   { padding: 18px 16px 0; }
          .page-title    { font-size: 18px; }
          .page-subtitle { font-size: 12px; }
          .main          { padding: 14px 16px 32px; }
          .table-scroll  { display: none; }
          .mobile-cards  { display: block; }
        }

        @media (max-width: 400px) {
          .logout-btn-sm { font-size: 11px; padding: 5px 10px; }
          .lang-corner { top: 10px; right: 12px; }
          .lang-pill { font-size: 10px; padding: 3px 8px; }
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
