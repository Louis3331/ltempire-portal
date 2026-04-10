import { useState } from 'react';

/* ── Translations ───────────────────────────────────────── */
const g = {
  en: {
    hero:    'Get Started in Minutes',
    heroSub: 'Follow the steps below to install and activate your EA on MetaTrader 5.',
    steps: [
      {
        title: 'Copy Your License Key',
        desc:  'Go to the License Keys tab in this portal. Click the copy icon next to your key — you will need it in Step 7.',
        tip:   'Make sure your membership is Active before proceeding.',
        tipType: 'info',
      },
      {
        title: 'Download EA from Whop',
        desc:  'Log in to your Whop account and navigate to the LT Empire product page. Download the LTE_Gold_v1.01.ex5 file from the Files section.',
        tip:   'Only download from the official Whop page to ensure you have the latest version.',
        tipType: 'warn',
      },
      {
        title: 'Open MT5 Data Folder',
        desc:  'Open MetaTrader 5. In the top menu click File → Open Data Folder. A Windows Explorer window will open.',
        tip:   null,
      },
      {
        title: 'Install the EA File',
        desc:  'Inside the Data Folder navigate to MQL5 → Experts. Paste the LTE_Gold_v1.01.ex5 file here. Then in MT5 right-click the Experts folder in Navigator and click Refresh.',
        tip:   'Do not rename the file. Keep the original filename.',
        tipType: 'warn',
      },
      {
        title: 'Allow Web Requests',
        desc:  'In MT5 go to Tools → Options → Expert Advisors tab. Check "Allow WebRequests for listed URL". Add the URL below and click OK.',
        tip:   'https://www.ltempire.com',
        tipType: 'copy',
      },
      {
        title: 'Attach EA to Chart',
        desc:  'Open a XAUUSD chart (M15 or H1 timeframe recommended). In the Navigator panel find LTE Gold under Expert Advisors and double-click or drag it onto the chart.',
        tip:   'Use M15 or H1 timeframe for best results.',
        tipType: 'info',
      },
      {
        title: 'Enter Your License Key',
        desc:  'The EA Parameters window will open. Go to the Inputs tab. Find the InpLicenseKey field and paste the license key you copied in Step 1. Click OK.',
        tip:   null,
      },
      {
        title: 'Enable AutoTrading',
        desc:  'Click the AutoTrading button in the MT5 toolbar (it should turn green). A smiley face icon ☺ will appear on the top-right of your chart — this means the EA is running correctly.',
        tip:   'If you see a sad face ☹ check the Experts tab at the bottom for error details.',
        tipType: 'warn',
      },
    ],
    faqs: [
      { q: 'EA shows error 1009 — what do I do?',          a: 'This means WebRequests are blocked. Go to Tools → Options → Expert Advisors and add https://www.ltempire.com to the allowed URLs list.' },
      { q: 'My license key says Invalid.',                  a: 'Make sure you copied the full key from the License Keys tab without any extra spaces. Also ensure your Whop membership is still Active.' },
      { q: 'EA is not showing in the Navigator panel.',     a: 'Right-click the Expert Advisors folder in the Navigator and select Refresh. If it still doesn\'t appear, restart MetaTrader 5.' },
      { q: 'How do I update to a new EA version?',          a: 'Download the new .ex5 file from Whop, replace the old file in MQL5 → Experts, then restart MT5 or refresh Navigator.' },
      { q: 'Can I run the EA on multiple accounts?',        a: 'Each license allows up to 2 registered MT5 accounts. You can manage your accounts in the Accounts tab of this portal.' },
    ],
    faqTitle:  'Frequently Asked Questions',
    stepLabel: 'Step',
    tip:       'Tip',
    warning:   'Important',
    copyBtn:   'Copy URL',
    copied:    'Copied!',
    done:      'You\'re all set!',
    doneSub:   'Your EA is now active. Monitor the Experts tab in MT5 for trade activity.',
  },
  zh: {
    hero:    '几分钟内快速上手',
    heroSub: '按照以下步骤在 MetaTrader 5 上安装并激活您的 EA。',
    steps: [
      {
        title: '复制您的许可证密钥',
        desc:  '进入本门户的"许可证密钥"选项卡，点击密钥旁边的复制图标，第 7 步将会用到。',
        tip:   '请确保您的会员状态为"有效"后再继续。',
        tipType: 'info',
      },
      {
        title: '从 Whop 下载 EA',
        desc:  '登录您的 Whop 账户并进入 LT Empire 产品页面，在文件区域下载 LTE_Gold_v1.01.ex5 文件。',
        tip:   '请仅从官方 Whop 页面下载，以确保获取最新版本。',
        tipType: 'warn',
      },
      {
        title: '打开 MT5 数据文件夹',
        desc:  '打开 MetaTrader 5，在顶部菜单点击 文件 → 打开数据文件夹，将会弹出一个文件资源管理器窗口。',
        tip:   null,
      },
      {
        title: '安装 EA 文件',
        desc:  '在数据文件夹中导航到 MQL5 → Experts，将 LTE_Gold_v1.01.ex5 文件粘贴到此处。然后在 MT5 导航器中右键点击 Expert Advisors 文件夹并选择"刷新"。',
        tip:   '请勿重命名文件，保持原始文件名。',
        tipType: 'warn',
      },
      {
        title: '允许 WebRequest',
        desc:  '在 MT5 中进入 工具 → 选项 → Expert Advisors 选项卡，勾选"允许以下 URL 的 WebRequest"，添加下方网址并点击确定。',
        tip:   'https://www.ltempire.com',
        tipType: 'copy',
      },
      {
        title: '将 EA 附加到图表',
        desc:  '打开 XAUUSD 图表（建议使用 M15 或 H1 时间框架），在导航器面板中找到 LTE Gold，双击或拖拽到图表上。',
        tip:   '建议使用 M15 或 H1 时间框架以获得最佳效果。',
        tipType: 'info',
      },
      {
        title: '输入您的许可证密钥',
        desc:  'EA 参数窗口将会打开，进入"输入"选项卡，找到 InpLicenseKey 字段并粘贴您在第 1 步复制的密钥，然后点击确定。',
        tip:   null,
      },
      {
        title: '启用自动交易',
        desc:  '点击 MT5 工具栏中的"自动交易"按钮（变为绿色），图表右上角将出现一个笑脸图标 ☺，表示 EA 正在正常运行。',
        tip:   '如果出现哭脸 ☹，请查看底部的 Experts 选项卡以了解错误详情。',
        tipType: 'warn',
      },
    ],
    faqs: [
      { q: 'EA 显示错误 1009，怎么办？',          a: '这意味着 WebRequests 被阻止。进入 工具 → 选项 → Expert Advisors，将 https://www.ltempire.com 添加到允许的 URL 列表中。' },
      { q: '我的许可证密钥显示无效。',              a: '请确保您从许可证密钥选项卡完整复制了密钥，没有多余的空格，同时确认您的 Whop 会员资格仍处于有效状态。' },
      { q: 'EA 未显示在导航器面板中。',             a: '右键点击导航器中的 Expert Advisors 文件夹并选择"刷新"。如果仍未显示，请重启 MetaTrader 5。' },
      { q: '如何更新到新版本的 EA？',              a: '从 Whop 下载新的 .ex5 文件，替换 MQL5 → Experts 中的旧文件，然后重启 MT5 或刷新导航器。' },
      { q: '我可以在多个账户上运行 EA 吗？',        a: '每个许可证最多允许注册 2 个 MT5 账户，您可以在本门户的"账户"选项卡中管理您的账户。' },
    ],
    faqTitle:  '常见问题',
    stepLabel: '步骤',
    tip:       '提示',
    warning:   '重要',
    copyBtn:   '复制网址',
    copied:    '已复制！',
    done:      '一切就绪！',
    doneSub:   'EA 现已激活，请在 MT5 的 Experts 选项卡中监控交易活动。',
  },
};

