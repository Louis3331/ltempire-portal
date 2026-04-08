import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.ok ? router.push('/dashboard') : null)
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>LT Empire | Member Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <div style={styles.grid} aria-hidden="true" />

        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <div style={styles.logoCircle}>
              <span style={styles.logoText}>LT</span>
            </div>
          </div>

          <h1 style={styles.title}>LT Empire</h1>
          <p style={styles.subtitle}>Member Portal</p>

          <div style={styles.divider} />

          <p style={styles.desc}>
            Sign in with your Whop account to access your license, plan details, and member dashboard.
          </p>

          <button style={styles.btn} onClick={() => { window.location.href = '/api/auth/login'; }}>
            <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
            Sign in with Whop
          </button>

          {router.query.error && (
            <p style={styles.error}>Authentication failed. Please try again.</p>
          )}

          <p style={styles.footer}>
            Access restricted to active LT Empire members only.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative',
    background: 'radial-gradient(ellipse at 50% 0%, #1a1408 0%, #0A0A0A 70%)',
  },
  grid: {
    position: 'fixed', inset: 0,
    backgroundImage: `linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none',
  },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' },
  spinner: { width: 36, height: 36, border: '3px solid #222', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  card: {
    position: 'relative', zIndex: 1, background: '#111111', border: '1px solid #2a2208',
    borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420, textAlign: 'center',
    boxShadow: '0 0 60px rgba(201,168,76,0.06), 0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.4s ease',
  },
  logoWrap: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  logoCircle: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(201,168,76,0.3)' },
  logoText: { fontSize: 26, fontWeight: 800, color: '#0A0A0A', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: 700, color: '#F5F0E8', letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#C9A84C', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 },
  divider: { height: 1, background: 'linear-gradient(90deg, transparent, #2a2208, transparent)', margin: '24px 0' },
  desc: { fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 28 },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
    border: 'none', borderRadius: 8, color: '#0A0A0A', fontSize: 15, fontWeight: 700,
    letterSpacing: 0.3, transition: 'all 0.2s ease', cursor: 'pointer',
  },
  btnIcon: { width: 18, height: 18 },
  error: { marginTop: 16, fontSize: 13, color: '#E05252' },
  footer: { marginTop: 24, fontSize: 12, color: '#444' },
};
