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
// 真实 simple-icons 微信图标
const SVG_WECHAT = makeSvg('#07C160', `
  <g transform="translate(12, 12) scale(3.1667)">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </g>
`)
export const ICON_WECHAT = encodeSvg(SVG_WECHAT)

// ========== 2. 支付宝 (Alipay) ==========
// 真实 simple-icons 支付宝图标
const SVG_ALIPAY = makeSvg('#1677FF', `
  <g transform="translate(12, 12) scale(3.1667)">
    <path d="M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809"/>
  </g>
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
// 真实 simple-icons QQ图标
const SVG_QQWALLET = makeSvg('#000000', `
  <g transform="translate(12, 12) scale(3.1667)">
    <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/>
  </g>
`)
export const ICON_QQWALLET = encodeSvg(SVG_QQWALLET)

// ========== 7. 美团 (Meituan) ==========
// 真实 simple-icons 美团图标
const SVG_MEITUAN = makeSvg('#FFC107', `
  <g transform="translate(12, 12) scale(3.1667)">
    <path d="M6.923 0c-2.408 0-3.28.25-4.16.721A4.906 4.907 0 0 0 .722 2.763C.25 3.643 0 4.516 0 6.923v10.154c0 2.407.25 3.28.72 4.16a4.905 4.906 0 0 0 2.042 2.042c.88.47 1.752.721 4.16.721h10.156c2.407 0 3.28-.25 4.16-.721a4.906 4.907 0 0 0 2.04-2.042c.471-.88.722-1.753.722-4.16V6.923c0-2.407-.25-3.28-.722-4.16A4.906 4.907 0 0 0 21.238.72C20.357.251 19.484 0 17.077 0Z"/>
    <path d="M4.17 7.51h1.084c.04.24.07.488.11.737h3.47c.05-.25.08-.497.1-.736h1.105a9.849 9.85 0 0 1-.09.736h1.562v.866H7.62v.696h3.642v.855h-3.64v.667h3.64v.854h-3.64v.816h3.89v.865H7.88c.775.935 2.218 1.532 3.78 1.651l-.538.936c-1.442-.17-3.103-.846-4.028-2.04-.856 1.194-2.487 1.92-4.525 2.07l.318-1.005c1.382-.02 2.814-.736 3.431-1.612h-3.62v-.865h3.86v-.816h-3.64v-.854h3.64v-.667h-3.64v-.855h3.64v-.697H2.7v-.866h1.56zm8.603.182h7.976c.358 0 .567.198.567.547v8.146H13.33c-.358 0-.557-.199-.557-.547zm1.044.885V15.5h6.455V8.577Zm3.999.476h1.024v.756h.975v.835h-.975V13c0 .806-.1 1.402-.318 2.02h-1.113c.338-.717.408-1.224.408-1.99v-2.387h-.935c-.14 1.541-.736 3.451-1.363 4.376h-1.134c.607-.855 1.303-2.526 1.472-4.376h-1.512v-.835h3.472z"/>
  </g>
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