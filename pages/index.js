import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../lib/useLang';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { lang, setLang, t }    = useLang();

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
        setErrorMsg(data.error || t('login.error.default'));
      }
    } catch {
      setErrorMsg(t('login.error.network'));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="lp-center">
        <div className="lp-spinner" />
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

      <div className="lp-page">
        <div className="lp-grid" aria-hidden="true" />

        {/* Language toggle — top right of page */}
        <div className="lp-lang-corner">
          <button className={`lp-lang-btn ${lang === 'en' ? 'lp-lang-active' : ''}`} onClick={() => setLang('en')}>EN</button>
          <button className={`lp-lang-btn ${lang === 'zh' ? 'lp-lang-active' : ''}`} onClick={() => setLang('zh')}>中文</button>
        </div>

        <div className="lp-card login-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(201,168,76,0.3)' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0A', letterSpacing: 1 }}>LT</span>
            </div>
          </div>

          <h1 className="lp-title">LT Empire</h1>
          <p className="lp-subtitle">{t('login.subtitle')}</p>

          <div className="lp-divider" />

          <p className="lp-desc">{t('login.desc')}</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            <div style={{ position: 'relative' }}>
              <svg className="lp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder={t('login.placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="lp-input"
                required
                autoComplete="email"
              />
            </div>

            {errorMsg && <p style={{ fontSize: 13, color: '#E05252', margin: '0 0 4px', textAlign: 'center' }}>{errorMsg}</p>}

            <button type="submit" className="lp-btn" disabled={loading}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(10,10,10,0.3)', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  {t('login.verifying')}
                </>
              ) : t('login.btn')}
            </button>
          </form>

          <p className="lp-footer">{t('login.footer')}</p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --lp-bg:        #0A0A0A;
          --lp-bg-grad:   radial-gradient(ellipse at 50% 0%, #1a1408 0%, #0A0A0A 70%);
          --lp-grid:      rgba(201,168,76,0.04);
          --lp-card:      #111111;
          --lp-card-bdr:  #2a2208;
          --lp-card-shad: 0 0 60px rgba(201,168,76,0.06), 0 24px 48px rgba(0,0,0,0.5);
          --lp-text:      #F5F0E8;
          --lp-muted:     #888;
          --lp-dim:       #444;
          --lp-divider:   linear-gradient(90deg, transparent, #2a2208, transparent);
          --lp-input-bg:  #0d0d0d;
          --lp-input-bdr: #2a2a2a;
          --lp-ph:        #444;
          --lp-icon:      #555;
          --lp-gold:      #C9A84C;
          --lp-lang-bg:   #1a1a1a;
          --lp-lang-bdr:  #2a2a2a;
        }
        html[data-theme="light"] {
          --lp-bg:        #F2F0EB;
          --lp-bg-grad:   radial-gradient(ellipse at 50% 0%, #F5EDD8 0%, #F2F0EB 70%);
          --lp-grid:      rgba(139,96,16,0.05);
          --lp-card:      #FFFFFF;
          --lp-card-bdr:  #E4E0D8;
          --lp-card-shad: 0 0 60px rgba(139,96,16,0.05), 0 24px 48px rgba(0,0,0,0.08);
          --lp-text:      #1A1817;
          --lp-muted:     #7A7570;
          --lp-dim:       #B0ABA5;
          --lp-divider:   linear-gradient(90deg, transparent, #E4E0D8, transparent);
          --lp-input-bg:  #FAFAF7;
          --lp-input-bdr: #E0DDD6;
          --lp-ph:        #B0ABA5;
          --lp-icon:      #9A9590;
          --lp-gold:      #8B6010;
          --lp-lang-bg:   #F0EDE6;
          --lp-lang-bdr:  #E0DDD6;
        }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .lp-center  { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--lp-bg); }
        .lp-spinner { width: 36px; height: 36px; border: 3px solid #222; border-top-color: #C9A84C; border-radius: 50%; animation: spin 0.8s linear infinite; }

        .lp-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; background: var(--lp-bg-grad); transition: background 0.25s;
        }
        .lp-grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(var(--lp-grid) 1px, transparent 1px),
                            linear-gradient(90deg, var(--lp-grid) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .lp-card {
          position: relative; z-index: 1;
          background: var(--lp-card); border: 1px solid var(--lp-card-bdr);
          border-radius: 16px; padding: 48px 40px;
          width: 100%; max-width: 420px; text-align: center;
          box-shadow: var(--lp-card-shad); animation: fadeIn 0.4s ease;
          transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
        }

        /* Language toggle — fixed top right */
        .lp-lang-corner {
          position: fixed; top: 16px; right: 20px; z-index: 10;
          display: flex; gap: 6px;
        }
        .lp-lang-btn {
          padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid var(--lp-lang-bdr);
          background: var(--lp-lang-bg); color: var(--lp-muted);
          transition: all 0.15s;
        }
        .lp-lang-active {
          background: var(--lp-gold) !important;
          border-color: var(--lp-gold) !important;
          color: #0A0A0A !important;
        }

        .lp-title    { font-size: 26px; font-weight: 700; color: var(--lp-text); letter-spacing: 0.5px; margin-bottom: 4px; }
        .lp-subtitle { font-size: 13px; color: var(--lp-gold); letter-spacing: 3px; text-transform: uppercase; font-weight: 500; }
        .lp-divider  { height: 1px; background: var(--lp-divider); margin: 24px 0; }
        .lp-desc     { font-size: 14px; color: var(--lp-muted); line-height: 1.6; margin-bottom: 24px; }
        .lp-footer   { margin-top: 24px; font-size: 12px; color: var(--lp-dim); }

        .lp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          width: 16px; height: 16px; color: var(--lp-icon); pointer-events: none;
        }
        .lp-input {
          width: 100%; padding: 13px 14px 13px 40px;
          background: var(--lp-input-bg); border: 1px solid var(--lp-input-bdr);
          border-radius: 8px; color: var(--lp-text); font-size: 14px;
          box-sizing: border-box; transition: border-color 0.2s, background 0.2s;
        }
        .lp-input::placeholder { color: var(--lp-ph); }
        .lp-input:focus { outline: none; border-color: var(--lp-gold); }

        .lp-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 14px 24px;
          background: linear-gradient(135deg, #C9A84C, #9B7B2F);
          border: none; border-radius: 8px; color: #0A0A0A;
          font-size: 15px; font-weight: 700; letter-spacing: 0.3px; cursor: pointer; margin-top: 4px;
        }
        .lp-btn:disabled { opacity: 0.8; cursor: not-allowed; }

        @media (max-width: 480px) { .lp-card { padding: 32px 20px; } }
      `}</style>
    </>
  );
}
