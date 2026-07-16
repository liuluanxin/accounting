<template>
	<view class="register-page">
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<view class="back-icon" :style="getIconStyle('arrow-left')"></view>
			</view>
			<text class="header-title">创建账号</text>
			<view class="header-spacer"></view>
		</view>

		<scroll-view scroll-y class="form-scroll">
			<view class="register-content">
				<view class="register-form-card">
					<!-- 邮箱 -->
					<view class="field-group">
						<view class="field-label">邮箱地址</view>
						<view class="input-wrapper" :class="{ 'input-error': errors.email && touched.email }">
							<view class="input-icon" :style="getIconStyle('user')"></view>
							<input
								class="input-field"
								type="text"
								v-model="form.email"
								placeholder="请输入邮箱地址"
								@input="validateField('email')"
								@blur="touched.email = true; validateField('email')"
							/>
						</view>
					<text v-if="errors.email && touched.email" class="error-msg">{{ errors.email }}</text>
					</view>

					<!-- 用户名 -->
					<view class="field-group">
						<view class="field-label">用户名</view>
						<view class="input-wrapper" :class="{ 'input-error': errors.username && touched.username }">
							<view class="input-icon" :style="getIconStyle('user')"></view>
							<input
								class="input-field"
								type="text"
								v-model="form.username"
								placeholder="请输入用户名"
								maxlength="20"
								@input="validateField('username')"
								@blur="touched.username = true; validateField('username')"
							/>
						</view>
						<text v-if="errors.username && touched.username" class="error-msg">{{ errors.username }}</text>
					</view>

					<!-- 验证码 -->
					<view class="field-group">
						<view class="field-label">验证码</view>
						<view class="input-wrapper code-wrapper" :class="{ 'input-error': errors.code && touched.code }">
							<input
								class="input-field code-input"
								type="text"
								v-model="form.code"
								placeholder="请输入验证码"
								maxlength="6"
								@input="validateField('code')"
								@blur="touched.code = true; validateField('code')"
							/>
							<view
								class="code-btn"
								:class="{ 'code-sent': countdown > 0 }"
								@click="sendCode"
							>
								<text v-if="countdown > 0">{{ countdown }}s</text>
								<text v-else>获取验证码</text>
							</view>
						</view>
						<text v-if="errors.code && touched.code" class="error-msg">{{ errors.code }}</text>
					</view>

					<!-- 密码 -->
					<view class="field-group">
						<view class="field-label">设置密码</view>
						<view class="input-wrapper" :class="{ 'input-error': errors.password && touched.password }">
							<view class="input-icon" :style="getIconStyle('lock')"></view>
							<input
								class="input-field"
								:type="showPassword ? 'text' : 'password'"
								v-model="form.password"
								placeholder="请设置6-20位密码"
								maxlength="20"
								@input="validateField('password')"
								@blur="touched.password = true; validateField('password')"
							/>
							<view class="toggle-pwd" @click="showPassword = !showPassword">
								<view v-if="showPassword" class="eye-icon" :style="getIconStyle('eye-off')"></view>
								<view v-else class="eye-icon" :style="getIconStyle('eye-open')"></view>
							</view>
						</view>
						<text v-if="errors.password && touched.password" class="error-msg">{{ errors.password }}</text>
						<view v-if="form.password.length > 0" class="strength-bar">
							<view class="strength-segment" :class="strengthClass(0)"></view>
							<view class="strength-segment" :class="strengthClass(1)"></view>
							<view class="strength-segment" :class="strengthClass(2)"></view>
							<text class="strength-label">{{ strengthText }}</text>
						</view>
					</view>

					<!-- 确认密码 -->
					<view class="field-group">
						<view class="field-label">确认密码</view>
						<view class="input-wrapper" :class="{ 'input-error': errors.confirmPassword && touched.confirmPassword }">
							<view class="input-icon" :style="getIconStyle('lock')"></view>
							<input
								class="input-field"
								:type="showConfirmPwd ? 'text' : 'password'"
								v-model="form.confirmPassword"
								placeholder="请再次输入密码"
								maxlength="20"
								@input="validateField('confirmPassword')"
								@blur="touched.confirmPassword = true; validateField('confirmPassword')"
							/>
							<text class="toggle-pwd" @click="showConfirmPwd = !showConfirmPwd">
								{{ showConfirmPwd ? '🙈' : '👁️' }}
							</text>
						</view>
						<text v-if="errors.confirmPassword && touched.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</text>
					</view>

					<!-- 协议勾选 -->
					<view class="agreement-row">
						<view class="checkbox" :class="{ checked: agree }" @click="agree = !agree">
							<text v-if="agree" class="check-icon">✓</text>
						</view>
						<text class="agreement-text">
							我已阅读并同意
							<text class="link-text">《用户协议》</text>
							和
							<text class="link-text">《隐私政策》</text>
						</text>
					</view>

					<!-- 注册按钮 -->
					<view class="register-btn-wrapper">
						<view
							class="btn-primary"
							:class="{ 'btn-disabled': !formValid || !agree || submitting }"
							@click="handleRegister"
						>
							<text v-if="submitting">⏳ 注册中...</text>
							<text v-else-if="registered">✅ 注册成功！即将跳转...</text>
							<text v-else>注册</text>
						</view>
					</view>
				</view>

				<view class="login-link-area">
					<text class="login-hint">已有账号？</text>
					<text class="login-link" @click="goBack">返回登录</text>
				</view>
			</view>
			<view style="height: 80rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
	import Logger from '@/common/logger.js'
	import { rules, validate } from '@/common/validator.js'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'
	import { apiRequest } from '@/services/api-client.js'
	import ENDPOINTS from '@/services/api-endpoints.js'

	export default {
		mixins: [themeMixin],
		data() {
			return {
				form: { email: '', username: '', code: '', password: '', confirmPassword: '' },
				errors: { email: '', username: '', code: '', password: '', confirmPassword: '' },
				touched: { email: false, username: false, code: false, password: false, confirmPassword: false },
				showPassword: false,
				showConfirmPwd: false,
				submitting: false,
				registered: false,
				agree: false,
				countdown: 0,
				countdownTimer: null
			}
		},
		computed: {
			formValid() {
				return !this.errors.email && !this.errors.username && !this.errors.code && !this.errors.password && !this.errors.confirmPassword
					&& this.form.email && this.form.username && this.form.code && this.form.password && this.form.confirmPassword
			},
			passwordStrength() {
				const p = this.form.password
				if (p.length < 6) return 0
				let score = 0
				if (p.length >= 6) score++
				if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
				if (/\d/.test(p)) score++
				if (/[^A-Za-z0-9]/.test(p)) score++
				if (score <= 1) return 1
				if (score <= 2) return 2
				return 3
			},
			strengthText() {
				return { 0: '', 1: '弱', 2: '中', 3: '强' }[this.passwordStrength] || ''
			}
		},
		beforeDestroy() {
			if (this.countdownTimer) clearInterval(this.countdownTimer)
		},
		methods: {
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			strengthClass(index) {
				const level = this.passwordStrength
				if (index >= level) return 'strength-empty'
				if (level === 1) return 'strength-weak'
				if (level === 2) return 'strength-medium'
				return 'strength-strong'
			},
			validateField(field) {
				const fieldRules = {
					email: [rules.required('请输入邮箱'), rules.email()],
					username: [rules.required('请输入用户名'), rules.username()],
					code: [rules.required('请输入验证码'), rules.minLength(6, '验证码为6位')],
					password: [rules.required('请输入密码'), rules.minLength(6, '密码至少6位')],
					confirmPassword: [
						rules.required('请确认密码'),
						(v) => {
							if (v !== this.form.password) return { valid: false, message: '两次密码不一致' }
							return { valid: true }
						}
					]
				}
				const result = validate({ [field]: this.form[field] }, { [field]: fieldRules[field] })
				this.errors[field] = result.valid ? '' : result.errors[field]
			},
			async sendCode() {
				if (this.countdown > 0) return
				const emailResult = validate({ email: this.form.email }, { email: [rules.required('请输入邮箱'), rules.email()] })
				if (!emailResult.valid) {
					this.errors.email = emailResult.errors.email
					this.touched.email = true
					return
				}
				this.errors.email = ''
				
				Logger.info('Register', '发送邮箱验证码', { email: this.form.email })
				const res = await apiRequest({
					url: ENDPOINTS.auth.sendEmailCode,
					method: 'POST',
					data: { email: this.form.email, scene: 'register' }
				})
				
				if (!res.success) {
					uni.showToast({ title: res.message || '发送失败', icon: 'none' })
					return
				}
				
// 开发模式：自动填入模拟验证码
				if (res.data && res.data.mockCode) {
					this.form.code = res.data.mockCode
				}
				uni.showToast({ title: res.message || '验证码已发送', icon: 'none' })
				this.countdown = 60
				this.countdownTimer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						clearInterval(this.countdownTimer)
						this.countdownTimer = null
					}
				}, 1000)
			},
			async handleRegister() {
				Object.keys(this.touched).forEach(k => { this.touched[k] = true; this.validateField(k) })
				if (!this.formValid || !this.agree || this.submitting || this.registered) return

				this.submitting = true
				Logger.info('Register', '用户注册', { email: this.form.email })

				try {
					const res = await apiRequest({
						url: ENDPOINTS.auth.register,
						method: 'POST',
						data: {
							email: this.form.email,
							username: this.form.username,
							code: this.form.code,
							password: this.form.password
						}
					})

					if (!res.success) {
						uni.showToast({ title: res.message || '注册失败', icon: 'none' })
						this.submitting = false
						return
					}

					Logger.info('Register', '注册成功', { username: this.form.username })
					this.registered = true
					this.submitting = false

					if (res.data?.token) {
						uni.setStorageSync('auth_token', res.data.token)
					}
					if (res.data?.user) {
						uni.setStorageSync('login_user', JSON.stringify(res.data.user))
					}

					const now = Date.now()
					uni.setStorageSync('isLoggedIn', 'true')
					uni.setStorageSync('loginTime', now)
					uni.setStorageSync('login_email', this.form.email)

					uni.redirectTo({ url: '/pages/accounting/home' })
				} catch (err) {
					Logger.errorWithException('Register', '注册失败', err)
					this.submitting = false
					uni.showToast({ title: '注册失败，请重试', icon: 'none' })
				}
			},
			goBack() { uni.redirectTo({ url: '/pages/accounting/login' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.register-page {
		height: 100vh;
		background: transparent;
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height) + 24rpx) 40rpx 24rpx;
		flex-shrink: 0;
		width: 100%;
		box-sizing: border-box;
	}
	.header-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--card-bg, #FFFFFF);
		box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.04);
		transition: background 0.2s;
	}
	.header-back:active {
		background: var(--border, #E8F0FE);
	}
	.back-icon {
		width: 40rpx;
		height: 40rpx;
		background-color: var(--text-primary, #1A2744);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.header-title {
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
	}
	.header-spacer {
		width: 72rpx;
	}

	.form-scroll {
		flex: 1;
		width: 100%;
		box-sizing: border-box;
		flex-direction: column;
	}

	.register-content {
		padding: 0 40rpx 80rpx;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		align-self: stretch;
	}

	.register-form-card {
		background: var(--card-bg, #FFFFFF);
		border-radius: 32rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06);
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	.field-group {
		margin-bottom: 40rpx;
	}
	.field-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: var(--text-secondary, #5A6B8A);
		margin-bottom: 12rpx;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		border-radius: 24rpx;
		background: var(--input-bg, #F2F7FF);
		border: 2rpx solid var(--border, #E8F0FE);
padding: 16rpx 32rpx;
		height: 88rpx;
		box-sizing: border-box;
		transition: border-color 0.2s;
	}
	.input-wrapper:focus-within {
		border-color: var(--primary, #5B9BE0);
	}
	.input-icon {
		width: 40rpx;
		height: 40rpx;
		background-color: currentColor;
		flex-shrink: 0;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.input-wrapper.input-error {
		border-color: #E53935 !important;
	}
	.input-field {
		flex: 1;
		padding: 0 0 0 12rpx;
		margin: 0;
		font-size: 30rpx;
line-height: 56rpx;
		color: var(--text-primary, #1A2744);
		background: transparent;
		border: none;
		outline: none;
	}
	.input-field::placeholder {
		color: #C8A896;
	}

.country-code {
		padding-right: 24rpx;
		border-right: 2rpx solid var(--border, #E8F0FE);
		margin-right: 24rpx;
	}
	.code-text {
		font-size: 30rpx;
		font-weight: 500;
		color: var(--text-primary, #1A2744);
	}

	.code-wrapper {
		padding-right: 0;
	}
	.code-input {
		padding-right: 0;
	}
	.code-btn {
		padding: 0 32rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(91, 155, 224, 0.1);
		color: var(--primary, #5B9BE0);
		font-size: 28rpx;
		font-weight: 500;
		border-radius: 0 24rpx 24rpx 0;
		transition: all 0.2s;
	}
	.code-btn:active {
		background: rgba(91, 155, 224, 0.3);
	}
	.code-sent {
		opacity: 0.5;
		pointer-events: none;
	}

	.toggle-pwd {
		font-size: 32rpx;
		padding: 12rpx;
		cursor: pointer;
		user-select: none;
	}
	.eye-icon {
		width: 44rpx;
		height: 44rpx;
		background-color: currentColor;
		flex-shrink: 0;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}

	.error-msg {
		display: block;
		font-size: 22rpx;
		color: #E53935;
		margin-top: 10rpx;
		padding-left: 8rpx;
	}

	.strength-bar {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 16rpx;
		padding: 0 8rpx;
	}
	.strength-segment {
		flex: 1;
		height: 6rpx;
		border-radius: 3rpx;
		transition: all 0.3s;
	}
	.strength-empty { background: var(--border, #E8F0FE); }
	.strength-weak { background: #E53935; }
	.strength-medium { background: var(--warning, #F0AD4E); }
	.strength-strong { background: #4CAF50; }
	.strength-label {
		font-size: 20rpx;
		color: var(--text-tertiary, #8A9BB8);
		margin-left: 8rpx;
		min-width: 40rpx;
	}

	.agreement-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		margin-bottom: 40rpx;
	}
	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border-radius: 6rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
		margin-top: 4rpx;
	}
	.checkbox.checked {
		background: var(--primary, #5B9BE0);
		border-color: var(--primary, #5B9BE0);
	}
	.check-icon {
		font-size: 22rpx;
		color: var(--card-bg, #FFFFFF);
		font-weight: 600;
	}
	.agreement-text {
		font-size: 24rpx;
		color: var(--text-tertiary, #8A9BB8);
		line-height: 1.6;
	}
	.link-text {
		color: var(--primary, #5B9BE0);
		font-weight: 500;
	}

	.btn-primary {
		width: 100%;
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--primary, #5B9BE0);
		color: var(--card-bg, #FFFFFF);
		font-size: 32rpx;
		font-weight: 600;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.3);
		transition: background 0.2s;
	}
	.btn-primary:active {
		background: var(--primary-dark, #4A7FC0);
	}
	.btn-disabled {
		opacity: 0.4 !important;
		pointer-events: none;
	}

	.register-btn-wrapper {
		text-align: center;
	}

	.register-btn-wrapper .btn-primary {
		width: 86%;
		max-width: 520rpx;
		min-width: 200rpx;
		margin: 0 auto;
		height: 96rpx;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--primary, #5B9BE0);
		color: var(--card-bg, #FFFFFF);
		font-size: 40rpx;
		font-weight: 600;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.3);
		transition: background 0.2s;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.register-btn-wrapper .btn-primary:active {
		background: var(--primary-dark, #4A7FC0);
	}
	.register-btn-wrapper .btn-disabled {
		opacity: 0.4 !important;
		pointer-events: none;
	}

	.login-link-area {
		text-align: center;
		margin-top: 48rpx;
		font-size: 28rpx;
	}
	.login-hint {
		color: var(--text-tertiary, #8A9BB8);
	}
	.login-link {
		color: var(--primary, #5B9BE0);
		font-weight: 600;
		margin-left: 8rpx;
	}

	@media (min-width: 768px) {
		.register-content {
			max-width: 600px;
			margin: 0 auto;
		}
	}
	@media (max-width: 360px) {
		.page-header { padding: calc(var(--status-bar-height) + 16rpx) 24rpx 16rpx; }
		.register-content { padding: 0 24rpx 80rpx; }
		.register-form-card { padding: 28rpx; }
		.input-field { font-size: 28rpx; }
		.code-btn { padding: 0 24rpx; font-size: 26rpx; }
		.btn-primary { height: 92rpx; font-size: 30rpx; }
	}
</style>
