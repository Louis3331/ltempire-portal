import { useEffect, useRef } from 'react';

export default function MouseEffect() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: -100, y: -100 });
  const ring    = useRef({ x: -100, y: -100 });
  const raf     = useRef(null);

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = dotRef.current;
    const ringEl = ringRef.current;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Spotlight: update CSS vars on root
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    };

    // Lerp loop for ring lag
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);

      if (dot) {
        dot.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringEl) {
        ringEl.style.transform = `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    // Cursor shrink on interactive elements
    const onEnter = () => ringEl?.classList.add('cursor-hover');
    const onLeave = () => ringEl?.classList.remove('cursor-hover');
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    // Re-bind on DOM mutations (dynamic buttons)
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Spotlight overlay */}
      <div className="spotlight" aria-hidden="true" />

      {/* Custom cursor dot */}
      <div ref={dotRef} className="cur-dot" aria-hidden="true" />

      {/* Custom cursor ring */}
      <div ref={ringRef} className="cur-ring" aria-hidden="true" />

      <style>{`
        /* Hide default cursor sitewide */
        *, *::before, *::after { cursor: none !important; }

        /* ── Spotlight ── */
        .spotlight {
          position: fixed; inset: 0; z-index: 2; pointer-events: none;
          background: radial-gradient(
            600px circle at var(--mx, -999px) var(--my, -999px),
            rgba(201,168,76,0.055),
            transparent 70%
          );
          transition: background 0.1s;
        }
        html[data-theme="light"] .spotlight {
          background: radial-gradient(
            600px circle at var(--mx, -999px) var(--my, -999px),
            rgba(139,96,16,0.06),
            transparent 70%
          );
        }

        /* ── Dot ── */
        .cur-dot {
          position: fixed; top: 0; left: 0; z-index: 9999;
          width: 8px; height: 8px; border-radius: 50%;
          background: #C9A84C;
          pointer-events: none; will-change: transform;
          transition: opacity 0.2s;
          box-shadow: 0 0 6px rgba(201,168,76,0.8);
        }
        html[data-theme="light"] .cur-dot { background: #8B6010; box-shadow: 0 0 6px rgba(139,96,16,0.6); }

        /* ── Ring ── */
        .cur-ring {
          position: fixed; top: 0; left: 0; z-index: 9998;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid rgba(201,168,76,0.5);
          pointer-events: none; will-change: transform;
          transition: width 0.2s, height 0.2s, border-color 0.2s, opacity 0.2s;
        }
        html[data-theme="light"] .cur-ring { border-color: rgba(139,96,16,0.4); }

        /* Ring shrinks on hover over interactive elements */
        .cur-ring.cursor-hover {
          width: 24px; height: 24px;
          border-color: rgba(201,168,76,0.9);
          transform: translate(var(--rx, 0), var(--ry, 0)) !important;
        }

        /* Hide custom cursor on touch/mobile */
        @media (hover: none) {
          .cur-dot, .cur-ring, .spotlight { display: none !important; }
          *, *::before, *::after { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
