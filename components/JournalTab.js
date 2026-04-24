import { useState, useEffect, useCallback } from 'react';

/* ── MT5 CSV parser ─────────────────────────────────────────
   Supports MT5 Statement / Detailed Report CSV formats.
   Looks for closed positions by matching column headers.
──────────────────────────────────────────────────────────── */
function parseMT5CSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // find header row (contains "ticket" or "position" or "deal")
  let headerIdx = -1;
  let headers = [];
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const cols = lines[i].split('\t').map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
    if (cols.some(c => c.includes('ticket') || c.includes('position') || c.includes('deal') || c.includes('order'))) {
      headerIdx = i;
      headers = cols;
      break;
    }
  }
  if (headerIdx === -1) return [];

  const col = (name) => {
    const patterns = {
      ticket:     ['ticket', 'position', 'deal', 'order'],
      openTime:   ['open time', 'time open', 'open'],
      closeTime:  ['close time', 'time close', 'close time', 'time'],
      symbol:     ['symbol', 'item'],
      type:       ['type', 'direction'],
      lots:       ['volume', 'lots', 'size', 'quantity'],
      openPrice:  ['open price', 'price open', 'price (open)', 'open'],
      closePrice: ['close price', 'price close', 'price (close)', 'price'],
      profit:     ['profit'],
      commission: ['commission'],
      swap:       ['swap'],
      comment:    ['comment'],
    };
    const candidates = patterns[name] || [name];
    for (const p of candidates) {
      const idx = headers.findIndex(h => h === p || h.startsWith(p));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = lines[i].split('\t').map(c => c.replace(/^"|"$/g, '').trim());
    if (row.length < 4) continue;

    const get = (name) => { const idx = col(name); return idx >= 0 ? row[idx] || '' : ''; };

    const ticket     = get('ticket');
    const closeTime  = get('closeTime');
    const symbol     = get('symbol');
    const type       = get('type').toLowerCase();
    const lots       = parseFloat(get('lots'))       || 0;
    const openPrice  = parseFloat(get('openPrice'))  || 0;
    const closePrice = parseFloat(get('closePrice')) || 0;
    const profit     = parseFloat(get('profit'))     || 0;
    const commission = parseFloat(get('commission')) || 0;
    const swap       = parseFloat(get('swap'))       || 0;
    const openTime   = get('openTime') || closeTime;
    const comment    = get('comment');

    // skip header repeats, balance/deposit lines, empty rows
    if (!ticket || !closeTime || isNaN(new Date(closeTime).getTime())) continue;
    if (type.includes('balance') || type.includes('deposit') || type.includes('withdrawal') || type.includes('credit')) continue;
    if (!symbol) continue;

    // calc pips for XAUUSD (pip = 0.1) or forex (pip = 0.0001)
    const diff = closePrice - openPrice;
    const pipSize = symbol.includes('JPY') ? 0.01 : symbol.toUpperCase().includes('XAU') || symbol.toUpperCase().includes('GOLD') ? 0.1 : 0.0001;
    const rawPips = diff / pipSize;
    const pips = type.includes('sell') ? -rawPips : rawPips;
    const isWin = profit > 0;
    const dir = type.includes('sell') ? 'sell' : 'buy';

    trades.push({
      ticket,
      openTime:   normaliseDate(openTime),
      closeTime:  normaliseDate(closeTime),
      symbol:     symbol.toUpperCase(),
      type:       dir,
      lots,
      openPrice,
      closePrice,
      profit:     Math.round(profit     * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      swap:       Math.round(swap       * 100) / 100,
      pips:       Math.round(pips       * 10)  / 10,
      net:        Math.round((profit + commission + swap) * 100) / 100,
      win:        isWin,
      notes:      comment || '',
    });
  }
  return trades;
}

function normaliseDate(str) {
  // MT5 uses "2024.01.15 09:30:00" or "2024-01-15 09:30:00"
  return str.replace(/\./g, '-').replace(' ', 'T');
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
function clr(n) { return n >= 0 ? '#3ECF8E' : '#E05252'; }

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
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
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
                    borderColor: form.type === t ? (t === 'buy' ? '#3ECF8E' : '#E05252') : 'var(--border)',
                    background:  form.type === t ? (t === 'buy' ? 'rgba(62,207,142,0.12)' : 'rgba(224,82,82,0.12)') : 'transparent',
                    color:       form.type === t ? (t === 'buy' ? '#3ECF8E' : '#E05252') : 'var(--text-dim)',
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
  const winRate   = ((wins / trades.length) * 100).toFixed(1);
  const dayMap    = buildCalendarData(trades);
  const dayPnls   = Object.values(dayMap).map(d => d.pnl);
  const bestDay   = Math.max(...dayPnls);
  const worstDay  = Math.min(...dayPnls);

  const stats = [
    { label: lang === 'zh' ? '总盈亏' : 'Total P&L',   value: fmtPnL(totalNet),         color: clr(totalNet) },
    { label: lang === 'zh' ? '胜率'   : 'Win Rate',     value: `${winRate}%`,             color: parseFloat(winRate) >= 50 ? '#3ECF8E' : '#E05252' },
    { label: lang === 'zh' ? '交易数' : 'Total Trades', value: trades.length,              color: 'var(--text)' },
    { label: lang === 'zh' ? '最佳日' : 'Best Day',     value: fmtPnL(bestDay),           color: '#3ECF8E' },
    { label: lang === 'zh' ? '最差日' : 'Worst Day',    value: fmtPnL(worstDay),          color: '#E05252' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Calendar ────────────────────────────────────────────── */
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function Calendar({ trades, lang }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  const dayMap = buildCalendarData(trades.filter(t => {
    const d = new Date(t.closeTime);
    return d.getFullYear() === year && d.getMonth() === month;
  }));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelected(null); };

  const selectedKey  = selected ? `${year}-${String(month+1).padStart(2,'0')}-${String(selected).padStart(2,'0')}` : null;
  const selectedData = selectedKey ? dayMap[selectedKey] : null;
  const selectedTrades = selectedKey ? trades.filter(t => getDayKey(t.closeTime) === selectedKey) : [];

  return (
    <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--gold-alpha)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 4 }}><ChevronIcon dir="left" /></button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', padding: 4 }}><ChevronIcon dir="right" /></button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)' }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1 }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', minHeight: 64 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const data = dayMap[key];
          const isSelected = selected === day;
          const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
          const col = (i + firstDay) % 7;
          const isLastCol = col === 6;

          return (
            <div
              key={day}
              onClick={() => data && setSelected(isSelected ? null : day)}
              style={{
                borderRight: isLastCol ? 'none' : '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                minHeight: 64, padding: '6px 8px',
                cursor: data ? 'pointer' : 'default',
                background: isSelected ? 'var(--gold-alpha)' : data ? (data.pnl >= 0 ? 'rgba(62,207,142,0.06)' : 'rgba(224,82,82,0.06)') : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: isToday ? 800 : 500,
                color: isToday ? 'var(--gold)' : 'var(--text-dim)',
                marginBottom: 4,
              }}>{day}</div>
              {data && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: clr(data.pnl) }}>
                    {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>
                    {data.trades} {lang === 'zh' ? '笔' : 'trade'}{data.trades > 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedData && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--gold-alpha)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10 }}>
            {MONTHS[month]} {selected} — {selectedTrades.length} {lang === 'zh' ? '笔交易' : 'trades'} · {fmtPnL(selectedData.pnl)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedTrades.map(t => (
              <div key={t.ticket} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: t.type === 'buy' ? 'rgba(62,207,142,0.12)' : 'rgba(224,82,82,0.12)', color: t.type === 'buy' ? '#3ECF8E' : '#E05252' }}>{t.type.toUpperCase()}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{t.symbol}</span>
                <span>{t.lots} lots</span>
                <span style={{ color: clr(t.net), fontWeight: 700, marginLeft: 'auto' }}>{fmtPnL(t.net)}</span>
                <span style={{ color: 'var(--text-dim)' }}>{t.pips > 0 ? '+' : ''}{t.pips} pips</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Trade log ───────────────────────────────────────────── */
function TradeLog({ trades, onDelete, onRefresh, lang }) {
  const [filter, setFilter] = useState('all');
  const symbols = [...new Set(trades.map(t => t.symbol))];

  const filtered = filter === 'all' ? trades : trades.filter(t => t.symbol === filter || t.type === filter);

  return (
    <div style={{ background: 'var(--bg-table)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: 1, marginRight: 4 }}>FILTER</span>
        {['all', 'buy', 'sell', ...symbols].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            borderColor: filter === f ? 'var(--gold)' : 'var(--border)',
            background:  filter === f ? 'var(--gold-alpha)' : 'transparent',
            color:       filter === f ? 'var(--gold)' : 'var(--text-dim)',
          }}>{f === 'all' ? (lang === 'zh' ? '全部' : 'All') : f.toUpperCase()}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
          {filtered.length} {lang === 'zh' ? '笔交易' : 'trades'}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              {['Close Date', 'Symbol', 'Type', 'Lots', 'Open', 'Close', 'Pips', 'Net P&L', 'Notes', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--bg-table-hd)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                {lang === 'zh' ? '暂无交易记录' : 'No trades yet'}
              </td></tr>
            ) : filtered.map(t => (
              <tr key={t.ticket} style={{ borderBottom: '1px solid var(--border-row)' }}>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <div>{fmtDate(t.closeTime)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{fmtTime(t.closeTime)}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.symbol}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: t.type === 'buy' ? 'rgba(62,207,142,0.12)' : 'rgba(224,82,82,0.12)', color: t.type === 'buy' ? '#3ECF8E' : '#E05252' }}>{t.type.toUpperCase()}</span>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{t.lots}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.openPrice}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.closePrice}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: clr(t.pips) }}>{t.pips > 0 ? '+' : ''}{t.pips}</td>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: clr(t.net) }}>{fmtPnL(t.net)}</td>
                <td style={{ padding: '11px 14px', fontSize: 11, color: 'var(--text-dim)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
                <td style={{ padding: '11px 14px' }}>
                  <button onClick={() => onDelete(t.ticket)} style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 5, color: '#E05252', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
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

/* ── Main component ──────────────────────────────────────── */
export default function JournalTab({ lang = 'en' }) {
  const [trades,      setTrades]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [importing,   setImporting]   = useState(false);
  const [showManual,  setShowManual]  = useState(false);
  const [importMsg,   setImportMsg]   = useState(null);
  const [view,        setView]        = useState('calendar'); // 'calendar' | 'log'

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/journal');
    const d = await r.json();
    setTrades(d.trades || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    const text = await file.text();
    const parsed = parseMT5CSV(text);
    if (!parsed.length) {
      setImportMsg({ type: 'error', text: lang === 'zh' ? '无法解析文件，请确认是 MT5 历史报告 CSV。' : 'Could not parse file. Make sure it is an MT5 history report CSV.' });
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
            {importing ? (lang === 'zh' ? '导入中...' : 'Importing...') : (lang === 'zh' ? '导入 MT5 CSV' : 'Import MT5 CSV')}
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleCSV} style={{ display: 'none' }} disabled={importing} />
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
        </div>
      </div>

      {/* Import message */}
      {importMsg && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 8, fontSize: 13,
          background: importMsg.type === 'success' ? 'rgba(62,207,142,0.1)' : 'rgba(224,82,82,0.1)',
          border: `1px solid ${importMsg.type === 'success' ? 'rgba(62,207,142,0.3)' : 'rgba(224,82,82,0.3)'}`,
          color: importMsg.type === 'success' ? '#3ECF8E' : '#E05252',
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
            {[['calendar', lang === 'zh' ? '📅 日历' : 'Calendar'], ['log', lang === 'zh' ? '📋 交易记录' : 'Trade Log']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1px solid', transition: 'all 0.15s',
                borderColor: view === v ? 'var(--gold)' : 'var(--border)',
                background:  view === v ? 'var(--gold-alpha)' : 'transparent',
                color:       view === v ? 'var(--gold)' : 'var(--text-dim)',
              }}>{label}</button>
            ))}
          </div>

          {view === 'calendar' && <Calendar trades={trades} lang={lang} />}
          {view === 'log'      && <TradeLog trades={trades} onDelete={deleteTrade} onRefresh={load} lang={lang} />}
        </>
      )}

      {showManual && <ManualForm onAdd={load} onClose={() => setShowManual(false)} lang={lang} />}
    </div>
  );
}
