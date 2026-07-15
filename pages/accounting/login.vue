<template>
	<view class="login-page">
		<view class="decoration-blob blob-1"></view>
		<view class="decoration-blob blob-2"></view>

		<scroll-view scroll-y class="login-scroll">
			<view class="login-content">
			<view class="login-logo">
				<view class="logo-icon">
					<image class="logo-img" src="/static/app-icon.png" mode="aspectFit" />
				</view>
				<text class="app-title">记账助手</text>
				<text class="app-subtitle">轻松管理每一笔开支</text>
			</view>

				<view class="login-form-card">
					<view class="form-group">
						<view class="field-label">邮箱</view>
						<view class="input-wrapper">
							<text class="input-icon">📧</text>
							<input class="input-field" type="text" v-model="email" placeholder="请输入邮箱地址" />
						</view>
					</view>

					<view class="form-group">
						<view class="field-label">密码</view>
						<view class="input-wrapper">
							<text class="input-icon">🔒</text>
							<input class="input-field" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码" />
							<text class="toggle-pwd" @click="showPassword = !showPassword">{{ showPassword ? '👁️' : '🙈' }}</text>
						</view>
					</view>

					<view class="form-options">
						<view class="remember-me">
							<view class="checkbox" :class="{ checked: rememberMe }" @click="rememberMe = !rememberMe">
								<text v-if="rememberMe" class="check-icon">✓</text>
							</view>
							<text class="remember-text">记住我</text>
						</view>
						<text class="forgot-link" @click="showForgotPwd">忘记密码?</text>
					</view>

					<view class="btn-primary" @click="handleLogin">{{ logining ? '登录中...' : '登 录' }}</view>
				</view>

				<view class="register-link">
					还没有账号？<text class="link-text" @click="showRegister">立即注册</text>
				</view>

				<view class="social-section">
					<view class="divider-row">
						<view class="divider-line"></view>
						<text class="divider-text">其他登录方式</text>
						<view class="divider-line"></view>
					</view>
					<view class="social-login">
						<view class="social-btn" @click="socialLogin('微信')">
							<text class="social-icon-wechat">💚</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import Logger from '@/common/logger.js'
	import themeMixin from '@/common/theme-mixin.js'
<<<<<<< Updated upstream
	import ICONS from '@/common/icon-base64.js'
