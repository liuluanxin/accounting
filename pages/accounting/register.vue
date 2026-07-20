<template>
	<view class="cosmic-page register-page">
		<!-- 装饰星球 -->
		<view class="cosmic-deco-planet cosmic-deco-planet--big" style="top:-60rpx;left:-80rpx;"></view>
		<view class="cosmic-deco-planet cosmic-deco-planet--small" style="bottom:120rpx;right:-20rpx;"></view>
		<view class="cosmic-deco-star" style="top:100rpx;right:80rpx;"></view>

		<top-bar title="注册" show-back @back="goBack" />

		<scroll-view scroll-y class="screen">
			<view class="register-content">
				<!-- Logo 区域 -->
				<view class="register-logo">
					<view class="logo-icon-wrap">
						<lucide-icon name="app-logo" brand size="76rpx" />
					</view>
					<text class="logo-text">加入宇宙记账</text>
				</view>

				<!-- 注册卡片 -->
				<view class="card register-form-card">
					<!-- QQ邮箱 -->
					<view class="form-group">
						<view class="field-label">QQ邮箱</view>
						<view class="field-wrapper">
							<lucide-icon class="field-icon" name="mail" size="28rpx" color="#8A9BB8" />
							<input class="field" type="text" v-model="form.email" placeholder="QQ邮箱" />
						</view>
					</view>

					<!-- 验证码 -->
					<view class="form-group">
						<view class="field-label">验证码</view>
						<view class="code-row">
							<view class="field-wrapper code-input-wrapper">
								<lucide-icon class="field-icon" name="shield" size="28rpx" color="#8A9BB8" />
								<input class="field" type="text" v-model="form.code" placeholder="请输入验证码" maxlength="6" />
							</view>
							<view class="code-btn" :class="{ 'code-sent': countdown > 0 }" @click="sendCode">
								<text v-if="countdown > 0">{{ countdown }}s</text>
								<text v-else>获取验证码</text>
							</view>
						</view>
					</view>

					<!-- 密码 -->
					<view class="form-group">
						<view class="field-label">设置密码</view>
						<view class="field-wrapper">
							<lucide-icon class="field-icon" name="lock" size="28rpx" color="#8A9BB8" />
							<input class="field" :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="8–20位，含字母和数字" maxlength="20" />
							<view class="toggle-pwd" @click="showPassword = !showPassword">
								<lucide-icon :name="showPassword ? 'eye' : 'eye-off'" size="32rpx" color="#8A9BB8" />
							</view>
						</view>
						<!-- 密码强度指示器 -->
						<view v-if="form.password.length > 0" class="pwd-strength">
							<span :class="strengthClass(0)"></span>
							<span :class="strengthClass(1)"></span>
							<span :class="strengthClass(2)"></span>
						</view>
					</view>

					<!-- 确认密码 -->
					<view class="form-group">
						<view class="field-label">确认密码</view>
						<view class="field-wrapper">
							<lucide-icon class="field-icon" name="lock" size="28rpx" color="#8A9BB8" />
							<input class="field" :type="showConfirmPwd ? 'text' : 'password'" v-model="form.confirmPassword" placeholder="请再次输入密码" maxlength="20" />
							<view class="toggle-pwd" @click="showConfirmPwd = !showConfirmPwd">
								<lucide-icon :name="showConfirmPwd ? 'eye' : 'eye-off'" size="32rpx" color="#8A9BB8" />
							</view>
						</view>
					</view>

					<!-- 协议勾选 -->
					<view class="agreement-row" @click="agree = !agree">
						<view class="custom-checkbox">
							<view class="box" :class="{ checked: agree }">
								<lucide-icon v-if="agree" name="check" size="20rpx" color="#FFFFFF" />
							</view>
						</view>
						<text class="agreement-text">
							我已阅读并同意
							<text class="btn-link">《用户协议》</text>
							和
							<text class="btn-link">《隐私政策》</text>
						</text>
					</view>

					<!-- 注册按钮 -->
					<view class="btn-primary register-btn" @click="handleRegister">
						<text>{{ submitting ? '注册中...' : '注 册' }}</text>
					</view>
				</view>

				<!-- 登录链接 -->
				<view class="center-link">
					已有账号？<text class="btn-link" @click="goBack">返回登录</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { isQqEmail, validatePassword, loginSuccess } from '@/common/auth-utils.js'

	export default {
		data() {
			return {
				form: {
					email: '',
					code: '',
					password: '',
					confirmPassword: ''
				},
				showPassword: false,
				showConfirmPwd: false,
				submitting: false,
				agree: false,
				countdown: 0,
				countdownTimer: null
			}
		},
		computed: {
			passwordValidation() {
				return validatePassword(this.form.password)
			},
			passwordStrength() {
				return this.passwordValidation.level
			}
		},
		beforeDestroy() {
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
				this.countdownTimer = null
			}
		},
		methods: {
			strengthClass(index) {
				const level = this.passwordStrength
				if (index >= level) return ''
				if (level === 1) return 'weak'
				if (level === 2) return 'medium'
				return 'strong'
			},
			sendCode() {
				if (this.countdown > 0) return
				const email = this.form.email.trim()
				if (!email) {
					uni.showToast({ title: '请先输入QQ邮箱', icon: 'none' })
					return
				}
				if (!isQqEmail(email)) {
					uni.showToast({ title: '请输入有效的QQ邮箱', icon: 'none' })
					return
				}
				uni.showToast({ title: '验证码已发送', icon: 'none' })
				this.countdown = 60
				this.countdownTimer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						clearInterval(this.countdownTimer)
						this.countdownTimer = null
					}
				}, 1000)
			},
			handleRegister() {
				const email = this.form.email.trim()
				if (!email || !this.form.code.trim() || !this.form.password.trim() || !this.form.confirmPassword.trim()) {
					uni.showToast({ title: '请填写完整信息', icon: 'none' })
					return
				}
				if (!isQqEmail(email)) {
					uni.showToast({ title: '请输入有效的QQ邮箱', icon: 'none' })
					return
				}
				const pwdResult = validatePassword(this.form.password)
				if (!pwdResult.ok) {
					uni.showToast({ title: pwdResult.msg, icon: 'none' })
					return
				}
				if (this.form.password !== this.form.confirmPassword) {
					uni.showToast({ title: '两次密码不一致', icon: 'none' })
					return
				}
				if (!this.agree) {
					uni.showToast({ title: '请阅读并同意协议', icon: 'none' })
					return
				}
				this.submitting = true
				loginSuccess(email, false)
				uni.showToast({ title: '注册成功', icon: 'success' })
				setTimeout(() => {
					this.submitting = false
					uni.redirectTo({ url: '/pages/accounting/home' })
				}, 1000)
			},
			goBack() {
				uni.redirectTo({ url: '/pages/accounting/login' })
			}
		}
	}
