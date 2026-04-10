import { useEffect, useRef } from 'react';

export default function MouseEffect() {
  const dotRef  = useRef(null);
  const pos     = useRef({ x: -100, y: -100 });
  const raf     = useRef(null);

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = dotRef.current;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    };

    const tick = () => {
      if (dot) {
        dot.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Spotlight overlay */}
      <div className="spotlight" aria-hidden="true" />

      {/* Custom cursor dot only */}
      <div ref={dotRef} className="cur-dot" aria-hidden="true" />

      <style>{`
        /* Hide default cursor sitewide */
        *, *::before, *::after { cursor: none !important; }

        /* ── Spotlight ── */
        .spotlight {
          position: fixed; inset: 0; z-index: 2; pointer-events: none;
          background: radial-gradient(
            500px circle at var(--mx, -999px) var(--my, -999px),
            rgba(201,168,76,0.13),
            transparent 70%
          );
        }
        html[data-theme="light"] .spotlight {
          background: radial-gradient(
            500px circle at var(--mx, -999px) var(--my, -999px),
            rgba(139,96,16,0.10),
            transparent 70%
          );
        }

        /* ── Dot ── */
        .cur-dot {
          position: fixed; top: 0; left: 0; z-index: 9999;
          width: 8px; height: 8px; border-radius: 50%;
          background: #C9A84C;
          pointer-events: none; will-change: transform;
          box-shadow: 0 0 8px rgba(201,168,76,0.9);
        }
        html[data-theme="light"] .cur-dot {
          background: #8B6010;
          box-shadow: 0 0 8px rgba(139,96,16,0.7);
        }

        /* Hide on touch/mobile */
        @media (hover: none) {
          .cur-dot, .spotlight { display: none !important; }
          *, *::before, *::after { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