/* ── Step SVGs ──────────────────────────────────────────── */
const W = 400, H = 220;
const Win = ({ title, children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
    <rect width={W} height={H} rx="8" fill="#0d0d0d" stroke="#252525" strokeWidth="1" />
    {/* Title bar */}
    <rect width={W} height="28" rx="8" fill="#161616" />
    <rect y="16" width={W} height="12" fill="#161616" />
    <circle cx="12" cy="14" r="4" fill="#E05252" opacity="0.7" />
    <circle cx="24" cy="14" r="4" fill="#C9A84C" opacity="0.7" />
    <circle cx="36" cy="14" r="4" fill="#3ECF8E" opacity="0.7" />
    <text x={W / 2} y="19" textAnchor="middle" fill="#555" fontSize="9" fontFamily="system-ui,sans-serif">{title}</text>
    {children}
  </svg>
);

/* Gold glow highlight box */
const Highlight = ({ x, y, w, h, label, labelX, labelY, arrow = 'down' }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="4" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
    <rect x={x} y={y} width={w} height={h} rx="4" fill="rgba(201,168,76,0.08)" />
    {label && <>
      <text x={labelX ?? x + w / 2} y={labelY ?? (arrow === 'down' ? y - 6 : y + h + 14)} textAnchor="middle" fill="#C9A84C" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">{label}</text>
      {arrow === 'down' && <path d={`M${labelX ?? x + w / 2} ${y - 4} L${labelX ?? x + w / 2} ${y}`} stroke="#C9A84C" strokeWidth="1" markerEnd="url(#arr)" />}
      {arrow === 'up'   && <path d={`M${labelX ?? x + w / 2} ${y + h + 12} L${labelX ?? x + w / 2} ${y + h}`} stroke="#C9A84C" strokeWidth="1" markerEnd="url(#arr)" />}
    </>}
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#C9A84C" />
      </marker>
    </defs>
  </g>
);

const Svg1 = () => (
  <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
    {/* Dark background */}
    <rect width={W} height={H} rx="8" fill="#0d0d0d" stroke="#252525" strokeWidth="1" />

    {/* Centered card */}
    <rect x="60" y="40" width="280" height="140" rx="8" fill="#111111" stroke="#1e1e1e" strokeWidth="1" />

    {/* LICENSE KEY header row */}
    <rect x="60" y="40" width="280" height="36" rx="8" fill="#0d0d0d" />
    <rect x="60" y="60" width="280" height="16" fill="#0d0d0d" />
    <text x="80" y="62" fill="#444" fontSize="8" fontFamily="system-ui,sans-serif" letterSpacing="1.5" fontWeight="600">LICENSE KEY</text>

    {/* Divider */}
    <rect x="60" y="76" width="280" height="1" fill="#1e1e1e" />

    {/* Key row */}
    <rect x="60" y="77" width="280" height="50" fill="#111111" />

    {/* Gold license key text */}
    <text x="80" y="108" fill="#C9A84C" fontSize="13" fontFamily="monospace" fontWeight="500" letterSpacing="0.5">L-XXXXXX-XXXXXXXX-XXXXXXX</text>

    {/* Copy button */}
    <rect x="294" y="96" width="26" height="20" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
    {/* Copy icon — two overlapping squares */}
    <rect x="300" y="100" width="10" height="10" rx="1.5" fill="none" stroke="#666" strokeWidth="1.5" />
    <rect x="303" y="103" width="10" height="10" rx="1.5" fill="#1a1a1a" stroke="#666" strokeWidth="1.5" />

    {/* Gold glow highlight on copy button */}
    <rect x="292" y="94" width="30" height="24" rx="5" fill="rgba(201,168,76,0.10)" stroke="#C9A84C" strokeWidth="1.5" />

    {/* Arrow + label */}
    <line x1="307" y1="88" x2="307" y2="93" stroke="#C9A84C" strokeWidth="1.5" markerEnd="url(#arr1)" />
    <text x="307" y="84" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">Click to copy</text>

    <defs>
      <marker id="arr1" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
        <path d="M0,0 L3,6 L6,0" fill="none" stroke="#C9A84C" strokeWidth="1.2" />
      </marker>
    </defs>
  </svg>
);

const Svg2 = () => (
  <Win title="Whop — LT Empire">
    {/* Page bg */}
    <rect x="0" y="28" width={W} height={H - 28} fill="#111" />
    {/* Header bar */}
    <rect x="0" y="28" width={W} height="28" fill="#0d0d0d" stroke="#1a1a1a" strokeWidth="1" />
    <text x="16" y="46" fill="#C9A84C" fontSize="11" fontFamily="system-ui,sans-serif" fontWeight="700">whop</text>
    <text x="280" y="46" fill="#777" fontSize="9" fontFamily="system-ui,sans-serif">LT Empire Community</text>
    {/* Card */}
    <rect x="60" y="70" width="280" height="120" rx="8" fill="#0d0d0d" stroke="#222" strokeWidth="1" />
    <text x="80" y="96" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif" letterSpacing="0.5">FILES</text>
    <rect x="72" y="102" width="256" height="34" rx="5" fill="#151515" stroke="#252525" />
    {/* File icon */}
    <rect x="80" y="108" width="18" height="22" rx="2" fill="#1a1a1a" stroke="#333" />
    <text x="89" y="123" textAnchor="middle" fill="#C9A84C" fontSize="7" fontFamily="system-ui,sans-serif">.ex5</text>
    <text x="104" y="116" fill="#ccc" fontSize="9" fontFamily="system-ui,sans-serif">LTE_Gold_v1.01.ex5</text>
    <text x="104" y="128" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">245 KB · Latest version</text>
    {/* Download button */}
    <rect x="116" y="148" width="168" height="30" rx="6" fill="url(#gbtn)" />
    <defs><linearGradient id="gbtn" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#9B7B2F"/></linearGradient></defs>
    <text x="200" y="168" textAnchor="middle" fill="#0a0a0a" fontSize="11" fontFamily="system-ui,sans-serif" fontWeight="700">↓ Download</text>
    <Highlight x="114" y="146" w="172" h="34" label="Click Download" labelX="200" labelY="136" arrow="down" />
  </Win>
);

const Svg3 = () => {
  const menuItems = [
    { label: 'New Chart',        hot: '',               sep: false, hi: false },
    { label: 'Open Deleted',     hot: '',               sep: false, hi: false },
    { label: 'Profiles',         hot: '',               sep: false, hi: false },
    { label: 'Close',            hot: 'Ctrl+F4',        sep: false, hi: false },
    { label: 'Save',             hot: 'Ctrl+S',         sep: false, hi: false },
    { label: 'Save as Picture',  hot: '',               sep: false, hi: false },
    { label: null,               hot: '',               sep: true,  hi: false },
    { label: 'Open Data Folder', hot: 'Ctrl+Shift+D',   sep: false, hi: true  },
    { label: null,               hot: '',               sep: true,  hi: false },
    { label: 'Print',            hot: 'Ctrl+P',         sep: false, hi: false },
    { label: 'Print Preview',    hot: '',               sep: false, hi: false },
  ];
  const dropW = 190, rowH = 17, dropX = 4, dropY = 50;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
      {/* Window bg */}
      <rect width={W} height={H} rx="8" fill="#1c1c1c" stroke="#333" strokeWidth="1" />
      {/* Title bar */}
      <rect width={W} height="22" rx="8" fill="#2a2a2a" />
      <rect y="14" width={W} height="8" fill="#2a2a2a" />
      <circle cx="12" cy="11" r="4" fill="#E05252" opacity="0.8" />
      <circle cx="24" cy="11" r="4" fill="#C9A84C" opacity="0.8" />
      <circle cx="36" cy="11" r="4" fill="#3ECF8E" opacity="0.8" />
      <text x={W / 2} y="15" textAnchor="middle" fill="#666" fontSize="8" fontFamily="system-ui,sans-serif">MetaTrader 5</text>
      {/* Menu bar */}
      <rect y="22" width={W} height="18" fill="#242424" />
      {/* "File" tab — active/pressed */}
      <rect x={dropX} y="22" width="28" height="18" fill="#1a1a1a" />
      <text x="18" y="34" textAnchor="middle" fill="#e0e0e0" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="600">File</text>
      {['View','Insert','Charts','Tools','Window','Help'].map((m, i) => (
        <text key={m} x={38 + i * 46} y="34" fill="#999" fontSize="9" fontFamily="system-ui,sans-serif">{m}</text>
      ))}
      {/* Dropdown panel */}
      <rect x={dropX} y={dropY} width={dropW} height={menuItems.length * rowH + 8} rx="3" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1" />
      {menuItems.map(({ label, hot, sep, hi }, i) => {
        const y = dropY + 4 + i * rowH;
        if (sep) return <rect key={i} x={dropX + 4} y={y + 7} width={dropW - 8} height="1" fill="#333" />;
        return (
          <g key={i}>
            {hi && <rect x={dropX + 2} y={y + 1} width={dropW - 4} height={rowH - 2} rx="2" fill="#3a6bc4" />}
            <text x={dropX + 22} y={y + 12} fill={hi ? '#fff' : '#ccc'} fontSize="9" fontFamily="system-ui,sans-serif" fontWeight={hi ? '600' : '400'}>{label}</text>
            {hot && <text x={dropX + dropW - 5} y={y + 12} textAnchor="end" fill={hi ? '#aad4ff' : '#666'} fontSize="8" fontFamily="system-ui,sans-serif">{hot}</text>}
            {/* folder icon for Open Data Folder */}
            {hi && <text x={dropX + 8} y={y + 12} fill="#f0c040" fontSize="9" fontFamily="system-ui,sans-serif">📁</text>}
          </g>
        );
      })}
      {/* Gold callout arrow from right side */}
      <line x1={dropX + dropW + 55} y1="148" x2={dropX + dropW + 4} y2="148" stroke="#C9A84C" strokeWidth="1.5" markerEnd="url(#arr3)" />
      <rect x={dropX + dropW + 58} y="138" width="88" height="20" rx="4" fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="1" />
      <text x={dropX + dropW + 102} y="151" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">Click here</text>
      <defs>
        <marker id="arr3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#C9A84C" />
        </marker>
      </defs>
    </svg>
  );
};

