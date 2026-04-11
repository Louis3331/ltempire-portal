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
        desc:  'Open a XAUUSD chart on the H1 timeframe. In the Navigator panel find LTE Gold under Expert Advisors and double-click or drag it onto the chart.',
        tip:   'Use H1 timeframe for best results.',
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
        desc:  '打开 XAUUSD 图表（H1 时间框架），在导航器面板中找到 LTE Gold，双击或拖拽到图表上。',
        tip:   '建议使用 H1 时间框架以获得最佳效果。',
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
      {/* Gold callout arrow from right side — points at Open Data Folder row */}
      <line x1={dropX + dropW + 55} y1="181" x2={dropX + dropW + 4} y2="181" stroke="#C9A84C" strokeWidth="1.5" markerEnd="url(#arr3)" />
      <rect x={dropX + dropW + 58} y="171" width="88" height="20" rx="4" fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="1" />
      <text x={dropX + dropW + 102} y="184" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">Click here</text>
      <defs>
        <marker id="arr3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#C9A84C" />
        </marker>
      </defs>
    </svg>
  );
};

const Svg4 = () => {
  const files = [
    { name: 'Advisors',              date: '3/15/2026  12:29 AM', isFolder: true,  hi: false },
    { name: 'Examples',              date: '2/24/2026   7:34 PM', isFolder: true,  hi: false },
    { name: 'Free Robots',           date: '2/24/2026   7:34 PM', isFolder: true,  hi: false },
    { name: 'SomeOther_EA 1.15.ex5', date: '3/26/2026   8:31 AM', isFolder: false, hi: false },
    { name: 'LTE_Gold_v1.01.ex5',    date: '4/10/2026   6:16 PM', isFolder: false, hi: true  },
  ];
  const colDate = 270;
  const rowH = 22, startY = 72;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
      {/* Window bg */}
      <rect width={W} height={H} rx="8" fill="#1e1e1e" stroke="#333" strokeWidth="1" />
      {/* Title bar */}
      <rect width={W} height="22" rx="8" fill="#2a2a2a" />
      <rect y="14" width={W} height="8" fill="#2a2a2a" />
      <circle cx="12" cy="11" r="4" fill="#E05252" opacity="0.8" />
      <circle cx="24" cy="11" r="4" fill="#C9A84C" opacity="0.8" />
      <circle cx="36" cy="11" r="4" fill="#3ECF8E" opacity="0.8" />
      <text x={W / 2} y="15" textAnchor="middle" fill="#666" fontSize="8" fontFamily="system-ui,sans-serif">MQL5 › Experts</text>
      {/* Address bar */}
      <rect y="22" width={W} height="20" fill="#252525" />
      <rect x="8" y="25" width="260" height="14" rx="3" fill="#1a1a1a" stroke="#333" />
      <text x="14" y="35" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif">  C: › ... › MQL5 › Experts</text>
      {/* Column headers */}
      <rect y="44" width={W} height="18" fill="#242424" />
      <rect y="62" width={W} height="1" fill="#333" />
      <text x="36" y="56" fill="#aaa" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">Name</text>
      <text x={colDate} y="56" fill="#aaa" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">Date modified</text>
      {/* File rows */}
      {files.map(({ name, date, isFolder, hi }, i) => {
        const y = startY + i * rowH;
        return (
          <g key={i}>
            {hi
              ? <rect x="0" y={y - 2} width={W} height={rowH} fill="#1a3a5c" />
              : (i % 2 === 0 && <rect x="0" y={y - 2} width={W} height={rowH} fill="rgba(255,255,255,0.02)" />)
            }
            {/* Folder or EA icon */}
            {isFolder
              ? <text x="12" y={y + 12} fill="#e8a020" fontSize="10" fontFamily="system-ui,sans-serif">📁</text>
              : <g transform={`translate(12, ${y + 2})`}>
                  {/* Graduation cap — grey when inactive, blue when active (hi) */}
                  <polygon points="6,3 12,6 6,9 0,6" fill={hi ? '#4d9de0' : '#777'} />
                  <rect x="9.5" y="5.5" width="1" height="4" fill={hi ? '#4d9de0' : '#777'} />
                  <rect x="8.5" y="9" width="3" height="1.5" rx="0.5" fill={hi ? '#4d9de0' : '#777'} />
                </g>
            }
            <text x="26" y={y + 12} fill={hi ? '#ffffff' : isFolder ? '#cccccc' : '#aaaaaa'} fontSize="9" fontFamily={isFolder ? 'system-ui,sans-serif' : 'monospace'} fontWeight={hi ? '600' : '400'}>{name}</text>
            <text x={colDate} y={y + 12} fill={hi ? '#aad4ff' : '#666'} fontSize="8.5" fontFamily="system-ui,sans-serif">{date}</text>
          </g>
        );
      })}
      {/* Gold callout — border around highlighted row */}
      <rect x="4" y={startY + 4 * rowH - 2} width={W - 8} height={rowH} rx="2" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      {/* Label below the row */}
      <rect x="130" y={startY + 5 * rowH + 4} width="140" height="18" rx="4" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1" />
      <text x="200" y={startY + 5 * rowH + 16} textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">↑ Paste your .ex5 file here</text>
    </svg>
  );
};

