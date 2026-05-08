const ui = {
  en: {
    heading: 'Recommended Brokers',
    subhead: 'Brokers and prop firms tested and approved to work with LTE Gold EA',
    note:    '* Affiliate link — we may earn a commission at no extra cost to you.',
    openBtn: 'Open Account',
    applyBtn: 'Apply Now',
  },
  zh: {
    heading: '推荐经纪商',
    subhead: '经测试并批准与 LTE Gold EA 配合使用的经纪商及资金平台',
    note:    '* 联盟链接 — 您通过此链接注册不会产生任何额外费用。',
    openBtn: '开设账户',
    applyBtn: '立即申请',
  },
};

const brokers = [
  {
    id: 'justmarkets',
    name: 'JustMarkets',
    type: { en: 'Retail Broker', zh: '零售经纪商' },
    url: 'justmarketsmy.com',
    affiliate: 'https://one.justmarkets.link/a/bmgg90iazx',
    badge: { en: 'Recommended', zh: '推荐' },
    badgeColor: '#C9A84C',
    accentColor: '#C9A84C',
    logo: (
      <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="56" rx="14" fill="#fff"/>
        <rect width="56" height="56" rx="14" fill="none" stroke="#e8e8e8" strokeWidth="1"/>
        <text x="7" y="38" fontSize="28" fontWeight="900" fontFamily="Arial,sans-serif" fill="#1a56db">J</text>
        <text x="24" y="38" fontSize="28" fontWeight="900" fontFamily="Arial,sans-serif" fill="#1a56db">M</text>
      </svg>
    ),
    details: {
      en: [
        { label: 'Min. Deposit',  value: 'From $10',      icon: '💵' },
        { label: 'Leverage',      value: 'Up to 1:3000',  icon: '📈' },
        { label: 'Spread',        value: 'From 0.0 pips', icon: '📊' },
        { label: 'Platforms',     value: 'MT5 / MT4',     icon: '🖥️' },
        { label: 'Swap-Free',     value: 'Available',     icon: '✦' },
        { label: 'Regulation',    value: 'FSA / CySEC',   icon: '🛡️' },
      ],
      zh: [
        { label: '最低入金',    value: '最低 $10',        icon: '💵' },
        { label: '杠杆',        value: '高达 1:3000',     icon: '📈' },
        { label: '点差',        value: '最低 0.0 点',     icon: '📊' },
        { label: '交易平台',    value: 'MT5 / MT4',       icon: '🖥️' },
        { label: '免隔夜费',    value: '可申请',           icon: '✦' },
        { label: '监管',        value: 'FSA / CySEC',     icon: '🛡️' },
      ],
    },
    accounts: {
      en: [
        { name: 'Standard',   fee: '$10',   info: '0.3 pips · No commission',     badge: 'Popular', color: '#3ECF8E' },
        { name: 'Pro',        fee: '$200',  info: '0.1 pips · No commission',     badge: '',        color: '#C9A84C' },
        { name: 'Raw Spread', fee: '$200',  info: '0.0 pips · $3 each side/lot', badge: '',        color: '#C9A84C' },
      ],
      zh: [
        { name: 'Standard 标准',   fee: '$10',   info: '0.3 点 · 无佣金',         badge: '热门', color: '#3ECF8E' },
        { name: 'Pro 专业',        fee: '$200',  info: '0.1 点 · 无佣金',         badge: '',     color: '#C9A84C' },
        { name: 'Raw Spread 原始', fee: '$200',  info: '0.0 点 · $3 每边/手',     badge: '',     color: '#C9A84C' },
      ],
    },
    accountsLabel: { en: 'Account Types', zh: '账户类型' },
    whyLabel: { en: 'Why JustMarkets?', zh: '为什么选择 JustMarkets？' },
    why: {
      en: [
        'Low minimum deposit — start from just $10',
        'Ultra-high leverage up to 1:3000',
        'Raw Spread accounts with 0 pip spreads',
        'Fully compatible with MT5 and LTE Gold EA',
        'Swap-free Islamic accounts available',
        'Fast deposits & withdrawals',
      ],
      zh: [
        '超低入金门槛 — 最低仅需 $10',
        '超高杠杆，最高可达 1:3000',
        'Raw Spread 账户提供 0 点差交易',
        '完全兼容 MT5 及 LTE Gold EA',
        '可申请免隔夜费伊斯兰账户',
        '多种方式快速入金与出金',
      ],
    },
    btnKey: 'openBtn',
  },
  {
    id: 'the5ers',
    name: 'The5ers',
    type: { en: 'Prop Firm', zh: '资金平台' },
    url: 'the5ers.com',
    affiliate: 'https://www.the5ers.com/?afmc=dlt',
    badge: { en: 'Prop Firm', zh: '资金平台' },
    badgeColor: '#7c3aed',
    accentColor: '#7c3aed',
    logo: (
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: '#fff', border: '1px solid #e8e8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}>
        <img src="/the5ers-logo.png" alt="The5ers" style={{ width: 46, height: 'auto', objectFit: 'contain' }} />
      </div>
    ),
    details: {
      en: [
        { label: 'Account Size',  value: '$2.5K – $100K', icon: '💰' },
        { label: 'Profit Split',  value: 'Up to 100%',    icon: '🤝' },
        { label: 'Fee',           value: 'From $19',       icon: '🏷️' },
        { label: 'Leverage',      value: '1:30',           icon: '📈' },
        { label: 'Time Limit',    value: 'Unlimited',      icon: '⏳' },
        { label: 'Established',   value: '2016 · UK',      icon: '🏛️' },
      ],
      zh: [
        { label: '账户规模',   value: '$2,500 – $100,000', icon: '💰' },
        { label: '分润比例',   value: '最高 100%',          icon: '🤝' },
        { label: '评估费用',   value: '最低 $19',           icon: '🏷️' },
        { label: '杠杆',       value: '1:30',               icon: '📈' },
        { label: '时间限制',   value: '无限制',              icon: '⏳' },
        { label: '成立时间',   value: '2016 · 英国',        icon: '🏛️' },
      ],
    },
    accounts: {
      en: [
        { name: 'Hyper Growth', fee: '$51–$850',  info: '1-Step · Up to 100% split', badge: 'Popular', color: '#3ECF8E' },
        { name: 'High Stakes',  fee: '$19–$545',  info: '2-Step · 80–100% split',    badge: '',        color: '#7c3aed' },
        { name: 'Bootcamp',     fee: '$22–$225',  info: '3-Step · $20K + scaling',   badge: '',        color: '#7c3aed' },
      ],
      zh: [
        { name: 'Hyper Growth', fee: '$51–$850',  info: '1阶段 · 最高100%分润',  badge: '热门', color: '#3ECF8E' },
        { name: 'High Stakes',  fee: '$19–$545',  info: '2阶段 · 80–100%分润',   badge: '',     color: '#7c3aed' },
        { name: 'Bootcamp',     fee: '$22–$225',  info: '3阶段 · $20K + 扩大规模', badge: '',   color: '#7c3aed' },
      ],
    },
    accountsLabel: { en: 'Funded Plans', zh: '资金计划' },
    whyLabel: { en: 'Why The5ers?', zh: '为什么选择 The5ers？' },
    why: {
      en: [
        'Trade with firm capital — no personal risk',
        'Up to 100% profit split on Hyper Growth',
        'Low entry fee — from just $19',
        'Unlimited time to hit profit target',
        'Established since 2016, UK-registered',
        'Free trading academy & community Discord',
      ],
      zh: [
        '使用公司资金交易，无个人风险',
        'Hyper Growth 计划最高 100% 分润',
        '入门费用低 — 最低仅需 $19',
        '无时间限制达成盈利目标',
        '成立于 2016 年，英国注册',
        '免费交易学院及社区 Discord',
      ],
    },
    btnKey: 'applyBtn',
  },
];