const Svg4 = () => (
  <Win title="MQL5 › Experts">
    {/* Address bar */}
    <rect x="0" y="28" width={W} height="22" fill="#141414" />
    <rect x="8" y="32" width="290" height="14" rx="3" fill="#0d0d0d" stroke="#252525" />
    <text x="14" y="42" fill="#777" fontSize="7.5" fontFamily="system-ui,sans-serif">📁 MQL5  ›  Experts</text>
    {/* Toolbar buttons */}
    <rect x="306" y="32" width="40" height="14" rx="3" fill="#1a1a1a" stroke="#252525" />
    <text x="326" y="42" textAnchor="middle" fill="#888" fontSize="7.5" fontFamily="system-ui,sans-serif">Paste</text>
    {/* Files area */}
    <rect x="0" y="50" width={W} height={H - 50} fill="#0d0d0d" />
    {/* Existing file */}
    <rect x="20" y="68" width="60" height="70" rx="4" fill="#151515" stroke="#222" />
    <text x="50" y="100" textAnchor="middle" fill="#555" fontSize="20" fontFamily="system-ui,sans-serif">📄</text>
    <text x="50" y="128" textAnchor="middle" fill="#555" fontSize="6.5" fontFamily="system-ui,sans-serif">SomeOther.ex5</text>
    {/* New file being dropped */}
    <rect x="100" y="62" width="70" height="80" rx="4" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4,2" />
    <text x="135" y="100" textAnchor="middle" fill="#C9A84C" fontSize="18">📥</text>
    <text x="135" y="114" textAnchor="middle" fill="#C9A84C" fontSize="6.5" fontFamily="system-ui,sans-serif" fontWeight="600">LTE Gold</text>
    <text x="135" y="124" textAnchor="middle" fill="#C9A84C" fontSize="6.5" fontFamily="system-ui,sans-serif" fontWeight="600">_GOLD.ex5</text>
    <text x="135" y="136" textAnchor="middle" fill="#C9A84C" fontSize="7" fontFamily="system-ui,sans-serif">DROP HERE</text>
    {/* Arrow */}
    <path d="M250,95 Q220,95 186,95" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arr2)" />
    <defs>
      <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#C9A84C" />
      </marker>
    </defs>
    <text x="270" y="88" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="600">Paste .ex5 file</text>
    <text x="270" y="100" fill="#777" fontSize="7.5" fontFamily="system-ui,sans-serif">here</text>
    {/* Then refresh instruction */}
    <rect x="196" y="145" width="196" height="28" rx="4" fill="#151515" stroke="#252525" />
    <text x="206" y="157" fill="#888" fontSize="7.5" fontFamily="system-ui,sans-serif">Then in MT5 Navigator:</text>
    <text x="206" y="168" fill="#C9A84C" fontSize="7.5" fontFamily="system-ui,sans-serif">Right-click Experts → Refresh</text>
  </Win>
);

