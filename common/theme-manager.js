/**
 * 主题管理工具
 * 支持 3 套主题：宇宙（默认）、暖阳、森林
 * 通过 CSS 变量动态切换
 * 兼容 H5 / App / 小程序
 */

const THEMES = {
	cosmic: {
		name: '宇宙',
		desc: '默认配色，宇宙蓝梦幻风',
		preview: 'linear-gradient(170deg, #EAF4FF 0%, #F1ECFF 50%, #FFFFFF 100%)',
		colors: {
			'--primary': '#5B9BE0',
			'--primary-dark': '#4A7FC0',
			'--primary-light': '#8BB8EA',
			'--primary-shadow': 'rgba(91, 155, 224, 0.3)',
			'--income': '#34C759',
			'--expense': '#FF6B6B',
			'--bg': '#EFF5FF',
			'--card-bg-start': '#FFFFFF',
			'--card-bg-via': '#F0F7FF',
			'--card-bg-end': '#F5F0FF',
			'--text-primary': '#1A2744',
			'--text-secondary': '#5A6B8A',
			'--text-tertiary': '#8A9BB8',
			'--border': '#E8F0FE',
			'--input-bg': '#F2F7FF',
			'--hero-from': '#EAF4FF',
			'--hero-via': '#F1ECFF',
			'--hero-to': '#FFFFFF',
			'--glass-border': 'rgba(255, 255, 255, 0.8)',
			'--glass-shadow': 'rgba(91, 155, 224, 0.08)'
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
			'--income': '#34C759',
			'--bg': '#FFF8F0',
			'--card-bg-start': '#FFFFFF',
			'--card-bg-via': '#FFF8F0',
			'--card-bg-end': '#FFF5E8',
			'--text-primary': '#3A2817',
			'--text-secondary': '#7A5A3A',
			'--text-tertiary': '#A89070',
			'--border': '#FFE8C8',
			'--input-bg': '#FFF2E8',
			'--hero-from': '#FFE3B0',
			'--hero-via': '#FFB97A',
			'--hero-to': '#FF9A8B',
			'--glass-border': 'rgba(255, 255, 255, 0.8)',
			'--glass-shadow': 'rgba(255, 154, 71, 0.08)'
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
			'--expense': '#FF6B6B',
			'--income': '#34C759',
			'--bg': '#F1F8E9',
			'--card-bg-start': '#FFFFFF',
			'--card-bg-via': '#F1F8E9',
			'--card-bg-end': '#E8F0E3',
			'--text-primary': '#1B3A2D',
			'--text-secondary': '#4A6B5A',
			'--text-tertiary': '#7A8A7A',
			'--border': '#D7E4D0',
			'--input-bg': '#E8F0E3',
			'--hero-from': '#C8E6C9',
			'--hero-via': '#81C784',
			'--hero-to': '#4DB6AC',
			'--glass-border': 'rgba(255, 255, 255, 0.8)',
			'--glass-shadow': 'rgba(77, 182, 172, 0.08)'
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
		if (typeof document !== 'undefined' && document.documentElement) {
			setCSSVars(document.documentElement, colors)
		}
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
				const containers = el.querySelectorAll('[class*="-page"], [class*="-container"], .uni-page-body')
				if (containers) {
					containers.forEach(c => setCSSVars(c, colors))
				}
			}
		})
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
		if (typeof document !== 'undefined' && document.documentElement) {
			setCSSVars(document.documentElement, colors)
		}
		if (pageInstance) {
			if (pageInstance.$el) {
				setCSSVars(pageInstance.$el, colors)
			} else {
				setTimeout(() => {
					if (pageInstance.$el) {
						setCSSVars(pageInstance.$el, colors)
					}
				}, 100)
			}
		}
	} catch (e) {
		// 忽略
	}
}

export default { getCurrentTheme, getTheme, getAllThemes, applyTheme, setTheme, applyThemeToPage, THEMES }