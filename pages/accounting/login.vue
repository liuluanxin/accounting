<template>
	<view class="cosmic-page login-page">
		<!-- 装饰星球 -->
		<view class="cosmic-deco-planet cosmic-deco-planet--big" style="top:-80rpx;right:-60rpx;"></view>
		<view class="cosmic-deco-planet cosmic-deco-planet--small" style="top:180rpx;left:-30rpx;"></view>
		<view class="cosmic-deco-planet cosmic-deco-planet--ring" style="top:120rpx;right:40rpx;"></view>
		<view class="cosmic-deco-star" style="top:60rpx;left:80rpx;"></view>
		<view class="cosmic-deco-star" style="top:240rpx;right:60rpx;width:5rpx;height:5rpx;"></view>

		<top-bar title="" />

		<scroll-view scroll-y class="screen">
			<view class="login-content">
				<!-- Logo 区域 -->
				<view class="login-logo">
					<view class="logo-icon-wrap">
						<lucide-icon name="app-logo" brand size="100rpx" />
					</view>
					<text class="app-title">宇宙记账</text>
					<text class="app-subtitle muted">让每一笔都清晰</text>
				</view>

				<!-- 登录卡片 -->
				<view class="card login-form-card">
					<view class="form-group">
						<view class="field-label">QQ邮箱</view>
						<view class="field-wrapper">
							<lucide-icon class="field-icon" name="mail" size="28rpx" color="#8A9BB8" />
							<input class="field" type="text" v-model="email" placeholder="QQ邮箱" />
						</view>
					</view>

					<view class="form-group">
						<view class="field-label">密码</view>
						<view class="field-wrapper">
							<lucide-icon class="field-icon" name="lock" size="28rpx" color="#8A9BB8" />
							<input class="field" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码" maxlength="20" />
							<view class="toggle-pwd" @click="showPassword = !showPassword">
								<lucide-icon :name="showPassword ? 'eye' : 'eye-off'" size="32rpx" color="#8A9BB8" />
							</view>
						</view>
						<text class="field-hint">密码长度为 8–20 位</text>
					</view>

					<view class="form-options">
						<view class="custom-checkbox" @click="rememberMe = !rememberMe">
							<view class="box" :class="{ checked: rememberMe }">
								<lucide-icon v-if="rememberMe" name="check" size="20rpx" color="#FFFFFF" />
							</view>
							<text class="checkbox-label">记住我</text>
						</view>
						<text class="btn-link" @click="showForgotPwd">忘记密码？</text>
					</view>

					<view class="btn-primary login-btn" @click="handleLogin">
						<text>{{ logining ? '登录中...' : '登 录' }}</text>
					</view>
				</view>

				<!-- 其他登录方式 -->
				<view class="social-section">
					<view class="divider-row">
						<view class="divider-line"></view>
						<text class="divider-text">其他登录方式</text>
						<view class="divider-line"></view>
					</view>
					<view class="social-row">
						<view class="social-btn" @click="socialLogin">
							<lucide-icon name="wechat" brand size="44rpx" />
						</view>
						<view class="social-btn" @click="socialLogin">
							<lucide-icon name="alipay" brand size="44rpx" />
						</view>
					</view>
				</view>

				<!-- 注册链接 -->
				<view class="center-link">
					还没有账号？<text class="btn-link" @click="showRegister">立即注册</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { isQqEmail, loginSuccess } from '@/common/auth-utils.js'

	export default {
		data() {
			return {
				email: '',
				password: '',
				showPassword: false,
				rememberMe: false,
				logining: false
			}
		},
		methods: {
			handleLogin() {
				const emailTrim = this.email.trim()
				if (!emailTrim) { uni.showToast({ title: '请输入QQ邮箱', icon: 'none' }); return }
				if (!isQqEmail(emailTrim)) { uni.showToast({ title: '请输入有效的QQ邮箱', icon: 'none' }); return }
				const pwd = this.password
				if (!pwd) { uni.showToast({ title: '请输入密码', icon: 'none' }); return }
				if (pwd.length < 8 || pwd.length > 20) { uni.showToast({ title: '密码需 8–20 位', icon: 'none' }); return }
				this.logining = true
				loginSuccess(emailTrim, this.rememberMe)
				uni.showToast({ title: '登录成功', icon: 'success' })
				setTimeout(() => {
					this.logining = false
					uni.redirectTo({ url: '/pages/accounting/home' })
				}, 1000)
			},
			socialLogin() {
				uni.showToast({ title: '二期开发', icon: 'none' })
			},
			showForgotPwd() {
				uni.navigateTo({ url: '/pages/accounting/forgot-pwd' })
			},
			showRegister() {
				uni.navigateTo({ url: '/pages/accounting/register' })
			}
		}
	}
</script>