const Svg5 = () => {
  // Fixed x positions so "Expert Advisors" doesn't overlap neighbours
  const tabs = [
    { label: 'Server',           x: 6  },
    { label: 'Charts',           x: 42 },
    { label: 'Trade',            x: 80 },
    { label: 'Expert Advisors',  x: 112, active: true },
    { label: 'GPU',              x: 202 },
    { label: 'Events',           x: 228 },
    { label: 'Notifications',    x: 268 },
  ];
  const Cb = ({ x, y, checked, label, highlight }) => (
    <g>
      <rect x={x} y={y} width="9" height="9" rx="1.5" fill={checked ? '#fff' : '#e8e8e8'} stroke="#888" strokeWidth="0.8" />
      {checked && <text x={x + 1} y={y + 8} fill="#1a6fc4" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="900">✓</text>}
      <text x={x + 14} y={y + 8} fill={highlight ? '#000' : '#222'} fontSize="8" fontFamily="system-ui,sans-serif" fontWeight={highlight ? '600' : '400'}>{label}</text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
      {/* Window bg — light theme like real MT5 */}
      <rect width={W} height={H} rx="8" fill="#f0f0f0" stroke="#bbb" strokeWidth="1" />
      {/* Title bar */}
      <rect width={W} height="22" rx="8" fill="#e0e0e0" />
      <rect y="14" width={W} height="8" fill="#e0e0e0" />
      <text x="16" y="15" fill="#333" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="600">Options</text>
      <text x={W - 28} y="15" fill="#666" fontSize="11" fontFamily="system-ui,sans-serif">✕</text>
      {/* Tab strip */}
      <rect y="22" width={W} height="22" fill="#dcdcdc" />
      <rect y="43" width={W} height="1" fill="#bbb" />
      {tabs.map(({ label, x, active }) => (
        <g key={label}>
          {active && <>
            <rect x={x - 3} y="22" width="88" height="22" fill="#f0f0f0" />
            <rect x={x - 3} y="43" width="88" height="1" fill="#f0f0f0" />
          </>}
          <text x={x} y="37" fill={active ? '#1a6fc4' : '#555'} fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight={active ? '700' : '400'}>{label}</text>
          {active && <rect x={x - 3} y="42" width="88" height="2" fill="#1a6fc4" />}
        </g>
      ))}
      {/* Content area */}
      <rect y="44" width={W} height={H - 44} rx="0" fill="#f0f0f0" />
      {/* Checkboxes */}
      <Cb x={14} y={54}  checked={true}  label="Allow algorithmic trading" />
      <Cb x={26} y={70}  checked={false} label="Disable algorithmic trading when the account has been changed" />
      <Cb x={26} y={83}  checked={false} label="Disable algorithmic trading when the profile has been changed" />
      <Cb x={26} y={96}  checked={false} label="Disable algorithmic trading when the charts symbol or period has been changed" />
      <Cb x={26} y={109} checked={false} label="Disable algorithmic trading via external Python API" />
      <Cb x={14} y={122} checked={true}  label="Allow DLL imports (potentially dangerous, enable only for trusted applications)" />
      {/* WebRequest row — highlighted */}
      <Cb x={14} y={137} checked={true}  label="Allow WebRequest for listed URL:" highlight={true} />
      {/* Gold highlight ring around checkbox + label */}
      <rect x="11" y="134" width="200" height="16" rx="3" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1.2" />
      {/* URL list box */}
      <rect x="14" y="155" width="372" height="28" rx="2" fill="#fff" stroke="#aaa" strokeWidth="0.8" />
      {/* URL row highlighted blue */}
      <rect x="15" y="156" width="370" height="14" fill="#1a6fc4" />
      <text x="22" y="167" fill="#fff" fontSize="8.5" fontFamily="system-ui,sans-serif">🌐  https://www.ltempire.com</text>
      {/* Add new row */}
      <text x="22" y="179" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif">+  add new URL like 'https://www.mql5.com'</text>
      {/* OK / Cancel / Help buttons */}
      <rect x="238" y="196" width="44" height="18" rx="3" fill="#1a6fc4" stroke="#1560a8" strokeWidth="0.8" />
      <text x="260" y="208" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="700">OK</text>
      <rect x="288" y="196" width="54" height="18" rx="3" fill="#e8e8e8" stroke="#bbb" strokeWidth="0.8" />
      <text x="315" y="208" textAnchor="middle" fill="#333" fontSize="9" fontFamily="system-ui,sans-serif">Cancel</text>
      <rect x="348" y="196" width="44" height="18" rx="3" fill="#e8e8e8" stroke="#bbb" strokeWidth="0.8" />
      <text x="370" y="208" textAnchor="middle" fill="#333" fontSize="9" fontFamily="system-ui,sans-serif">Help</text>
    </svg>
  );
};

