import { useState } from 'react';

const faq = {
  en: [
    {
      category: 'Getting Started',
      items: [
        {
          q: 'How do I get my license key?',
          a: 'Your license key is automatically generated when you purchase. Go to the License Keys tab in this portal — you will see your key listed there. Click the copy icon to copy it.',
        },
        {
          q: 'Where do I download the EA file?',
          a: 'Log in to your Whop account and go to the LT Empire product page. Navigate to the Files section and download LTE_Gold_v1.01.ex5. Only download from the official Whop page to ensure you have the latest version.',
        },
        {
          q: 'Do I need a VPS to run the EA?',
          a: 'A VPS (Virtual Private Server) is strongly recommended so the EA runs 24/5 without interruption. If you run it on a home PC, the EA will stop trading whenever your computer is off or loses internet connection.',
        },
        {
          q: 'Can I use the EA on multiple accounts?',
          a: 'Each license covers one live trading account. If you want to run the EA on additional accounts, you will need an additional license. Contact support to discuss multi-account options.',
        },
      ],
    },
    {
      category: 'Installation & Setup',
      items: [
        {
          q: 'Which MetaTrader version do I need — MT4 or MT5?',
          a: 'LTE Gold EA requires MetaTrader 5 (MT5). It is not compatible with MT4. Make sure your broker provides an MT5 account.',
        },
        {
          q: "Why can't I see the EA in my Navigator panel?",
          a: 'After pasting the .ex5 file into MQL5 → Experts folder, you must refresh the Navigator panel. Right-click the Experts folder in the Navigator and select Refresh. If it still does not appear, restart MT5.',
        },
        {
          q: 'What timeframe should I run the EA on?',
          a: 'Attach the EA to a Gold (XAUUSD) chart on the H1 (1-hour) timeframe. Using a different timeframe may cause the EA to behave incorrectly.',
        },
        {
          q: 'What settings should I use for the EA inputs?',
          a: 'Paste your license key into the License Key field. For lot size, start conservatively — 0.01 lots per $1,000 balance is a safe starting point. Refer to the MT5 Guide tab for a full walkthrough of all input parameters.',
        },
      ],
    },
    {
      category: 'Brokers & Accounts',
      items: [
        {
          q: 'Which broker do you recommend?',
          a: 'We recommend JustMarkets for retail trading — low minimum deposit ($10), high leverage up to 1:3000, and full MT5 compatibility. For prop firm trading, The5ers is our top pick. See the Brokers tab for full details and sign-up links.',
        },
        {
          q: 'What account type should I open?',
          a: 'For JustMarkets, the Raw Spread account is recommended for the best execution — 0.0 pip spreads with a small commission. The Standard account ($10 minimum) is a good starting point if you are new.',
        },
        {
          q: 'What minimum deposit do I need?',
          a: 'You can start with as little as $10 on JustMarkets Standard account. However, for safer risk management we recommend a minimum of $500–$1,000 so you can trade with appropriate lot sizes.',
        },
        {
          q: 'Does the EA work with swap-free (Islamic) accounts?',
          a: 'Yes. JustMarkets offers swap-free Islamic accounts that are fully compatible with LTE Gold EA. You can request a swap-free account directly through JustMarkets after opening your account.',
        },
      ],
    },
    {
      category: 'Troubleshooting',
      items: [
        {
          q: 'The EA is not trading — what is wrong?',
          a: 'Check the following: (1) AutoTrading is enabled in the MT5 toolbar — the button should be green. (2) The EA smiley face on the chart is not grey. (3) Your license key is entered correctly with no extra spaces. (4) The chart is set to XAUUSD on H1. (5) You have sufficient margin in your account.',
        },
        {
          q: 'I see "License Key Required" — what do I do?',
          a: 'This means the EA did not receive a valid license key. Go to the License Keys tab, copy your key exactly, then open the EA parameters in MT5 (right-click the EA on chart → Properties → Inputs) and paste it into the License Key field. Click OK.',
        },
        {
          q: 'AutoTrading is enabled but the EA still will not trade?',
          a: 'Make sure "Allow automated trading" is checked in the EA\'s own settings. Right-click the EA on the chart → Properties → Common tab → check "Allow automated trading". Also verify the WebRequest URL (ltempire.com) is added in MT5 Tools → Options → Expert Advisors.',
        },
        {
          q: 'The EA was working but suddenly stopped?',
          a: 'Common causes: (1) MT5 lost internet connection and did not reconnect. (2) Your VPS restarted and MT5 was not set to auto-start. (3) Your membership or license expired. (4) The broker changed the symbol name (e.g. XAUUSD to GOLD). Check the Experts log tab in MT5 for error messages.',
        },
      ],
    },
    {
      category: 'Membership',
      items: [
        {
          q: 'My license shows as expired — what do I do?',
          a: 'Log in to your Whop account and check your membership status. If it has expired, you can renew it directly through Whop. Once renewed, your license will become active again automatically — no changes needed in MT5.',
        },
        {
          q: 'Can I transfer my license to a new account?',
          a: 'Yes. Go to the Accounts tab in this portal and delete the old account entry. The next time the EA runs on your new MT5 account it will register automatically using the same license key.',
        },
        {
          q: 'How do I get support?',
          a: 'Join our Discord community using the link in the sidebar — it is the fastest way to get help. You can also reach us through the LT Empire Whop page. Please include your license key (first 8 characters only) and a screenshot of the MT5 Experts log when asking for help.',
        },
      ],
    },
  ],

  zh: [
    {
      category: '快速入门',
      items: [
        {
          q: '如何获取我的许可证密钥？',
          a: '您购买后系统会自动生成许可证密钥。进入本门户的"许可证密钥"选项卡，即可看到您的密钥。点击复制图标即可复制。',
        },
        {
          q: '在哪里下载 EA 文件？',
          a: '登录您的 Whop 账户，进入 LT Empire 产品页面，在"文件"板块下载 LTE_Gold_v1.01.ex5 文件。请务必从官方 Whop 页面下载以确保版本最新。',
        },
        {
          q: '运行 EA 需要 VPS 吗？',
          a: '强烈建议使用 VPS（虚拟专用服务器），以确保 EA 全天候不间断运行。若在家用电脑上运行，一旦电脑关机或断网，EA 将停止交易。',
        },
        {
          q: '我可以在多个账户上使用 EA 吗？',
          a: '每个许可证仅限一个真实交易账户使用。如需在更多账户上运行 EA，需购买额外许可证。如需多账户方案，请联系客服。',
        },
      ],
    },
    {
      category: '安装与设置',
      items: [
        {
          q: '我需要 MT4 还是 MT5？',
          a: 'LTE Gold EA 仅支持 MetaTrader 5（MT5），不兼容 MT4。请确保您的经纪商提供 MT5 账户。',
        },
        {
          q: '为什么在导航器面板中看不到 EA？',
          a: '将 .ex5 文件粘贴到 MQL5 → Experts 文件夹后，需要刷新导航器面板。右键点击导航器中的 Experts 文件夹，选择"刷新"。若仍未显示，请重启 MT5。',
        },
        {
          q: 'EA 应在哪个时间周期运行？',
          a: '请将 EA 挂载到黄金（XAUUSD）图表上，使用 H1（1小时）时间周期。使用其他时间周期可能导致 EA 运行异常。',
        },
        {
          q: 'EA 输入参数应如何设置？',
          a: '将您的许可证密钥粘贴到许可证密钥字段中。手数方面，建议保守起步——每 $1,000 账户余额使用 0.01 手是较安全的起点。完整参数说明请参阅"安装指南"选项卡。',
        },
      ],
    },
    {
      category: '经纪商与账户',
      items: [
        {
          q: '推荐使用哪家经纪商？',
          a: '零售交易推荐 JustMarkets——最低入金 $10，杠杆高达 1:3000，完全兼容 MT5。资金账户交易推荐 The5ers。详情及注册链接请查看"推荐经纪商"选项卡。',
        },
        {
          q: '应开设哪种账户类型？',
          a: '推荐 JustMarkets 的 Raw Spread 账户，执行效率最优——0.0 点差，仅收取少量佣金。若您是新手，Standard 账户（最低 $10）也是不错的起点。',
        },
        {
          q: '最低需要入金多少？',
          a: '使用 JustMarkets Standard 账户最低仅需 $10 即可开始。但为了更安全的风险管理，建议最低入金 $500–$1,000，以便使用合适的手数进行交易。',
        },
        {
          q: 'EA 是否兼容免隔夜费（伊斯兰）账户？',
          a: '是的。JustMarkets 提供与 LTE Gold EA 完全兼容的免隔夜费伊斯兰账户。开户后可直接向 JustMarkets 申请开通免隔夜费账户。',
        },
      ],
    },
    {
      category: '故障排查',
      items: [
        {
          q: 'EA 没有交易，是什么原因？',
          a: '请检查以下几点：(1) MT5 工具栏中的"自动交易"按钮是否为绿色；(2) 图表上 EA 的笑脸图标是否正常；(3) 许可证密钥输入是否正确，无多余空格；(4) 图表是否为 XAUUSD H1；(5) 账户是否有足够保证金。',
        },
        {
          q: '出现"License Key Required"提示，怎么办？',
          a: '这表示 EA 未收到有效许可证密钥。请进入"许可证密钥"选项卡复制您的密钥，然后在 MT5 中右键点击图表上的 EA → 属性 → 输入参数，将密钥粘贴到许可证密钥字段，点击确定。',
        },
        {
          q: '已启用自动交易，但 EA 仍不交易？',
          a: '请确认 EA 自身设置中已勾选"允许自动交易"。右键点击图表上的 EA → 属性 → 通用选项卡 → 勾选"允许自动交易"。同时确认已在 MT5 工具 → 选项 → 智能交易系统中添加 ltempire.com 的 WebRequest 权限。',
        },
        {
          q: 'EA 之前运行正常，突然停止了？',
          a: '常见原因：(1) MT5 断网后未重新连接；(2) VPS 重启后 MT5 未设置为自动启动；(3) 会员资格或许可证已到期；(4) 经纪商修改了品种名称（如 XAUUSD 改为 GOLD）。请查看 MT5 专家顾问日志选项卡中的错误信息。',
        },
      ],
    },
    {
      category: '会员资格',
      items: [
        {
          q: '我的许可证显示已过期，怎么办？',
          a: '请登录您的 Whop 账户查看会员状态。如已过期，可直接在 Whop 上续费。续费成功后，您的许可证将自动恢复有效——无需在 MT5 中做任何更改。',
        },
        {
          q: '我可以将许可证转移到新账户吗？',
          a: '可以。进入本门户的"账户"选项卡，删除旧账户记录。下次在新 MT5 账户上运行 EA 时，系统将使用相同的许可证密钥自动注册。',
        },
        {
          q: '如何获取技术支持？',
          a: '使用侧边栏中的链接加入我们的 Discord 社区——这是获取帮助最快捷的方式。您也可以通过 LT Empire 的 Whop 页面联系我们。寻求帮助时，请提供您的许可证密钥（前8位即可）及 MT5 专家顾问日志的截图。',
        },
      ],
    },
  ],
};