const Svg5 = () => (
  <Win title="MetaTrader 5 — Options">
    {/* Dialog bg */}
    <rect x="30" y="32" width="340" height="175" rx="6" fill="#141414" stroke="#2a2a2a" />
    {/* Tab strip */}
    <rect x="30" y="32" width="340" height="22" rx="6" fill="#0d0d0d" />
    <rect y="46" x="30" width="340" height="8" fill="#0d0d0d" />
    {['Charts','Expert Advisors','Events','Objects'].map((tab, i) => (
      <g key={tab}>
        {i === 1 && <rect x={32 + i * 80} y="32" width="80" height="22" rx="4" fill="#1e1e1e" />}
        <text x={72 + i * 80} y="46" textAnchor="middle" fill={i === 1 ? '#C9A84C' : '#555'} fontSize="8" fontFamily="system-ui,sans-serif" fontWeight={i === 1 ? '600' : '400'}>{tab}</text>
      </g>
    ))}
    {/* Content */}
    <text x="46" y="72" fill="#777" fontSize="8" fontFamily="system-ui,sans-serif">✅  Allow automated trading</text>
    <text x="46" y="88" fill="#777" fontSize="8" fontFamily="system-ui,sans-serif">✅  Allow DLL imports</text>
    {/* WebRequest checkbox — highlighted */}
    <rect x="42" y="96" width="310" height="16" rx="2" fill="rgba(201,168,76,0.06)" />
    <rect x="44" y="98" width="10" height="10" rx="2" fill="#C9A84C" />
    <text x="54" y="107" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif">✓</text>
    <text x="60" y="107" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="600">Allow WebRequests for listed URL:</text>
    {/* URL input */}
    <rect x="44" y="116" width="230" height="16" rx="3" fill="#0d0d0d" stroke="#C9A84C" strokeWidth="1" />
    <text x="50" y="127" fill="#C9A84C" fontSize="8" fontFamily="monospace">https://www.ltempire.com</text>
    {/* Add button */}
    <rect x="280" y="116" width="60" height="16" rx="3" fill="#1a1a1a" stroke="#333" />
    <text x="310" y="127" textAnchor="middle" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif">Add</text>
    <Highlight x="42" y="94" w="314" h="42" label="Check this & add the URL" labelX="200" labelY="84" arrow="down" />
    {/* OK button */}
    <rect x="290" y="172" width="60" height="20" rx="4" fill="url(#gbtn2)" />
    <defs><linearGradient id="gbtn2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#9B7B2F"/></linearGradient></defs>
    <text x="320" y="185" textAnchor="middle" fill="#0a0a0a" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">OK</text>
  </Win>
);