=======
>>>>>>> Stashed changes
	import { apiRequest } from '@/services/api-client.js'
	import ENDPOINTS from '@/services/api-endpoints.js'
	import { rules, validate } from '@/common/validator.js'

	export default {
		mixins: [themeMixin],
		data() {
			return { 
				email: '', 
				password: '', 
				logining: false,
				showPassword: false,
				rememberMe: false
			}
		},
		methods: {
			getIconStyle(name) {
				return { 'mask-image': 'url(' + ICONS[name] + ')', '-webkit-mask-image': 'url(' + ICONS[name] + ')' }
			},
			async handleLogin() {
				const emailTrim = this.email.trim()
				if (!emailTrim) { uni.showToast({ title: '请输入邮箱', icon: 'none' }); return }
				const emailResult = validate({ email: emailTrim }, { email: [rules.required('请输入邮箱'), rules.email()] })
				if (!emailResult.valid) { uni.showToast({ title: emailResult.errors.email, icon: 'none' }); return }
				if (!this.password.trim()) { uni.showToast({ title: '请输入密码', icon: 'none' }); return }

				this.logining = true
				Logger.info('Login', '用户登录', { email: emailTrim })

				try {
					const res = await apiRequest({
						url: ENDPOINTS.auth.login,
						method: 'POST',
						data: { email: emailTrim, password: this.password }
					})

					if (!res.success) {
						uni.showToast({ title: res.message || '登录失败', icon: 'none' })
						this.logining = false
						return
					}

					const now = Date.now()
					uni.setStorageSync('isLoggedIn', 'true')
					uni.setStorageSync('loginTime', now)
					uni.setStorageSync('login_email', emailTrim)
					if (res.data?.token) {
						uni.setStorageSync('auth_token', res.data.token)
<<<<<<< Updated upstream
					}
					if (res.data?.user) {
						uni.setStorageSync('login_user', JSON.stringify(res.data.user))
					}
					if (this.rememberMe) {
						uni.setStorageSync('remember_email', emailTrim)
=======
>>>>>>> Stashed changes
					}
					if (res.data?.user) {
						uni.setStorageSync('login_user', JSON.stringify(res.data.user))
					}
					if (this.rememberMe) {
						uni.setStorageSync('remember_email', emailTrim)
					}
					uni.redirectTo({ url: '/pages/accounting/home' })
				} catch (err) {
					Logger.errorWithException('Login', '登录失败', err)
					uni.showToast({ title: '登录失败，请重试', icon: 'none' })
				} finally {
					this.logining = false
				}
			},
			socialLogin(provider) {
				uni.showToast({ title: '暂不支持' + provider + '登录', icon: 'none' })
			},
			showForgotPwd() { uni.navigateTo({ url: '/pages/accounting/forgot-pwd' }) },
			showRegister() { uni.navigateTo({ url: '/pages/accounting/register' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.login-page {
		height: 100vh;
		background: var(--bg, #FFF9F5);
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	.login-scroll {
		flex: 1;
		width: 100%;
		padding: 0 40rpx;
		box-sizing: border-box;
	}
	/* 中等屏（大屏手机）增加左右呼吸空间 */
	@media (min-width: 414px) {
		.login-scroll { padding: 0 60rpx; }
	}
	/* 平板及以上 */
	@media (min-width: 768px) {
		.login-scroll { padding: 0 80rpx; }
	}
	.decoration-blob {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}
	.blob-1 {
		top: -160rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 640rpx;
		height: 640rpx;
		background: radial-gradient(circle at 40% 40%, rgba(232, 115, 74, 0.1) 0%, rgba(232, 115, 74, 0.3) 40%, transparent 70%);
		opacity: 0.6;
	}
	.blob-2 {
		top: -40rpx;
		right: -120rpx;
		width: 400rpx;
		height: 400rpx;
		background: radial-gradient(circle at 60% 30%, rgba(232, 115, 74, 0.3) 0%, transparent 60%);
		opacity: 0.4;
	}

	.login-content {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		box-sizing: border-box;
		padding-top: 120rpx;
		padding-bottom: 80rpx;
	}

	.login-logo {
		text-align: center;
		margin-bottom: 60rpx;
	}
	.logo-icon {
		width: 128rpx;
		height: 128rpx;
		margin: 0 auto 32rpx;
		border-radius: 32rpx;
		overflow: hidden;
		background: var(--card-bg, #FFFFFF);
		box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.3);
		padding: 8rpx;
		box-sizing: border-box;
	}
	.logo-img {
		width: 100%;
		height: 100%;
		border-radius: 24rpx;
		background: transparent;
	}
	.app-title {
		display: block;
		font-size: 48rpx;
		font-weight: 700;
		color: var(--primary, #E8734A);
		margin-bottom: 8rpx;
	}
	.app-subtitle {
		display: block;
		font-size: 26rpx;
		color: var(--text-tertiary, #A98B78);
	}

	.login-form-card {
		background: var(--card-bg, #FFFFFF);
		border-radius: 32rpx;
		padding: 36rpx 32rpx;
		box-shadow: 0 8rpx 24rpx rgba(61, 35, 22, 0.08);
		margin-bottom: 40rpx;
	}
	/* 小屏手机：卡片内边距压缩 */
	@media (max-width: 374px) {
		.login-form-card { padding: 28rpx 24rpx; }
	}
	/* 大屏手机：卡片内边距舒展 */
	@media (min-width: 414px) {
		.login-form-card { padding: 44rpx 48rpx; }
	}
	/* 平板及以上 */
	@media (min-width: 768px) {
		.login-form-card { padding: 52rpx 56rpx; }
	}

	.form-group {
		margin-bottom: 32rpx;
	}
	.field-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: var(--text-secondary, #7A5C4A);
		margin-bottom: 12rpx;
	}
	.input-wrapper {
		display: flex;
		align-items: center;
		border-radius: 50rpx;
		background: var(--input-bg, #FFF5EE);
		border: 2rpx solid var(--border, #E8D5C8);
<<<<<<< Updated upstream
		padding: 0rpx 24rpx;
=======
		padding: 16rpx 24rpx;
		height: 88rpx;
		box-sizing: border-box;
>>>>>>> Stashed changes
		transition: border-color 0.2s;
	}
	.input-wrapper:focus-within {
		border-color: var(--primary, #E8734A);
	}
	.input-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
		color: var(--text-tertiary, #A98B78);
	}
	.input-field {
		flex: 1;
<<<<<<< Updated upstream
		height: 70rpx;
		font-size: 30rpx;
=======
		padding: 0 0 0 12rpx;
		margin: 0;
		font-size: 30rpx;
		line-height: 56rpx;
>>>>>>> Stashed changes
		color: var(--text-primary, #3D2316);
		background: transparent;
		border: none;
		outline: none;
		text-align: left;
	}
	.input-field::placeholder {
		color: #C8A896;
	}
	.toggle-pwd {
		font-size: 30rpx;
		padding: 0;
		cursor: pointer;
		user-select: none;
	}

	.form-options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}
	.remember-me {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	.checkbox {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		border: 2rpx solid var(--border, #E8D5C8);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.checkbox.checked {
		background: var(--primary, #E8734A);
		border-color: var(--primary, #E8734A);
	}
	.check-icon {
		font-size: 24rpx;
		color: #fff;
		font-weight: 600;
	}
	.remember-text {
		font-size: 26rpx;
		color: var(--text-secondary, #7A5C4A);
	}
	.forgot-link {
		font-size: 26rpx;
		color: var(--primary, #E8734A);
		font-weight: 500;
	}

	.btn-primary {
		width: 86%;
		max-width: 520rpx;
		min-width: 200rpx;
		margin: 0 auto;
		height: 96rpx;
		min-height: 44px; /* 最小触摸目标 */
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--primary, #E8734A);
		color: #fff;
		font-size: 40rpx;
		font-weight: 600;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.3);
		transition: background 0.2s;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.btn-primary:active {
		background: var(--primary-dark, #C95A33);
	}

	.register-link {
		text-align: center;
		font-size: 28rpx;
		color: var(--text-tertiary, #A98B78);
		margin-bottom: 64rpx;
	}
	.link-text {
		color: var(--primary, #E8734A);
		font-weight: 600;
	}

	.social-section {
		width: 100%;
	}
	.divider-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-bottom: 40rpx;
	}
	.divider-line {
		flex: 1;
		height: 2rpx;
		background: var(--border, #F0E4DA);
	}
	.divider-text {
		font-size: 24rpx;
		color: var(--text-tertiary, #A98B78);
	}
	.social-login {
		display: flex;
		justify-content: center;
		gap: 48rpx;
	}
	.social-btn {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: var(--card-bg, #FFFFFF);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		-webkit-tap-highlight-color: transparent;
		box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06);
	}
	.social-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.1);
	}
	.social-icon-wechat {
		font-size: 48rpx;
	}
	.social-icon-phone {
		font-size: 48rpx;
		color: var(--primary, #E8734A);
	}

	@media (min-width: 414px) {
		.login-content { padding-top: 100rpx; }
	}
	@media (min-width: 768px) {
		.login-page { padding: 0; }
		.login-content { padding-top: 80rpx; }
		.app-title { font-size: 48rpx; }
	}
	@media (max-width: 374px) {
		.login-page { padding: 0; }
		.login-content { padding-top: 80rpx; }
		.btn-primary { height: 80rpx; font-size: 28rpx; }
		.social-login { gap: 32rpx; }
		.social-btn { width: 80rpx; height: 80rpx; }
	}
</style>
