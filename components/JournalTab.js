import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Shared trade builder ───────────────────────────────── */
function buildTrade(raw) {
  const {
    ticket, openTime, closeTime, symbol, type,
    lots, openPrice, closePrice, profit, commission, swap, comment,
  } = raw;

  if (!ticket || !closeTime) return null;
  const closeTs = new Date(closeTime);
  if (isNaN(closeTs.getTime())) return null;
  // Skip rows where close price is missing, zero, or non-numeric (e.g. "filled", "canceled" from orders section)
  const closePriceVal = parseFloat(closePrice);
  if (!closePrice || isNaN(closePriceVal) || closePriceVal <= 0) return null;

  const t = (type || '').toLowerCase().trim();
  // Only accept fully-closed market orders — reject pending types, balance rows, etc.
  if (t !== 'buy' && t !== 'sell') return null;
  if (!symbol) return null;

  const dir      = t === 'sell' ? 'sell' : 'buy';
  const diff     = (parseFloat(closePrice) || 0) - (parseFloat(openPrice) || 0);
  const sym      = symbol.toUpperCase();
  const pipSize  = sym.includes('JPY') ? 0.01
                 : (sym.includes('XAU') || sym.includes('GOLD')) ? 0.01
                 : sym.includes('US30') || sym.includes('US100') || sym.includes('NAS') || sym.includes('SPX') ? 1
                 : 0.0001;
  const rawPips  = diff / pipSize;
  const pips     = dir === 'sell' ? -rawPips : rawPips;
  const p        = parseFloat(profit)     || 0;
  const c        = parseFloat(commission) || 0;
  const s        = parseFloat(swap)       || 0;

  return {
    ticket:     String(ticket),
    openTime:   openTime ? normaliseDate(String(openTime)) : normaliseDate(String(closeTime)),
    closeTime:  normaliseDate(String(closeTime)),
    symbol:     symbol.toUpperCase(),
    type:       dir,
    lots:       parseFloat(lots) || 0,
    openPrice:  parseFloat(openPrice)  || 0,
    closePrice: closePriceVal,
    profit:     Math.round(p * 100) / 100,
    commission: Math.round(c * 100) / 100,
    swap:       Math.round(s * 100) / 100,
    pips:       Math.round(pips * 10) / 10,
    net:        Math.round((p + c + s) * 100) / 100,
    win:        p > 0,
    notes:      comment || '',
  };
}

function normaliseDate(str) {
  return str.replace(/\./g, '-').replace(' ', 'T');
}

/* ── Column mapper (shared by HTML + XLSX parsers) ──────── */
function makeColMapper(headers) {
  const h = headers.map(s => String(s || '').trim().toLowerCase());

  const find = (...patterns) => {
    for (const p of patterns) {
      const i = h.findIndex(c => c === p || c.includes(p));
      if (i !== -1) return i;
    }
    return -1;
  };

  // MT5 uses "Price" for BOTH open price and close price columns — handle by position
  const priceIndices = h.reduce((a, c, i) => { if (c === 'price') a.push(i); return a; }, []);
  const openPriceCol  = priceIndices.length >= 2 ? priceIndices[0]
                      : find('open price', 'price open', 'price (open)');
  const closePriceCol = priceIndices.length >= 2 ? priceIndices[priceIndices.length - 1]
                      : find('close price', 'price close', 'price (close)', 'price');

  // MT5 "Deals" view uses "Time" twice (open and close) — handle by position
  const timeIndices = h.reduce((a, c, i) => { if (c === 'time') a.push(i); return a; }, []);
  const openTimeCol  = timeIndices.length >= 2 ? timeIndices[0]  : find('open time', 'time open');
  const closeTimeCol = timeIndices.length >= 2 ? timeIndices[timeIndices.length - 1] : find('close time', 'time close', 'time');

  return {
    ticket:     find('position', 'ticket', '#', 'deal', 'order'),
    openTime:   openTimeCol,
    closeTime:  closeTimeCol,
    symbol:     find('symbol', 'item'),
    type:       find('type', 'direction'),
    lots:       find('volume', 'lots', 'size', 'quantity'),
    openPrice:  openPriceCol,
    closePrice: closePriceCol,
    profit:     find('profit'),
    commission: find('commission'),
    swap:       find('swap'),
    comment:    find('comment'),
  };
}

function rowToTrade(row, map) {
  const g = (k) => map[k] >= 0 ? String(row[map[k]] ?? '').trim() : '';
  return buildTrade({
    ticket: g('ticket'), openTime: g('openTime'), closeTime: g('closeTime'),
    symbol: g('symbol'), type: g('type'), lots: g('lots'),
    openPrice: g('openPrice'), closePrice: g('closePrice'),
    profit: g('profit'), commission: g('commission'), swap: g('swap'), comment: g('comment'),
  });
}

/* ── UTF-16 aware file reader ────────────────────────────── */
async function readFileText(file) {
  const buf   = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Detect UTF-16 BOM: FF FE (LE) or FE FF (BE)
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return new TextDecoder('utf-16le').decode(buf);
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return new TextDecoder('utf-16be').decode(buf);
  return new TextDecoder('utf-8').decode(buf);
}

/* ── MT5 HTML parser ─────────────────────────────────────── */
function parseMT5HTML(text) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(text, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));
  const trades = [];

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) continue;

    // Find header row
    let headerIdx = -1;
    for (let i = 0; i < Math.min(8, rows.length); i++) {
      const cells = Array.from(rows[i].querySelectorAll('td,th')).map(c => c.textContent.trim().toLowerCase());
      const hasId     = cells.some(c => c === 'position' || c === 'ticket' || c === '#' || c === 'deal');
      const hasSymbol = cells.some(c => c === 'symbol');
      const hasProfit = cells.some(c => c === 'profit');
      if ((hasId || hasSymbol) && hasProfit) { headerIdx = i; break; }
    }
    if (headerIdx === -1) continue;

    // Build map from header — strip hidden cells from header too
    const headerCells = Array.from(rows[headerIdx].querySelectorAll('td,th'))
      .filter(c => !c.className.includes('hidden'))
      .map(c => c.textContent.trim().toLowerCase());
    const map = makeColMapper(headerCells);

    for (let i = headerIdx + 1; i < rows.length; i++) {
      // Strip hidden cells — MT5 embeds <td class="hidden" colspan="8"> in each data row
      const cells = Array.from(rows[i].querySelectorAll('td,th'))
        .filter(c => !c.className.includes('hidden'))
        .map(c => c.textContent.trim());
      if (cells.length < 8) continue;
      const t = rowToTrade(cells, map);
      if (t) trades.push(t);
    }
    if (trades.length > 0) break;
  }
  return trades;
}


/* ── Helpers ─────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function fmtPnL(n) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}
function clr(n) { return n >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)'; }

/* ── Count-up animation ──────────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    if (target === 0) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = p * (2 - p); // ease-out quad
      setValue(target * ease);
      if (p < 1) { raf = requestAnimationFrame(tick); }
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function AnimatedPnL({ value, duration = 800 }) {
  const v = useCountUp(value, duration);
  return <>{v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(2)}</>;
}
function AnimatedPct({ value, duration = 800 }) {
  const v = useCountUp(value, duration);
  return <>{v.toFixed(1)}%</>;
}
function AnimatedInt({ value, duration = 800 }) {
  const v = useCountUp(value, duration);
  return <>{Math.round(Math.abs(v))}</>;
}
function AnimatedDecimal({ value, decimals = 2, duration = 800 }) {
  const v = useCountUp(value, duration);
  return <>{v.toFixed(decimals)}</>;
}

function getDayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildCalendarData(trades) {
  const map = {};
  for (const t of trades) {
    const k = getDayKey(t.closeTime);
    if (!map[k]) map[k] = { pnl: 0, trades: 0, wins: 0 };
    map[k].pnl    += t.net;
    map[k].trades += 1;
    if (t.win) map[k].wins += 1;
  }
  return map;
}

/* ── Icons ───────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round"/>
    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
  </svg>
);
const TrashIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size }}>
    <polyline points="3 6 5 6 21 6" strokeLinecap="round"/>
    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round"/>
    <path d="M10 11v6M14 11v6" strokeLinecap="round"/>
  </svg>
);
const ChevronIcon = ({ dir = 'left' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    {dir === 'left'
      ? <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/>
      : <polyline points="9 18 15 12 9 6"  strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

/* ── Manual trade form ───────────────────────────────────── */
const EMPTY_FORM = { symbol: 'XAUUSD', type: 'buy', lots: '', openPrice: '', closePrice: '', openTime: '', closeTime: '', profit: '', notes: '' };