const Svg6 = () => (
  <Win title="MetaTrader 5 — XAUUSD, H1">
    {/* Navigator panel */}
    <rect x="0" y="28" width="110" height={H - 28} fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="1" />
    <text x="8" y="44" fill="#555" fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="0.5">NAVIGATOR</text>
    <text x="8" y="58" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">▶ Indicators</text>
    <text x="8" y="72" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif">▼ Expert Advisors</text>
    <rect x="6" y="76" width="98" height="16" rx="3" fill="rgba(201,168,76,0.12)" />
    <text x="14" y="87" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="600">LTE Gold</text>
    <text x="8" y="108" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">▶ Scripts</text>
    {/* Drag arrow */}
    <path d="M104,84 Q135,84 155,110" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arr3)" />
    <defs>
      <marker id="arr3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#C9A84C" />
      </marker>
    </defs>
    <text x="118" y="78" fill="#C9A84C" fontSize="7.5" fontFamily="system-ui,sans-serif">Drag to chart</text>
    {/* Chart area */}
    <rect x="110" y="28" width={W - 110} height={H - 28} fill="#0d0d0d" />
    <text x="120" y="44" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif">XAUUSD, H1</text>
    {/* Candlestick chart */}
    {[
      [140,80,100,60], [155,75,105,65], [170,90,110,75], [185,70,100,60],
      [200,85,115,70], [215,65,95,55],  [230,80,110,70], [245,75,105,60],
      [260,90,120,75], [275,65,95,50],  [290,85,115,70], [305,70,100,60],
      [320,80,110,65], [335,60,90,45],  [350,75,105,60], [365,85,115,70],
    ].map(([x, yHigh, yLow, yClose], i) => {
      const isGreen = i % 3 !== 1;
      const clr = isGreen ? '#3ECF8E' : '#E05252';
      const bodyTop = isGreen ? yClose : yClose - 12;
      return (
        <g key={i}>
          <line x1={x} y1={yHigh} x2={x} y2={yLow + 20} stroke={clr} strokeWidth="0.8" opacity="0.6" />
          <rect x={x - 3} y={bodyTop} width="6" height="12" fill={clr} opacity="0.8" />
        </g>
      );
    })}
    {/* EA badge on chart */}
    <rect x="340" y="35" width="48" height="16" rx="3" fill="#1a1a1a" stroke="#2a2a2a" />
    <text x="364" y="46" textAnchor="middle" fill="#3ECF8E" fontSize="8" fontFamily="system-ui,sans-serif">☺ EA Active</text>
  </Win>
);

