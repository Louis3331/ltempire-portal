import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head />
      <body>
        {/* Inline script runs before React hydration to prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('lt-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
              var l = localStorage.getItem('lt-lang') || 'en';
              document.documentElement.setAttribute('lang', l === 'zh' ? 'zh-CN' : 'en');
            } catch(e) {}
          })();
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
