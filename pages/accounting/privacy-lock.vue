<template>
	<view class="page">
		<view v-if="!isSetupMode && !isChangeMode" class="verify-mode">
			<view class="lock-icon">🔒</view>
			<view class="title">输入隐私密码</view>
			<view class="subtitle">保护您的账单隐私</view>

			<view class="pin-display">
				<view v-for="(dot, i) in 4" :key="i" class="dot" :class="{ filled: i < pin.length, error: error }"></view>
			</view>

			<view class="keypad">
				<view v-for="n in 9" :key="'n'+n" class="key" @click="pressKey(String(n))">
					<text>{{ n }}</text>
				</view>
				<view class="key empty"></view>
				<view class="key" @click="pressKey('0')"><text>0</text></view>
				<view class="key del" @click="pressDel"><text>⌫</text></view>
			</view>
		</view>

		<view v-else class="setup-mode">
			<view class="lock-icon">🛡️</view>
			<view class="title">{{ isChangeMode ? '重置隐私密码' : (step === 1 ? '设置隐私密码' : '再次输入确认') }}</view>
			<view class="subtitle">{{ step === 1 ? '请输入 4 位数字' : '请再输一次' }}</view>

			<view class="pin-display">
				<view v-for="(dot, i) in 4" :key="i" class="dot" :class="{ filled: i < (step === 1 ? pin1.length : pin2.length), error: error }"></view>
			</view>

			<view class="keypad">
				<view v-for="n in 9" :key="'n'+n" class="key" @click="pressKey(String(n))">
					<text>{{ n }}</text>
				</view>
				<view class="key empty"></view>
				<view class="key" @click="pressKey('0')"><text>0</text></view>
				<view class="key del" @click="pressDel"><text>⌫</text></view>
			</view>
		</view>
	</view>
</template>

<script>
import { hasPin, setPin, clearPin, verifyPin, markVerified } from '@/common/privacy-lock.js'
import themeMixin from '@/common/theme-mixin.js'
import ICONS from '@/common/icon-base64.js'

export default {
	mixins: [themeMixin],
	data() {
		return {
			isSetupMode: false,
			isChangeMode: false,
			pin: '',
			pin1: '',
			pin2: '',
			step: 1,
			error: false,
			errorTimer: null
		}
	},
	onLoad(options) {
		const mode = options.mode || 'verify'
		if (mode === 'setup') this.isSetupMode = true
		else if (mode === 'change') this.isChangeMode = true
	},
	methods: {
		getIconStyle(name) {
			return { 'mask-image': 'url(' + ICONS[name] + ')', '-webkit-mask-image': 'url(' + ICONS[name] + ')' }
		},
		pressKey(n) {
			if (this.error) return
			if (this.isSetupMode || this.isChangeMode) {
				const target = this.step === 1 ? 'pin1' : 'pin2'
				if (this[target].length >= 4) return
				this[target] += n
				if (this[target].length === 4) {
					setTimeout(() => this.handleComplete(), 200)
				}
			} else {
				if (this.pin.length >= 4) return
				this.pin += n
				if (this.pin.length === 4) {
					setTimeout(() => this.handleComplete(), 200)
				}
			}
		},
		pressDel() {
			if (this.error) return
			if (this.isSetupMode || this.isChangeMode) {
				const target = this.step === 1 ? 'pin1' : 'pin2'
				this[target] = this[target].slice(0, -1)
			} else {
				this.pin = this.pin.slice(0, -1)
			}
		},
		handleComplete() {
			if (this.isSetupMode || this.isChangeMode) {
				if (this.step === 1) {
					this.step = 2
				} else {
					if (this.pin1 !== this.pin2) {
						this.showError()
						setTimeout(() => { this.pin1 = ''; this.pin2 = ''; this.step = 1 }, 800)
						return
					}
					setPin(this.pin1)
					uni.showToast({ title: '设置成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 800)
				}
			} else {
				if (verifyPin(this.pin)) {
					markVerified()
					uni.showToast({ title: '验证成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 500)
				} else {
					this.showError()
				}
			}
		},
		showError() {
			this.error = true
			if (this.errorTimer) clearTimeout(this.errorTimer)
			this.errorTimer = setTimeout(() => {
				this.error = false
				if (this.isSetupMode || this.isChangeMode) {
					this.pin1 = ''
					this.pin2 = ''
					this.step = 1
				} else {
					this.pin = ''
				}
			}, 800)
		}
	}
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: var(--bg, #FFF9F5); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80rpx 32rpx; box-sizing: border-box; }
.verify-mode, .setup-mode { width: 100%; display: flex; flex-direction: column; align-items: center; }
.lock-icon { font-size: 100rpx; margin-bottom: 32rpx; }
.title { font-size: 40rpx; font-weight: 700; color: var(--text-primary, #3D2316); margin-bottom: 8rpx; }
.subtitle { font-size: 26rpx; color: var(--text-secondary, #7A5C4A); margin-bottom: 64rpx; }

.pin-display { display: flex; gap: 24rpx; margin-bottom: 64rpx; }
.dot { width: 56rpx; height: 56rpx; border-radius: 50%; background: var(--input-bg, #FFF5EE); border: 2rpx solid var(--primary, #E8734A); transition: all 0.15s; }
.dot.filled { background: var(--primary, #E8734A); transform: scale(1.05); }
.dot.error { background: #E89B9B; border-color: #E89B9B; transform: scale(0.92); }

.keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24rpx; width: 100%; max-width: 540rpx; }
.key { width: 100%; aspect-ratio: 1; max-width: 160rpx; margin: 0 auto; background: var(--card-bg, #FFFFFF); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48rpx; font-weight: 500; color: var(--text-primary, #3D2316); box-shadow: 0 4rpx 12rpx rgba(61, 35, 22, 0.08); transition: all 0.15s; -webkit-tap-highlight-color: transparent; user-select: none; }
.key:active { transform: scale(0.94); background: var(--input-bg, #FFF5EE); }
.key.empty { background: transparent; box-shadow: none; pointer-events: none; }
.key.del { background: var(--border, #F0E4DA); }
</style>