function ManualForm({ onAdd, onClose, lang }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.symbol || !form.lots || !form.closeTime) return;
    setSaving(true);
    const pipSize = form.symbol.toUpperCase().includes('XAU') || form.symbol.toUpperCase().includes('GOLD') ? 0.1 : 0.0001;
    const diff    = parseFloat(form.closePrice) - parseFloat(form.openPrice);
    const pips    = form.type === 'sell' ? -(diff / pipSize) : (diff / pipSize);
    const profit  = parseFloat(form.profit) || 0;

    const trade = {
      ticket:     `M-${Date.now()}`,
      symbol:     form.symbol.toUpperCase(),
      type:       form.type,
      lots:       parseFloat(form.lots) || 0,
      openPrice:  parseFloat(form.openPrice)  || 0,
      closePrice: parseFloat(form.closePrice) || 0,
      openTime:   form.openTime  ? new Date(form.openTime).toISOString()  : new Date(form.closeTime).toISOString(),
      closeTime:  new Date(form.closeTime).toISOString(),
      profit,
      commission: 0,
      swap:       0,
      pips:       Math.round(pips * 10) / 10,
      net:        profit,
      win:        profit > 0,
      notes:      form.notes,
    };

    const r = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trades: [trade] }),
    });
    const d = await r.json();
    setSaving(false);
    if (d.ok) { onAdd(); onClose(); }
  };

  const inp = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7,
    padding: '8px 11px', fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 14,
        width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{lang === 'zh' ? '手动添加交易' : 'Add Trade Manually'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>SYMBOL</label>
              <input style={inp} value={form.symbol} onChange={e => set('symbol', e.target.value)} placeholder="XAUUSD" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>DIRECTION</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['buy','sell'].map(t => (
                  <button key={t} onClick={() => set('type', t)} style={{
                    flex: 1, padding: '8px', borderRadius: 7, border: '1px solid',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    borderColor: form.type === t ? (t === 'buy' ? 'var(--clr-win)' : 'var(--clr-loss)') : 'var(--border)',
                    background:  form.type === t ? (t === 'buy' ? 'var(--win-bg)' : 'var(--loss-bg)') : 'transparent',
                    color:       form.type === t ? (t === 'buy' ? 'var(--clr-win)' : 'var(--clr-loss)') : 'var(--text-dim)',
                  }}>{t.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>LOTS</label>
              <input style={inp} type="number" step="0.01" value={form.lots} onChange={e => set('lots', e.target.value)} placeholder="0.01" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>OPEN PRICE</label>
              <input style={inp} type="number" step="0.01" value={form.openPrice} onChange={e => set('openPrice', e.target.value)} placeholder="2020.00" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>CLOSE PRICE</label>
              <input style={inp} type="number" step="0.01" value={form.closePrice} onChange={e => set('closePrice', e.target.value)} placeholder="2030.00" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>CLOSE DATE & TIME</label>
              <input style={inp} type="datetime-local" value={form.closeTime} onChange={e => set('closeTime', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>PROFIT ($)</label>
              <input style={inp} type="number" step="0.01" value={form.profit} onChange={e => set('profit', e.target.value)} placeholder="12.50" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 5 }}>NOTES (optional)</label>
            <input style={inp} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. Breakout trade, news spike..." />
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer' }}>
            {lang === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button onClick={submit} disabled={saving} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#C9A84C,#9B7B2F)', color: '#0A0A0A',
            fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
          }}>
            {saving ? '...' : (lang === 'zh' ? '添加' : 'Add Trade')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stats bar ───────────────────────────────────────────── */
function StatsBar({ trades, lang }) {
  if (!trades.length) return null;
  const totalNet  = trades.reduce((s, t) => s + t.net, 0);
  const wins      = trades.filter(t => t.win).length;
  const winRateNum = (wins / trades.length) * 100;
  const dayMap    = buildCalendarData(trades);
  const dayPnls   = Object.values(dayMap).map(d => d.pnl);
  const bestDay   = Math.max(...dayPnls);
  const worstDay  = Math.min(...dayPnls);

  const stats = [
    { label: lang === 'zh' ? '总盈亏' : 'Total P&L',   node: <AnimatedPnL value={totalNet} />,            color: clr(totalNet) },
    { label: lang === 'zh' ? '胜率'   : 'Win Rate',     node: <AnimatedPct value={winRateNum} />,           color: winRateNum >= 50 ? 'var(--clr-win)' : 'var(--clr-loss)' },
    { label: lang === 'zh' ? '交易数' : 'Total Trades', node: <AnimatedInt value={trades.length} />,        color: 'var(--text)' },
    { label: lang === 'zh' ? '最佳日' : 'Best Day',     node: <AnimatedPnL value={bestDay} />,              color: 'var(--clr-win)' },
    { label: lang === 'zh' ? '最差日' : 'Worst Day',    node: <AnimatedPnL value={worstDay} />,             color: 'var(--clr-loss)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10, marginBottom: 20 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>{s.label}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.node}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Calendar ────────────────────────────────────────────── */
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLS   = 'repeat(7,1fr) 80px';

function Calendar({ trades, lang }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);
  const [zoom,     setZoom]     = useState('month'); // 'month' | 'year'

  const monthTrades = trades.filter(t => {
    const d = new Date(t.closeTime);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const dayMap = buildCalendarData(monthTrades);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build week rows
  const weeks = [];
  let week = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  while (week.length > 0 && week.length < 7) week.push(null);
  if (week.length) weeks.push(week);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelected(null); };

  const selectedKey    = selected ? `${year}-${String(month+1).padStart(2,'0')}-${String(selected).padStart(2,'0')}` : null;
  const selectedData   = selectedKey ? dayMap[selectedKey] : null;
  const selectedTrades = selectedKey ? trades.filter(t => getDayKey(t.closeTime) === selectedKey) : [];

  const monthPnl    = Object.values(dayMap).reduce((s, d) => s + d.pnl, 0);
  const monthWins   = Object.values(dayMap).filter(d => d.pnl > 0).length;
  const monthDays   = Object.values(dayMap).length;
  const winDayRate  = monthDays > 0 ? ((monthWins / monthDays) * 100).toFixed(0) : 0;

  const dayKey = (d) => d ? `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : null;

  /* ── Year overview mode ── */
  if (zoom === 'year') {
    const yearTrades = trades.filter(t => new Date(t.closeTime).getFullYear() === year);
    const monthStats = Array.from({ length: 12 }, (_, m) => {
      const mt = yearTrades.filter(t => new Date(t.closeTime).getMonth() === m);
      const pnl = mt.reduce((s, t) => s + t.net, 0);
      return { pnl, count: mt.length, wins: mt.filter(t => t.net > 0).length };
    });
    const yearPnl = monthStats.reduce((s, m) => s + m.pnl, 0);
    const activeMths = monthStats.filter(m => m.count > 0).length;

    return (
      <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setYear(y => y - 1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: '6px 8px' }}>
            <ChevronIcon dir="left" />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.5 }}>{year} Overview</div>
            {activeMths > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                <span style={{ color: clr(yearPnl), fontWeight: 700 }}><AnimatedPnL value={yearPnl} /></span>
                <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                <span>{activeMths} active months</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setZoom('month')} style={{ background: 'var(--gold-alpha)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 8, cursor: 'pointer', color: 'var(--gold)', padding: '5px 10px', fontSize: 11, fontWeight: 700 }}>
              Month ↗
            </button>
            <button onClick={() => setYear(y => y + 1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: '6px 8px' }}>
              <ChevronIcon dir="right" />
            </button>
          </div>
        </div>
        {/* 12-month grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10, padding: 16 }}>
          {MONTHS_SHORT.map((mName, m) => {
            const s = monthStats[m];
            const isCur = year === now.getFullYear() && m === now.getMonth();
            return (
              <div key={m} onClick={() => { if (s.count > 0) { setMonth(m); setZoom('month'); setSelected(null); } }}
                style={{
                  background: s.count > 0 ? (s.pnl >= 0 ? 'var(--win-cell-bg)' : 'var(--loss-cell-bg)') : 'rgba(255,255,255,0.02)',
                  border: isCur ? '1px solid var(--gold)' : '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 12px',
                  cursor: s.count > 0 ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}>
                {s.count > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.pnl >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)', opacity: 0.6 }} />}
                <div style={{ fontSize: 11, fontWeight: 700, color: isCur ? 'var(--gold)' : 'var(--text)', marginBottom: 8 }}>{mName}</div>
                {s.count > 0 ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 800, color: clr(s.pnl), marginBottom: 4 }}><AnimatedPnL value={s.pnl} duration={600} /></div>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{s.count} trades · {((s.wins/s.count)*100).toFixed(0)}% W</div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', opacity: 0.4 }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

      {/* ── Header nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))', borderBottom: '1px solid var(--border)' }}>
        <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: '6px 8px', transition: 'all 0.15s' }}>
          <ChevronIcon dir="left" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.5 }}>{MONTHS[month]} {year}</div>
          {monthDays > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
              <span style={{ color: clr(monthPnl), fontWeight: 700 }}><AnimatedPnL value={monthPnl} /></span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
              <span>{winDayRate}% {lang === 'zh' ? '盈利日' : 'green days'}</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
              <span>{monthTrades.length} {lang === 'zh' ? '笔' : 'trades'}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setZoom('year')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-dim)', padding: '5px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {year} ↙
          </button>
          <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: '6px 8px', transition: 'all 0.15s' }}>
            <ChevronIcon dir="right" />
          </button>
        </div>
      </div>

      {/* ── Column headers + grid (horizontally scrollable on mobile) ── */}
      <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 480 }}>
      {/* ── Column headers ── */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, borderBottom: '1px solid var(--border)', background: 'var(--bg-table-hd)' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: (i === 0 || i === 6) ? 'rgba(201,168,76,0.5)' : 'var(--text-dim)', letterSpacing: 1.2 }}>{d}</div>
        ))}
        <div style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.2, borderLeft: '1px solid var(--border)' }}>WEEK</div>
      </div>

      {/* ── Week rows ── */}
      {weeks.map((wk, wi) => {
        const weekPnl = wk.reduce((sum, d) => sum + (d && dayMap[dayKey(d)] ? dayMap[dayKey(d)].pnl : 0), 0);
        const hasData = wk.some(d => d && dayMap[dayKey(d)]);

        return (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: COLS, borderBottom: wi < weeks.length - 1 ? '1px solid var(--border)' : 'none' }}>
            {wk.map((day, di) => {
              const k       = dayKey(day);
              const data    = k ? dayMap[k] : null;
              const isSel   = selected === day;
              const isToday = day && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
              const isHov   = hovered === day && data;
              const isWeekend = di === 0 || di === 6;

              return (
                <div
                  key={di}
                  onClick={() => day && data && setSelected(isSel ? null : day)}
                  onMouseEnter={() => day && data && setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    minHeight: 100, padding: '8px 8px',
                    borderRight: di < 6 ? '1px solid var(--border)' : 'none',
                    cursor: data ? 'pointer' : 'default',
                    background: isSel
                      ? 'rgba(201,168,76,0.12)'
                      : isHov
                        ? (data.pnl >= 0 ? 'var(--win-bg)' : 'var(--loss-bg)')
                        : data
                          ? (data.pnl >= 0 ? 'var(--win-cell-bg)' : 'var(--loss-cell-bg)')
                          : isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* Today ring */}
                  {isToday && (
                    <div style={{ position: 'absolute', inset: 3, borderRadius: 8, border: '1.5px solid var(--gold)', opacity: 0.6, pointerEvents: 'none' }} />
                  )}
                  {/* Selected indicator */}
                  {isSel && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold)', borderRadius: '0 0 2px 2px' }} />
                  )}
                  {day && (
                    <>
                      <div style={{
                        fontSize: 12, fontWeight: isToday ? 800 : 500,
                        color: isToday ? 'var(--gold)' : isWeekend ? 'var(--text-dim)' : 'var(--text-muted)',
                        marginBottom: 6, lineHeight: 1,
                      }}>{day}</div>
                      {data && (
                        <>
                          <div style={{ fontSize: 18, fontWeight: 900, color: clr(data.pnl), letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 6 }}>
                            {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, letterSpacing: 0.2 }}>
                            {data.trades} {lang === 'zh' ? '笔' : 'trades'}{' · '}{data.wins}/{data.trades}W
                          </div>
                          {/* Bottom accent bar */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: data.pnl >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)', opacity: 0.4 }} />
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* ── Weekly total cell ── */}
            <div style={{
              minHeight: 92, borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: hasData
                ? (weekPnl >= 0 ? 'var(--win-cell-bg)' : 'var(--loss-cell-bg)')
                : 'rgba(255,255,255,0.01)',
              padding: '6px 8px',
            }}>
              {hasData ? (
                <>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.2, textTransform: 'uppercase' }}>W{wi + 1}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 800, color: clr(weekPnl),
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {weekPnl >= 0 ? '+' : ''}{weekPnl.toFixed(2)}
                  </div>
                  <div style={{ width: 28, height: 2, borderRadius: 1, background: weekPnl >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)', opacity: 0.6 }} />
                </>
              ) : null}
            </div>
          </div>
        );
      })}
      </div>{/* end minWidth wrapper */}
      </div>{/* end overflowX scroll */}

      {/* ── Selected day detail ── */}
      {selectedData && (() => {
        const dayWins   = selectedTrades.filter(t => t.net > 0);
        const dayLosses = selectedTrades.filter(t => t.net <= 0);
        const dayGross  = dayWins.reduce((s, t) => s + t.net, 0);
        const dayLoss   = Math.abs(dayLosses.reduce((s, t) => s + t.net, 0));
        return (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            {/* Day header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg,rgba(201,168,76,0.07),transparent)' }}>
              <div style={{ marginRight: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{MONTHS[month]} {selected}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 10 }}>{selectedTrades.length} {lang === 'zh' ? '笔' : 'trades'}</span>
              </div>
              {/* win/loss pills */}
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--win-bg)', color: 'var(--clr-win)' }}>
                  {dayWins.length}W
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--loss-bg)', color: 'var(--clr-loss)' }}>
                  {dayLosses.length}L
                </span>
              </div>
              {/* win bar */}
              <div style={{ flex: 1, margin: '0 16px', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${selectedTrades.length > 0 ? (dayWins.length / selectedTrades.length) * 100 : 0}%`, background: 'linear-gradient(90deg,var(--clr-win),var(--win-bg))', borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: clr(selectedData.pnl) }}>{fmtPnL(selectedData.pnl)}</div>
            </div>

            {/* Trade rows */}
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {/* Column header */}
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 50px 90px 90px 80px 70px 90px', gap: 0, padding: '6px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-table-hd)' }}>
                {['', 'Symbol', 'Lots', 'Open', 'Close', 'Time', 'Pips', 'P&L'].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.8, textAlign: i >= 5 ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              {selectedTrades.map((t, idx) => (
                <div key={t.ticket} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 50px 90px 90px 80px 70px 90px',
                  alignItems: 'center', gap: 0,
                  padding: '9px 20px',
                  borderBottom: idx < selectedTrades.length - 1 ? '1px solid var(--border)' : 'none',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  borderLeft: `3px solid ${t.type === 'buy' ? 'var(--clr-win)' : 'var(--clr-loss)'}`,
                  transition: 'background 0.1s',
                }}>
                  {/* Type badge */}
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4,
                    background: t.type === 'buy' ? 'var(--win-bg)' : 'var(--loss-bg)',
                    color: t.type === 'buy' ? 'var(--clr-win)' : 'var(--clr-loss)',
                    letterSpacing: 0.3, textAlign: 'center',
                  }}>{t.type === 'buy' ? 'BUY' : 'SELL'}</span>
                  {/* Symbol */}
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', paddingLeft: 4 }}>{t.symbol.replace('.ECN','').replace('.ecn','')}</span>
                  {/* Lots */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{t.lots}</span>
                  {/* Open price */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{t.openPrice}</span>
                  {/* Close price */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{t.closePrice}</span>
                  {/* Time */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{fmtTime(t.closeTime)}</span>
                  {/* Pips */}
                  <span style={{ fontSize: 11, fontWeight: 600, color: clr(t.pips), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {t.pips > 0 ? '+' : ''}{t.pips}
                  </span>
                  {/* P&L */}
                  <span style={{ fontSize: 13, fontWeight: 800, color: clr(t.net), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtPnL(t.net)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-table-hd)' }}>
              {dayGross > 0 && <span style={{ fontSize: 11, color: 'var(--clr-win)' }}>Gross +${dayGross.toFixed(2)}</span>}
              {dayLoss > 0  && <span style={{ fontSize: 11, color: 'var(--clr-loss)' }}>Loss -${dayLoss.toFixed(2)}</span>}
              <span style={{ fontSize: 11, fontWeight: 800, color: clr(selectedData.pnl) }}>Net {fmtPnL(selectedData.pnl)}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ── Trade log ───────────────────────────────────────────── */
function TradeLog({ trades, onDelete, onRefresh, lang }) {
  const [filter, setFilter] = useState('all');
  const symbols = [...new Set(trades.map(t => t.symbol))];
  const filtered = filter === 'all' ? trades : trades.filter(t => t.symbol === filter || t.type === filter);
  const sorted   = [...filtered].sort((a, b) => new Date(b.closeTime) - new Date(a.closeTime));

  const TH = ({ children, right }) => (
    <th style={{ padding: '11px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--bg-table-hd)', textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap', userSelect: 'none' }}>
      {children}
    </th>
  );

  return (
    <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      {/* Toolbar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-table-hd)' }}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1, marginRight: 4 }}>FILTER</span>
        {['all', 'buy', 'sell', ...symbols].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            borderColor: filter === f ? 'var(--gold)' : 'var(--border)',
            background:  filter === f ? 'var(--gold-alpha)' : 'transparent',
            color:       filter === f ? 'var(--gold)' : 'var(--text-dim)',
          }}>{f === 'all' ? (lang === 'zh' ? '全部' : 'All') : f === 'buy' ? 'Long' : f === 'sell' ? 'Short' : f.replace('.ECN','')}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
          {sorted.length} {lang === 'zh' ? '笔交易' : 'trades'}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <TH>Status</TH>
              <TH>Symbol</TH>
              <TH>Entry Date</TH>
              <TH>Entry Time</TH>
              <TH>Side</TH>
              <TH right>Entry Price</TH>
              <TH right>Exit Price</TH>
              <TH>Exit Date</TH>
              <TH>Exit Time</TH>
              <TH right>Size</TH>
              <TH right>Fees</TH>
              <TH right>Pips</TH>
              <TH right>P&L</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={14} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                {lang === 'zh' ? '暂无交易记录' : 'No trades yet'}
              </td></tr>
            ) : sorted.map((t, idx) => (
              <tr key={t.ticket} style={{ borderBottom: '1px solid var(--border-row)', background: idx % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent', transition: 'background 0.1s' }}>
                {/* Status */}
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', letterSpacing: 0.5 }}>Closed</span>
                </td>
                {/* Symbol */}
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  {t.symbol.replace('.ECN','').replace('.ecn','')}
                </td>
                {/* Entry Date */}
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(t.openTime || t.closeTime)}</td>
                {/* Entry Time */}
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(t.openTime || t.closeTime)}</td>
                {/* Side */}
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: t.type === 'buy' ? 'var(--win-bg)' : 'var(--loss-bg)', color: t.type === 'buy' ? 'var(--clr-win)' : 'var(--clr-loss)' }}>
                    {t.type === 'buy' ? 'Long' : 'Short'}
                  </span>
                </td>
                {/* Entry Price */}
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', textAlign: 'right' }}>{t.openPrice}</td>
                {/* Exit Price */}
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', textAlign: 'right' }}>{t.closePrice}</td>
                {/* Exit Date */}
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(t.closeTime)}</td>
                {/* Exit Time */}
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(t.closeTime)}</td>
                {/* Size */}
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{t.lots}</td>
                {/* Fees */}
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-dim)', textAlign: 'right' }}>
                  {t.commission !== 0 ? <span style={{ color: 'var(--clr-loss)' }}>${Math.abs(t.commission).toFixed(2)}</span> : '—'}
                </td>
                {/* Pips */}
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: clr(t.pips), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {t.pips > 0 ? '+' : ''}{t.pips}
                </td>
                {/* P&L */}
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: clr(t.net), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtPnL(t.net)}
                </td>
                {/* Delete */}
                <td style={{ padding: '10px 10px' }}>
                  <button onClick={() => onDelete(t.ticket)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-dim)', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-loss)'; e.currentTarget.style.color = 'var(--clr-loss)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Performance helpers ─────────────────────────────────── */
function fmtDur(ms) {
  if (!ms || ms <= 0) return '—';
  const m = Math.floor(ms / 60000);
  if (m < 1) return '<1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

// Zero-centred horizontal P&L bar
function PnLBar({ label, value, maxAbs }) {
  const pct = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 46 : 0;
  const isPos = value >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{ width: 90, fontSize: 10, color: 'var(--text-dim)', textAlign: 'left', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ flex: 1, position: 'relative', height: 14 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', borderRadius: 3 }} />
        {value !== 0 && (
          <div style={{
            position: 'absolute', top: 2, bottom: 2,
            left: isPos ? '50%' : `${50 - pct}%`,
            width: `${pct}%`,
            background: isPos ? 'var(--clr-win)' : 'var(--clr-loss)',
            borderRadius: isPos ? '0 3px 3px 0' : '3px 0 0 3px',
            transition: 'width 0.4s ease',
          }} />
        )}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
      </div>
      <div style={{ width: 70, fontSize: 10, fontWeight: 700, color: clr(value), textAlign: 'right', flexShrink: 0 }}>{fmtPnL(value)}</div>
    </div>
  );
}

// Left-to-right count bar (gold)
function CountBar({ label, value, maxVal }) {
  const pct = maxVal > 0 ? (value / maxVal) * 92 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{ width: 90, fontSize: 10, color: 'var(--text-dim)', textAlign: 'left', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, position: 'relative', height: 14 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 2, bottom: 2, left: 0, width: `${pct}%`, background: 'rgba(201,168,76,0.5)', borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ width: 24, fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textAlign: 'right', flexShrink: 0 }}>{value}</div>
    </div>
  );
}

/* ── Performance view ────────────────────────────────────── */
/* ── Equity Curve ────────────────────────────────────────── */
function EquityCurve({ trades }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  const sorted = [...trades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));
  let cum = 0;
  const pts = [{ date: null, cum: 0, net: 0 }];
  sorted.forEach(t => { cum += t.net; pts.push({ date: t.closeTime, cum, net: t.net, symbol: t.symbol }); });

  const W = 1000, H = 300;
  const pad = { t: 14, r: 24, b: 30, l: 60 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const vals  = pts.map(p => p.cum);
  const yPad  = (Math.max(...vals) - Math.min(...vals)) * 0.1 || 20;
  const yMax  = Math.max(...vals) + yPad;
  const yMin  = Math.min(...vals, 0) - yPad;
  const yRange = yMax - yMin;

  const sx = i  => pad.l + (i / Math.max(pts.length - 1, 1)) * cW;
  const sy = v  => pad.t + cH - ((v - yMin) / yRange) * cH;
  const zero    = sy(0);

  const isPos    = pts[pts.length - 1].cum >= 0;
  const lineClr  = isPos ? 'var(--clr-win)' : 'var(--clr-loss)';
  const fillClr  = isPos ? 'var(--clr-win)' : 'var(--clr-loss)';

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(1)} ${sy(p.cum).toFixed(1)}`).join(' ');
  const zeroClamp = Math.min(Math.max(zero, pad.t), pad.t + cH);
  const areaPath = `${linePath} L ${sx(pts.length - 1).toFixed(1)} ${zeroClamp.toFixed(1)} L ${sx(0).toFixed(1)} ${zeroClamp.toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yRange / 4) * i);

  // X-axis month labels — deduplicate by month
  const xLabels = [];
  let lastKey = null;
  pts.forEach((p, i) => {
    if (!p.date) return;
    const d   = new Date(p.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key !== lastKey) {
      xLabels.push({ x: sx(i), label: MONTHS_SHORT[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ` '${String(d.getFullYear()).slice(2)}` : '') });
      lastKey = key;
    }
  });
  // Thin out labels if too many
  const step   = Math.ceil(xLabels.length / 12);
  const labels = xLabels.filter((_, i) => i % step === 0);

  const onMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * W;
    const i    = Math.max(0, Math.min(pts.length - 1, Math.round((mx - pad.l) / cW * (pts.length - 1))));
    setHover({ i, x: sx(i), y: sy(pts[i].cum), pt: pts[i] });
  };

  const ttX = hover ? (hover.x > W * 0.72 ? hover.x - 148 : hover.x + 14) : 0;
  const ttY = hover ? Math.max(pad.t, Math.min(hover.y - 24, pad.t + cH - 52)) : 0;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', minHeight: 220, display: 'block', overflow: 'visible', cursor: 'crosshair' }}
      onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPos ? '#3ECF8E' : '#E05252'} stopOpacity="0.22" />
          <stop offset="100%" stopColor={isPos ? '#3ECF8E' : '#E05252'} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <line key={i} x1={pad.l} y1={sy(v)} x2={pad.l + cW} y2={sy(v)} stroke="var(--border)" strokeWidth="0.8" />
      ))}

      {/* Zero baseline */}
      {zero >= pad.t && zero <= pad.t + cH && (
        <line x1={pad.l} y1={zero} x2={pad.l + cW} y2={zero} stroke="var(--border)" strokeWidth="1.2" strokeDasharray="5 4" />
      )}

      {/* Area fill */}
      <path d={areaPath} fill="url(#eq-fill)" />

      {/* Equity line */}
      <path d={linePath} fill="none" stroke={lineClr} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Y-axis labels */}
      {yTicks.map((v, i) => (
        <text key={i} x={pad.l - 8} y={sy(v) + 4} fontSize="9" textAnchor="end" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>
          {v >= 0 ? '+' : ''}${Math.round(v)}
        </text>
      ))}

      {/* X-axis labels */}
      {labels.map((m, i) => (
        <text key={i} x={m.x} y={pad.t + cH + 20} fontSize="9" textAnchor="middle" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>
          {m.label}
        </text>
      ))}

      {/* Hover crosshair + dot */}
      {hover && (
        <>
          <line x1={hover.x} y1={pad.t} x2={hover.x} y2={pad.t + cH} stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <circle cx={hover.x} cy={hover.y} r="4.5" fill={isPos ? '#3ECF8E' : '#E05252'} stroke="var(--bg-table)" strokeWidth="2" />
          {/* Tooltip box */}
          <rect x={ttX} y={ttY} width="136" height="48" rx="7" fill="var(--bg-table)" stroke="var(--gold)" strokeWidth="0.8" opacity="0.95" />
          <text x={ttX + 10} y={ttY + 16} fontSize="9" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>
            {hover.pt.date ? fmtDate(hover.pt.date) : 'Start'}{hover.pt.symbol ? ` · ${hover.pt.symbol.replace('.ECN','')}` : ''}
          </text>
          <text x={ttX + 10} y={ttY + 35} fontSize="14" fontWeight="800" style={{ fill: hover.pt.cum >= 0 ? '#3ECF8E' : '#E05252', fontFamily: 'system-ui' }}>
            {hover.pt.cum >= 0 ? '+' : ''}${hover.pt.cum.toFixed(2)}
          </text>
          {hover.pt.net !== 0 && (
            <text x={ttX + 126} y={ttY + 35} fontSize="10" fontWeight="600" textAnchor="end" style={{ fill: hover.pt.net >= 0 ? '#3ECF8E' : '#E05252', fontFamily: 'system-ui' }}>
              {hover.pt.net >= 0 ? '+' : ''}${hover.pt.net.toFixed(2)}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

/* ── Mini bar chart (sidebar) ────────────────────────────── */
function MiniBarChart({ data, color = 'var(--gold)', colorByValue = false, fillHeight = false }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: '12px 0' }}>No data</div>;

  const W = 400, H = 240;
  const pad = { t: 28, r: 12, b: 40, l: 72 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const vals = data.map(d => d.value);
  const maxVal = Math.max(...vals.map(Math.abs), 1);
  const hasNeg = vals.some(v => v < 0);
  // zero baseline y
  const zeroY = hasNeg
    ? pad.t + cH * (maxVal / (maxVal + Math.max(...vals.map(v => Math.abs(v < 0 ? v : 0)), 0.001)))
    : pad.t + cH;

  const barW = Math.max(2, cW / data.length - 2);
  const gap  = cW / data.length;

  // Y-axis ticks (4)
  const tickMax = hasNeg ? maxVal : maxVal;
  const tickMin = hasNeg ? -maxVal : 0;
  const yTicks  = Array.from({ length: 5 }, (_, i) => tickMin + ((tickMax - tickMin) / 4) * i);
  const yScale  = (v) => pad.t + cH - ((v - tickMin) / (tickMax - tickMin)) * cH;

  // Short label (e.g. "Apr" from "Apr 2026", or "04-12" from "2026-04-12")
  const shortLabel = (str) => {
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const d = new Date(str);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return str.split(' ')[0];
  };

  // Thin x labels if too many
  const step = Math.ceil(data.length / 6);

  const svgStyle = fillHeight
    ? { width: '100%', height: '100%', display: 'block', overflow: 'visible' }
    : { width: '100%', height: 'auto', minHeight: 160, display: 'block', overflow: 'visible' };

  return (
    <div style={fillHeight ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } : { position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={svgStyle}
        onMouseLeave={() => setHover(null)}>

        {/* Grid lines + Y labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yScale(v)} x2={pad.l + cW} y2={yScale(v)} stroke="var(--border)" strokeWidth="0.6" />
            <text x={pad.l - 6} y={yScale(v) + 4} fontSize="13" textAnchor="end" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>
              {v >= 0 ? '+' : ''}${Math.round(v)}
            </text>
          </g>
        ))}

        {/* Zero baseline */}
        {hasNeg && (
          <line x1={pad.l} y1={yScale(0)} x2={pad.l + cW} y2={yScale(0)} stroke="var(--border)" strokeWidth="1.2" strokeDasharray="4 3" />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x   = pad.l + i * gap + gap / 2 - barW / 2;
          const top = yScale(Math.max(d.value, 0));
          const bot = yScale(Math.min(d.value, 0));
          const h   = Math.max(1, bot - top);
          const barColor = colorByValue
            ? (d.value >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)')
            : color;
          const isHov = hover === i;
          return (
            <rect key={i} x={x} y={top} width={barW} height={h} rx="2"
              fill={barColor} opacity={isHov ? 1 : 0.7}
              onMouseEnter={() => setHover(i)}
              style={{ cursor: 'crosshair', transition: 'opacity 0.1s' }}
            />
          );
        })}

        {/* X labels */}
        {data.map((d, i) => i % step === 0 && (
          <text key={i} x={pad.l + i * gap + gap / 2} y={H - 6} fontSize="12" textAnchor="middle" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>
            {shortLabel(d.label)}
          </text>
        ))}

        {/* Hover tooltip */}
        {hover !== null && (() => {
          const d  = data[hover];
          const bx = pad.l + hover * gap + gap / 2;
          const by = yScale(Math.max(d.value, 0)) - 4;
          const tx = bx > W * 0.7 ? bx - 96 : bx + 6;
          const ty = Math.max(pad.t + 2, by - 36);
          return (
            <>
              <line x1={bx} y1={pad.t} x2={bx} y2={pad.t + cH} stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
              <rect x={tx} y={ty} width="90" height="30" rx="5" fill="var(--bg-table)" stroke="var(--gold)" strokeWidth="0.7" opacity="0.95" />
              <text x={tx + 7} y={ty + 12} fontSize="11" style={{ fill: 'var(--text-dim)', fontFamily: 'system-ui' }}>{shortLabel(d.label)}</text>
              <text x={tx + 7} y={ty + 24} fontSize="13" fontWeight="700" style={{ fill: d.value >= 0 ? 'var(--clr-win)' : 'var(--clr-loss)', fontFamily: 'system-ui' }}>
                {d.value >= 0 ? '+' : ''}${Math.abs(d.value).toFixed(2)}
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}

/* ── Overview view ───────────────────────────────────────── */
function OverviewView({ trades, lang }) {
  const [curveFilter, setCurveFilter] = useState('all');

  if (!trades.length) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-dim)', fontSize: 13 }}>
        {lang === 'zh' ? '暂无交易数据' : 'No trade data yet. Import your MT5 history to see an overview.'}
      </div>
    );
  }

  const sorted = [...trades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));

  const curveMonths = [...new Map(sorted.map(t => {
    const d = new Date(t.closeTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return [key, { key, label: `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` }];
  })).values()];
  const curveTrades = curveFilter === 'all' ? trades
    : trades.filter(t => { const d = new Date(t.closeTime); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === curveFilter; });
  const curvePnl = curveTrades.reduce((s, t) => s + t.net, 0);

  const monthlyMap = {};
  for (const t of trades) {
    const d = new Date(t.closeTime);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!monthlyMap[key]) monthlyMap[key] = { pnl: 0, count: 0, label: `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` };
    monthlyMap[key].pnl   += t.net;
    monthlyMap[key].count += 1;
  }
  const monthlyData = Object.entries(monthlyMap).sort(([a],[b]) => a.localeCompare(b)).map(([,v]) => v);
  const maxMonthAbs = Math.max(...monthlyData.map(m => Math.abs(m.pnl)), 1);

  const sectionTitle = (txt, color = 'var(--gold)') => (
    <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{txt}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Equity Curve + Monthly sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'stretch' }}>

        {/* Equity Curve — flex column so SVG fills all remaining card height */}
        <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px 10px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' }}>
          {/* Row 1: title + P&L */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{lang === 'zh' ? '净值曲线' : 'Equity Curve'}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 8 }}>{curveTrades.length} trades</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: clr(curvePnl), letterSpacing: -0.5 }}><AnimatedPnL value={curvePnl} /></div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1 }}>{curveFilter === 'all' ? 'all time' : curveMonths.find(m => m.key === curveFilter)?.label}</div>
            </div>
          </div>
          {/* Row 2: filter pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8, flexShrink: 0 }}>
            {[{ key: 'all', label: 'All' }, ...curveMonths].map(m => {
              const active = curveFilter === m.key;
              return (
                <button key={m.key} onClick={() => setCurveFilter(m.key)} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                  borderColor: active ? 'var(--gold)' : 'var(--border)',
                  background: active ? 'var(--gold-alpha)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--text-dim)',
                  transition: 'all 0.15s',
                }}>{m.label}</button>
              );
            })}
          </div>
          {/* Chart fills remaining height */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <EquityCurve trades={curveTrades} />
          </div>
        </div>

        {/* Right sidebar: two charts filling full height */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Monthly P&L */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            {sectionTitle('Monthly P&L')}
            <MiniBarChart
              data={monthlyData.map(m => ({ label: m.label, value: m.pnl }))}
              color="var(--gold)"
              fillHeight
            />
          </div>

          {/* Last 30 Days */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            {sectionTitle('Last 30 Days')}
            <MiniBarChart
              data={(() => {
                const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
                const dayMap = {};
                for (const t of trades) {
                  if (new Date(t.closeTime) < cutoff) continue;
                  const k = getDayKey(t.closeTime);
                  if (!dayMap[k]) dayMap[k] = { label: k, value: 0 };
                  dayMap[k].value += t.net;
                }
                return Object.values(dayMap).sort((a, b) => a.label.localeCompare(b.label));
              })()}
              colorByValue
              fillHeight
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Performance view ────────────────────────────────────── */
function PerformanceView({ trades, lang }) {
  const [rtPage, setRtPage] = useState(0);

  if (!trades.length) {
    return (
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-dim)', fontSize: 13 }}>
        {lang === 'zh' ? '暂无交易数据' : 'No trade data yet. Import your MT5 history to see performance analytics.'}
      </div>
    );
  }

  // ── Core stats ──
  const sorted  = [...trades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));
  const wins    = trades.filter(t => t.net > 0);
  const losses  = trades.filter(t => t.net <= 0);
  const avgWin  = wins.length   ? wins.reduce((s, t) => s + t.net, 0)   / wins.length   : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.net, 0) / losses.length : 0;
  const wlRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const grossWin  = wins.reduce((s, t) => s + t.net, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.net, 0));

  // Drawdown + mini underwater curve points
  let cumPnl = 0, peak = 0, maxDD = 0, currentDD = 0;
  const ddPoints = [0]; // stores drawdown depth (0 = at peak, positive = underwater)
  for (const t of sorted) {
    cumPnl += t.net;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    ddPoints.push(dd);
    if (dd > maxDD) maxDD = dd;
  }
  currentDD = peak - cumPnl;

  // Mini drawdown SVG path (80×28) — 0 at top, deeper = lower
  const ddW = 80, ddH = 28;
  const ddDepthMax = Math.max(...ddPoints, 1);
  const ddPath = ddPoints.map((v, i) => {
    const x = (i / Math.max(ddPoints.length - 1, 1)) * ddW;
    const y = (v / ddDepthMax) * ddH; // 0 (no DD) = top, max DD = bottom
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // Best / worst single trade
  const byNet = [...trades].sort((a, b) => b.net - a.net);
  const best  = byNet[0];
  const worst = byNet[byNet.length - 1];
  const biggestAbs = Math.max(Math.abs(best?.net || 0), Math.abs(worst?.net || 0), 1);

  // Current streak + recent 12 squares
  const recent = [...sorted].reverse();
  let streak = 0;
  if (recent.length) {
    const dir = recent[0].net > 0 ? 1 : -1;
    for (const t of recent) {
      if ((t.net > 0 ? 1 : -1) === dir) streak += dir; else break;
    }
  }

  // Avg holding time
  const hold  = t => Math.max(0, new Date(t.closeTime) - new Date(t.openTime || t.closeTime));
  const wHold = wins.length   ? wins.reduce((s, t) => s + hold(t), 0)   / wins.length   : 0;
  const lHold = losses.length ? losses.reduce((s, t) => s + hold(t), 0) / losses.length : 0;

  // P&L by weekday
  const WD_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const wdData = WD_LABELS.map(label => ({ label, pnl: 0, count: 0 }));
  for (const t of trades) {
    const idx = (new Date(t.closeTime).getDay() + 6) % 7;
    wdData[idx].pnl   += t.net;
    wdData[idx].count += 1;
  }
  const maxWdAbs   = Math.max(...wdData.map(w => Math.abs(w.pnl)), 1);
  const maxWdCount = Math.max(...wdData.map(w => w.count), 1);

  // Best / worst 5 trades
  const top5        = byNet.slice(0, 5);
  const bot5        = byNet.slice(-5).reverse();
  const maxTradeAbs = Math.max(Math.abs(top5[0]?.net || 0), Math.abs(bot5[0]?.net || 0), 1);

  // Entry time range — 2-hour buckets, AM/PM labels
  const fmtHr = (h) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
  const hourMap = {};
  for (const t of trades) {
    const h      = new Date(t.closeTime).getHours();
    const bucket = Math.floor(h / 2) * 2;
    if (!hourMap[bucket]) hourMap[bucket] = { pnl: 0, count: 0 };
    hourMap[bucket].pnl   += t.net;
    hourMap[bucket].count += 1;
  }
  const hourData     = Object.entries(hourMap).map(([h, v]) => ({ label: `${fmtHr(+h)} - ${fmtHr(+h + 2)}`, h: +h, ...v })).sort((a,b) => a.h - b.h);
  const maxHourAbs   = Math.max(...hourData.map(d => Math.abs(d.pnl)), 1);
  const maxHourCount = Math.max(...hourData.map(d => d.count), 1);

  // Paginated recent trades
  const RT_PER_PAGE = 5;
  const allByClose  = [...trades].sort((a,b) => new Date(b.closeTime) - new Date(a.closeTime));
  const rtPageCount = Math.ceil(allByClose.length / RT_PER_PAGE);
  const safePage    = Math.min(rtPage, rtPageCount - 1);
  const recentTrades = allByClose.slice(safePage * RT_PER_PAGE, (safePage + 1) * RT_PER_PAGE);

  const card = { background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' };
  const kpiLbl = { fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 };
  const sectionTitle = (txt, color = 'var(--gold)') => (
    <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>{txt}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── KPI row: 5 cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>

        {/* 1. Avg Holding Time */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={kpiLbl}>Avg Holding Time</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Winners:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{fmtDur(wHold)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-dim)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Losers:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{fmtDur(lHold)}</span>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--gold)', borderRadius: '10px 0 0 10px' }} />
        </div>

        {/* 2. Drawdown */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={kpiLbl}>Drawdown</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 2 }}>CURRENT</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: currentDD > 0 ? 'var(--clr-loss)' : 'var(--text)' }}>{fmtPnL(-currentDD)}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginBottom: 2 }}>MAX</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: maxDD > 0 ? 'var(--clr-loss)' : 'var(--text)' }}>{fmtPnL(-maxDD)}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <svg viewBox={`0 0 ${ddW} ${ddH}`} style={{ width: '100%', height: 24, display: 'block' }}>
                <path d={ddPath} fill="none" stroke="var(--clr-loss)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              </svg>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--clr-loss)', borderRadius: '10px 0 0 10px' }} />
        </div>

        {/* 3. Biggest Trades */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={kpiLbl}>Biggest Trades</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: 'var(--clr-win)' }}>↑</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-win)', minWidth: 64 }}>{fmtPnL(best?.net || 0)}</span>
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{best?.symbol?.replace('.ECN','')}</span>
          </div>
          <div style={{ height: 5, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${((best?.net || 0) / biggestAbs) * 100}%`, background: 'var(--gold)', borderRadius: 2, opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: 'var(--clr-loss)' }}>↓</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-loss)', minWidth: 64 }}>{fmtPnL(worst?.net || 0)}</span>
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{worst?.symbol?.replace('.ECN','')}</span>
          </div>
          <div style={{ height: 5, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(Math.abs(worst?.net || 0) / biggestAbs) * 100}%`, background: 'rgba(80,80,80,0.6)', borderRadius: 2 }} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg,var(--clr-win),var(--clr-loss))', borderRadius: '10px 0 0 10px' }} />
        </div>

        {/* 4. W/L Ratio */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={kpiLbl}>Avg W/L Ratio</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: wlRatio >= 1.5 ? 'var(--clr-win)' : wlRatio >= 1 ? 'var(--gold)' : 'var(--clr-loss)', lineHeight: 1, marginBottom: 8 }}>
            <AnimatedDecimal value={wlRatio} decimals={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, fontSize: 8, color: 'var(--clr-win)', fontWeight: 700 }}>W</div>
              <div style={{ flex: 1, height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${grossWin + grossLoss > 0 ? (grossWin / (grossWin + grossLoss)) * 100 : 0}%`, background: 'var(--clr-win)', borderRadius: 2, opacity: 0.75 }} />
              </div>
              <div style={{ width: 32, fontSize: 8, color: 'var(--clr-win)', fontWeight: 700, textAlign: 'right' }}>{grossWin + grossLoss > 0 ? ((grossWin / (grossWin + grossLoss)) * 100).toFixed(1) : 0}%</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, fontSize: 8, color: 'var(--clr-loss)', fontWeight: 700 }}>L</div>
              <div style={{ flex: 1, height: 4, background: 'var(--bg)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${grossWin + grossLoss > 0 ? (grossLoss / (grossWin + grossLoss)) * 100 : 0}%`, background: 'var(--clr-loss)', borderRadius: 2, opacity: 0.75 }} />
              </div>
              <div style={{ width: 32, fontSize: 8, color: 'var(--clr-loss)', fontWeight: 700, textAlign: 'right' }}>{grossWin + grossLoss > 0 ? ((grossLoss / (grossWin + grossLoss)) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--gold)', borderRadius: '10px 0 0 10px' }} />
        </div>

        {/* 5. Current Streak */}
        <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
          <div style={kpiLbl}>Current Streak</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, marginBottom: 6, color: streak > 0 ? 'var(--clr-win)' : streak < 0 ? 'var(--clr-loss)' : 'var(--text)' }}>
            {streak > 0 ? '+' : ''}<AnimatedInt value={streak} />
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
            {recent.slice(0, 12).map((t, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: t.net > 0 ? 'var(--clr-win)' : 'var(--clr-loss)', opacity: i < Math.abs(streak) ? 0.9 : 0.2 }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
            {streak > 1 ? 'win streak' : streak < -1 ? 'loss streak' : streak === 1 ? 'last win' : streak === -1 ? 'last loss' : 'neutral'}
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: streak > 0 ? 'var(--clr-win)' : streak < 0 ? 'var(--clr-loss)' : 'var(--border)', borderRadius: '10px 0 0 10px' }} />
        </div>
      </div>

      {/* ── Charts: 4-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>

        {/* Col 1: Entry time range + Number of Trades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('Entry Time Range')}
            <div style={{ flex: 1 }}>
              {hourData.map((h, i) => <PnLBar key={i} label={h.label} value={h.pnl} maxAbs={maxHourAbs} />)}
            </div>
          </div>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('Number of Trades')}
            <div style={{ flex: 1 }}>
              {hourData.map((h, i) => <CountBar key={i} label={h.label} value={h.count} maxVal={maxHourCount} />)}
            </div>
          </div>
        </div>

        {/* Col 2: Best / Worst 5 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('Best Trades', 'var(--clr-win)')}
            <div style={{ flex: 1 }}>
              {top5.map((t, i) => <PnLBar key={i} label={`${t.symbol.replace('.ECN','')} · ${fmtDate(t.closeTime)}`} value={t.net} maxAbs={maxTradeAbs} />)}
            </div>
          </div>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('Worst Trades', 'var(--clr-loss)')}
            <div style={{ flex: 1 }}>
              {bot5.map((t, i) => <PnLBar key={i} label={`${t.symbol.replace('.ECN','')} · ${fmtDate(t.closeTime)}`} value={t.net} maxAbs={maxTradeAbs} />)}
            </div>
          </div>
        </div>

        {/* Col 3: P&L by Weekday + count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('P&L by Weekday')}
            <div style={{ flex: 1 }}>
              {wdData.map((w, i) => <PnLBar key={i} label={w.label} value={w.pnl} maxAbs={maxWdAbs} />)}
            </div>
          </div>
          <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sectionTitle('Number of Trades')}
            <div style={{ flex: 1 }}>
              {wdData.map((w, i) => <CountBar key={i} label={w.label} value={w.count} maxVal={maxWdCount} />)}
            </div>
          </div>
        </div>

        {/* Col 4: Recent trades with pagination */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          {sectionTitle('Recent Trades')}
          <div style={{ display: 'grid', gridTemplateColumns: '82px 1fr 64px', gap: 6, paddingBottom: 6, borderBottom: '1px solid var(--border)', marginBottom: 2 }}>
            {['Entry Date', 'Symbol', 'Gross P&L'].map((h, i) => (
              <div key={h} style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.8, textAlign: i === 2 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {recentTrades.map((t, i) => (
              <div key={t.ticket} style={{ display: 'grid', gridTemplateColumns: '82px 1fr 64px', gap: 6, padding: '6px 0', borderBottom: i < recentTrades.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{new Date(t.closeTime).toLocaleDateString('en-CA')}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{t.symbol.replace('.ECN','')}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: clr(t.net), textAlign: 'right' }}>{fmtPnL(t.net)}</div>
              </div>
            ))}
          </div>
          {rtPageCount > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setRtPage(p => Math.max(0, p - 1))} disabled={safePage === 0} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, color: safePage === 0 ? 'var(--text-dim)' : 'var(--text)', padding: '3px 7px', fontSize: 11, cursor: safePage === 0 ? 'default' : 'pointer', opacity: safePage === 0 ? 0.4 : 1 }}>‹</button>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Page {safePage + 1} of {rtPageCount}</span>
              <button onClick={() => setRtPage(p => Math.min(rtPageCount - 1, p + 1))} disabled={safePage === rtPageCount - 1} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, color: safePage === rtPageCount - 1 ? 'var(--text-dim)' : 'var(--text)', padding: '3px 7px', fontSize: 11, cursor: safePage === rtPageCount - 1 ? 'default' : 'pointer', opacity: safePage === rtPageCount - 1 ? 0.4 : 1 }}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function JournalTab({ lang = 'en' }) {
  const [trades,      setTrades]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [importing,   setImporting]   = useState(false);
  const [clearing,    setClearing]    = useState(false);
  const [showManual,  setShowManual]  = useState(false);
  const [importMsg,   setImportMsg]   = useState(null);
  const [view,        setView]        = useState('calendar'); // 'calendar' | 'log' | 'performance'

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/journal');
    const d = await r.json();
    setTrades(d.trades || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);

    let parsed = [];
    const ext = file.name.split('.').pop().toLowerCase();
    try {
      const text = await readFileText(file);
      parsed = parseMT5HTML(text);
    } catch {
      parsed = [];
    }

    if (!parsed.length) {
      setImportMsg({ type: 'error', text: lang === 'zh' ? '无法解析文件，请确认是 MT5 HTML 历史报告。' : 'Could not parse file. Please export as HTML from MT5 History tab (right-click → Save as Report).' });
      setImporting(false);
      e.target.value = '';
      return;
    }
    const r = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trades: parsed }),
    });
    const d = await r.json();
    setImportMsg({
      type: 'success',
      text: lang === 'zh'
        ? `导入成功：新增 ${d.added} 笔，跳过 ${d.skipped} 笔（重复或超过1年）`
        : `Imported ${d.added} new trade${d.added !== 1 ? 's' : ''}, skipped ${d.skipped} (duplicates or older than 1 year)`,
    });
    await load();
    setImporting(false);
    e.target.value = '';
  };

  const deleteTrade = async (ticket) => {
    if (!confirm(lang === 'zh' ? '确定删除这笔交易？' : 'Delete this trade?')) return;
    await fetch(`/api/journal?ticket=${ticket}`, { method: 'DELETE' });
    setTrades(ts => ts.filter(t => t.ticket !== ticket));
  };

  const clearAll = async () => {
    if (!confirm(lang === 'zh' ? '确定清除全部交易记录？此操作无法撤销。' : 'Clear ALL trade history? This cannot be undone.')) return;
    setClearing(true);
    await fetch('/api/journal?all=true', { method: 'DELETE' });
    setTrades([]);
    setImportMsg(null);
    setClearing(false);
  };

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>
            {lang === 'zh' ? '交易日记' : 'Trading Journal'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {lang === 'zh' ? '最多保存 12 个月的交易记录。' : 'Stores up to 12 months of trade history.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* CSV import */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'var(--gold-alpha)', border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--gold)',
            cursor: importing ? 'wait' : 'pointer', whiteSpace: 'nowrap',
          }}>
            <UploadIcon />
            {importing ? (lang === 'zh' ? '导入中...' : 'Importing...') : (lang === 'zh' ? '导入 MT5 HTML' : 'Import MT5 HTML')}
            <input type="file" accept=".html,.htm" onChange={handleImport} style={{ display: 'none' }} disabled={importing} />
          </label>
          {/* Manual add */}
          <button onClick={() => setShowManual(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-dim)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <PlusIcon />
            {lang === 'zh' ? '手动添加' : 'Add Manual'}
          </button>
          {/* Clear all */}
          {trades.length > 0 && (
            <button onClick={clearAll} disabled={clearing} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'var(--loss-bg)', border: '1px solid var(--clr-loss)',
              borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--clr-loss)',
              cursor: clearing ? 'wait' : 'pointer', whiteSpace: 'nowrap',
            }}>
              <TrashIcon size={13} />
              {clearing ? '...' : (lang === 'zh' ? '清除全部' : 'Clear All')}
            </button>
          )}
        </div>
      </div>

      {/* Import message */}
      {importMsg && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 8, fontSize: 13,
          background: importMsg.type === 'success' ? 'var(--win-bg)' : 'var(--loss-bg)',
          border: `1px solid ${importMsg.type === 'success' ? 'var(--clr-win)' : 'var(--clr-loss)'}`,
          color: importMsg.type === 'success' ? 'var(--clr-win)' : 'var(--clr-loss)',
        }}>{importMsg.text}</div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 3, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 3 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <StatsBar trades={trades} lang={lang} />

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[
              ['calendar',    'Calendar'],
              ['overview',    'Overview'],
              ['log',         'Trade Log'],
              ['performance', 'Performance'],
            ].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1px solid', transition: 'all 0.15s',
                borderColor: view === v ? 'var(--gold)' : 'var(--border)',
                background:  view === v ? 'var(--gold-alpha)' : 'transparent',
                color:       view === v ? 'var(--gold)' : 'var(--text-dim)',
              }}>{label}</button>
            ))}
          </div>

          {view === 'calendar'    && <Calendar        trades={trades} lang={lang} />}
          {view === 'overview'    && <OverviewView    trades={trades} lang={lang} />}
          {view === 'log'         && <TradeLog        trades={trades} onDelete={deleteTrade} onRefresh={load} lang={lang} />}
          {view === 'performance' && <PerformanceView trades={trades} lang={lang} />}
        </>
      )}

      {showManual && <ManualForm onAdd={load} onClose={() => setShowManual(false)} lang={lang} />}
    </div>
  );
}
