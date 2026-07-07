<template>
	<view class="register-page">
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<svg class="back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</view>
			<text class="header-title">创建账号</text>
			<view class="header-spacer"></view>
		</view>

		<scroll-view scroll-y class="form-scroll">
			<view class="register-content">
				<view class="register-form-card">
					<!-- 手机号 -->
					<view class="field-group">
						<view class="field-label">手机号码</view>
						<view class="input-wrapper" :class="{ 'input-error': errors.phone && touched.phone }">
							<svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="14" height="20" x="5" y="2" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M12 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<view class="country-code">
								<text class="code-text">+86</text>
							</view>
							<input
								class="input-field"
								type="tel"
								v-model="form.phone"
								placeholder="请输入手机号码"
								maxlength="11"
								@input="validateField('phone')"
								@blur="touched.phone = true; validateField('phone')"
							/>
						</view>
						<text v-if="errors.phone && touched.phone" class="error-msg">{{ errors.phone }}</text>
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
							<svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
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
								<svg v-if="showPassword" class="eye-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M2 2l20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<svg v-else class="eye-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
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
							<svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
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
					<view
						class="btn-primary register-btn"
						:class="{ 'btn-disabled': !formValid || !agree || submitting }"
						@click="handleRegister"
					>
						<text v-if="submitting">⏳ 注册中...</text>
						<text v-else-if="registered">✅ 注册成功！即将跳转...</text>
						<text v-else>注册</text>
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

	export default {
		data() {
			return {
				form: { phone: '', code: '', password: '', confirmPassword: '' },
				errors: { phone: '', code: '', password: '', confirmPassword: '' },
				touched: { phone: false, code: false, password: false, confirmPassword: false },
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
				return !this.errors.phone && !this.errors.code && !this.errors.password && !this.errors.confirmPassword
					&& this.form.phone && this.form.code && this.form.password && this.form.confirmPassword
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
			strengthClass(index) {
				const level = this.passwordStrength
				if (index >= level) return 'strength-empty'
				if (level === 1) return 'strength-weak'
				if (level === 2) return 'strength-medium'
				return 'strength-strong'
			},
			validateField(field) {
				const fieldRules = {
					phone: [rules.required('请输入手机号'), rules.phone()],
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
			sendCode() {
				if (this.countdown > 0) return
				const phoneResult = validate({ phone: this.form.phone }, { phone: [rules.required('请输入手机号'), rules.phone()] })
				if (!phoneResult.valid) {
					this.errors.phone = phoneResult.errors.phone
					this.touched.phone = true
					return
				}
				this.errors.phone = ''
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
			async handleRegister() {
				Object.keys(this.touched).forEach(k => { this.touched[k] = true; this.validateField(k) })
				if (!this.formValid || !this.agree || this.submitting || this.registered) return

				this.submitting = true
				Logger.info('Register', '用户注册', { phone: this.form.phone })

				try {
					uni.setStorageSync('registered_user', JSON.stringify({
						phone: this.form.phone
					}))
					Logger.info('Register', '注册成功')

					this.registered = true
					this.submitting = false

					setTimeout(() => {
						uni.redirectTo({ url: '/pages/accounting/login' })
					}, 2000)
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
		min-height: 100vh;
		background: #FFF9F5;
		display: flex;
		flex-direction: column;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height) + 24rpx) 40rpx 24rpx;
		flex-shrink: 0;
	}
	.header-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04);
		transition: background 0.2s;
	}
	.header-back:active {
		background: #F5EDE6;
	}
	.back-icon {
		font-size: 40rpx;
		color: #3D2316;
		line-height: 1;
	}
	.header-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #3D2316;
	}
	.header-spacer {
		width: 72rpx;
	}

	.form-scroll {
		flex: 1;
	}

	.register-content {
		padding: 0 40rpx 80rpx;
	}

	.register-form-card {
		background: #fff;
		border-radius: 32rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06);
	}

	.field-group {
		margin-bottom: 40rpx;
	}
	.field-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: #7A5C4A;
		margin-bottom: 12rpx;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		border-radius: 24rpx;
		background: #FFF5EE;
		border: 2rpx solid #F0E4DA;
		padding: 0 32rpx;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	.input-wrapper:focus-within {
		border-color: #E8734A;
	}
	.input-wrapper.input-error {
		border-color: #E53935 !important;
	}
	.input-field {
		flex: 1;
		height: 96rpx;
		font-size: 30rpx;
		color: #3D2316;
		background: transparent;
		border: none;
		outline: none;
	}
	.input-field::placeholder {
		color: #C8A896;
	}

	.country-code {
		padding-right: 24rpx;
		border-right: 2rpx solid #F0E4DA;
		margin-right: 24rpx;
	}
	.code-text {
		font-size: 30rpx;
		font-weight: 500;
		color: #3D2316;
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
		background: #FDE6D4;
		color: #E8734A;
		font-size: 28rpx;
		font-weight: 500;
		border-radius: 0 24rpx 24rpx 0;
		transition: all 0.2s;
	}
	.code-btn:active {
		background: #FBBE9E;
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
	.strength-empty { background: #F0E4DA; }
	.strength-weak { background: #E53935; }
	.strength-medium { background: #FF9800; }
	.strength-strong { background: #4CAF50; }
	.strength-label {
		font-size: 20rpx;
		color: #A98B78;
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
		border: 2rpx solid #E8D5C8;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
		margin-top: 4rpx;
	}
	.checkbox.checked {
		background: #E8734A;
		border-color: #E8734A;
	}
	.check-icon {
		font-size: 22rpx;
		color: #fff;
		font-weight: 600;
	}
	.agreement-text {
		font-size: 24rpx;
		color: #A98B78;
		line-height: 1.6;
	}
	.link-text {
		color: #E8734A;
		font-weight: 500;
	}

	.btn-primary {
		width: 100%;
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #E8734A;
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.3);
		transition: background 0.2s;
	}
	.btn-primary:active {
		background: #C95A33;
	}
	.btn-disabled {
		opacity: 0.4 !important;
		pointer-events: none;
	}

	.login-link-area {
		text-align: center;
		margin-top: 48rpx;
		font-size: 28rpx;
	}
	.login-hint {
		color: #A98B78;
	}
	.login-link {
		color: #E8734A;
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
		.input-field { height: 88rpx; font-size: 28rpx; }
		.code-btn { padding: 0 24rpx; font-size: 26rpx; }
	}
</style>