</script>


<style lang="scss" scoped>

	/* ===== 装饰星球 ===== */
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

	/* ===== 注册内容 ===== */
	.register-content {
		padding: 0 40rpx 80rpx;
		width: 100%;
		max-width: 720rpx;
		margin: 0 auto;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	/* ===== Logo 区域 ===== */
	.register-logo {
		text-align: center;
		margin-bottom: 36rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	.register-logo .logo-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logo-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #1A2744;
	}

	/* ===== 注册卡片 ===== */
	.register-form-card {
		padding: 52rpx 40rpx;
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

	/* ===== 验证码行 ===== */
	.code-row {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}
	.code-input-wrapper {
		flex: 1;
	}
	.code-btn {
		flex-shrink: 0;
		padding: 0 28rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(91, 155, 224, 0.1);
		color: #5B9BE0;
		font-size: 26rpx;
		font-weight: 500;
		border-radius: 24rpx;
		transition: all 0.2s;
		white-space: nowrap;
		cursor: pointer;
	}
	.code-btn:active {
		background: rgba(91, 155, 224, 0.3);
	}
	.code-sent {
		opacity: 0.5;
		pointer-events: none;
	}

	/* ===== 密码强度条 ===== */
	.pwd-strength {
		display: flex;
		gap: 8rpx;
		margin-top: 16rpx;
	}
	.pwd-strength span {
		flex: 1;
		height: 6rpx;
		border-radius: 3rpx;
		background: #E3ECF7;
		transition: all 0.3s;
	}
	.pwd-strength span.weak {
		background: #FF6B6B;
	}
	.pwd-strength span.medium {
		background: #FFB020;
	}
	.pwd-strength span.strong {
		background: #34C759;
	}

	/* ===== 协议行 ===== */
	.agreement-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		margin-bottom: 40rpx;
		cursor: pointer;
		user-select: none;
	}
	.custom-checkbox .box {
		width: 32rpx;
		height: 32rpx;
		border-radius: 6rpx;
		border: 2rpx solid #D0D7E3;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
		margin-top: 4rpx;
		background: #fff;
	}
	.custom-checkbox .box.checked {
		background: #5B9BE0;
		border-color: #5B9BE0;
	}
	.agreement-text {
		font-size: 24rpx;
		color: #8A9BB8;
		line-height: 1.6;
	}
	.btn-link {
		color: #5B9BE0;
		font-weight: 500;
	}

	/* ===== 注册按钮 ===== */
	.register-btn {
		width: 100%;
		height: 100rpx;
		min-height: 48px;
		margin: 0 auto;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 50rpx;
	}

	/* ===== 中心链接 ===== */
	.center-link {
		text-align: center;
		margin-top: 48rpx;
		font-size: 28rpx;
		color: #8A9BB8;
	}
	.center-link .btn-link {
		margin-left: 4rpx;
	}

	@media (max-width: 374px) {
		.register-content { padding: 0 24rpx 60rpx; }
		.register-form-card { padding: 28rpx 24rpx; }
		.code-btn { padding: 0 24rpx; font-size: 24rpx; }
		.register-btn { height: 88rpx; font-size: 30rpx; }
	}
	@media (min-width: 414px) {
		.register-content { padding: 0 60rpx 80rpx; }
		.register-form-card { padding: 44rpx 48rpx; }
	}
	@media (min-width: 768px) {
		.register-content { padding: 0 80rpx 80rpx; }
	}
</style>