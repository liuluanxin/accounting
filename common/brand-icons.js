/**
 * 支付 / 生活品牌 SVG — 高保真自绘（官方标准色 + 识别图形，非官方素材文件）
 */
import { brandCircle, brandRoundRect } from './brand-svg-util.js'

export const PAYMENT_BRAND_SVGS = {
	// 微信 — 双气泡 + 眼睛
	wechat: brandCircle('#07C160',
		'<g transform="translate(12, 12) scale(3.1667)"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" fill="#fff"/></g>'
	),

	alipay: brandCircle('#1677FF',
		'<g transform="translate(12, 12) scale(3.1667)"><path d="M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809z" fill="#fff"/></g>'
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
		'<g transform="translate(12, 12) scale(3.1667)"><path d="M6.923 0c-2.408 0-3.28.25-4.16.721A4.906 4.907 0 0 0 .722 2.763C.25 3.643 0 4.516 0 6.923v10.154c0 2.407.25 3.28.72 4.16a4.905 4.906 0 0 0 2.042 2.042c.88.47 1.752.721 4.16.721h10.156c2.407 0 3.28-.25 4.16-.721a4.906 4.907 0 0 0 2.04-2.042c.471-.88.722-1.753.722-4.16V6.923c0-2.407-.25-3.28-.722-4.16A4.906 4.907 0 0 0 21.238.72C20.357.251 19.484 0 17.077 0ZM4.17 7.51h1.084c.04.24.07.488.11.737h3.47c.05-.25.08-.497.1-.736h1.105a9.849 9.85 0 0 1-.09.736h1.562v.866H7.62v.696h3.642v.855h-3.64v.667h3.64v.854h-3.64v.816h3.89v.865H7.88c.775.935 2.218 1.532 3.78 1.651l-.538.936c-1.442-.17-3.103-.846-4.028-2.04-.856 1.194-2.487 1.92-4.525 2.07l.318-1.005c1.382-.02 2.814-.736 3.431-1.612h-3.62v-.865h3.86v-.816h-3.64v-.854h3.64v-.667h-3.64v-.855h3.64v-.697H2.7v-.866h1.56zm8.603.182h7.976c.358 0 .567.198.567.547v8.146H13.33c-.358 0-.557-.199-.557-.547zm1.044.885V15.5h6.455V8.577Zm3.999.476h1.024v.756h.975v.835h-.975V13c0 .806-.1 1.402-.318 2.02h-1.113c.338-.717.408-1.224.408-1.99v-2.387h-.935c-.14 1.541-.736 3.451-1.363 4.376h-1.134c.607-.855 1.303-2.526 1.472-4.376h-1.512v-.835h3.472z" fill="#fff"/></g>'
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