const Svg6 = () => {
  const candles = [
    [0,1],[1,-1],[2,1],[3,1],[4,-1],[5,1],[6,-1],[7,1],
    [8,1],[9,-1],[10,1],[11,1],[12,-1],[13,1],[14,1],[15,-1],
    [16,1],[17,1],[18,-1],[19,1],[20,1],[21,-1],[22,1],[23,1],
  ];
  const chartX = 108, chartY = 28, chartW = W - chartX, chartH = H - chartY;
  const cW = Math.floor(chartW / candles.length);
  const midY = chartY + chartH * 0.48;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
      {/* Window */}
      <rect width={W} height={H} rx="8" fill="#0d0d0d" stroke="#252525" strokeWidth="1" />
      {/* Title bar */}
      <rect width={W} height="22" rx="8" fill="#161616" />
      <rect y="14" width={W} height="8" fill="#161616" />
      <circle cx="12" cy="11" r="4" fill="#E05252" opacity="0.7" />
      <circle cx="24" cy="11" r="4" fill="#C9A84C" opacity="0.7" />
      <circle cx="36" cy="11" r="4" fill="#3ECF8E" opacity="0.7" />
      <text x={W / 2} y="15" textAnchor="middle" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">MetaTrader 5 — XAUUSD, H1</text>

      {/* Navigator panel */}
      <rect x="0" y="22" width={chartX} height={H - 22} fill="#0a0a0a" stroke="#1e1e1e" strokeWidth="1" />
      <text x="6" y="36" fill="#444" fontSize="7" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.8">NAVIGATOR</text>
      <text x="6" y="50" fill="#444" fontSize="8" fontFamily="system-ui,sans-serif">▶ Indicators</text>
      <text x="6" y="63" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif">▼ Expert Advisors</text>
      {/* LTE Gold row highlighted */}
      <rect x="4" y="66" width={chartX - 8} height="15" rx="2" fill="rgba(201,168,76,0.14)" stroke="#C9A84C" strokeWidth="0.8" />
      {/* Blue cap = EA active in navigator */}
      <g transform="translate(10, 68)">
        <polygon points="5,2 10,5 5,8 0,5" fill="#4d9de0" />
        <rect x="8" y="4.5" width="1" height="3.5" fill="#4d9de0" />
        <rect x="7" y="7.5" width="2.5" height="1.5" rx="0.5" fill="#4d9de0" />
      </g>
      <text x="23" y="77" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">LTE Gold</text>
      <text x="6" y="93" fill="#444" fontSize="8" fontFamily="system-ui,sans-serif">▶ Scripts</text>

      {/* Drag arrow */}
      <defs>
        <marker id="arr6" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#C9A84C" />
        </marker>
      </defs>
      <path d={`M${chartX - 1},73 Q${chartX + 20},73 ${chartX + 30},85`} stroke="#C9A84C" strokeWidth="1.4" strokeDasharray="3,2" fill="none" markerEnd="url(#arr6)" />

      {/* Chart area */}
      <rect x={chartX} y={chartY} width={chartW} height={chartH} fill="#0d0d0d" />
      {/* Grid lines */}
      {[0.25,0.5,0.75].map(f => (
        <line key={f} x1={chartX} y1={chartY + chartH * f} x2={W} y2={chartY + chartH * f} stroke="#161616" strokeWidth="0.8" />
      ))}
      {/* Timeframe tabs */}
      {['M1','M5','M15','M30','H1','H4','D1'].map((tf, i) => (
        <g key={tf}>
          {tf === 'H1' && <rect x={chartX + 4 + i * 26} y={chartY + 2} width="24" height="13" rx="2" fill="#1e1e1e" stroke="#C9A84C" strokeWidth="0.8" />}
          <text x={chartX + 16 + i * 26} y={chartY + 12} textAnchor="middle" fill={tf === 'H1' ? '#C9A84C' : '#333'} fontSize="7.5" fontFamily="system-ui,sans-serif" fontWeight={tf === 'H1' ? '700' : '400'}>{tf}</text>
        </g>
      ))}
      {/* Candles */}
      {candles.map(([i, dir]) => {
        const x = chartX + i * cW + cW / 2;
        const clr = dir > 0 ? '#3ECF8E' : '#E05252';
        const bodyH = 8 + (i % 5) * 2;
        const wickH = bodyH + 6;
        const top = midY - (dir > 0 ? bodyH : 0) - (i % 3) * 3;
        return (
          <g key={i}>
            <line x1={x} y1={top - 4} x2={x} y2={top + wickH} stroke={clr} strokeWidth="0.8" opacity="0.5" />
            <rect x={x - 3} y={top} width="6" height={bodyH} fill={clr} opacity="0.85" />
          </g>
        );
      })}
      {/* Tip callout at bottom — matching screenshot style */}
      <rect x={chartX + 10} y={H - 32} width={chartW - 20} height="22" rx="5" fill="rgba(30,24,8,0.92)" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
      <circle cx={chartX + 24} cy={H - 21} r="5" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="0.8" />
      <text x={chartX + 24} y={H - 17} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif">💡</text>
      <text x={chartX + 34} y={H - 18} fill="#C9A84C" fontSize="8.5" fontFamily="system-ui,sans-serif">Use H1 timeframe for best results.</text>
      <circle cx={W - 20} cy={H - 21} r="3" fill="#C9A84C" opacity="0.6" />
    </svg>
  );
};

