/**
 * 支付 / 生活品牌 SVG — 高保真自绘（官方标准色 + 识别图形，非官方素材文件）
 */
import { brandCircle, brandRoundRect } from './brand-svg-util.js'

export const PAYMENT_BRAND_SVGS = {
	// 微信 — 双气泡 + 眼睛
	wechat: brandCircle('#07C160',
		'<ellipse cx="36" cy="42" rx="20" ry="16" fill="#fff"/>' +
		'<ellipse cx="60" cy="54" rx="17" ry="13" fill="#fff"/>' +
		'<circle cx="29" cy="40" r="2.8" fill="#07C160"/><circle cx="43" cy="40" r="2.8" fill="#07C160"/>' +
		'<circle cx="54" cy="52" r="2.3" fill="#07C160"/><circle cx="66" cy="52" r="2.3" fill="#07C160"/>'
	),

	alipay: brandCircle('#1677FF',
		'<text x="50" y="64" text-anchor="middle" fill="#fff" font-size="48" font-weight="700" font-family="PingFang SC,Microsoft YaHei,sans-serif">支</text>'
	),

	// 花呗 — 蓝渐变 + 花瓣
	huabei: (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		'<defs><linearGradient id="hb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#69B1FF"/><stop offset="100%" stop-color="#1677FF"/></linearGradient></defs>' +
		'<circle cx="50" cy="50" r="50" fill="url(#hb)"/>' +
		'<circle cx="50" cy="44" r="16" fill="none" stroke="#fff" stroke-width="3"/>' +
		'<path d="M50 30v28M38 40h24M38 52h24" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' +
		'</svg>'
	),

	jd: brandCircle('#E1251B',
		'<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="32" font-weight="800" font-family="Arial Black,Arial,sans-serif">JD</text>' +
		'<ellipse cx="38" cy="72" rx="6" ry="8" fill="#fff"/><ellipse cx="62" cy="72" rx="6" ry="8" fill="#fff"/>' +
		'<circle cx="38" cy="74" r="3" fill="#E1251B"/><circle cx="62" cy="74" r="3" fill="#E1251B"/>'
	),

	dcep: brandCircle('#CF152D',
		'<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="38" font-weight="700" font-family="system-ui,sans-serif">¥</text>' +
		'<line x1="28" y1="68" x2="72" y2="68" stroke="#fff" stroke-width="3"/>' +
		'<line x1="28" y1="76" x2="72" y2="76" stroke="#fff" stroke-width="3"/>'
	),

	// QQ 企鹅
	qq: brandCircle('#12B7F5',
		'<ellipse cx="50" cy="58" rx="28" ry="26" fill="#fff"/>' +
		'<ellipse cx="50" cy="48" rx="22" ry="20" fill="#12B7F5"/>' +
		'<circle cx="40" cy="44" r="5" fill="#fff"/><circle cx="60" cy="44" r="5" fill="#fff"/>' +
		'<circle cx="41" cy="44" r="2.5" fill="#1a1a1a"/><circle cx="61" cy="44" r="2.5" fill="#1a1a1a"/>' +
		'<ellipse cx="50" cy="52" rx="5" ry="3" fill="#FFA500"/>' +
		'<path d="M36 78c4 6 10 8 14 8s10-2 14-8" stroke="#12B7F5" stroke-width="3" fill="none" stroke-linecap="round"/>'
	),

	// 美团 — 黄底黑袋鼠
	meituan: brandCircle('#FFC300',
		'<path d="M58 28c10 2 16 10 16 20 0 14-12 24-26 26-4 1-8 1-12 0-14-2-26-12-26-26 0-10 6-18 16-20 0 6 4 12 10 14 6-6 10-10 10-18 4 2 8 2 12 4z" fill="#000"/>' +
		'<ellipse cx="42" cy="68" rx="14" ry="11" fill="#000"/>' +
		'<circle cx="36" cy="64" r="3" fill="#FFC300"/><circle cx="48" cy="64" r="3" fill="#FFC300"/>'
	),

	eleme: brandCircle('#0097FF',
		'<text x="50" y="68" text-anchor="middle" fill="#fff" font-size="54" font-weight="900" font-family="Arial Black,Arial,sans-serif">e</text>'
	),

	// 中国移动 — 蓝绿螺旋
	cmcc: brandCircle('#0085CF',
		'<path d="M28 68c0-20 10-36 22-36s22 16 22 36" fill="none" stroke="#8DC63F" stroke-width="9" stroke-linecap="round"/>' +
		'<circle cx="50" cy="32" r="6" fill="#8DC63F"/>'
	),

	telecom: brandCircle('#014DA2',
		'<path d="M50 28c16 0 28 10 28 22s-12 22-28 22S22 62 22 50 34 28 50 28z" fill="none" stroke="#fff" stroke-width="3"/>' +
		'<path d="M34 48c6-10 14-14 16-14s10 4 16 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>' +
		'<path d="M38 56c4 6 8 8 12 8s8-2 12-8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>'
	),

	unicom: brandCircle('#E60012',
		'<path d="M50 24c14 0 26 12 26 26s-12 26-26 26S24 64 24 50 36 24 50 24z" fill="none" stroke="#fff" stroke-width="4"/>' +
		'<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="28" font-weight="700" font-family="Arial,sans-serif">U</text>'
	),

	sinopec: brandCircle('#E60012',
		'<circle cx="50" cy="48" r="16" fill="#fff"/>' +
		'<path d="M50 32 L58 52 L42 52 Z" fill="#E60012"/>' +
		'<path d="M50 64 L42 44 L58 44 Z" fill="#E60012"/>'
	),

	petrochina: brandCircle('#E60012',
		'<circle cx="50" cy="50" r="22" fill="#FFD100"/>' +
		'<path d="M50 32c-6 8-6 16 0 24 6-8 6-16 0-24z" fill="#E60012"/>' +
		'<path d="M38 50c8-6 16-6 24 0-8 6-16 6-24 0z" fill="#E60012"/>'
	),

	'state-grid': brandCircle('#007A3D',
		'<circle cx="50" cy="50" r="24" fill="none" stroke="#fff" stroke-width="2.5"/>' +
		'<ellipse cx="50" cy="50" rx="24" ry="10" fill="none" stroke="#fff" stroke-width="2"/>' +
		'<ellipse cx="50" cy="50" rx="10" ry="24" fill="none" stroke="#fff" stroke-width="2"/>' +
		'<line x1="26" y1="50" x2="74" y2="50" stroke="#fff" stroke-width="2"/>'
	),

	lingqiantong: brandCircle('#F7B52C',
		'<circle cx="50" cy="50" r="22" fill="#fff"/>' +
		'<text x="50" y="58" text-anchor="middle" fill="#F7B52C" font-size="30" font-weight="700">¥</text>'
	),

	licaitong: brandCircle('#2B7DE1',
		'<rect x="28" y="32" width="44" height="36" rx="4" fill="none" stroke="#fff" stroke-width="3"/>' +
		'<path d="M36 56V40h28v16" stroke="#fff" stroke-width="3" fill="none"/>' +
		'<path d="M36 48h20" stroke="#fff" stroke-width="3"/>'
	),

	yuebao: brandCircle('#FF6A00',
		'<circle cx="50" cy="48" r="20" fill="none" stroke="#fff" stroke-width="3.5"/>' +
		'<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="32" font-weight="700" font-family="PingFang SC,Microsoft YaHei,sans-serif">宝</text>'
	),

	douyin: brandCircle('#010101',
		'<path d="M58 28v32a10 10 0 1 1-8-9.8V36a14 14 0 0 0 8 2.2V28h6z" fill="none" stroke="#25F4EE" stroke-width="4" stroke-linejoin="round"/>' +
		'<path d="M60 30v30a9 9 0 1 1-7-8.8V38a12 12 0 0 0 7 1.8V30h5z" fill="none" stroke="#FE2C55" stroke-width="4" stroke-linejoin="round"/>'
	),

	chs: brandCircle('#1A6FB5',
		'<path d="M50 26L76 38V58C76 68 50 78 50 78S24 68 24 58V38Z" fill="#fff"/>' +
		'<rect x="46" y="44" width="8" height="24" fill="#1A6FB5"/>' +
		'<rect x="38" y="52" width="24" height="8" fill="#1A6FB5"/>'
	),

	xiaohebao: brandCircle('#1677FF',
		'<path d="M32 38c0-6 10-10 18-10s18 4 18 10v24c0 6-10 10-18 10s-18-4-18-10V38z" fill="#fff"/>' +
		'<circle cx="42" cy="52" r="3" fill="#1677FF"/><circle cx="58" cy="52" r="3" fill="#1677FF"/>' +
		'<path d="M44 60c4 4 8 4 12 0" stroke="#1677FF" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
	),

	unionpay: brandRoundRect('#FFFFFF',
		'<rect x="20" y="20" width="18" height="60" rx="2" fill="#E21836"/>' +
		'<rect x="41" y="20" width="18" height="60" rx="2" fill="#00447C"/>' +
		'<rect x="62" y="20" width="18" height="60" rx="2" fill="#00A3E0"/>'
	),

	'apple-pay': brandRoundRect('#000000',
		'<path d="M52 34c2-3 5-5 8-5-1 4-2 7-5 10-3 3-6 5-9 5 1-4 3-7 6-10zM44 35c-5 0-9 4-11 9-5 9-1 22 4 29 3 4 6 8 11 8 3 0 5-2 9-2s6 2 9 2c5 0 8-4 11-8 2-3 3-5 5-8-6-2-7-14-1-18-3-3-7-4-11-4-4 0-7 2-10 2s-7-2-10-2z" fill="#fff"/>' +
		'<text x="50" y="82" text-anchor="middle" fill="#fff" font-size="12" font-weight="600" font-family="SF Pro,system-ui,sans-serif">Pay</text>'
	)
}

export const PAYMENT_BRAND_KEYS = Object.keys(PAYMENT_BRAND_SVGS)
