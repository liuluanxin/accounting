// ============================================================
// 银行图标库 — 高保真自绘（官方标准色 + 识别图形）
// viewBox 100×100，满铺圆底（与支付品牌一致）
// ============================================================

import { brandCircle } from './brand-svg-util.js'

function bankDataUri(svg) {
	return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/** 原始 SVG 字符串（供 static/brands 导出与 data URI 共用） */
export const BANK_BRAND_SVGS = {
	icbc: brandCircle('#C7000B',
		'<rect x="28" y="28" width="44" height="44" rx="6" fill="none" stroke="#fff" stroke-width="4.5"/>' +
		'<rect x="38" y="36" width="24" height="5" fill="#fff"/>' +
		'<rect x="47.5" y="36" width="5" height="28" fill="#fff"/>' +
		'<rect x="38" y="59" width="24" height="5" fill="#fff"/>'
	),
	ccb: brandCircle('#003A8F',
		'<path d="M68 28C82 28 90 38 90 50C90 62 82 72 68 72H54C68 62 68 38 54 28H68Z" fill="#fff" opacity=".95"/>' +
		'<path d="M54 28H68C82 28 90 38 90 50C90 62 82 72 68 72H54V58C66 58 66 42 54 42V28Z" fill="#fff"/>'
	),
	abchina: brandCircle('#009944',
		'<circle cx="50" cy="50" r="18" fill="#fff"/>' +
		'<rect x="45" y="45" width="10" height="10" rx="1" fill="#009944"/>' +
		'<ellipse cx="32" cy="36" rx="8" ry="3.5" fill="#fff" transform="rotate(-30 32 36)"/>' +
		'<ellipse cx="24" cy="50" rx="8" ry="3.5" fill="#fff"/>' +
		'<ellipse cx="32" cy="64" rx="8" ry="3.5" fill="#fff" transform="rotate(30 32 64)"/>' +
		'<ellipse cx="68" cy="36" rx="8" ry="3.5" fill="#fff" transform="rotate(30 68 36)"/>' +
		'<ellipse cx="76" cy="50" rx="8" ry="3.5" fill="#fff"/>' +
		'<ellipse cx="68" cy="64" rx="8" ry="3.5" fill="#fff" transform="rotate(-30 68 64)"/>'
	),
	boc: brandCircle('#C7000B',
		'<circle cx="50" cy="50" r="26" fill="#fff"/>' +
		'<rect x="44" y="34" width="12" height="32" fill="#C7000B"/>' +
		'<rect x="34" y="44" width="32" height="12" fill="#C7000B"/>'
	),
	bankcomm: brandCircle('#003A8F',
		'<path d="M22 58C38 34 50 50 50 50C50 50 62 34 78 58C62 70 50 56 50 56C50 56 38 70 22 58Z" fill="#fff"/>'
	),
	cmb: brandCircle('#C7000B',
		'<path d="M22 72L40 30L50 48L60 30L78 72L66 72L56 50L50 60L44 50L34 72Z" fill="#fff"/>'
	),
	spdb: brandCircle('#1D2088',
		'<path d="M62 28C48 28 44 40 44 48C44 56 48 60 54 60C60 60 62 64 62 70C62 78 54 82 44 82" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>'
	),
	citic: brandCircle('#E60012',
		'<rect x="30" y="32" width="40" height="8" fill="#fff"/>' +
		'<rect x="46" y="32" width="8" height="36" fill="#fff"/>' +
		'<rect x="30" y="60" width="40" height="8" fill="#fff"/>'
	),
	cebbank: (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		'<circle cx="50" cy="50" r="50" fill="#fff"/>' +
		'<defs><linearGradient id="ceb" x1="0" y1="0" x2="1" y2="1">' +
		'<stop offset="0%" stop-color="#FFD700"/><stop offset="50%" stop-color="#FF69B4"/><stop offset="100%" stop-color="#4169E1"/></linearGradient></defs>' +
		'<path d="M28 24H72V36H40V44H68V56H40V64H72V76H28Z" fill="url(#ceb)"/>' +
		'</svg>'
	),
	cmbc: (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		'<circle cx="50" cy="50" r="50" fill="#fff"/>' +
		'<defs><linearGradient id="cmbc" x1="0" y1="0" x2="1" y2="1">' +
		'<stop offset="0%" stop-color="#0099CC"/><stop offset="100%" stop-color="#00B388"/></linearGradient></defs>' +
		'<path d="M64 28C48 28 44 42 44 50C44 58 48 62 54 62C60 62 64 66 64 74C64 82 54 86 42 86" fill="none" stroke="url(#cmbc)" stroke-width="8" stroke-linecap="round"/>' +
		'</svg>'
	),
	cib: brandCircle('#003A8F',
		'<circle cx="50" cy="50" r="20" fill="none" stroke="#fff" stroke-width="5"/>' +
		'<circle cx="50" cy="50" r="6" fill="#fff"/>'
	),
	pingan: (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		'<defs><linearGradient id="pa" x1="0" y1="0" x2="1" y2="1">' +
		'<stop offset="0%" stop-color="#FF6600"/><stop offset="100%" stop-color="#E60012"/></linearGradient></defs>' +
		'<circle cx="50" cy="50" r="50" fill="url(#pa)"/>' +
		'<text x="50" y="58" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="PingFang SC,Microsoft YaHei,sans-serif">平安</text>' +
		'</svg>'
	),
	cgb: brandCircle('#E60012',
		'<path d="M50 28L78 72H22Z" fill="#fff"/>' +
		'<path d="M50 42L64 68H36Z" fill="#E60012"/>'
	),
	psbc: brandCircle('#007E3E',
		'<path d="M50 24L80 56H62V76H38V56H20Z" fill="#fff"/>'
	),
	mybank: brandCircle('#0066CC',
		'<path d="M26 72L38 32L50 50L62 32L74 72L64 72L54 48L50 56L46 48L36 72Z" fill="#fff"/>'
	)
}

export const ICON_ICBC = bankDataUri(BANK_BRAND_SVGS.icbc)
export const ICON_CCB = bankDataUri(BANK_BRAND_SVGS.ccb)
export const ICON_ABCHINA = bankDataUri(BANK_BRAND_SVGS.abchina)
export const ICON_BOC = bankDataUri(BANK_BRAND_SVGS.boc)
export const ICON_BANKCOMM = bankDataUri(BANK_BRAND_SVGS.bankcomm)
export const ICON_CMB = bankDataUri(BANK_BRAND_SVGS.cmb)
export const ICON_SPDB = bankDataUri(BANK_BRAND_SVGS.spdb)
export const ICON_CITIC = bankDataUri(BANK_BRAND_SVGS.citic)
export const ICON_CEBBANK = bankDataUri(BANK_BRAND_SVGS.cebbank)
export const ICON_CMBC = bankDataUri(BANK_BRAND_SVGS.cmbc)
export const ICON_CIB = bankDataUri(BANK_BRAND_SVGS.cib)
export const ICON_PINGAN = bankDataUri(BANK_BRAND_SVGS.pingan)
export const ICON_CGB = bankDataUri(BANK_BRAND_SVGS.cgb)
export const ICON_PSBC = bankDataUri(BANK_BRAND_SVGS.psbc)
export const ICON_MYBANK = bankDataUri(BANK_BRAND_SVGS.mybank)

export const BANK_ICONS_MAP = {
	citic: { name: '中信银行', icon: ICON_CITIC, color: '#E60012', bg: '#E60012' },
	cebbank: { name: '光大银行', icon: ICON_CEBBANK, color: '#FFD700', bg: '#FFFFFF' },
	abchina: { name: '农业银行', icon: ICON_ABCHINA, color: '#009944', bg: '#009944' },
	ccb: { name: '建设银行', icon: ICON_CCB, color: '#003A8F', bg: '#003A8F' },
	psbc: { name: '邮政储蓄', icon: ICON_PSBC, color: '#007E3E', bg: '#007E3E' },
	boc: { name: '中国银行', icon: ICON_BOC, color: '#C7000B', bg: '#C7000B' },
	bankcomm: { name: '交通银行', icon: ICON_BANKCOMM, color: '#003A8F', bg: '#003A8F' },
	cmbc: { name: '民生银行', icon: ICON_CMBC, color: '#0099CC', bg: '#FFFFFF' },
	spdb: { name: '浦发银行', icon: ICON_SPDB, color: '#1D2088', bg: '#1D2088' },
	cib: { name: '兴业银行', icon: ICON_CIB, color: '#003A8F', bg: '#003A8F' },
	pingan: { name: '平安银行', icon: ICON_PINGAN, color: '#FF6600', bg: '#FF6600' },
	icbc: { name: '工商银行', icon: ICON_ICBC, color: '#C7000B', bg: '#C7000B' },
	cgb: { name: '广发银行', icon: ICON_CGB, color: '#E60012', bg: '#E60012' },
	cmb: { name: '招商银行', icon: ICON_CMB, color: '#C7000B', bg: '#C7000B' },
	mybank: { name: '网商银行', icon: ICON_MYBANK, color: '#0066CC', bg: '#0066CC' }
}
