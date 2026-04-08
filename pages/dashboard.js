import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/membership')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMemberships(data.memberships || []);
      })
      .catch(() => setError('Could not load membership data.'))
      .finally(() => setLoading(false));
  }, [status]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const statusColor = (s) => {
    if (s === 'active') return '#3ECF8E';
    if (s === 'trialing') return '#C9A84C';
    if (s === 'expired' || s === 'canceled') return '#E05252';
    return '#888';
  };

  const statusLabel = (s) => {
    const map = { active: 'Active', trialing: 'Trial', expired: 'Expired', canceled: 'Canceled', past_due: 'Past Due' };
    return map[s] || s;
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (!session) return null;

  const user = session.user;

  return (
    <>
      <Head>
        <title>LT Empire | Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.layout}>
        {/* Background grid */}
        <div style={styles.grid} aria-hidden="true" />

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <div style={styles.logoCircle}>
              <span style={styles.logoText}>LT</span>
            </div>
            <div>
              <div style={styles.brandName}>LT Empire</div>
              <div style={styles.brandSub}>Member Portal</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <a href="#" style={{ ...styles.navItem, ...styles.navItemActive }}>
              <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </a>
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.userInfo}>
              {user?.image ? (
                <img src={user.image} alt="" style={styles.avatar} />
              ) : (
                <div style={styles.avatarFallback}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user?.name || 'Member'}</div>
                <div style={styles.userEmail}>{user?.email || ''}</div>
              </div>
            </div>
            <button style={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.pageTitle}>My Licenses</h1>
              <p style={styles.pageDesc}>Manage your LT Empire membership and license keys</p>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeDot} />
              {memberships.filter(m => m.valid).length} Active
            </div>
          </div>

          {loading && (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ color: '#888', marginTop: 12, fontSize: 14 }}>Loading memberships...</p>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && memberships.length === 0 && (
            <div style={styles.emptyBox}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" style={{ width: 48, height: 48, marginBottom: 12 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p style={{ color: '#888', fontSize: 14 }}>No active memberships found for this account.</p>
              <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>Make sure you purchased with the same Whop account.</p>
            </div>
          )}

          {!loading && !error && memberships.length > 0 && (
            <div style={styles.cardsGrid}>
              {memberships.map((m) => (
                <div key={m.id} style={styles.licenseCard}>
                  {/* Card header */}
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.planName}>{m.plan?.name || 'LT Empire Plan'}</div>
                      <div style={styles.planBilling}>
                        {m.plan?.billing_period
                          ? `Billed ${m.plan.billing_period}`
                          : 'Lifetime'}
                      </div>
                    </div>
                    <span style={{ ...styles.statusPill, background: statusColor(m.status) + '20', color: statusColor(m.status), borderColor: statusColor(m.status) + '40' }}>
                      <span style={{ ...styles.statusDot, background: statusColor(m.status) }} />
                      {statusLabel(m.status)}
                    </span>
                  </div>

                  <div style={styles.divider} />

                  {/* License Key */}
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>License Key</div>
                    <div style={styles.licenseKeyBox}>
                      <code style={styles.licenseKey}>{m.license_key || 'N/A'}</code>
                      {m.license_key && (
                        <button
                          style={styles.copyBtn}
                          onClick={() => copyToClipboard(m.license_key, m.id + '_key')}
                          title="Copy to clipboard"
                        >
                          {copied === m.id + '_key' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
                              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={styles.statsRow}>
                    <div style={styles.stat}>
                      <div style={styles.statLabel}>Seats Used</div>
                      <div style={styles.statValue}>
                        <span style={styles.statNum}>{m.quantity ?? 1}</span>
                        <span style={styles.statUnit}>seat{m.quantity !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                      <div style={styles.statLabel}>Valid</div>
                      <div style={styles.statValue}>
                        <span style={{ ...styles.statNum, color: m.valid ? '#3ECF8E' : '#E05252' }}>
                          {m.valid ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                      <div style={styles.statLabel}>Renews</div>
                      <div style={styles.statValue}>
                        <span style={styles.statNum}>{formatDate(m.renewal_period_end)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <span style={styles.memberSince}>
                      Member since {formatDate(m.renewal_period_start)}
                    </span>
                    <span style={styles.membershipId}>
                      {m.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    background: '#0f0f0f',
    borderRight: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
    padding: '24px 16px',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    paddingLeft: 8,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 16px rgba(201,168,76,0.3)',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 800,
    color: '#0A0A0A',
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#F5F0E8',
  },
  brandSub: {
    fontSize: 11,
    color: '#C9A84C',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#888',
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'rgba(201,168,76,0.08)',
    color: '#C9A84C',
    borderLeft: '2px solid #C9A84C',
    paddingLeft: 10,
  },
  navIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  sidebarFooter: {
    borderTop: '1px solid #1e1e1e',
    paddingTop: 16,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    padding: '8px',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '2px solid #C9A84C',
    objectFit: 'cover',
    flexShrink: 0,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#0A0A0A',
    flexShrink: 0,
  },
  userDetails: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#F5F0E8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: 11,
    color: '#555',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '9px 16px',
    background: 'transparent',
    border: '1px solid #222',
    borderRadius: 7,
    color: '#555',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  main: {
    marginLeft: 260,
    flex: 1,
    padding: '40px 36px',
    position: 'relative',
    zIndex: 1,
    maxWidth: 'calc(100vw - 260px)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#F5F0E8',
    marginBottom: 4,
  },
  pageDesc: {
    fontSize: 13,
    color: '#555',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(62,207,142,0.08)',
    border: '1px solid rgba(62,207,142,0.2)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    color: '#3ECF8E',
    fontWeight: 600,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#3ECF8E',
    boxShadow: '0 0 6px #3ECF8E',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #222',
    borderTopColor: '#C9A84C',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(224,82,82,0.08)',
    border: '1px solid rgba(224,82,82,0.2)',
    borderRadius: 8,
    padding: '14px 18px',
    color: '#E05252',
    fontSize: 14,
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    textAlign: 'center',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 20,
  },
  licenseCard: {
    background: '#111111',
    border: '1px solid #1e1e1e',
    borderRadius: 14,
    padding: '24px',
    animation: 'fadeIn 0.35s ease',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    transition: 'border-color 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#F5F0E8',
    marginBottom: 3,
  },
  planBilling: {
    fontSize: 12,
    color: '#555',
    textTransform: 'capitalize',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid',
    textTransform: 'capitalize',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
  },
  divider: {
    height: 1,
    background: '#1e1e1e',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontWeight: 600,
  },
  licenseKeyBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0d0d0d',
    border: '1px solid #2a2208',
    borderRadius: 8,
    padding: '10px 14px',
  },
  licenseKey: {
    flex: 1,
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 14,
    color: '#C9A84C',
    letterSpacing: 1,
    wordBreak: 'break-all',
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    padding: 4,
    color: '#555',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    background: '#0d0d0d',
    borderRadius: 8,
    border: '1px solid #1a1a1a',
    overflow: 'hidden',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    padding: '12px 16px',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    background: '#1a1a1a',
  },
  statLabel: {
    fontSize: 10,
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: 600,
  },
  statValue: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 3,
  },
  statNum: {
    fontSize: 15,
    fontWeight: 700,
    color: '#F5F0E8',
  },
  statUnit: {
    fontSize: 11,
    color: '#555',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberSince: {
    fontSize: 11,
    color: '#444',
  },
  membershipId: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
  },
};
