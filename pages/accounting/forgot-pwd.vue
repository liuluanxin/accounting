<template>
	<view class="forgot-page">
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<view class="back-icon" :style="getIconStyle('arrow-left')"></view>
			</view>
			<text class="header-title">找回密码</text>
			<view class="header-spacer"></view>
		</view>

		<scroll-view scroll-y class="form-scroll">
			<view class="forgot-content">
				<view class="illustration-area">
					<view class="lock-icon-wrapper">
					<view class="lock-icon-inner">
						<view class="lock-icon" :style="getIconStyle('lock')"></view>
						</view>
						<view class="deco-circle deco-1"></view>
						<view class="deco-circle deco-2"></view>
					</view>
				</view>

				<view class="step-indicator">
					<view class="step-item" :class="{ active: step >= 1 }">
						<view class="step-dot">
							<text class="step-num">1</text>
						</view>
						<text class="step-label">验证邮箱</text>
					</view>
					<view class="step-connector" :class="{ active: step >= 2 }"></view>
					<view class="step-item" :class="{ active: step >= 2 }">
						<view class="step-dot">
							<text class="step-num">2</text>
						</view>
						<text class="step-label">设置新密码</text>
					</view>
					<view class="step-connector" :class="{ active: step >= 3 }"></view>
					<view class="step-item" :class="{ active: step >= 3 }">
						<view class="step-dot">
							<text class="step-num">3</text>
						</view>
						<text class="step-label">完成</text>
					</view>
				</view>

				<view class="forgot-form-card">
					<template v-if="step === 1">
						<text class="form-desc">请输入注册时使用的邮箱地址，我们将发送验证码帮助您重置密码。</text>

						<view class="field-group">
							<view class="field-label">邮箱地址</view>
							<view class="input-wrapper" :class="{ 'input-error': errors.email && touched.email }">
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

						<view class="field-group">
							<view class="field-label">验证码</view>
							<view class="code-row">
								<view class="input-wrapper code-input-wrapper" :class="{ 'input-error': errors.code && touched.code }">
									<input
										class="input-field"
										type="text"
										v-model="form.code"
										placeholder="请输入验证码"
										maxlength="6"
										@input="validateField('code')"
										@blur="touched.code = true; validateField('code')"
									/>
								</view>
								<view class="code-btn" :class="{ 'code-sent': countdown > 0 }" @click="sendCode">
									<text v-if="countdown > 0">{{ countdown }}s</text>
									<text v-else>获取验证码</text>
								</view>
							</view>
							<text v-if="errors.code && touched.code" class="error-msg">{{ errors.code }}</text>
						</view>

						<view class="forgot-btn-wrapper">
							<view class="btn-primary" @click="goStep2">
								<text>下一步</text>
							</view>
						</view>

						<text class="tip-text">没有收到验证码？<text class="tip-link" @click="sendCode">重新发送</text></text>
					</template>

					<template v-if="step === 2">
						<view class="field-group">
							<view class="field-label">新密码</view>
							<view class="input-wrapper" :class="{ 'input-error': errors.password && touched.password }">
								<input
									class="input-field"
									:type="showPassword ? 'text' : 'password'"
									v-model="form.password"
									placeholder="请设置新密码"
									@input="validateField('password')"
									@blur="touched.password = true; validateField('password')"
								/>
								<text class="toggle-pwd" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</text>
							</view>
							<text v-if="errors.password && touched.password" class="error-msg">{{ errors.password }}</text>
						</view>

						<view class="field-group">
							<view class="field-label">确认密码</view>
							<view class="input-wrapper" :class="{ 'input-error': errors.confirmPassword && touched.confirmPassword }">
								<input
									class="input-field"
									:type="showConfirm ? 'text' : 'password'"
									v-model="form.confirmPassword"
									placeholder="请再次输入密码"
									@input="validateField('confirmPassword')"
									@blur="touched.confirmPassword = true; validateField('confirmPassword')"
								/>
								<text class="toggle-pwd" @click="showConfirm = !showConfirm">{{ showConfirm ? '🙈' : '👁️' }}</text>
							</view>
							<text v-if="errors.confirmPassword && touched.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</text>
						</view>

						<view class="btn-row">
							<view class="btn-secondary" @click="step = 1">上一步</view>
							<view class="btn-primary" :class="{ 'btn-disabled': !formValid || submitting }" @click="handleSubmit">
								<text v-if="submitting">⏳ 提交中...</text>
								<text v-else-if="submitted">✅ 已重置</text>
								<text v-else>确认重置</text>
							</view>
						</view>
					</template>

					<template v-if="step === 3">
						<view class="success-state">
							<view class="success-icon-wrapper">
						<view class="success-icon" :style="getIconStyle('check')"></view>
					</view>
							<text class="success-title">密码重置成功</text>
							<text class="success-desc">请使用新密码登录你的账户</text>
							<view class="forgot-btn-wrapper">
								<view class="btn-primary" @click="goBack">返回登录</view>
							</view>
						</view>
					</template>
				</view>

				<view style="height: 48rpx;"></view>
			</view>
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
				step: 1,
				form: { email: '', code: '', password: '', confirmPassword: '' },
				errors: { email: '', code: '', password: '', confirmPassword: '' },
				touched: { email: false, code: false, password: false, confirmPassword: false },
				showPassword: false,
				showConfirm: false,
				countdown: 0,
				countdownTimer: null,
				submitting: false,
				submitted: false
			}
		},
		computed: {
			formValid() {
				return !this.errors.email && !this.errors.code && !this.errors.password && !this.errors.confirmPassword
					&& this.form.email && this.form.code && this.form.password && this.form.confirmPassword
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
			validateField(field) {
				const fieldRules = {
					email: [rules.required('请输入邮箱'), rules.email()],
					code: [rules.required('请输入验证码'), rules.minLength(6, '验证码为6位')],
					password: [rules.required('请输入新密码'), rules.minLength(6, '密码至少6位')],
					confirmPassword: [
						rules.required('请确认密码'),
						(v) => (v !== this.form.password) ? { valid: false, message: '两次密码不一致' } : { valid: true }
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
				Logger.info('ForgotPwd', '发送邮箱验证码', { email: this.form.email })
				
				const res = await apiRequest({
					url: ENDPOINTS.auth.sendEmailCode,
					method: 'POST',
					data: { email: this.form.email, scene: 'reset' }
				})
				
				if (!res.success) {
					uni.showToast({ title: res.message || '发送失败', icon: 'none' })
					return
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
			goStep2() {
				this.touched.email = true; this.validateField('email')
				this.touched.code = true; this.validateField('code')
				if (!this.errors.email && !this.errors.code && this.form.email && this.form.code) {
					this.step = 2
				}
			},
			async handleSubmit() {
				Object.keys(this.touched).forEach(k => { this.touched[k] = true; this.validateField(k) })
				if (!this.formValid || this.submitting || this.submitted) return

				this.submitting = true
				Logger.info('ForgotPwd', '提交密码重置', { email: this.form.email })

				try {
					const res = await apiRequest({
						url: ENDPOINTS.auth.resetPassword,
						method: 'POST',
						data: {
							email: this.form.email,
							code: this.form.code,
							password: this.form.password
						}
					})
					
					if (!res.success) {
						uni.showToast({ title: res.message || '重置失败', icon: 'none' })
						this.submitting = false
						return
					}
					
					Logger.info('ForgotPwd', '密码重置成功')
					this.submitted = true
					this.submitting = false
					setTimeout(() => { this.step = 3 }, 600)
				} catch (err) {
					Logger.errorWithException('ForgotPwd', '重置失败', err)
					this.submitting = false
					uni.showToast({ title: '重置失败，请重试', icon: 'none' })
				}
			},
			goBack() { uni.redirectTo({ url: '/pages/accounting/login' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.forgot-page {
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
		width: 80rpx;
		height: 80rpx;
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
		width: 44rpx;
		height: 44rpx;
		background-color: var(--text-primary, #1A2744);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.header-title {
		font-size: 36rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
	}
	.header-spacer {
		width: 80rpx;
	}

	.form-scroll {
		flex: 1;
		width: 100%;
		box-sizing: border-box;
	}
	.forgot-content {
		padding: 0 40rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.illustration-area {
		display: flex;
		justify-content: center;
		padding: 48rpx 0;
	}
	.lock-icon-wrapper {
		position: relative;
		width: 160rpx;
		height: 160rpx;
	}
	.lock-icon-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(91, 155, 224, 0.1), rgba(91, 155, 224, 0.3));
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.lock-icon {
		width: 80rpx;
		height: 80rpx;
		background-color: var(--primary, #5B9BE0);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.deco-circle {
		position: absolute;
		border-radius: 50%;
	}
	.deco-1 {
		top: -8rpx;
		right: -8rpx;
		width: 40rpx;
		height: 40rpx;
		background: rgba(91, 155, 224, 0.3);
		opacity: 0.6;
	}
	.deco-2 {
		bottom: -16rpx;
		left: -16rpx;
		width: 32rpx;
		height: 32rpx;
		background: #5B9BE0;
		opacity: 0.4;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 40rpx;
	}
	.step-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}
	.step-dot {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: var(--border, #E8F0FE);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
	}
	.step-item.active .step-dot {
		background: var(--primary, #5B9BE0);
	}
	.step-num {
		font-size: 24rpx;
		font-weight: 600;
		color: var(--text-tertiary, #8A9BB8);
	}
	.step-item.active .step-num {
		color: var(--card-bg, #FFFFFF);
	}
	.step-label {
		font-size: 24rpx;
		color: var(--text-tertiary, #8A9BB8);
	}
	.step-item.active .step-label {
		color: var(--primary, #5B9BE0);
	}
	.step-connector {
		width: 64rpx;
		height: 4rpx;
		background: var(--border, #E8F0FE);
		border-radius: 2rpx;
		margin: 0 16rpx;
		transition: all 0.3s;
	}
	.step-connector.active {
		background: var(--primary, #5B9BE0);
	}

	.forgot-form-card {
		background: var(--card-bg, #FFFFFF);
		border-radius: 32rpx;
		padding: 48rpx;
		box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06);
	}

	.form-desc {
		display: block;
		font-size: 28rpx;
		color: var(--text-secondary, #5A6B8A);
		line-height: 1.6;
		margin-bottom: 40rpx;
	}

	.field-group {
		margin-bottom: 40rpx;
		width: 100%;
		box-sizing: border-box;
	}
	.field-label {
		display: block;
		font-size: 26rpx;
		color: var(--text-secondary, #5A6B8A);
		margin-bottom: 12rpx;
		font-weight: 500;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		border-radius: 24rpx;
		background: var(--input-bg, #F2F7FF);
		border: 2rpx solid var(--border, #E8F0FE);
<<<<<<< Updated upstream
		padding: 0 32rpx;
		transition: border-color 0.2s;
=======
		padding: 16rpx 32rpx;
		height: 88rpx;
>>>>>>> Stashed changes
		box-sizing: border-box;
		transition: border-color 0.2s;
	}
	.input-wrapper:focus-within {
		border-color: var(--primary, #5B9BE0);
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
	.prefix-text {
		font-size: 30rpx;
		font-weight: 500;
		color: var(--text-secondary, #5A6B8A);
		margin-right: 16rpx;
	}
	.divider-line {
		width: 2rpx;
		height: 40rpx;
		background: var(--border, #E8F0FE);
		margin-right: 24rpx;
	}
	.code-row {
		display: flex;
		gap: 24rpx;
		align-items: center;
	}
	.code-input-wrapper {
		flex: 1;
	}
	.code-btn {
		flex-shrink: 0;
		padding: 0 40rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(91, 155, 224, 0.1);
		color: var(--primary, #5B9BE0);
		font-size: 28rpx;
		font-weight: 500;
		border-radius: 24rpx;
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

	.error-msg {
		display: block;
		font-size: 22rpx;
		color: #E53935;
		margin-top: 10rpx;
		padding-left: 8rpx;
	}

	.forgot-btn-wrapper {
		text-align: center;
	}
	.forgot-btn-wrapper .btn-primary {
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
	.forgot-btn-wrapper .btn-primary:active {
		background: var(--primary-dark, #4A7FC0);
	}
	.forgot-btn-wrapper .btn-disabled {
		opacity: 0.4 !important;
		pointer-events: none;
	}
	/* 按钮行（上一步+确认重置）不受居中约束影响 */
	.btn-row .btn-primary {
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
<<<<<<< Updated upstream
	.btn-primary:active {
=======
	.btn-row .btn-primary:active {
>>>>>>> Stashed changes
		background: var(--primary-dark, #4A7FC0);
	}
	.btn-row .btn-disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.btn-row {
		display: flex;
		gap: 24rpx;
		margin-top: 16rpx;
	}
	.btn-secondary {
		flex: 0 0 auto;
		padding: 0 48rpx;
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--border, #E8F0FE);
		color: var(--text-secondary, #5A6B8A);
		font-size: 30rpx;
		font-weight: 500;
		border-radius: 50rpx;
		transition: background 0.2s;
	}
	.btn-row .btn-secondary:active {
		background: var(--border, #E8F0FE);
	}

	.tip-text {
		display: block;
		text-align: center;
		font-size: 24rpx;
		color: var(--text-tertiary, #8A9BB8);
		margin-top: 32rpx;
	}
	.tip-link {
		color: var(--primary, #5B9BE0);
		font-weight: 500;
		text-decoration: underline;
	}

	.success-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 20rpx;
		text-align: center;
	}
	.success-icon-wrapper {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: var(--primary, #5B9BE0);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32rpx;
		box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.3);
	}
	.success-icon {
		width: 64rpx;
		height: 64rpx;
		background-color: var(--card-bg, #FFFFFF);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.success-title {
		font-size: 36rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
		margin-bottom: 16rpx;
	}
	.success-desc {
		font-size: 28rpx;
		color: var(--text-tertiary, #8A9BB8);
		margin-bottom: 48rpx;
	}

	@media (min-width: 768px) {
		.forgot-content {
			max-width: 600px;
			margin: 0 auto;
		}
		.step-connector {
			width: 96rpx;
		}
	}
	@media (max-width: 360px) {
		.page-header { padding: calc(var(--status-bar-height) + 16rpx) 24rpx 16rpx; }
		.forgot-content { padding: 0 24rpx; }
		.forgot-form-card { padding: 32rpx; }
		.input-field { font-size: 28rpx; }
		.code-btn { padding: 0 28rpx; font-size: 26rpx; }
		.step-connector { width: 48rpx; }
	}
</style>