const Svg7 = () => (
  <Win title="LTE Gold — EA Parameters">
    <rect x="40" y="32" width="320" height="180" rx="6" fill="#141414" stroke="#2a2a2a" />
    {/* Tabs */}
    <rect x="40" y="32" width="320" height="22" fill="#0d0d0d" rx="6"/>
    <rect y="46" x="40" width="320" height="8" fill="#0d0d0d"/>
    {['Common','Inputs','Dependencies'].map((t, i) => (
      <g key={t}>
        {i === 1 && <rect x={42 + i * 80} y="32" width="80" height="22" rx="4" fill="#1e1e1e" />}
        <text x={82 + i * 80} y="46" textAnchor="middle" fill={i === 1 ? '#C9A84C' : '#555'} fontSize="8" fontFamily="system-ui,sans-serif" fontWeight={i === 1 ? '600' : '400'}>{t}</text>
      </g>
    ))}
    {/* Inputs table header */}
    <rect x="40" y="54" width="320" height="16" fill="#0d0d0d" />
    <text x="52" y="65" fill="#444" fontSize="7.5" fontFamily="system-ui,sans-serif" letterSpacing="0.5">VARIABLE</text>
    <text x="230" y="65" fill="#444" fontSize="7.5" fontFamily="system-ui,sans-serif" letterSpacing="0.5">VALUE</text>
    {/* Rows */}
    {[
      { name: 'InpLotSize',      val: '0.01',    hi: false },
      { name: 'InpLicenseKey',   val: 'L-XXXXXX-XXXXXXXX-XXXXXXX', hi: true },
      { name: 'InpMaxTrades',    val: '3',       hi: false },
      { name: 'InpStopLoss',     val: '50',      hi: false },
      { name: 'InpTakeProfit',   val: '100',     hi: false },
    ].map(({ name, val, hi }, i) => (
      <g key={name}>
        {hi && <rect x="42" y={70 + i * 18} width="316" height="18" fill="rgba(201,168,76,0.08)" />}
        <text x="52" y={82 + i * 18} fill={hi ? '#F5F0E8' : '#777'} fontSize="8" fontFamily="monospace">{name}</text>
        <text x="232" y={82 + i * 18} fill={hi ? '#C9A84C' : '#555'} fontSize="8" fontFamily="monospace">{hi ? '●●●●●●●●●●' : val}</text>
      </g>
    ))}
    <Highlight x="42" y="88" w="316" h="18" label="Paste your license key here" labelX="200" labelY="78" arrow="down" />
    {/* OK button */}
    <rect x="240" y="183" width="100" height="20" rx="4" fill="url(#gbtn3)" />
    <defs><linearGradient id="gbtn3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#9B7B2F"/></linearGradient></defs>
    <text x="290" y="196" textAnchor="middle" fill="#0a0a0a" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">OK</text>
  </Win>
);

