/**
 * 主题 Mixin
 * 在页面 onShow 时自动应用当前主题的 CSS 变量
 * 解决 App 端页面切换后主题丢失的问题
 */
import { applyThemeToPage, applyTheme, getCurrentTheme } from './theme-manager.js'

export default {
	onShow() {
		// App 端每个页面有独立 WebView，需要在 onShow 时重新设置 CSS 变量
		applyThemeToPage(this)
	},
	onLoad() {
		// 页面加载时也应用一次主题
		applyThemeToPage(this)
	}
}

export { applyThemeToPage, applyTheme, getCurrentTheme }
