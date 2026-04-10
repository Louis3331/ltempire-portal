import { useState, useEffect } from 'react';
import { translations } from './translations';

export function useLang() {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lt-lang') || 'en';
      setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem('lt-lang', l); } catch {}
  };

  const t = (key) =>
    translations[lang]?.[key] ?? translations['en']?.[key] ?? key;

  return { lang, setLang, t };
}
