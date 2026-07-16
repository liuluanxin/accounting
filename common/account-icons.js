/**
 * 账户图标库
 * 所有图标均为 100x100 圆形品牌 SVG data URI 格式
 * 背景色为品牌色，图案为白色
 */

// ========== 辅助函数 ==========

function encodeSvg(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// SVG 模板函数：生成圆形背景 + 白色图案
function makeSvg(bgColor, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${bgColor}"/>
  ${content}
</svg>`
}

// ========== 1. 微信 (WeChat) ==========
// 白色对话气泡带对勾
const SVG_WECHAT = makeSvg('#07C160', `
  <path d="M30 35 Q30 26 38 26 L62 26 Q70 26 70 35 L70 56 Q70 64 62 64 L54 64 L44 72 L44 64 L38 64 Q30 64 30 56 Z" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M40 44 L48 53 L60 39" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
`)
export const ICON_WECHAT = encodeSvg(SVG_WECHAT)

// ========== 2. 支付宝 (Alipay) ==========
// 白色"支"字
const SVG_ALIPAY = makeSvg('#1677FF', `
  <text x="50" y="68" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">支</text>
`)
export const ICON_ALIPAY = encodeSvg(SVG_ALIPAY)

// ========== 3. 花呗 (Huabei) ==========
// 白色抽象花瓣曲线
const SVG_HUABEI = makeSvg('#1677FF', `
  <path d="M50 28 Q36 34 32 48 Q28 62 38 68 Q48 74 50 68 Q52 74 62 68 Q72 62 68 48 Q64 34 50 28Z" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M50 43 Q44 50 47 56" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 43 Q56 50 53 56" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
`)
export const ICON_HUABEI = encodeSvg(SVG_HUABEI)

// ========== 4. 京东 (JD) ==========
// 白色"JD"字母
const SVG_JD = makeSvg('#E4393C', `
  <text x="50" y="65" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">JD</text>
`)
export const ICON_JD = encodeSvg(SVG_JD)

// ========== 5. 数字人民币 (e-CNY) ==========
// 白色"e"符号 + ¥
const SVG_ECNY = makeSvg('#E60012', `
  <text x="50" y="52" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">e</text>
  <text x="50" y="76" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">¥</text>
`)
export const ICON_ECNY = encodeSvg(SVG_ECNY)

// ========== 6. QQ钱包 (QQ Wallet) ==========
// 白色企鹅剪影
const SVG_QQWALLET = makeSvg('#000000', `
  <ellipse cx="50" cy="58" rx="16" ry="20" fill="#FFFFFF"/>
  <circle cx="50" cy="32" r="13" fill="#FFFFFF"/>
  <circle cx="45" cy="30" r="2.5" fill="#000000"/>
  <circle cx="55" cy="30" r="2.5" fill="#000000"/>
  <polygon points="50,34 46,38 54,38" fill="#FFA500"/>
  <rect x="39" y="42" width="22" height="3.5" rx="1.5" fill="#E60012"/>
`)
export const ICON_QQWALLET = encodeSvg(SVG_QQWALLET)

// ========== 7. 美团 (Meituan) ==========
// 黄色袋鼠剪影（袋鼠无填充，保留黄色背景）
const SVG_MEITUAN = makeSvg('#FFC107', `
  <path d="M38 66 Q34 50 38 38 Q42 28 50 30 Q55 32 56 38 Q58 34 62 36 Q66 40 64 48 Q68 52 68 58 Q68 64 62 66 L57 66 L54 72 L50 66 Z" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
`)
export const ICON_MEITUAN = encodeSvg(SVG_MEITUAN)

// ========== 8. 饿了么 (Ele.me) ==========
// 白色"e"字母带弧线
const SVG_ELEME = makeSvg('#0088FF', `
  <text x="50" y="65" font-size="40" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif" font-style="italic">e</text>
  <path d="M35 54 Q50 68 65 54" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
`)
export const ICON_ELEME = encodeSvg(SVG_ELEME)

// ========== 9. 中国移动 (China Mobile) ==========
// 蓝绿渐变螺旋（用两个半圆表示）
const SVG_CHINAMOBILE = makeSvg('#00A650', `
  <path d="M50 30 A20 20 0 0 1 70 50 A20 20 0 0 1 50 70" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 30 A20 20 0 0 0 30 50 A20 20 0 0 0 50 70" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
`)
export const ICON_CHINAMOBILE = encodeSvg(SVG_CHINAMOBILE)

// ========== 10. 中国电信 (China Telecom) ==========
// 白色展翅/翅膀造型
const SVG_CHINATELECOM = makeSvg('#0055AA', `
  <path d="M32 62 Q28 46 38 36 Q46 28 54 34 Q50 40 46 46 Q40 52 42 62 Z" fill="#FFFFFF"/>
  <path d="M68 62 Q72 46 62 36 Q54 28 46 34 Q50 40 54 46 Q60 52 58 62 Z" fill="#FFFFFF"/>
`)
export const ICON_CHINATELECOM = encodeSvg(SVG_CHINATELECOM)

// ========== 11. 中国联通 (China Unicom) ==========
// 白色中国结图案
const SVG_CHINAUNICOM = makeSvg('#E60012', `
  <path d="M50 25 L50 75" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M25 50 L75 50" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="50" cy="50" r="8" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="50" cy="25" r="5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="50" cy="75" r="5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="25" cy="50" r="5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="75" cy="50" r="5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
`)
export const ICON_CHINAUNICOM = encodeSvg(SVG_CHINAUNICOM)

// ========== 12. 中石化 (Sinopec) ==========
// 白色火焰/太阳图案
const SVG_SINOPEC = makeSvg('#E60012', `
  <circle cx="50" cy="50" r="15" fill="#FFFFFF"/>
  <path d="M50 18 L50 26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 74 L50 82" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M18 50 L26 50" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M74 50 L82 50" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M28 28 L34 34" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M66 66 L72 72" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M28 72 L34 66" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <path d="M66 34 L72 28" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
`)
export const ICON_SINOPEC = encodeSvg(SVG_SINOPEC)

// ========== 13. 中石油 (CNPC) ==========
// 红黄太阳花（黄色花心 + 红色花瓣）——全白图案
const SVG_CNPC = makeSvg('#FF6600', `
  <circle cx="50" cy="50" r="16" fill="#FFFFFF"/>
  <ellipse cx="50" cy="26" rx="6" ry="10" fill="#FFFFFF"/>
  <ellipse cx="50" cy="74" rx="6" ry="10" fill="#FFFFFF"/>
  <ellipse cx="26" cy="50" rx="10" ry="6" fill="#FFFFFF"/>
  <ellipse cx="74" cy="50" rx="10" ry="6" fill="#FFFFFF"/>
  <ellipse cx="33" cy="33" rx="6" ry="10" fill="#FFFFFF" transform="rotate(-45 33 33)"/>
  <ellipse cx="67" cy="67" rx="6" ry="10" fill="#FFFFFF" transform="rotate(-45 67 67)"/>
  <ellipse cx="67" cy="33" rx="6" ry="10" fill="#FFFFFF" transform="rotate(45 67 33)"/>
  <ellipse cx="33" cy="67" rx="6" ry="10" fill="#FFFFFF" transform="rotate(45 33 67)"/>
`)
export const ICON_CNPC = encodeSvg(SVG_CNPC)

// ========== 14. 国家电网 (State Grid) ==========
// 白色地球 + 电网线条
const SVG_STATEGRID = makeSvg('#008800', `
  <circle cx="50" cy="50" r="22" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <ellipse cx="50" cy="50" rx="22" ry="10" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
  <path d="M28 50 L72 50" stroke="#FFFFFF" stroke-width="2.5"/>
  <path d="M40 28 L40 72" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M60 28 L60 72" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M33 35 L33 65" stroke="#FFFFFF" stroke-width="1.5"/>
  <path d="M67 35 L67 65" stroke="#FFFFFF" stroke-width="1.5"/>
`)
export const ICON_STATEGRID = encodeSvg(SVG_STATEGRID)

// ========== 15. 零钱通 (Lingqiantong) ==========
// 白色钻石切割面
const SVG_LINGQIANGTONG = makeSvg('#FFD700', `
  <polygon points="50,25 30,45 50,75 70,45" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
  <line x1="50" y1="25" x2="50" y2="75" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="30" y1="45" x2="70" y2="45" stroke="#FFFFFF" stroke-width="2.5"/>
  <line x1="40" y1="35" x2="40" y2="60" stroke="#FFFFFF" stroke-width="2"/>
  <line x1="60" y1="35" x2="60" y2="60" stroke="#FFFFFF" stroke-width="2"/>
`)
export const ICON_LINGQIANGTONG = encodeSvg(SVG_LINGQIANGTONG)

// ========== 16. 理财通 (Licaitong) ==========
// 白色企鹅 + 钱币
const SVG_LICAITONG = makeSvg('#0066FF', `
  <circle cx="50" cy="50" r="22" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <text x="50" y="57" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">¥</text>
`)
export const ICON_LICAITONG = encodeSvg(SVG_LICAITONG)

// ========== 17. 余额宝 (Yuebao) ==========
// 白色元宝 / 人形
const SVG_YUEBAO = makeSvg('#FF6600', `
  <path d="M35 56 Q50 46 65 56 L60 72 L40 72 Z" fill="#FFFFFF"/>
  <path d="M35 56 Q50 50 65 56" fill="none" stroke="#FF6600" stroke-width="2"/>
  <circle cx="50" cy="38" r="8" fill="#FFFFFF"/>
`)
export const ICON_YUEBAO = encodeSvg(SVG_YUEBAO)

// ========== 18. 抖音钱包 (Douyin) ==========
// 白色音符
const SVG_DOUYIN = makeSvg('#000000', `
  <circle cx="42" cy="62" r="8" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M50 62 L50 32" stroke="#FFFFFF" stroke-width="3"/>
  <path d="M50 32 Q60 28 65 38" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <circle cx="65" cy="38" r="2" fill="#FFFFFF"/>
`)
export const ICON_DOUYIN = encodeSvg(SVG_DOUYIN)

// ========== 19. 中国医疗 (CHS Medical) ==========
// 白色"CHS"文字
const SVG_CHNMEDICAL = makeSvg('#0066FF', `
  <text x="50" y="65" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">CHS</text>
`)
export const ICON_CHNMEDICAL = encodeSvg(SVG_CHNMEDICAL)

// ========== 20. 小荷包 (Xiaohebao) ==========
// 白色荷包 / 钱袋
const SVG_XIAOHEBAO = makeSvg('#FF8800', `
  <path d="M35 40 Q35 30 50 28 Q65 30 65 40 L68 66 Q68 73 50 73 Q32 73 32 66 Z" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M40 40 L40 48" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M60 40 L60 48" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M45 42 L55 42" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
`)
export const ICON_XIAOHEBAO = encodeSvg(SVG_XIAOHEBAO)

// ========== 图标映射表 ==========

export const ACCOUNT_ICONS_MAP = {
  wechat:       { name: '微信',       icon: ICON_WECHAT,       color: '#07C160', bg: '#07C160' },
  alipay:       { name: '支付宝',     icon: ICON_ALIPAY,       color: '#1677FF', bg: '#1677FF' },
  huabei:       { name: '花呗',       icon: ICON_HUABEI,       color: '#1677FF', bg: '#1677FF' },
  jd:           { name: '京东',       icon: ICON_JD,           color: '#E4393C', bg: '#E4393C' },
  ecny:         { name: '数字人民币', icon: ICON_ECNY,         color: '#E60012', bg: '#E60012' },
  qqwallet:     { name: 'QQ钱包',     icon: ICON_QQWALLET,     color: '#000000', bg: '#000000' },
  meituan:      { name: '美团',       icon: ICON_MEITUAN,      color: '#FFC107', bg: '#FFC107' },
  eleme:        { name: '饿了么',     icon: ICON_ELEME,        color: '#0088FF', bg: '#0088FF' },
  chinamobile:  { name: '中国移动',   icon: ICON_CHINAMOBILE,  color: '#00A650', bg: '#00A650' },
  chinatelecom: { name: '中国电信',   icon: ICON_CHINATELECOM, color: '#0055AA', bg: '#0055AA' },
  chinaunicom:  { name: '中国联通',   icon: ICON_CHINAUNICOM,  color: '#E60012', bg: '#E60012' },
  sinopec:      { name: '中石化',     icon: ICON_SINOPEC,      color: '#E60012', bg: '#E60012' },
  cnpc:         { name: '中石油',     icon: ICON_CNPC,         color: '#FF6600', bg: '#FF6600' },
  stategrid:    { name: '国家电网',   icon: ICON_STATEGRID,    color: '#008800', bg: '#008800' },
  lingqiantong: { name: '零钱通',     icon: ICON_LINGQIANGTONG, color: '#FFD700', bg: '#FFD700' },
  licaitong:    { name: '理财通',     icon: ICON_LICAITONG,    color: '#0066FF', bg: '#0066FF' },
  yuebao:       { name: '余额宝',     icon: ICON_YUEBAO,       color: '#FF6600', bg: '#FF6600' },
  douyin:       { name: '抖音钱包',   icon: ICON_DOUYIN,       color: '#000000', bg: '#000000' },
  chnmedical:   { name: '中国医疗',   icon: ICON_CHNMEDICAL,   color: '#0066FF', bg: '#0066FF' },
  xiaohebao:    { name: '小荷包',     icon: ICON_XIAOHEBAO,    color: '#FF8800', bg: '#FF8800' },
}