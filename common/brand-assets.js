/**
 * 官方品牌 Logo 本地素材（PNG / WebP / SVG）
 * 放置目录：/static/brands/
 * 解析顺序：本地素材 → 自绘 SVG 兜底（lucide-icons.js）
 */

/** 账户图标 key 与银行库 key 别名 */
export const BANK_ALIASES = {
	abc: 'abchina',
	comm: 'bankcomm'
}

export function resolveBrandKey(key) {
	return BANK_ALIASES[key] || key
}

/**
 * 已登记的品牌素材（由 scripts/export-brand-logos.mjs 自动生成/更新）
 * 手动替换：将官方 PNG 放入 static/brands/ 后改扩展名为 .png 并更新本表
 */
export const BRAND_ASSETS = {
	abchina: '/static/brands/abchina.svg',
	alipay: '/static/brands/alipay.png',
	'apple-pay': '/static/brands/apple-pay.png',
	bankcomm: '/static/brands/bankcomm.svg',
	boc: '/static/brands/boc.svg',
	ccb: '/static/brands/ccb.svg',
	cebbank: '/static/brands/cebbank.svg',
	cgb: '/static/brands/cgb.svg',
	chs: '/static/brands/chs.svg',
	cib: '/static/brands/cib.svg',
	citic: '/static/brands/citic.svg',
	cmb: '/static/brands/cmb.svg',
	cmbc: '/static/brands/cmbc.svg',
	cmcc: '/static/brands/cmcc.svg',
	dcep: '/static/brands/dcep.svg',
	douyin: '/static/brands/douyin.png',
	eleme: '/static/brands/eleme.svg',
	huabei: '/static/brands/huabei.svg',
	icbc: '/static/brands/icbc.svg',
	jd: '/static/brands/jd.svg',
	licaitong: '/static/brands/licaitong.svg',
	lingqiantong: '/static/brands/lingqiantong.svg',
	meituan: '/static/brands/meituan.svg',
	mybank: '/static/brands/mybank.svg',
	petrochina: '/static/brands/petrochina.svg',
	pingan: '/static/brands/pingan.svg',
	psbc: '/static/brands/psbc.svg',
	qq: '/static/brands/qq.png',
	sinopec: '/static/brands/sinopec.svg',
	spdb: '/static/brands/spdb.svg',
	'state-grid': '/static/brands/state-grid.svg',
	telecom: '/static/brands/telecom.svg',
	unicom: '/static/brands/unicom.svg',
	unionpay: '/static/brands/unionpay.svg',
	wechat: '/static/brands/wechat.png',
	xiaohebao: '/static/brands/xiaohebao.svg',
	yuebao: '/static/brands/yuebao.svg'
}

/** 全部品牌 key（创建账户 37 项），供补齐素材时对照 */
export const ALL_BRAND_ICON_KEYS = [
	'wechat', 'alipay', 'huabei', 'jd', 'dcep', 'qq', 'meituan', 'eleme',
	'cmcc', 'telecom', 'unicom', 'sinopec', 'petrochina', 'state-grid',
	'lingqiantong', 'licaitong', 'yuebao', 'douyin', 'chs', 'xiaohebao',
	'unionpay', 'apple-pay',
	'citic', 'cebbank', 'abc', 'ccb', 'psbc', 'boc', 'comm', 'cmbc', 'spdb',
	'cib', 'pingan', 'icbc', 'cgb', 'cmb', 'mybank'
]

/** 建议文件名（默认 .png，也可用 .webp / .svg，在 BRAND_ASSETS 里写完整路径） */
export function expectedBrandAssetPath(key, ext = 'png') {
	return `/static/brands/${resolveBrandKey(key)}.${ext}`
}

export function getBrandAssetSrc(key) {
	if (!key) return ''
	const resolved = resolveBrandKey(key)
	return BRAND_ASSETS[resolved] || BRAND_ASSETS[key] || ''
}

export function hasBrandAsset(key) {
	return !!getBrandAssetSrc(key)
}