const Svg8 = () => (
  <Win title="MetaTrader 5 — XAUUSD, H1">
    {/* Toolbar */}
    <rect x="0" y="28" width={W} height="26" fill="#141414" stroke="#1a1a1a" strokeWidth="1" />
    {/* AutoTrading button — highlighted */}
    <rect x="120" y="31" width="88" height="20" rx="4" fill="rgba(62,207,142,0.15)" stroke="#3ECF8E" strokeWidth="1.5" />
    <text x="134" y="44" fill="#3ECF8E" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">▶ AutoTrading ON</text>
    <Highlight x="118" y="29" w="92" h="24" label="Must be ON (green)" labelX="164" labelY="19" arrow="down" />
    {/* Other toolbar items */}
    <text x="16" y="44" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">New Order  Chart  Navigator</text>
    <text x="220" y="44" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">History  Strategy Tester</text>
    {/* Chart */}
    <rect x="0" y="54" width={W} height={H - 80} fill="#0d0d0d" />
    {[140,158,176,194,212,230,248,266,284,302,320,338,356,374].map((x, i) => {
      const hs = [55,62,48,70,58,45,68,52,60,42,65,50,58,44];
      const bs = [16,14,18,12,16,14,12,16,14,18,12,16,14,12];
      const isG = i % 3 !== 2;
      const clr = isG ? '#3ECF8E' : '#E05252';
      return (
        <g key={x}>
          <line x1={x} y1={70 + hs[i] - 8} x2={x} y2={70 + hs[i] + bs[i] + 8} stroke={clr} strokeWidth="0.8" opacity="0.5"/>
          <rect x={x-4} y={70 + hs[i]} width="8" height={bs[i]} fill={clr} opacity="0.85"/>
        </g>
      );
    })}
    {/* EA smiley badge */}
    <rect x="340" y="60" width="52" height="24" rx="4" fill="#0d2a1a" stroke="#3ECF8E" strokeWidth="1" />
    <text x="366" y="70" textAnchor="middle" fill="#3ECF8E" fontSize="9" fontFamily="system-ui,sans-serif">☺</text>
    <text x="366" y="80" textAnchor="middle" fill="#3ECF8E" fontSize="7" fontFamily="system-ui,sans-serif">Running</text>
    {/* Experts tab at bottom */}
    <rect x="0" y={H - 26} width={W} height="26" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="1"/>
    <text x="10" y={H - 10} fill="#555" fontSize="7.5" fontFamily="system-ui,sans-serif">Toolbox:  Trade   History   </text>
    <text x="150" y={H - 10} fill="#C9A84C" fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight="600">Experts   Journal</text>
    <text x="260" y={H - 10} fill="#3ECF8E" fontSize="7.5" fontFamily="system-ui,sans-serif">● LTE Gold: initialized</text>
  </Win>
);

const SVGS = [Svg1, Svg2, Svg3, Svg4, Svg5, Svg6, Svg7, Svg8];

