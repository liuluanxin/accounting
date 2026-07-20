/**
 * Lucide 风格线性图标 + 品牌 Logo（对齐 HTML 交互原型）
 * 分类图标使用 ICON_EMOJI（Twemoji/Emoji），操作图标用本模块
 */

import { BANK_ICONS_MAP } from '@/common/account-icons-bank.js'
import { PAYMENT_BRAND_SVGS, PAYMENT_BRAND_KEYS } from '@/common/brand-icons.js'
import { BANK_ALIASES, getBrandAssetSrc } from '@/common/brand-assets.js'

export { BANK_ALIASES }

export const ICON_INNER = {
	planet: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="15" ry="5" transform="rotate(-22 12 12)"/>',
	search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>',
	receipt: '<path d="M5 3v18l2-1.5L9 22l2-1.5L13 22l2-1.5L17 22l2-1.5L21 22V3l-2 1.5L17 2l-2 1.5L13 2l-2 1.5L9 2l-2 1.5z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/>',
	pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
	eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
	'eye-off': '<path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13 13 0 0 1-2.2 3"/><path d="M6.6 6.6A13 13 0 0 0 2 11s3.5 7 10 7a9.6 9.6 0 0 0 4.3-1"/><line x1="2" y1="2" x2="22" y2="22"/>',
	banknote: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
	'credit-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
	'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
	utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a3 3 0 0 0-3 3v11a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2z"/><path d="M18 22V11"/>',
	car: '<path d="M5 17h14l-1.6-5.2A2 2 0 0 0 15.5 10H8.5a2 2 0 0 0-1.9 1.5L5 17z"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/>',
	'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
	home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>',
	wallet: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M21 10h-5a2 2 0 0 0 0 4h5"/>',
	plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
	check: '<polyline points="20 6 9 17 4 12"/>',
	'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
	'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
	'chevron-up': '<polyline points="18 15 12 9 6 15"/>',
	'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
	calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',
	user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
	'bar-chart': '<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/>',
	sliders: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2"/>',
	'more-vertical': '<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',
	tag: '<path d="M11 3H4a1 1 0 0 0-1 1v7l9 9 8-8-9-9z"/><circle cx="7" cy="7" r="1.5"/>',
	upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
	cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.7 1.5A4 4 0 0 0 6 19z"/>',
	download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
	palette: '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 1 0 0 20c1 0 1.5-.8 1.5-1.5 0-.4-.2-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5h2A4.5 4.5 0 0 0 12 2z"/>',
	info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
	bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.5 21a2 2 0 0 0 3 0"/>',
	trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
	save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
	'list-ordered': '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><path d="M4 6h1v4M4 10h2"/><path d="M4 12h1v4M4 16h2"/>',
	lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
	x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
	delete: '<path d="M21 4H8l-5 8 5 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="16" y1="9" x2="11" y2="14"/><line x1="11" y1="9" x2="16" y2="14"/>',
	subway: '<path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"/><path d="M9 2v5"/><path d="M15 2v5"/><path d="M4 10h16v6H4z"/>',
	camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
	folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.6a2 2 0 0 1-1.5-.7L7.5 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
	heart: '<path d="M19 14c1.5-1.5 3-3.5 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2 1.5 4 3 5.5l7 7z"/>',
	'alert-triangle': '<path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
	'gamepad-2': '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
	handshake: '<path d="m11 13 3-3"/><path d="M8 10l-3 3 3 3 3-3"/><path d="M16 10l3 3-3 3-3-3"/>',
	gift: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M3 8v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8"/>',
	mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,12 2,4"/>',
	lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
	shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
}

/** 分类彩色 Emoji（Twemoji 体系，与原型一致） */
export const ICON_EMOJI = {
	cloche: '🍜', apple: '🍎', cookie: '🍪', car: '🚗', 'shopping-bag': '🛍️', handshake: '🤝',
	utensils: '🍴', coffee: '☕', subway: '🚇', banknote: '💰', 'trending-up': '📈',
	home: '🏠', gift: '🧧', tag: '🏷️', 'gamepad-2': '🎮', wallet: '👛'
}

export const CAT_META = {
	'日常': { color: '#FF6B6B', emoji: '🏠' },
	'社交': { color: '#4A90D9', emoji: '🤝' },
	'零食': { color: '#34C759', emoji: '🍪' },
	'购物': { color: '#FFB020', emoji: '🛍️' },
	'交通': { color: '#9B59B6', emoji: '🚗' },
	'餐饮': { color: '#FF8C42', emoji: '🍴' },
	'工资': { color: '#2ECC71', emoji: '💰' },
	'红包': { color: '#E84393', emoji: '🧧' }
}

