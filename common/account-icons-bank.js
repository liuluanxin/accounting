// ============================================================
// 银行图标库 - Bank Icons
// 每个图标为 100x100 SVG data URI，白底 + 品牌色 Logo 图案
// 使用 ES module 导出，可直接 import 使用
// ============================================================

// ---------- 1. 中信银行 ----------
// 白底 + 红色对称"中"字变形
export const ICON_CITIC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M35 35 L65 35 L65 44 L35 44 Z" fill="#E60012"/>' +
  '<path d="M46 35 L46 65 L54 65 L54 35 Z" fill="#E60012"/>' +
  '<path d="M35 56 L65 56 L65 65 L35 65 Z" fill="#E60012"/>' +
  '</svg>'
);

// ---------- 2. 光大银行 ----------
// 白底 + 多彩"E"字母（黄粉蓝紫渐变）
export const ICON_CEBBANK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<defs>' +
  '<linearGradient id="cebGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" stop-color="#FFD700"/>' +
  '<stop offset="25%" stop-color="#FF8C00"/>' +
  '<stop offset="50%" stop-color="#FF69B4"/>' +
  '<stop offset="75%" stop-color="#4169E1"/>' +
  '<stop offset="100%" stop-color="#9400D3"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M30 25 L70 25 L70 37 L42 37 L42 47 L66 47 L66 57 L42 57 L42 67 L70 67 L70 79 L30 79 Z" fill="url(#cebGrad)"/>' +
  '</svg>'
);

// ---------- 3. 农业银行 ----------
// 白底 + 绿色麦穗环绕古钱币
export const ICON_ABCHINA = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<circle cx="50" cy="50" r="18" fill="#4CAF50"/>' +
  '<circle cx="50" cy="50" r="12" fill="#FFFFFF"/>' +
  '<rect x="45" y="45" width="10" height="10" rx="1" fill="#4CAF50"/>' +
  '<ellipse cx="32" cy="35" rx="7" ry="3" fill="#4CAF50" transform="rotate(-30 32 35)"/>' +
  '<ellipse cx="24" cy="50" rx="7" ry="3" fill="#4CAF50"/>' +
  '<ellipse cx="32" cy="65" rx="7" ry="3" fill="#4CAF50" transform="rotate(30 32 65)"/>' +
  '<ellipse cx="68" cy="35" rx="7" ry="3" fill="#4CAF50" transform="rotate(30 68 35)"/>' +
  '<ellipse cx="76" cy="50" rx="7" ry="3" fill="#4CAF50"/>' +
  '<ellipse cx="68" cy="65" rx="7" ry="3" fill="#4CAF50" transform="rotate(-30 68 65)"/>' +
  '</svg>'
);

// ---------- 4. 建设银行 ----------
// 白底 + 蓝色立体"C"字
export const ICON_CCB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M62 25 Q75 25 75 50 Q75 75 62 75 L52 75 Q62 65 62 50 Q62 35 52 25 Z" fill="#003366"/>' +
  '<path d="M52 25 L62 25 Q75 25 75 50 Q75 75 62 75 L52 75 L52 62 Q62 62 62 50 Q62 38 52 38 Z" fill="#0066CC"/>' +
  '</svg>'
);

// ---------- 5. 邮政储蓄 ----------
// 白底 + 绿色飞鸟/箭头
export const ICON_PSBC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M50 25 L75 55 L60 55 L60 75 L40 75 L40 55 L25 55 Z" fill="#00A650"/>' +
  '</svg>'
);

// ---------- 6. 中国银行 ----------
// 白底 + 红色古钱币内嵌"中"字
export const ICON_BOC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<circle cx="50" cy="50" r="24" fill="#E60012"/>' +
  '<rect x="44" y="36" width="12" height="28" fill="#FFFFFF"/>' +
  '<rect x="36" y="44" width="28" height="12" fill="#FFFFFF"/>' +
  '</svg>'
);

// ---------- 7. 交通银行 ----------
// 白底 + 蓝色飞翼/蜜蜂
export const ICON_BANKCOMM = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M25 55 Q40 35 50 50 Q60 35 75 55 Q60 65 50 52 Q40 65 25 55" fill="#003399"/>' +
  '<ellipse cx="50" cy="50" rx="5" ry="8" fill="#003399"/>' +
  '</svg>'
);

// ---------- 8. 民生银行 ----------
// 白底 + 蓝绿渐变"S"形流动
export const ICON_CMBC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<defs>' +
  '<linearGradient id="cmbcGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" stop-color="#0099CC"/>' +
  '<stop offset="100%" stop-color="#00CC99"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M62 30 Q48 30 46 45 Q44 55 50 55 Q56 55 56 62 Q56 72 45 72 Q36 72 34 62" fill="none" stroke="url(#cmbcGrad)" stroke-width="8" stroke-linecap="round"/>' +
  '</svg>'
);

