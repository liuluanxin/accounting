/**
 * 创建账户 · 图标注册表（对齐参考 App 布局与命名）
 * group: pay = 支付/生活, bank = 银行
 */
export const ACCOUNT_ICON_REGISTRY = [
	// —— 支付 / 生活（参考图顺序）——
	{ key: 'wechat', label: '微信', group: 'pay', keywords: '微信 wechat' },
	{ key: 'alipay', label: '支付宝', group: 'pay', keywords: '支付宝 alipay 支' },
	{ key: 'huabei', label: '花呗', group: 'pay', keywords: '花呗 huabei' },
	{ key: 'jd', label: '京东', group: 'pay', keywords: '京东 jd' },
	{ key: 'dcep', label: '数字人民币', group: 'pay', keywords: '数字人民币 dcep e-cny' },
	{ key: 'qq', label: 'QQ钱包', group: 'pay', keywords: 'qq 钱包' },
	{ key: 'meituan', label: '美团', group: 'pay', keywords: '美团 meituan' },
	{ key: 'eleme', label: '饿了么', group: 'pay', keywords: '饿了么 eleme' },
	{ key: 'cmcc', label: '中国移动', group: 'pay', keywords: '移动 cmcc' },
	{ key: 'telecom', label: '中国电信', group: 'pay', keywords: '电信 telecom' },
	{ key: 'unicom', label: '中国联通', group: 'pay', keywords: '联通 unicom' },
	{ key: 'sinopec', label: '中石化', group: 'pay', keywords: '中石化 sinopec' },
	{ key: 'petrochina', label: '中石油', group: 'pay', keywords: '中石油 petrochina' },
	{ key: 'state-grid', label: '国家电网', group: 'pay', keywords: '国家电网 电网' },
	{ key: 'lingqiantong', label: '零钱通', group: 'pay', keywords: '零钱通 微信' },
	{ key: 'licaitong', label: '理财通', group: 'pay', keywords: '理财通 腾讯' },
	{ key: 'yuebao', label: '余额宝', group: 'pay', keywords: '余额宝 支付宝' },
	{ key: 'douyin', label: '抖音钱包', group: 'pay', keywords: '抖音 douyin 钱包' },
	{ key: 'chs', label: '医保', group: 'pay', keywords: '医保 chs 社保' },
	{ key: 'xiaohebao', label: '小荷包', group: 'pay', keywords: '小荷包 支付宝' },
	{ key: 'unionpay', label: '云闪付', group: 'pay', keywords: '云闪付 银联 unionpay' },
	{ key: 'apple-pay', label: 'Apple Pay', group: 'pay', keywords: 'apple pay 苹果' },

	// —— 银行 15 家 ——
	{ key: 'citic', label: '中信', group: 'bank', keywords: '中信 citic 银行' },
	{ key: 'cebbank', label: '光大', group: 'bank', keywords: '光大 cebbank 银行' },
	{ key: 'abc', label: '农业', group: 'bank', keywords: '农业 abc 农行 银行' },
	{ key: 'ccb', label: '建设', group: 'bank', keywords: '建设 ccb 建行 银行' },
	{ key: 'psbc', label: '邮储', group: 'bank', keywords: '邮储 psbc 邮政 银行' },
	{ key: 'boc', label: '中国银行', group: 'bank', keywords: '中国银行 boc 中行' },
	{ key: 'comm', label: '交通', group: 'bank', keywords: '交通 comm 交行 银行' },
	{ key: 'cmbc', label: '民生', group: 'bank', keywords: '民生 cmbc 银行' },
	{ key: 'spdb', label: '浦发', group: 'bank', keywords: '浦发 spdb 银行' },
	{ key: 'cib', label: '兴业', group: 'bank', keywords: '兴业 cib 银行' },
	{ key: 'pingan', label: '平安', group: 'bank', keywords: '平安 pingan 银行' },
	{ key: 'icbc', label: '工商', group: 'bank', keywords: '工商 icbc 工行 银行' },
	{ key: 'cgb', label: '广发', group: 'bank', keywords: '广发 cgb 银行' },
	{ key: 'cmb', label: '招商', group: 'bank', keywords: '招商 cmb 银行' },
	{ key: 'mybank', label: '网商', group: 'bank', keywords: '网商 mybank 银行' }
]

export function getAccountIcons(group) {
	if (!group) return ACCOUNT_ICON_REGISTRY
	return ACCOUNT_ICON_REGISTRY.filter(i => i.group === group)
}

export function searchAccountIcons(q) {
	const s = (q || '').trim().toLowerCase()
	if (!s) return ACCOUNT_ICON_REGISTRY
	return ACCOUNT_ICON_REGISTRY.filter(
		i => i.label.toLowerCase().includes(s) || (i.keywords || '').toLowerCase().includes(s)
	)
}

export function getAccountIconLabel(key) {
	const item = ACCOUNT_ICON_REGISTRY.find(i => i.key === key)
	return item ? item.label : key
}

export const ACC_ICON_KEYS = ACCOUNT_ICON_REGISTRY.map(i => i.key)