const Svg7 = () => {
  const cV = 272; // Value column x
  const rH = 15;  // row height
  // Pre-computed fixed y positions — no mutation
  const S = 54; // table start y
  // section header = 13px, data row = 15px
  // Licensing(13) + LicKey(15) + MagicNum(15) + RiskSettings(13) + FixedLot(15) + AutoLot(15) + RiskPct(15) + MaxDD(15) + OrderSetting(13) + SL(15) + TP(15)
  const items = [
    { type:'sec', label:'Licensing',                             y: S },
    { type:'row', label:'License key (whop.com → copy your key)', val:'',         hi:true,  y: S+13 },
    { type:'row', label:'Magic number (unique ID for this EA)',    val:'20250101', hi:false, y: S+28 },
    { type:'sec', label:'Risk Settings',                          y: S+43 },
    { type:'row', label:'Fixed lot size',                         val:'0.01',     hi:false, y: S+56 },
    { type:'row', label:'Auto lot size (false=use fixed lot size)',val:'true',     hi:false, y: S+71 },
    { type:'row', label:'Risk % per trade',                       val:'1.0',      hi:false, y: S+86 },
    { type:'row', label:'Max daily drawdown % (0=disabled)',       val:'0.0',      hi:false, y: S+101 },
    { type:'sec', label:'Order Setting',                          y: S+116 },
    { type:'row', label:'Stop Loss in pips (0=candle range)',      val:'10.0',     hi:false, y: S+129 },
    { type:'row', label:'Take Profit in pips (0=disabled)',        val:'0.0',      hi:false, y: S+144 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, display: 'block' }}>
      {/* Light window bg */}
      <rect width={W} height={H} rx="8" fill="#f0f0f0" stroke="#bbb" strokeWidth="1" />
      {/* Title bar */}
      <rect width={W} height="20" rx="8" fill="#e0e0e0" />
      <rect y="13" width={W} height="7" fill="#e0e0e0" />
      <text x="8" y="14" fill="#333" fontSize="7.5" fontFamily="system-ui,sans-serif">LTE_Gold_v1.01 (XAUUSD,H1)</text>
      <text x={W-36} y="14" fill="#666" fontSize="9" fontFamily="system-ui,sans-serif">─  □  ✕</text>
      {/* Tab strip */}
      <rect y="20" width={W} height="18" fill="#dcdcdc" />
      <rect y="37" width={W} height="1" fill="#bbb" />
      {/* Common tab */}
      <text x="8" y="33" fill="#666" fontSize="8.5" fontFamily="system-ui,sans-serif">Common</text>
      {/* Inputs tab — active */}
      <rect x="52" y="20" width="36" height="18" fill="#f0f0f0" />
      <rect x="52" y="36" width="36" height="2" fill="#1a6fc4" />
      <text x="54" y="33" fill="#1a6fc4" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700">Inputs</text>
      {/* Dependencies tab */}
      <text x="94" y="33" fill="#666" fontSize="8.5" fontFamily="system-ui,sans-serif">Dependencies</text>
      {/* Table area */}
      <rect y="38" width={W} height={H-58} fill="#fff" />
      {/* Column headers */}
      <rect y="38" width={W} height="16" fill="#e0e0e0" />
      <line x1="0" y1="54" x2={W} y2="54" stroke="#ccc" strokeWidth="0.8" />
      <text x="10" y="50" fill="#222" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">Variable</text>
      <text x={cV+4} y="50" fill="#222" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">Value</text>
      {/* Column divider */}
      <line x1={cV} y1="38" x2={cV} y2={H-18} stroke="#ccc" strokeWidth="0.8" />
      {/* Scrollbar */}
      <rect x={W-10} y="38" width="10" height={H-58} fill="#ececec" />
      <rect x={W-9} y="44" width="8" height="28" rx="3" fill="#c0c0c0" />
      {/* All rows — fixed positions */}
      {items.map((item, i) => item.type === 'sec' ? (
        <g key={i}>
          <rect x="0" y={item.y} width={W-10} height="13" fill="#f0f0f0" />
          <line x1="0" y1={item.y} x2={W-10} y2={item.y} stroke="#ddd" strokeWidth="0.5" />
          <text x="10" y={item.y+10} fill="#444" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">{item.label}</text>
        </g>
      ) : (
        <g key={i}>
          {item.hi
            ? <rect x="0" y={item.y} width={W-10} height={rH} fill="#1a6fc4" />
            : <rect x="0" y={item.y} width={W-10} height={rH} fill={i%2===0?'#fafafa':'#fff'} />
          }
          <line x1="0" y1={item.y+rH} x2={W-10} y2={item.y+rH} stroke="#eee" strokeWidth="0.5" />
          <line x1={cV} y1={item.y} x2={cV} y2={item.y+rH} stroke="#ddd" strokeWidth="0.8" />
          <text x="10" y={item.y+11} fill={item.hi?'#fff':'#222'} fontSize="8" fontFamily="system-ui,sans-serif">{item.label}</text>
          <text x={cV+6} y={item.y+11} fill={item.hi?'#aad4ff':'#333'} fontSize="8" fontFamily="monospace">{item.val}</text>
        </g>
      ))}
      {/* Gold callout border around license key row */}
      <rect x="1" y={S+13} width={W-12} height={rH} fill="none" stroke="#C9A84C" strokeWidth="1.5" />
      <rect x="90" y={S+13+rH+3} width="170" height="13" rx="3" fill="rgba(201,168,76,0.18)" stroke="#C9A84C" strokeWidth="1" />
      <text x="175" y={S+13+rH+13} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">↑ Paste your license key here</text>
      {/* Buttons */}
      <rect y={H-18} width={W} height="18" fill="#e0e0e0" />
      <rect x={W-142} y={H-15} width="40" height="12" rx="2" fill="#1a6fc4" />
      <text x={W-122} y={H-6} textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700">OK</text>
      <rect x={W-96} y={H-15} width="46" height="12" rx="2" fill="#e8e8e8" stroke="#bbb" strokeWidth="0.8" />
      <text x={W-73} y={H-6} textAnchor="middle" fill="#333" fontSize="8.5" fontFamily="system-ui,sans-serif">Cancel</text>
      <rect x={W-44} y={H-15} width="38" height="12" rx="2" fill="#e8e8e8" stroke="#bbb" strokeWidth="0.8" />
      <text x={W-25} y={H-6} textAnchor="middle" fill="#333" fontSize="8.5" fontFamily="system-ui,sans-serif">Reset</text>
    </svg>
  );
};

