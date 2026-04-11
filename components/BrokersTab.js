const brokerData = {
  en: {
    heading:  'Recommended Broker',
    subhead:  'Brokers tested and approved to work with LTE Gold EA',
    badge:    'Recommended',
    openBtn:  'Open Account',
    note:     '* This is an affiliate link. We may earn a commission at no extra cost to you.',
    details: [
      { label: 'Min. Deposit',  value: 'From $10' },
      { label: 'Leverage',      value: 'Up to 1:3000' },
      { label: 'Spread',        value: 'From 0.0 pips (Raw)' },
      { label: 'Platforms',     value: 'MT5 / MT4' },
      { label: 'Swap-Free',     value: 'Available (Islamic)' },
      { label: 'Regulation',    value: 'FSA / CySEC' },
    ],
    accounts: [
      { name: 'Standard',   deposit: '$10',   spread: 'From 0.3 pips', commission: 'No commission',       badge: 'Popular' },
      { name: 'Pro',        deposit: '$200',  spread: 'From 0.1 pips', commission: 'No commission',       badge: '' },
      { name: 'Raw Spread', deposit: '$200',  spread: 'From 0.0 pips', commission: '$3 each side / lot',  badge: '' },
    ],
    accountsTitle: 'Account Types',
    whyTitle: 'Why JustMarkets?',
    why: [
      'Low minimum deposit — start from just $10',
      'Ultra-high leverage up to 1:3000',
      'Raw Spread accounts with 0 pip spreads',
      'Fully compatible with MT5 and LTE Gold EA',
      'Swap-free Islamic accounts available',
      'Fast deposits & withdrawals with multiple methods',
    ],
  },
  zh: {
    heading:  '推荐经纪商',
    subhead:  '经测试并批准与 LTE Gold EA 配合使用的经纪商',
    badge:    '推荐',
    openBtn:  '开设账户',
    note:     '* 这是一个联盟链接，您通过此链接注册不会产生任何额外费用。',
    details: [
      { label: '最低入金',    value: '最低 $10' },
      { label: '杠杆',        value: '高达 1:3000' },
      { label: '点差',        value: '最低 0.0 点（Raw）' },
      { label: '交易平台',    value: 'MT5 / MT4' },
      { label: '伊斯兰账户', value: '可申请免隔夜费' },
      { label: '监管',        value: 'FSA / CySEC' },
    ],
    accounts: [
      { name: 'Standard 标准',   deposit: '$10',   spread: '最低 0.3 点', commission: '无佣金',          badge: '热门' },
      { name: 'Pro 专业',        deposit: '$200',  spread: '最低 0.1 点', commission: '无佣金',          badge: '' },
      { name: 'Raw Spread 原始', deposit: '$200',  spread: '最低 0.0 点', commission: '$3 每边 / 手',    badge: '' },
    ],
    accountsTitle: '账户类型',
    whyTitle: '为什么选择 JustMarkets？',
    why: [
      '超低入金门槛 — 最低仅需 $1',
      '超高杠杆，最高可达 1:3000',
      'Raw Spread 账户提供 0 点差交易',
      '完全兼容 MT5 及 LTE Gold EA',
      '可申请免隔夜费伊斯兰账户',
      '多种方式快速入金与出金',
    ],
  },
};

export default function BrokersTab({ lang = 'en' }) {
  const tx = brokerData[lang] || brokerData.en;
  const affiliateUrl = 'https://one.justmarkets.link/a/bmgg90iazx';

  return (
    <div style={{ padding: '0 0 48px' }}>

      {/* Section heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>{tx.heading}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{tx.subhead}</p>
      </div>

      {/* Broker card */}
      <div style={{
        background: 'var(--bg-table)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
      }}>

        {/* Card header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
          borderBottom: '1px solid var(--border)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* JustMarkets Logo */}
            <div style={{ flexShrink: 0 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
                <rect width="56" height="56" rx="14" fill="#fff"/>
                <rect width="56" height="56" rx="14" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
                {/* J shape */}
                <text x="7" y="38" fontSize="28" fontWeight="900" fontFamily="Arial,sans-serif" fill="#1a56db">J</text>
                {/* M shape */}
                <text x="24" y="38" fontSize="28" fontWeight="900" fontFamily="Arial,sans-serif" fill="#0ea271">M</text>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>JustMarkets</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#0A0A0A',
                  background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
                  borderRadius: 20, padding: '2px 10px', letterSpacing: 0.5,
                }}>{tx.badge}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>justmarketsmy.com</span>
            </div>
          </div>

          {/* CTA button */}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #C9A84C, #9B7B2F)',
              borderRadius: 8, border: 'none',
              color: '#0A0A0A', fontSize: 14, fontWeight: 800,
              textDecoration: 'none', letterSpacing: 0.3,
              boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round"/>
              <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
            </svg>
            {tx.openBtn}
          </a>
        </div>

        {/* Key details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          borderBottom: '1px solid var(--border)',
        }}>
          {tx.details.map((d, i) => (
            <div key={i} style={{
              padding: '16px 20px',
              borderRight: i < tx.details.length - 1 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid transparent',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{d.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{d.value}</div>
            </div>
          ))}
        </div>

        {/* Account types + Why section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Account types */}
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 14px' }}>{tx.accountsTitle}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tx.accounts.map((a, i) => (
                <div key={i} style={{
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.name}</span>
                      {a.badge && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#0ea271', background: 'rgba(14,162,113,0.12)', border: '1px solid rgba(14,162,113,0.3)', borderRadius: 20, padding: '1px 6px' }}>{a.badge}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.spread} · {a.commission}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--gold)',
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: 6, padding: '3px 8px',
                  }}>{a.deposit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why section */}
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 14px' }}>{tx.whyTitle}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tx.why.map((w, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--gold)', marginTop: 1, flexShrink: 0 }}>✓</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate disclaimer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{tx.note}</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .brokers-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