/* ── GuideTab component ─────────────────────────────────── */
export default function GuideTab({ lang = 'en', onCopyKey }) {
  const [openFaq,   setOpenFaq]   = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const tx = g[lang] || g.en;

  const copyUrl = () => {
    navigator.clipboard.writeText('https://www.ltempire.com').catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="guide-wrap">

      {/* Hero */}
      <div className="guide-hero">
        <div className="guide-hero-icon">⚡</div>
        <div>
          <h2 className="guide-hero-title">{tx.hero}</h2>
          <p className="guide-hero-sub">{tx.heroSub}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="guide-steps">
        {tx.steps.map((step, i) => {
          const SvgEl = SVGS[i];
          return (
            <div key={i} className="guide-step">
              {/* Step number line */}
              <div className="guide-step-left">
                <div className="guide-num">{i + 1}</div>
                {i < tx.steps.length - 1 && <div className="guide-line" />}
              </div>

              {/* Content */}
              <div className="guide-step-content">
                <div className="guide-step-inner">
                  {/* Text */}
                  <div className="guide-step-text">
                    <p className="guide-step-label">{tx.stepLabel} {i + 1}</p>
                    <h3 className="guide-step-title">{step.title}</h3>
                    <p className="guide-step-desc">{step.desc}</p>

                    {step.tip && step.tipType === 'info' && (
                      <div className="guide-callout guide-callout-info">
                        <span className="guide-callout-icon">💡</span>
                        <span>{step.tip}</span>
                      </div>
                    )}
                    {step.tip && step.tipType === 'warn' && (
                      <div className="guide-callout guide-callout-warn">
                        <span className="guide-callout-icon">⚠️</span>
                        <span>{step.tip}</span>
                      </div>
                    )}
                    {step.tip && step.tipType === 'copy' && (
                      <div className="guide-callout guide-callout-copy">
                        <code className="guide-url">{step.tip}</code>
                        <button className="guide-copy-btn" onClick={copyUrl}>
                          {copiedUrl ? `✓ ${tx.copied}` : tx.copyBtn}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SVG illustration */}
                  <div className="guide-svg-wrap">
                    <SvgEl />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Done banner */}
      <div className="guide-done">
        <span className="guide-done-icon">✅</span>
        <div>
          <div className="guide-done-title">{tx.done}</div>
          <div className="guide-done-sub">{tx.doneSub}</div>
        </div>
      </div>

      {/* FAQ */}
      <div className="guide-faq">
        <h3 className="guide-faq-title">{tx.faqTitle}</h3>
        {tx.faqs.map((faq, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <span className={`faq-chevron ${openFaq === i ? 'faq-chevron-open' : ''}`}>›</span>
            </button>
            {openFaq === i && <div className="faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>

      <style>{`
        .guide-wrap { display: flex; flex-direction: column; gap: 0; }

        /* Hero */
        .guide-hero {
          display: flex; align-items: center; gap: 16px;
          background: var(--gold-alpha); border: 1px solid rgba(201,168,76,0.2);
          border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;
        }
        .guide-hero-icon { font-size: 28px; flex-shrink: 0; }
        .guide-hero-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .guide-hero-sub   { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

        /* Steps */
        .guide-steps { display: flex; flex-direction: column; }
        .guide-step  { display: flex; gap: 0; }

        .guide-step-left {
          display: flex; flex-direction: column; align-items: center;
          flex-shrink: 0; width: 48px;
        }
        .guide-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #C9A84C, #9B7B2F);
          color: #0A0A0A; font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 0 16px rgba(201,168,76,0.3);
          position: relative; z-index: 1;
        }
        .guide-line {
          width: 2px; flex: 1; min-height: 24px;
          background: linear-gradient(to bottom, rgba(201,168,76,0.4), rgba(201,168,76,0.1));
          margin: 4px 0;
        }

        .guide-step-content { flex: 1; padding-bottom: 36px; min-width: 0; }
        .guide-step-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
          align-items: start; padding-left: 16px;
        }

        .guide-step-label { font-size: 10px; color: var(--gold); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px; }
        .guide-step-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
        .guide-step-desc  { font-size: 13px; color: var(--text-muted); line-height: 1.65; }

        /* Callouts */
        .guide-callout {
          display: flex; align-items: flex-start; gap: 10px;
          border-radius: 8px; padding: 10px 14px; margin-top: 12px;
          font-size: 12px; line-height: 1.5;
        }
        .guide-callout-icon { flex-shrink: 0; font-size: 14px; }
        .guide-callout-info { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); color: var(--text-muted); }
        .guide-callout-warn { background: rgba(224,82,82,0.07); border: 1px solid rgba(224,82,82,0.2); color: var(--text-muted); }
        .guide-callout-copy {
          background: var(--avatar-bg); border: 1px solid var(--border);
          flex-direction: column; gap: 8px;
        }
        .guide-url { font-family: monospace; font-size: 12px; color: var(--gold); word-break: break-all; }
        .guide-copy-btn {
          align-self: flex-start; padding: 5px 14px;
          background: var(--gold-alpha); border: 1px solid rgba(201,168,76,0.3);
          border-radius: 6px; color: var(--gold); font-size: 11px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .guide-copy-btn:hover { background: rgba(201,168,76,0.16); }

        /* SVG illustration */
        .guide-svg-wrap {
          border-radius: 10px; overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        /* Done banner */
        .guide-done {
          display: flex; align-items: center; gap: 16px;
          background: rgba(62,207,142,0.08); border: 1px solid rgba(62,207,142,0.25);
          border-radius: 12px; padding: 20px 24px; margin: 8px 0 32px;
        }
        .guide-done-icon  { font-size: 28px; flex-shrink: 0; }
        .guide-done-title { font-size: 15px; font-weight: 700; color: #3ECF8E; margin-bottom: 3px; }
        .guide-done-sub   { font-size: 13px; color: var(--text-muted); }

        /* FAQ */
        .guide-faq       { display: flex; flex-direction: column; gap: 8px; }
        .guide-faq-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
        .faq-item   { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; transition: border-color 0.15s; }
        .faq-item:hover { border-color: rgba(201,168,76,0.3); }
        .faq-q {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: 14px 16px; background: var(--bg-table);
          border: none; color: var(--text); font-size: 13px; font-weight: 600;
          cursor: pointer; text-align: left; gap: 12px;
          transition: background 0.15s;
        }
        .faq-q:hover { background: var(--row-hover); }
        .faq-chevron { font-size: 18px; color: var(--text-dim); transition: transform 0.2s; flex-shrink: 0; }
        .faq-chevron-open { transform: rotate(90deg); color: var(--gold); }
        .faq-a { padding: 12px 16px; font-size: 13px; color: var(--text-muted); line-height: 1.6; background: var(--avatar-bg); border-top: 1px solid var(--border); }

        /* Responsive */
        @media (max-width: 860px) {
          .guide-step-inner { grid-template-columns: 1fr; }
          .guide-svg-wrap   { max-width: 100%; }
        }
        @media (max-width: 640px) {
          .guide-hero   { padding: 16px; }
          .guide-hero-title { font-size: 17px; }
          .guide-step-content { padding-bottom: 28px; }
          .guide-step-inner   { padding-left: 12px; gap: 16px; }
          .guide-step-title   { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