const Svg8 = () => {
  // Layout constants
  const tbY = 46;   // toolbar y
  const tbH = 24;   // toolbar height
  const cX  = 0;    // chart x
  const cY  = tbY + tbH; // chart start y = 70
  const cW  = 305;  // chart width
  const cH  = 118;  // chart height
  const pX  = cW;   // panel x
  const pW  = W - cW; // panel width = 95
  const bY  = cY + cH; // bottom bar y = 188
  const midY = cY + cH * 0.48;

  const candles = [
    {d:1,s:8},{d:-1,s:10},{d:1,s:12},{d:1,s:9},{d:-1,s:11},{d:1,s:8},
    {d:1,s:13},{d:-1,s:9},{d:1,s:10},{d:1,s:12},{d:-1,s:8},{d:1,s:11},
    {d:1,s:14},{d:-1,s:10},{d:1,s:9},{d:1,s:12},{d:-1,s:11},{d:1,s:10},
  ];
  const cW2 = Math.floor(cW / candles.length);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10, display: 'block' }}>
      <defs>
        <linearGradient id="titleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#1a1a1a"/>
        </linearGradient>
        <linearGradient id="toolbarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f7f7"/>
          <stop offset="100%" stopColor="#ebebeb"/>
        </linearGradient>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f1117"/>
          <stop offset="100%" stopColor="#131722"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Window frame ── */}
      <rect width={W} height={H} rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>

      {/* Title bar — dark premium */}
      <rect width={W} height={tbY} rx="10" fill="url(#titleGrad)"/>
      <rect y={tbY-8} width={W} height="8" fill="#1a1a1a"/>
      {/* Traffic lights */}
      <circle cx="14" cy="14" r="5" fill="#ff5f57"/>
      <circle cx="28" cy="14" r="5" fill="#febc2e"/>
      <circle cx="42" cy="14" r="5" fill="#28c840"/>
      <text x={W/2} y="17" textAnchor="middle" fill="#888" fontSize="8" fontFamily="system-ui,sans-serif">Just Global Markets Ltd. — XAUUSD.ecn, H1</text>
      <text x={W-10} y="17" textAnchor="end" fill="#555" fontSize="8" fontFamily="system-ui,sans-serif">✕</text>

      {/* Menu bar */}
      <rect y="26" width={W} height="14" fill="#222"/>
      {['Insert','Charts','Tools','Window','Help'].map((m,i)=>(
        <text key={m} x={58+i*46} y="37" fill="#aaa" fontSize="8" fontFamily="system-ui,sans-serif">{m}</text>
      ))}

      {/* Toolbar */}
      <rect y={tbY} width={W} height={tbH} fill="url(#toolbarGrad)" stroke="#d8d8d8" strokeWidth="0.5"/>
      {/* Generic icon buttons */}
      {[4,20,36,52,68].map(x=>(
        <rect key={x} x={x} y={tbY+4} width="14" height="14" rx="2" fill="#e2e2e2" stroke="#ccc" strokeWidth="0.5"/>
      ))}
      {/* Separator */}
      <line x1="88" y1={tbY+5} x2="88" y2={tbY+19} stroke="#ccc" strokeWidth="0.8"/>
      {/* Algo Trading button — GREEN, premium style */}
      <rect x="92" y={tbY+3} width="80" height="18" rx="4" fill="#1b5e20" stroke="#43a047" strokeWidth="1.2"/>
      <rect x="93" y={tbY+3} width="79" height="9" rx="4" fill="rgba(255,255,255,0.07)"/>
      <text x="132" y={tbY+15} textAnchor="middle" fill="#66bb6a" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700">▶  Algo Trading</text>
      {/* Separator */}
      <line x1="178" y1={tbY+5} x2="178" y2={tbY+19} stroke="#ccc" strokeWidth="0.8"/>
      {/* New Order */}
      <rect x="182" y={tbY+4} width="60" height="16" rx="3" fill="#e8e8e8" stroke="#ccc" strokeWidth="0.5"/>
      <text x="212" y={tbY+15} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui,sans-serif">＋ New Order</text>

      {/* Gold callout pointing DOWN at Algo Trading */}
      <rect x="88" y={tbY+24} width="92" height="14" rx="4" fill="rgba(201,168,76,0.18)" stroke="#C9A84C" strokeWidth="1.2"/>
      <text x="134" y={tbY+34} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">↑ Enable AutoTrading</text>

      {/* ── Chart area ── */}
      <rect x={cX} y={cY} width={cW} height={cH} fill="url(#chartGrad)"/>
      {/* Subtle grid */}
      {[0.25,0.5,0.75].map(f=>(
        <line key={f} x1={cX} y1={cY+cH*f} x2={cX+cW} y2={cY+cH*f} stroke="#1c2030" strokeWidth="0.8"/>
      ))}
      {[0.2,0.4,0.6,0.8].map(f=>(
        <line key={f} x1={cX+cW*f} y1={cY} x2={cX+cW*f} y2={cY+cH} stroke="#1c2030" strokeWidth="0.8"/>
      ))}
      {/* Candlesticks */}
      {candles.map(({d,s},i)=>{
        const x = cX + i*cW2 + cW2/2;
        const clr = d>0 ? '#26a69a' : '#ef5350';
        const offset = ((i*7+s)%20) - 10;
        const top = midY + offset - (d>0?s:0);
        return (
          <g key={i}>
            <line x1={x} y1={top-4} x2={x} y2={top+s+5} stroke={clr} strokeWidth="0.8" opacity="0.5"/>
            <rect x={x-4} y={top} width="8" height={s} fill={clr} rx="0.5"/>
          </g>
        );
      })}
      {/* Smiley badge on chart — top right */}
      <rect x={cW-50} y={cY+6} width="46" height="18" rx="4" fill="rgba(38,166,154,0.12)" stroke="#26a69a" strokeWidth="1" filter="url(#glow)"/>
      <text x={cW-27} y={cY+19} textAnchor="middle" fill="#26a69a" fontSize="13" fontFamily="system-ui,sans-serif">☺</text>

      {/* ── EA info panel ── */}
      <rect x={pX} y={cY} width={pW} height={cH} fill="#0d0d0d" stroke="#222" strokeWidth="0.5"/>
      <rect x={pX} y={cY} width={pW} height="20" fill="#141414"/>
      <text x={pX+pW/2} y={cY+13} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="system-ui,sans-serif" fontWeight="700">LTE Gold v1.01</text>
      <line x1={pX} y1={cY+20} x2={pX+pW} y2={cY+20} stroke="#222" strokeWidth="0.8"/>
      <text x={pX+5} y={cY+32} fill="#555" fontSize="7" fontFamily="system-ui,sans-serif">Current P&amp;L:</text>
      <text x={pX+5} y={cY+44} fill="#3ECF8E" fontSize="7" fontFamily="system-ui,sans-serif">Daily profit:</text>
      <text x={pX+5} y={cY+56} fill="#555" fontSize="7" fontFamily="system-ui,sans-serif">EA is active</text>
      <line x1={pX} y1={cY+62} x2={pX+pW} y2={cY+62} stroke="#1a1a1a" strokeWidth="0.5"/>

      {/* ── Bottom bar ── */}
      <rect x={cX} y={bY} width={W} height={H-bY} rx="0" fill="#111"/>
      <rect x={cX} y={bY} width={W} height="1" fill="#222"/>
      {['Trade','History','Experts','Journal'].map((t,i)=>(
        <text key={t} x={8+i*54} y={bY+11} fill={t==='Experts'?'#C9A84C':'#444'} fontSize="8" fontFamily="system-ui,sans-serif" fontWeight={t==='Experts'?'600':'400'}>{t}</text>
      ))}
      <line x1={cX} y1={bY+14} x2={W} y2={bY+14} stroke="#1a1a1a" strokeWidth="0.8"/>
      <circle cx="8" cy={bY+23} r="3" fill="#26a69a"/>
      <text x="14" y={bY+26} fill="#26a69a" fontSize="7.5" fontFamily="system-ui,sans-serif">LTE Gold: EA initialized successfully</text>
    </svg>
  );
};

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