// ---------- 9. 浦发银行 ----------
// 白底 + 蓝紫色"SP"字母
export const ICON_SPDB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#6A0DAD">SP</text>' +
  '</svg>'
);

// ---------- 10. 兴业银行 ----------
// 白底 + 蓝色圆环中心圆点
export const ICON_CIB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<circle cx="50" cy="50" r="18" fill="none" stroke="#003399" stroke-width="5"/>' +
  '<circle cx="50" cy="50" r="5" fill="#003399"/>' +
  '</svg>'
);

// ---------- 11. 平安银行 ----------
// 白底 + 橙红渐变圆角矩形，白色"平安"文字
export const ICON_PINGAN = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<defs>' +
  '<linearGradient id="pinganGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
  '<stop offset="0%" stop-color="#FF6600"/>' +
  '<stop offset="100%" stop-color="#E60012"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<rect x="20" y="32" width="60" height="36" rx="8" fill="url(#pinganGrad)"/>' +
  '<text x="50" y="55" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#FFFFFF">平安</text>' +
  '</svg>'
);

// ---------- 12. 工商银行 ----------
// 白底 + 红色"工"字（外圆内方）
export const ICON_ICBC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<rect x="32" y="32" width="36" height="36" rx="4" fill="none" stroke="#E60012" stroke-width="5"/>' +
  '<rect x="42" y="38" width="16" height="5" fill="#E60012"/>' +
  '<rect x="48" y="38" width="5" height="24" fill="#E60012"/>' +
  '<rect x="42" y="57" width="16" height="5" fill="#E60012"/>' +
  '</svg>'
);

// ---------- 13. 广发银行 ----------
// 白底 + 红色三角形/箭头组合
export const ICON_CGB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M50 30 L75 70 L25 70 Z" fill="#E60012"/>' +
  '<path d="M50 42 L62 65 L38 65 Z" fill="#FFFFFF"/>' +
  '</svg>'
);

// ---------- 14. 招商银行 ----------
// 白底 + 红色"M"字母（山峰造型）
export const ICON_CMB = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M25 70 L42 35 L50 50 L58 35 L75 70 L65 70 L55 50 L50 58 L45 50 L35 70 Z" fill="#E60012"/>' +
  '</svg>'
);

// ---------- 15. 网商银行 ----------
// 白底 + 蓝色"M"字母
export const ICON_MYBANK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>' +
  '<path d="M28 70 L40 35 L50 52 L60 35 L72 70 L63 70 L54 50 L50 58 L46 50 L37 70 Z" fill="#0066CC"/>' +
  '</svg>'
);

// ============================================================
// 银行图标映射表
// 包含名称、图标 data URI、品牌色、背景色
// ============================================================
export const BANK_ICONS_MAP = {
  citic: {
    name: '中信银行',
    icon: ICON_CITIC,
    color: '#E60012',
    bg: '#FFFFFF'
  },
  cebbank: {
    name: '光大银行',
    icon: ICON_CEBBANK,
    color: '#FFD700',
    bg: '#FFFFFF'
  },
  abchina: {
    name: '农业银行',
    icon: ICON_ABCHINA,
    color: '#4CAF50',
    bg: '#FFFFFF'
  },
  ccb: {
    name: '建设银行',
    icon: ICON_CCB,
    color: '#003366',
    bg: '#FFFFFF'
  },
  psbc: {
    name: '邮政储蓄',
    icon: ICON_PSBC,
    color: '#00A650',
    bg: '#FFFFFF'
  },
  boc: {
    name: '中国银行',
    icon: ICON_BOC,
    color: '#E60012',
    bg: '#FFFFFF'
  },
  bankcomm: {
    name: '交通银行',
    icon: ICON_BANKCOMM,
    color: '#003399',
    bg: '#FFFFFF'
  },
  cmbc: {
    name: '民生银行',
    icon: ICON_CMBC,
    color: '#0099CC',
    bg: '#FFFFFF'
  },
  spdb: {
    name: '浦发银行',
    icon: ICON_SPDB,
    color: '#6A0DAD',
    bg: '#FFFFFF'
  },
  cib: {
    name: '兴业银行',
    icon: ICON_CIB,
    color: '#003399',
    bg: '#FFFFFF'
  },
  pingan: {
    name: '平安银行',
    icon: ICON_PINGAN,
    color: '#FF6600',
    bg: '#FFFFFF'
  },
  icbc: {
    name: '工商银行',
    icon: ICON_ICBC,
    color: '#E60012',
    bg: '#FFFFFF'
  },
  cgb: {
    name: '广发银行',
    icon: ICON_CGB,
    color: '#E60012',
    bg: '#FFFFFF'
  },
  cmb: {
    name: '招商银行',
    icon: ICON_CMB,
    color: '#E60012',
    bg: '#FFFFFF'
  },
  mybank: {
    name: '网商银行',
    icon: ICON_MYBANK,
    color: '#0066CC',
    bg: '#FFFFFF'
  }
};