<style lang="scss" scoped>

	/* ===== 装饰星球（scoped 版本） ===== */
	.cosmic-deco-planet {
		position: fixed;
		border-radius: 50%;
		pointer-events: none;
		z-index: 0;
	}
	.cosmic-deco-planet--big {
		width: 320rpx;
		height: 320rpx;
		background: radial-gradient(circle at 30% 30%, #8FC9FF, #5B9BE0);
		opacity: 0.12;
	}
	.cosmic-deco-planet--small {
		width: 140rpx;
		height: 140rpx;
		background: radial-gradient(circle at 35% 30%, #FFC774, #FFB020);
		opacity: 0.10;
	}
	.cosmic-deco-planet--ring {
		width: 200rpx;
		height: 200rpx;
		border: 6rpx solid #C4A8F5;
		opacity: 0.08;
		background: none;
	}
	.cosmic-deco-star {
		position: fixed;
		width: 6rpx;
		height: 6rpx;
		border-radius: 50%;
		background: #5B9BE0;
		opacity: 0.2;
		pointer-events: none;
		z-index: 0;
	}

	/* ===== 登录内容 ===== */
	.login-content {
		padding: 0 40rpx 80rpx;
		width: 100%;
		max-width: 720rpx;
		margin: 0 auto;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	/* ===== Logo 区域 ===== */
	.login-logo {
		text-align: center;
		padding: 40rpx 0 36rpx;
	}
	.logo-icon-wrap {
		width: 120rpx;
		height: 120rpx;
		margin: 0 auto 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.app-title {
		display: block;
		font-size: 44rpx;
		font-weight: 800;
		color: #1A2744;
		margin-bottom: 8rpx;
		letter-spacing: 2rpx;
	}
	.app-subtitle {
		display: block;
		font-size: 26rpx;
	}

	/* ===== 登录卡片 ===== */
	.login-form-card {
		padding: 52rpx 40rpx;
		margin-bottom: 40rpx;
	}

	.form-group {
		margin-bottom: 32rpx;
	}
	.field-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: #5A6B8A;
		margin-bottom: 12rpx;
	}
	.field-hint {
		display: block;
		font-size: 22rpx;
		color: #8A9BB8;
		margin-top: 10rpx;
	}

	/* ===== 输入框包装 ===== */
	.field-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	.field-wrapper .field {
		padding-left: 76rpx;
		padding-right: 72rpx;
		width: 100%;
	}
	.field-icon {
		position: absolute;
		left: 28rpx;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		pointer-events: none;
	}
	.toggle-pwd {
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		padding: 12rpx;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ===== 选项行 ===== */
	.form-options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}
	.custom-checkbox {
		display: flex;
		align-items: center;
		gap: 12rpx;
		cursor: pointer;
		user-select: none;
	}
	.custom-checkbox .box {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		border: 2rpx solid #D0D7E3;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		background: #fff;
		flex-shrink: 0;
	}
	.custom-checkbox .box.checked {
		background: #5B9BE0;
		border-color: #5B9BE0;
	}
	.checkbox-label {
		font-size: 26rpx;
		color: #5A6B8A;
	}
	.btn-link {
		font-size: 26rpx;
		color: #5B9BE0;
		font-weight: 500;
	}

	/* ===== 登录按钮 ===== */
	.login-btn {
		width: 100%;
		height: 100rpx;
		min-height: 48px;
		margin: 0 auto;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 50rpx;
	}

	/* ===== 社交登录 ===== */
	.social-section {
		width: 100%;
		margin-bottom: 40rpx;
	}
	.divider-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-bottom: 36rpx;
	}
	.divider-line {
		flex: 1;
		height: 2rpx;
		background: #E3ECF7;
	}
	.divider-text {
		font-size: 24rpx;
		color: #8A9BB8;
		white-space: nowrap;
	}
	.social-row {
		display: flex;
		justify-content: center;
		gap: 48rpx;
	}
	.social-btn {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.65);
	}
	.social-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.1);
	}

	/* ===== 中心链接 ===== */
	.center-link {
		text-align: center;
		font-size: 28rpx;
		color: #8A9BB8;
	}
	.center-link .btn-link {
		margin-left: 4rpx;
	}

	@media (max-width: 374px) {
		.login-content { padding: 0 24rpx 60rpx; }
		.login-form-card { padding: 28rpx 24rpx; }
		.login-btn { height: 88rpx; font-size: 30rpx; }
		.social-row { gap: 32rpx; }
		.social-btn { width: 80rpx; height: 80rpx; }
	}
	@media (min-width: 414px) {
		.login-content { padding: 0 60rpx 80rpx; }
		.login-form-card { padding: 44rpx 48rpx; }
	}
	@media (min-width: 768px) {
		.login-content { padding: 0 80rpx 80rpx; }
		.app-title { font-size: 48rpx; }
	}
</style>