/** 品牌 Logo SVG（app-logo + 支付生活，银行走 BANK_ICONS_MAP） */
export const BRAND_LOGOS = {
	'app-logo': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><radialGradient id="pg" cx="35%" cy="30%"><stop offset="0%" stop-color="#C7E4FF"/><stop offset="55%" stop-color="#7FB8F0"/><stop offset="100%" stop-color="#5B9BE0"/></radialGradient></defs><g transform="translate(12 12) scale(1.2) translate(-12 -12)"><circle cx="12" cy="12" r="9.5" fill="url(#pg)"/><ellipse cx="12" cy="12" rx="16" ry="5.5" transform="rotate(-22 12 12)" stroke="#8FC9FF" stroke-width="2.5" fill="none" opacity="0.7"/><circle cx="16" cy="8" r="1.8" fill="#FFD66B"/></g></svg>',
	...PAYMENT_BRAND_SVGS
}

/** 图标内容放大系数（银行白底圆适当放大 Logo） */
export const ICON_CONTENT_SCALE = 1.22

function svgToDataUri(svg) {
	if (!svg) return ''
	if (svg.startsWith('data:')) return svg
	return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/** 以 viewBox 中心放大 SVG 内容（用于银行 data URI 等） */
function zoomSvgDataUri(dataUri, scale = ICON_CONTENT_SCALE) {
	if (!dataUri || !dataUri.startsWith('data:image/svg+xml')) return dataUri
	try {
		const svg = decodeURIComponent(dataUri.slice(dataUri.indexOf(',') + 1))
		const match = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i)
		if (!match) return dataUri
		const attrs = match[1]
		const vbMatch = attrs.match(/viewBox=["']([^"']+)["']/)
		const vb = vbMatch ? vbMatch[1] : '0 0 24 24'
		const p = vb.split(/[\s,]+/).map(Number)
		const cx = p[0] + p[2] / 2
		const cy = p[1] + p[3] / 2
		const zoomed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><g transform="translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})">${match[2]}</g></svg>`
		return svgToDataUri(zoomed)
	} catch (e) {
		return dataUri
	}
}

function buildStrokeSvg(name, color = '#5A6B8A') {
	const inner = ICON_INNER[name] || ICON_INNER.tag
	const s = ICON_CONTENT_SCALE
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(12 12) scale(${s}) translate(-12 -12)">${inner}</g></svg>`
}

/** 生成可在 image 标签中使用的图标地址（本地素材优先，否则 SVG data URI） */
export function iconSrc(name, color = '#5A6B8A', brand = false) {
	const bankKey = BANK_ALIASES[name] || name
	const isPaymentBrand = PAYMENT_BRAND_KEYS.includes(name) || name === 'app-logo'
	const isBankBrand = !!(BANK_ICONS_MAP[bankKey] && !isPaymentBrand)
	const wantsBrand = brand || isPaymentBrand || isBankBrand

	if (wantsBrand) {
		const asset = getBrandAssetSrc(name) || getBrandAssetSrc(bankKey)
		if (asset) return asset
	}

	if (isBankBrand) {
		const bank = BANK_ICONS_MAP[bankKey]
		if (bank && bank.icon) return bank.icon
	}
	if ((brand || isPaymentBrand) && BRAND_LOGOS[name]) {
		return svgToDataUri(BRAND_LOGOS[name])
	}
	return svgToDataUri(buildStrokeSvg(name, color))
}

export function isBrandIcon(name) {
	const bankKey = BANK_ALIASES[name] || name
	return !!(
		getBrandAssetSrc(name) ||
		getBrandAssetSrc(bankKey) ||
		BRAND_LOGOS[name] ||
		BANK_ICONS_MAP[bankKey]
	)
}

export function isBrandAssetIcon(name) {
	const bankKey = BANK_ALIASES[name] || name
	return !!(getBrandAssetSrc(name) || getBrandAssetSrc(bankKey))
}

/** 创建账户页图标列表（来自注册表） */
export { ACC_ICON_KEYS } from '@/common/account-icon-registry.js'
export { getAccountIconLabel, searchAccountIcons, getAccountIcons } from '@/common/account-icon-registry.js'
export {
	getBrandAssetSrc,
	hasBrandAsset,
	expectedBrandAssetPath,
	ALL_BRAND_ICON_KEYS
} from '@/common/brand-assets.js'

export function iconSvg(name, size = '1em') {
	const inner = ICON_INNER[name] || ''
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:${size};height:${size};display:block">${inner}</svg>`
}

export function icon2(name, size = '1em') {
	return BRAND_LOGOS[name] || iconSvg(name, size)
}

export function catEmoji(iconKey) {
	return ICON_EMOJI[iconKey] || '📦'
}
