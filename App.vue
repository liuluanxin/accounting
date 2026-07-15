<script>
	import Logger from '@/common/logger.js'
	import { setupGlobalErrorHandler, vueErrorHandler } from '@/common/error-handler.js'
	import { configureApi } from '@/services/api-client.js'
	import { applyTheme, getCurrentTheme } from '@/common/theme-manager.js'
	import { needVerify } from '@/common/privacy-lock.js'

	export default {
		onLaunch: function() {
			setupGlobalErrorHandler()
			// #ifndef VUE3
			Vue.config.errorHandler = vueErrorHandler
			// #endif

		// 初始化 API 配置（使用 uniCloud 云函数，调用已部署的云端服务）
		configureApi({
			baseURL: 'https://unicloud',
			adapter: 'unicloud',
			timeout: 15000
		})

		Logger.info('App', '宇宙记账启动 [API: uniCloud]')

			// 应用主题
			applyTheme(getCurrentTheme())

			// 隐私密码检查：已设置 PIN 且需要验证时跳转锁屏页
			if (needVerify()) {
				setTimeout(() => {
					uni.redirectTo({ url: '/pages/accounting/privacy-lock' })
				}, 400)
			}

			// 登录检查：已登录则跳转首页，未登录则停留在登录页
			const isLoggedIn = uni.getStorageSync('isLoggedIn') === 'true'
			const loginTime = uni.getStorageSync('loginTime') || 0
			const TOKEN_TTL = 30 * 24 * 60 * 60 * 1000  // 30 天过期
			const expired = loginTime > 0 && (Date.now() - loginTime > TOKEN_TTL)

			setTimeout(() => {
				const currentPages = getCurrentPages()
				const currentPath = currentPages.length > 0 ? currentPages[currentPages.length - 1].route : ''
				if (isLoggedIn && !expired) {
					if (currentPath === 'pages/accounting/login' || currentPath === 'pages/accounting/register' || currentPath === 'pages/accounting/forgot-pwd') {
						uni.redirectTo({ url: '/pages/accounting/home' })
					}
				} else {
					if (expired) {
						uni.removeStorageSync('isLoggedIn')
						uni.removeStorageSync('loginTime')
						uni.removeStorageSync('login_phone')
					}
					if (currentPath !== 'pages/accounting/login') {
						uni.redirectTo({ url: '/pages/accounting/login' })
					}
				}
			}, 300)
		},
		onShow: function() { Logger.debug('App', '应用进入前台'); applyTheme(getCurrentTheme()) },
		onHide: function() { Logger.debug('App', '应用进入后台') }
	}
</script>

<style lang="scss">
	@import '@/uni.scss';
	page { background: linear-gradient(170deg, var(--hero-from, #EAF4FF), var(--hero-via, #F1ECFF), var(--hero-to, #FFFFFF)); height: 100%; font-size: 28rpx; color: var(--text-primary, #1A2744); font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'Roboto', sans-serif; overflow: hidden; }
	::-webkit-scrollbar { width: 0; height: 0; display: none; }
	/* 全局滚动优化：启用原生动量滚动 + GPU 合成层，显著减少滚动卡顿 */
	[class*="-scroll"], .scroll { -webkit-overflow-scrolling: touch; will-change: transform; transform: translateZ(0); }
	.glass-card { background: linear-gradient(170deg, var(--card-bg-start, #FFFFFF), var(--card-bg-via, #F0F7FF), var(--card-bg-end, #F5F0FF)); border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.8)); border-radius: 44rpx; box-shadow: 0 8rpx 32rpx var(--glass-shadow, rgba(91, 155, 224, 0.08)); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); }
	@supports not ((-webkit-backdrop-filter: blur(20px)) or (backdrop-filter: blur(20px))) { .glass-card { background: linear-gradient(170deg, var(--card-bg-start, #FFFFFF), var(--card-bg-via, #F0F7FF), var(--card-bg-end, #F5F0FF)); } }
	.btn-primary { background: linear-gradient(135deg, var(--primary, #5B9BE0), var(--primary-dark, #4A7FC0)); color: #fff; border: none; padding: 24rpx; border-radius: 20rpx; font-size: 32rpx; font-weight: 600; width: 100%; box-shadow: 0 8rpx 24rpx var(--primary-shadow, rgba(91, 155, 224, 0.3)); transition: opacity 0.15s; text-align: center; }
	.btn-primary:active { opacity: 0.85; }
	.btn-secondary { background: var(--card-bg-start, #FFFFFF); border: 1px solid var(--border, #E8F0FE); color: var(--text-primary, #1A2744); padding: 16rpx 32rpx; border-radius: 16rpx; font-size: 26rpx; text-align: center; display: inline-block; }
	.input-field { width: 100%; padding: 24rpx 28rpx; border: 1px solid var(--border, #E8F0FE); border-radius: 20rpx; font-size: 28rpx; margin-bottom: 20rpx; outline: none; background: var(--input-bg, #F2F7FF); color: var(--text-primary, #1A2744); transition: border-color 0.2s; box-sizing: border-box; }
	.input-field:focus { border-color: var(--primary, #5B9BE0); }
	.input-field::placeholder { color: var(--text-tertiary, #8A9BB8); }
	.amount-input { font-size: 80rpx !important; font-weight: 700; border: none; outline: none; text-align: center; background: transparent; color: var(--text-primary, #1A2744); max-width: 80%; width: auto; min-width: 200rpx; }
	.segment-control { display: flex; background: var(--border, #E8F0FE); border-radius: 10rpx; padding: 6rpx; margin-bottom: 24rpx; }
	.segment-btn { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 12rpx; font-size: 28rpx; font-weight: 600; color: var(--text-secondary, #5A6B8A); transition: all 0.2s; }
	.segment-btn.active { background: var(--card-bg-start, #FFFFFF); color: var(--primary, #5B9BE0); box-shadow: 0 4rpx 16rpx var(--primary-shadow, rgba(91, 155, 224, 0.15)); }
	.fab-btn { position: fixed; bottom: calc(180rpx + env(safe-area-inset-bottom, 20rpx)); right: 40rpx; width: 110rpx; height: 110rpx; background: linear-gradient(135deg, var(--primary, #5B9BE0), var(--primary-dark, #4A7FC0)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 48rpx; box-shadow: 0 12rpx 40rpx var(--primary-shadow, rgba(91, 155, 224, 0.35)); z-index: 100; }
	.fab-btn:active { transform: scale(0.9); }
</style>