/**
 * 宇宙记账 - 主题管理器
 * 简版，匹配 HTML 原型
 */
const THEMES = {
  cosmic: {
    name: '宇宙蓝',
    colors: {
      '--bg': '#EFF5FF',
      '--surface': '#FFFFFF',
      '--primary': '#5B9BE0',
      '--primary-dark': '#4A7FC0',
      '--primary-light': '#8BB8EA',
      '--income': '#34C759',
      '--expense': '#FF6B6B',
      '--warning': '#FFB020',
      '--text-primary': '#1F2329',
      '--text-secondary': '#8A9099',
      '--text-muted': '#A0A8B0',
      '--divider': '#E3ECF7',
      '--border': 'rgba(180, 200, 230, 0.25)',
      '--card-shadow': '0 6rpx 20rpx rgba(91, 140, 210, 0.12)',
      '--primary-shadow': '0 4rpx 16rpx rgba(91, 155, 224, 0.35)'
    }
  }
}

export function getCurrentTheme() {
  try { return uni.getStorageSync('app_theme') || 'cosmic' } catch (e) { return 'cosmic' }
}

export function getTheme(name) {
  return THEMES[name] || THEMES.cosmic
}

export function getAllThemes() {
  return Object.entries(THEMES).map(([key, val]) => ({ key, ...val }))
}

/** 设置 CSS 变量到 document */
function setCSSVars(colors) {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      Object.entries(colors).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v)
      })
    }
  } catch (e) { /* ignore */ }
}

/** 按主题名称应用主题 */
export function applyTheme(name) {
  const theme = getTheme(name)
  setCSSVars(theme.colors)
}

/** 给当前页面应用主题 */
export function applyThemeToPage() {
  applyTheme(getCurrentTheme())
}

export default { getCurrentTheme, getTheme, getAllThemes, applyTheme, applyThemeToPage }