function BrokerCard({ broker, lang, ui }) {
  const details  = broker.details[lang]  || broker.details.en;
  const accounts = broker.accounts[lang] || broker.accounts.en;
  const why      = broker.why[lang]      || broker.why.en;
  const badge    = broker.badge[lang]    || broker.badge.en;
  const accLabel = broker.accountsLabel[lang] || broker.accountsLabel.en;
  const whyLabel = broker.whyLabel[lang]      || broker.whyLabel.en;
  const btnLabel = ui[broker.btnKey];
  const accent   = broker.accentColor;

  return (
    <div style={{
      background: 'var(--bg-table)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 32px rgba(0,0,0,0.22)',
      borderTop: `2px solid ${accent}`,
    }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}0d 0%, transparent 60%)`,
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo with glow ring */}
          <div style={{
            flexShrink: 0,
            borderRadius: 16,
            padding: 3,
            background: `linear-gradient(135deg, ${accent}50, transparent)`,
          }}>
            {broker.logo}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>{broker.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#fff',
                background: accent, borderRadius: 20, padding: '2px 10px',
                boxShadow: `0 0 8px ${accent}60`,
              }}>{badge}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3ECF8E', display: 'inline-block', boxShadow: '0 0 4px #3ECF8E' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{broker.url}</span>
            </div>
          </div>
        </div>

        {/* CTA button */}
        <a
          href={broker.affiliate}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px',
            background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
            borderRadius: 10, color: accent === '#C9A84C' ? '#0A0A0A' : '#fff',
            fontSize: 13, fontWeight: 800, textDecoration: 'none',
            boxShadow: `0 4px 20px ${accent}40`,
            whiteSpace: 'nowrap', transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 13, height: 13 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round"/>
            <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
          </svg>
          {btnLabel}
        </a>
      </div>

      {/* ── Details strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-table-hd)',
      }}>
        {details.map((d, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderRight: i < details.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>{d.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: accent }}>{d.value}</div>
          </div>
        ))}
      </div>

      {/* ── Accounts + Why ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Account types */}
        <div style={{ padding: '20px 22px', borderRight: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 3, height: 12, background: accent, borderRadius: 2, display: 'inline-block' }} />
            {accLabel}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {accounts.map((a, i) => (
              <div key={i} style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${a.badge ? '#3ECF8E' : accent}`,
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.15s',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.name}</span>
                    {a.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#3ECF8E',
                        background: 'rgba(62,207,142,0.12)', border: '1px solid rgba(62,207,142,0.3)',
                        borderRadius: 20, padding: '1px 7px',
                      }}>{a.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{a.info}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: accent,
                  background: `${accent}12`, border: `1px solid ${accent}30`,
                  borderRadius: 6, padding: '4px 10px', whiteSpace: 'nowrap',
                }}>{a.fee}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why section */}
        <div style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 3, height: 12, background: accent, borderRadius: 2, display: 'inline-block' }} />
            {whyLabel}
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {why.map((w, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  background: `${accent}18`, border: `1px solid ${accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>
                  <svg viewBox="0 0 12 12" fill="none" style={{ width: 8, height: 8 }}>
                    <polyline points="2,6 5,9 10,3" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

export default function BrokersTab({ lang = 'en' }) {
  const tx = ui[lang] || ui.en;
  return (
    <div style={{ padding: '0 0 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>{tx.heading}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 6px' }}>{tx.subhead}</p>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{tx.note}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {brokers.map(b => <BrokerCard key={b.id} broker={b} lang={lang} ui={tx} />)}
      </div>
    </div>
  );
}
