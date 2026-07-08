/**
 * 主题管理工具
 * 支持 3 套主题：宇宙（默认）、暖阳、森林
 * 通过 CSS 变量动态切换
 * 兼容 H5 / App / 小程序
 */

const THEMES = {
	cosmic: {
		name: '宇宙',
		desc: '默认配色，冷色调，星空感',
		preview: 'linear-gradient(135deg, #B5E8D5 0%, #A8D4E8 50%, #C5B8E8 100%)',
		colors: {
			'--primary': '#6BA8D9',
			'--primary-dark': '#5A8FB8',
			'--primary-shadow': 'rgba(107, 168, 217, 0.3)',
			'--expense': '#7BC4A8',
			'--income': '#E89B9B',
			'--bg': '#F4F6FB',
			'--card-bg': 'rgba(255, 255, 255, 0.85)',
			'--text-primary': '#1F2A47',
			'--text-secondary': '#5A6788',
			'--text-tertiary': '#9098B0',
			'--border': '#F4F0FA',
			'--input-bg': '#EEF1F8',
			'--hero-from': '#B5E8D5',
			'--hero-via': '#A8D4E8',
			'--hero-to': '#C5B8E8'
		}
	},
	sunshine: {
		name: '暖阳',
		desc: '温暖橙黄，活力四射',
		preview: 'linear-gradient(135deg, #FFE3B0 0%, #FFB97A 50%, #FF9A8B 100%)',
		colors: {
			'--primary': '#FF9A47',
			'--primary-dark': '#E07F2A',
			'--primary-shadow': 'rgba(255, 154, 71, 0.3)',
			'--expense': '#FF6B6B',
			'--income': '#4ECDC4',
			'--bg': '#FFF8F0',
			'--card-bg': 'rgba(255, 255, 255, 0.92)',
			'--text-primary': '#3A2817',
			'--text-secondary': '#7A5A3A',
			'--text-tertiary': '#A89070',
			'--border': '#FFE8C8',
			'--input-bg': '#FFF2E8',
			'--hero-from': '#FFE3B0',
			'--hero-via': '#FFB97A',
			'--hero-to': '#FF9A8B'
		}
	},
	forest: {
		name: '森林',
		desc: '清新绿色，自然宁静',
		preview: 'linear-gradient(135deg, #C8E6C9 0%, #81C784 50%, #4DB6AC 100%)',
		colors: {
			'--primary': '#4DB6AC',
			'--primary-dark': '#388E7B',
			'--primary-shadow': 'rgba(77, 182, 172, 0.3)',
			'--expense': '#7BC4A8',
			'--income': '#FF8A65',
			'--bg': '#F1F8E9',
			'--card-bg': 'rgba(255, 255, 255, 0.92)',
			'--text-primary': '#1B3A2D',
			'--text-secondary': '#4A6B5A',
			'--text-tertiary': '#7A8A7A',
			'--border': '#D7E4D0',
			'--input-bg': '#E8F0E3',
			'--hero-from': '#C8E6C9',
			'--hero-via': '#81C784',
			'--hero-to': '#4DB6AC'
		}
	}
}

const STORAGE_KEY = 'app_theme'

/** 获取当前主题 */
export function getCurrentTheme() {
	try {
		return uni.getStorageSync(STORAGE_KEY) || 'cosmic'
	} catch (e) {
		return 'cosmic'
	}
}

/** 获取主题配置 */
export function getTheme(name) {
	return THEMES[name] || THEMES.cosmic
}

/** 获取所有主题 */
export function getAllThemes() {
	return Object.entries(THEMES).map(([key, val]) => ({ key, ...val }))
}

/** 将 CSS 变量设置到元素上 */
function setCSSVars(el, colors) {
	if (!el) return
	Object.entries(colors).forEach(([k, v]) => {
		el.style.setProperty(k, v)
	})
}

/** 应用主题到全局（写入 CSS 变量） */
export function applyTheme(name) {
	const theme = getTheme(name)
	const colors = theme.colors
	try {
		// 方案1：设置到 document.documentElement（H5 和 App-Vue 均可）
		if (typeof document !== 'undefined' && document.documentElement) {
			setCSSVars(document.documentElement, colors)
		}

		// 方案2：设置到当前所有页面实例的根元素
		// 在 App 端，每个页面有独立的 WebView，需要逐页设置
		const pages = getCurrentPages()
		pages.forEach(p => {
			let el = null
			if (p.$vm && p.$vm.$el) {
				el = p.$vm.$el
			} else if (p.$el) {
				el = p.$el
			}
			if (el) {
				setCSSVars(el, colors)
				// 递归设置所有子元素中使用了 CSS 变量的容器
				const containers = el.querySelectorAll('[class*="-page"], [class*="-container"], .uni-page-body')
				if (containers) {
					containers.forEach(c => setCSSVars(c, colors))
				}
			}
		})

		// 方案3：通过 uni API 设置 page 节点样式（App 端关键方案）
		// App 端每个页面的最外层是 <page> 节点，需要单独设置
		if (typeof uni !== 'undefined') {
			try {
				// 使用 createSelectorQuery 获取 page 节点
				const query = uni.createSelectorQuery()
				query.select('page').context(res => {
					if (res) {
						// 通过 context 获取 page 节点的 DOM
						if (res.$el && res.$el.style) {
							setCSSVars(res.$el, colors)
						}
					}
				}).exec()
			} catch (e) {
				// 忽略，某些平台不支持
			}
		}
	} catch (e) {
		console.warn('applyTheme error', e)
	}
}

/** 保存并应用主题 */
export function setTheme(name) {
	if (!THEMES[name]) return false
	try {
		uni.setStorageSync(STORAGE_KEY, name)
		applyTheme(name)
		return true
	} catch (e) {
		return false
	}
}

/** 为页面 mixin 提供 onShow 时自动应用主题的方法 */
export function applyThemeToPage(pageInstance) {
	const name = getCurrentTheme()
	const theme = getTheme(name)
	const colors = theme.colors
	try {
		// 设置到页面的根元素
		if (pageInstance && pageInstance.$el) {
			setCSSVars(pageInstance.$el, colors)
		}
		// 同时设置 documentElement 确保全局生效
		if (typeof document !== 'undefined' && document.documentElement) {
			setCSSVars(document.documentElement, colors)
		}
	} catch (e) {
		// 忽略
	}
}

export default { getCurrentTheme, getTheme, getAllThemes, applyTheme, setTheme, applyThemeToPage, THEMES }