const catIcons = [
  /* Getting Started */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, flexShrink: 0 }}><path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  /* Installation */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, flexShrink: 0 }}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" strokeLinecap="round"/></svg>,
  /* Brokers */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, flexShrink: 0 }}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round"/><line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round"/><line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round"/></svg>,
  /* Troubleshooting */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round"/></svg>,
  /* Membership */
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 15, height: 15, flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round"/><circle cx="12" cy="7" r="4"/></svg>,
];

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ width: 14, height: 14, flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
      <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqItem({ item, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      borderLeft: open ? '3px solid var(--gold)' : '3px solid transparent',
      transition: 'border-color 0.2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 14, padding: '16px 20px', background: open ? 'var(--gold-alpha)' : 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: open ? 'var(--gold)' : 'var(--text)', lineHeight: 1.5, transition: 'color 0.2s' }}>
          {item.q}
        </span>
        <span style={{ color: open ? 'var(--gold)' : 'var(--text-dim)', transition: 'color 0.2s', marginTop: 2, flexShrink: 0 }}>
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px 20px', background: 'var(--gold-alpha)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, margin: 0, paddingTop: 2 }}>
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FaqTab({ lang = 'en' }) {
  const data = faq[lang] || faq.en;
  const [activeCat, setActiveCat] = useState(0);
  const cat = data[activeCat];

  return (
    <div style={{ padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>
          {lang === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          {lang === 'zh' ? '找不到答案？通过侧边栏加入我们的 Discord 社区。' : "Can't find an answer? Join our Discord via the sidebar."}
        </p>
      </div>

      {/* Two-column layout */}
      <style>{`@media(max-width:640px){.faq-grid{grid-template-columns:1fr!important}}`}</style>
      <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Left — category list */}
        <div style={{
          background: 'var(--bg-table)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
        }}>
          {data.map((c, ci) => (
            <button
              key={ci}
              onClick={() => setActiveCat(ci)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeCat === ci ? 'var(--gold-alpha)' : 'transparent',
                borderLeft: activeCat === ci ? '3px solid var(--gold)' : '3px solid transparent',
                borderBottom: ci < data.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'all 0.18s',
              }}
            >
              <span style={{ color: activeCat === ci ? 'var(--gold)' : 'var(--text-dim)', transition: 'color 0.18s', display: 'flex' }}>{catIcons[ci]}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: activeCat === ci ? 'var(--gold)' : 'var(--text)', lineHeight: 1.3, transition: 'color 0.18s' }}>
                  {c.category}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                  {c.items.length} {lang === 'zh' ? '个问题' : 'questions'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right — questions */}
        <div style={{
          background: 'var(--bg-table)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
        }}>
          {/* Category header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, var(--gold-alpha), transparent)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: 'var(--gold)', display: 'flex' }}>{catIcons[activeCat]}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{cat.category}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
                {cat.items.length} {lang === 'zh' ? '个问题' : 'questions'}
              </div>
            </div>
          </div>

          {/* Q&A list */}
          <div>
            {cat.items.map((item, ii) => (
              <FaqItem key={`${activeCat}-${ii}`} item={item} isLast={ii === cat.items.length - 1} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
