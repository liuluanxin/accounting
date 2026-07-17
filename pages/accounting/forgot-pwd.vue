<template>
	<view class="cosmic-page forgot-page">
		<!-- 装饰星球 -->
		<view class="cosmic-deco-planet cosmic-deco-planet--big" style="top:-60rpx;right:-60rpx;"></view>
		<view class="cosmic-deco-star" style="top:180rpx;left:60rpx;"></view>

		<!-- 状态栏 -->
		<status-bar />

		<top-bar title="忘记密码" show-back @back="goBack" />

		<scroll-view scroll-y class="screen">
			<view class="forgot-content">
				<!-- 步骤指示器 -->
				<view class="steps">
					<view class="step">
						<view class="dot" :class="{ active: step >= 1, done: step > 1 }">
							<lucide-icon v-if="step > 1" name="check" size="20rpx" color="#FFFFFF" />
							<text v-else>1</text>
						</view>
						<text class="label" :class="{ active: step >= 1 }">验证邮箱</text>
					</view>
					<view class="step-line" :class="{ active: step >= 2 }"></view>
					<view class="step">
						<view class="dot" :class="{ active: step >= 2, done: step > 2 }">
							<lucide-icon v-if="step > 2" name="check" size="20rpx" color="#FFFFFF" />
							<text v-else>2</text>
						</view>
						<text class="label" :class="{ active: step >= 2 }">设置新密码</text>
					</view>
					<view class="step-line" :class="{ active: step >= 3 }"></view>
					<view class="step">
						<view class="dot" :class="{ active: step >= 3 }">
							<text>3</text>
						</view>
						<text class="label" :class="{ active: step >= 3 }">完成</text>
					</view>
				</view>

				<!-- 表单卡片 -->
				<view class="card forgot-form-card">
					<!-- 步骤1：验证邮箱 -->
					<template v-if="step === 1">
						<view class="lock-icon-area">
							<view class="lock-icon-circle">
								<lucide-icon name="lock" size="48rpx" color="#5B9BE0" />
							</view>
						</view>
						<text class="form-desc">请输入注册时使用的邮箱地址，我们将发送验证码帮助您重置密码。</text>

						<view class="form-group">
							<view class="field-label">QQ邮箱</view>
							<view class="field-wrapper">
								<lucide-icon class="field-icon" name="mail" size="28rpx" color="#8A9BB8" />
								<input class="field" type="text" v-model="form.email" placeholder="QQ邮箱" />
							</view>
						</view>

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

						<view class="btn-primary step-btn" @click="goStep2">
							<text>下一步</text>
						</view>

						<view class="tip-text">没有收到验证码？<text class="btn-link" @click="sendCode">重新发送</text></view>
					</template>

					<!-- 步骤2：设置新密码 -->
					<template v-if="step === 2">
						<view class="form-group">
							<view class="field-label">新密码</view>
							<view class="field-wrapper">
								<lucide-icon class="field-icon" name="lock" size="28rpx" color="#8A9BB8" />
								<input class="field" :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="8–20位，含字母和数字" maxlength="20" />
								<view class="toggle-pwd" @click="showPassword = !showPassword">
									<lucide-icon :name="showPassword ? 'eye' : 'eye-off'" size="32rpx" color="#8A9BB8" />
								</view>
							</view>
						</view>

						<view class="form-group">
							<view class="field-label">确认密码</view>
							<view class="field-wrapper">
								<lucide-icon class="field-icon" name="lock" size="28rpx" color="#8A9BB8" />
								<input class="field" :type="showConfirm ? 'text' : 'password'" v-model="form.confirmPassword" placeholder="请再次输入密码" maxlength="20" />
								<view class="toggle-pwd" @click="showConfirm = !showConfirm">
									<lucide-icon :name="showConfirm ? 'eye' : 'eye-off'" size="32rpx" color="#8A9BB8" />
								</view>
							</view>
						</view>

						<view class="btn-row">
							<view class="btn-secondary btn-back" @click="step = 1">上一步</view>
							<view class="btn-primary btn-reset" @click="handleSubmit">
								<text>{{ submitting ? '提交中...' : '确认重置' }}</text>
							</view>
						</view>
					</template>

					<!-- 步骤3：完成 -->
					<template v-if="step === 3">
						<view class="success-state">
							<view class="success-icon-wrapper">
								<lucide-icon name="check" size="56rpx" color="#FFFFFF" />
							</view>
							<text class="success-title">密码重置成功</text>
							<text class="success-desc muted">请使用新密码登录你的账户</text>
							<view class="btn-primary step-btn" @click="goBack">
								<text>返回登录</text>
							</view>
						</view>
					</template>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { isQqEmail, validatePassword } from '@/common/auth-utils.js'

	export default {
		data() {
			return {
				step: 1,
				form: {
					email: '',
					code: '',
					password: '',
					confirmPassword: ''
				},
				showPassword: false,
				showConfirm: false,
				countdown: 0,
				countdownTimer: null,
				submitting: false
			}
		},
		beforeDestroy() {
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
				this.countdownTimer = null
			}
		},
		methods: {
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
			goStep2() {
				const email = this.form.email.trim()
				if (!email || !this.form.code.trim()) {
					uni.showToast({ title: '请填写邮箱和验证码', icon: 'none' })
					return
				}
				if (!isQqEmail(email)) {
					uni.showToast({ title: '请输入有效的QQ邮箱', icon: 'none' })
					return
				}
				this.step = 2
			},
			handleSubmit() {
				if (!this.form.password.trim() || !this.form.confirmPassword.trim()) {
					uni.showToast({ title: '请填写密码', icon: 'none' })
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
				this.submitting = true
				setTimeout(() => {
					this.submitting = false
					this.step = 3
				}, 600)
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

	/* ===== 找回密码内容 ===== */
	.forgot-content {
		padding: 0 40rpx 80rpx;
		width: 100%;
		max-width: 600rpx;
		margin: 0 auto;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	/* ===== 步骤指示器 ===== */
	.steps {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32rpx 0 36rpx;
	}
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}
	.step .dot {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: #E3ECF7;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		font-size: 24rpx;
		font-weight: 600;
		color: #8A9BB8;
	}
	.step .dot.active {
		background: linear-gradient(135deg, #8FC9FF, #5B9BE0, #8B7FF0);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.3);
	}
	.step .dot.done {
		background: #34C759;
		color: #fff;
	}
	.step .label {
		font-size: 22rpx;
		color: #8A9BB8;
		white-space: nowrap;
	}
	.step .label.active {
		color: #5B9BE0;
		font-weight: 500;
	}
	.step-line {
		width: 64rpx;
		height: 4rpx;
		background: #E3ECF7;
		border-radius: 2rpx;
		margin: 0 16rpx 40rpx;
		transition: all 0.3s;
	}
	.step-line.active {
		background: linear-gradient(90deg, #5B9BE0, #8B7FF0);
	}

	/* ===== 表单卡片 ===== */
	.forgot-form-card {
		padding: 40rpx 32rpx;
	}

	/* ===== 锁图标 ===== */
	.lock-icon-area {
		display: flex;
		justify-content: center;
		margin-bottom: 24rpx;
	}
	.lock-icon-circle {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(91, 155, 224, 0.1), rgba(91, 155, 224, 0.3));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.form-desc {
		display: block;
		font-size: 26rpx;
		color: #5A6B8A;
		line-height: 1.6;
		margin-bottom: 36rpx;
		text-align: center;
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

	/* ===== 按钮区域 ===== */
	.step-btn {
		width: 86%;
		max-width: 520rpx;
		height: 96rpx;
		min-height: 44px;
		margin: 0 auto;
		font-size: 34rpx;
		font-weight: 600;
		border-radius: 50rpx;
	}

	.btn-row {
		display: flex;
		gap: 24rpx;
		margin-top: 16rpx;
	}
	.btn-back {
		flex: 0 0 auto;
		padding: 0 40rpx;
		height: 96rpx;
		min-height: 44px;
		font-size: 30rpx;
		font-weight: 500;
		background: #E3ECF7;
		color: #5A6B8A;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
	}
	.btn-reset {
		flex: 1;
		height: 96rpx;
		min-height: 44px;
		font-size: 30rpx;
		font-weight: 600;
		border-radius: 50rpx;
	}

	/* ===== 提示文字 ===== */
	.tip-text {
		display: block;
		text-align: center;
		font-size: 24rpx;
		color: #8A9BB8;
		margin-top: 32rpx;
	}
	.tip-text .btn-link {
		font-weight: 500;
	}

	/* ===== 成功状态 ===== */
	.success-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 20rpx;
		text-align: center;
	}
	.success-icon-wrapper {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #8FC9FF, #5B9BE0, #8B7FF0);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32rpx;
		box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.3);
	}
	.success-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #1A2744;
		margin-bottom: 16rpx;
	}
	.success-desc {
		font-size: 28rpx;
		margin-bottom: 48rpx;
		display: block;
	}
	.success-state .step-btn {
		margin-top: 0;
	}

	@media (max-width: 374px) {
		.forgot-content { padding: 0 24rpx 60rpx; }
		.forgot-form-card { padding: 28rpx 24rpx; }
		.code-btn { padding: 0 24rpx; font-size: 24rpx; }
		.step-btn { height: 88rpx; font-size: 30rpx; }
		.step-line { width: 48rpx; }
	}
	@media (min-width: 414px) {
		.forgot-content { padding: 0 60rpx 80rpx; }
		.forgot-form-card { padding: 44rpx 48rpx; }
	}
	@media (min-width: 768px) {
		.forgot-content { padding: 0 80rpx 80rpx; }
		.step-line { width: 96rpx; }
	}
</style>