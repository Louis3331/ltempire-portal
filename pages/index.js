import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.ok ? router.push('/dashboard') : null)
      .finally(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setErrorMsg(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Login using your Whop email to view and manage your license.
          </p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder="Whop email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                required
                autoComplete="email"
              />
            </div>

            {errorMsg && <p style={styles.error}>{errorMsg}</p>}

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? (
                <>
                  <div style={styles.btnSpinner} />
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Access restricted to active LT Empire members only.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #444; }
        input:focus { outline: none; border-color: #C9A84C !important; }
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
  desc: { fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' },
  inputGroup: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#555', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '13px 14px 13px 40px', background: '#0d0d0d',
    border: '1px solid #2a2a2a', borderRadius: 8, color: '#F5F0E8', fontSize: 14,
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  error: { fontSize: 13, color: '#E05252', margin: '0 0 4px', textAlign: 'center' },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
    border: 'none', borderRadius: 8, color: '#0A0A0A', fontSize: 15, fontWeight: 700,
    letterSpacing: 0.3, cursor: 'pointer', marginTop: 4,
  },
  btnSpinner: { width: 16, height: 16, border: '2px solid rgba(10,10,10,0.3)', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  footer: { marginTop: 24, fontSize: 12, color: '#444' },
};
