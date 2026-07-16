<template>
	<view class="page">
		<view class="nav-back" @click="goBack"><text>‹</text></view>
		<view class="page-title">账户详情</view>

		<scroll-view scroll-y class="scroll">
			<!-- 账户卡片预览 -->
			<view class="account-card" :style="{ background: cardGradient }">
				<view class="card-row">
					<text class="card-icon">{{ account.icon || '💳' }}</text>
					<view class="card-info">
						<text class="card-name">{{ account.name || '未命名账户' }}</text>
						<text class="card-type">{{ typeLabel }}</text>
					</view>
				</view>
				<view class="card-balance">
					<text class="balance-label">当前余额</text>
					<text class="balance-value">¥ {{ formatBalance }}</text>
				</view>
				<view v-if="account.cardNumber" class="card-number">
					<text>{{ displayCardNumber }}</text>
				</view>
			</view>

			<!-- 编辑表单 -->
			<view class="form-section">
				<view class="form-group">
					<text class="form-label">账户名称</text>
					<input class="form-input" type="text" v-model="form.name" placeholder="请输入账户名称" placeholder-class="ph" />
				</view>

				<view class="form-group">
					<text class="form-label">账户类型</text>
					<view class="type-grid">
						<view v-for="t in accountTypes" :key="t.value" class="type-item" :class="{ active: form.type === t.value }" @click="form.type = t.value">
							<text class="type-icon">{{ t.icon }}</text>
							<text class="type-name">{{ t.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">余额</text>
					<input class="form-input" type="digit" v-model="form.balance" placeholder="0.00" placeholder-class="ph" />
				</view>

				<view class="form-group">
					<text class="form-label">图标</text>
					<view class="icon-grid">
						<view v-for="icon in iconList" :key="icon" class="icon-item" :class="{ active: form.icon === icon }" @click="form.icon = icon">
							<text>{{ icon }}</text>
						</view>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">主题色</text>
					<view class="color-grid">
						<view v-for="c in colorList" :key="c" class="color-item" :class="{ active: form.color === c }" :style="{ background: c }" @click="form.color = c"></view>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">卡号（可选）</text>
					<input class="form-input" type="text" v-model="form.cardNumber" placeholder="信用卡或银行卡号" placeholder-class="ph" maxlength="25" />
				</view>

				<view class="form-group">
					<text class="form-label">备注</text>
					<textarea class="form-textarea" v-model="form.desc" placeholder="添加备注" placeholder-class="ph" maxlength="100" />
				</view>
			</view>

			<!-- 该账户的交易 -->
			<view v-if="accountTransactions.length > 0" class="tx-section">
				<view class="section-title">
					<text>近期交易 ({{ accountTransactions.length }})</text>
				</view>
				<view v-for="tx in accountTransactions.slice(0, 10)" :key="tx.id" class="tx-item">
					<view class="tx-left">
						<text class="tx-category">{{ tx.category }}</text>
						<text class="tx-date">{{ tx.date }} {{ tx.time }}</text>
					</view>
					<text class="tx-amount" :class="tx.type">{{ tx.type === 'income' ? '+' : '-' }}¥{{ tx.amount.toFixed(2) }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 底部操作按钮 -->
		<view class="footer-bar">
			<view class="btn-delete" @click="confirmDelete">删除账户</view>
			<view class="btn-save" :class="{ disabled: !canSave || saving }" @click="save">
				{{ saving ? '保存中...' : '保存修改' }}
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import Logger from '@/common/logger.js'
import { formatMoney } from '@/common/accounting-utils.js'
import themeMixin from '@/common/theme-mixin.js'
import ICONS from '@/common/icon-base64.js'

const accountTypes = [
	{ value: 'cash', label: '现金', icon: '💵' },
	{ value: 'bank', label: '储蓄卡', icon: '💳' },
	{ value: 'credit', label: '信用卡', icon: '💎' },
	{ value: 'alipay', label: '支付宝', icon: '🅰️' },
	{ value: 'wechat', label: '微信', icon: '💚' },
	{ value: 'other', label: '其他', icon: '📦' }
]
const iconList = ['💳', '💵', '💎', '🏦', '🅰️', '💚', '🪙', '📱', '💼', '🎁', '🏧', '💰']
const colorList = ['#E8734A', '#7BC4A8', '#E89B9B', '#FFB97A', '#9ED3FF', '#C5B8E8', '#FF9A8B', '#5DADE2', '#48C9B0', '#F4D03F']

export default {
	mixins: [themeMixin],
	data() {
		return {
			accountTypes,
			iconList,
			colorList,
			accountId: '',
			form: {
				name: '',
				type: 'bank',
				balance: 0,
				icon: '💳',
				color: '#E8734A',
				cardNumber: '',
				desc: ''
			},
			original: null,
			saving: false
		}
	},
	computed: {
		...mapState('accounting', ['data']),
		account() {
			return this.data.accounts.find(a => a.id === this.accountId) || {}
		},
		typeLabel() {
			const t = accountTypes.find(t => t.value === this.form.type)
			return t ? t.label : '其他'
		},
		cardGradient() {
			return `linear-gradient(135deg, ${this.form.color} 0%, ${this.shadeColor(this.form.color, 25)} 100%)`
		},
		formatBalance() {
			return (Number(this.form.balance) || 0).toFixed(2)
		},
		displayCardNumber() {
			if (!this.form.cardNumber) return ''
			if (this.form.cardNumberHidden === false) return this.form.cardNumber
			const n = this.form.cardNumber.replace(/\s/g, '')
			return n.length >= 8 ? n.slice(0, 4) + ' •••• •••• ' + n.slice(-4) : this.form.cardNumber
		},
		accountTransactions() {
			return this.data.transactions.filter(t => t.accountId === this.accountId)
		},
		canSave() {
			return this.form.name.trim().length > 0
		}
	},
	onLoad(options) {
		this.accountId = options.id || ''
		if (this.account) {
			this.form = {
				name: this.account.name || '',
				type: this.account.type || 'bank',
				balance: this.account.balance || 0,
				icon: this.account.icon || '💳',
				color: this.account.color || '#E8734A',
				cardNumber: this.account.cardNumber || '',
				desc: this.account.desc || ''
			}
			this.original = { ...this.form }
		}
	},
	methods: {
getIconStyle(name) {
			return { 'mask-image': 'url(' + ICONS[name] + ')', '-webkit-mask-image': 'url(' + ICONS[name] + ')' }
		},
		formatMoney,
		goBack() { uni.navigateBack() },
		shadeColor(hex, percent) {
			const f = parseInt(hex.slice(1), 16),
				t = percent < 0 ? 0 : 255,
				p = percent < 0 ? percent * -1 / 100 : percent / 100,
				R = f >> 16,
				G = (f >> 8) & 0x00ff,
				B = f & 0x0000ff
			return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)
		},
		async save() {
			if (!this.canSave || this.saving) return
			this.saving = true
			try {
				const res = await this.$store.dispatch('accounting/updateAccount', {
					id: this.accountId,
					name: this.form.name.trim(),
					type: this.form.type,
					balance: Number(this.form.balance) || 0,
					icon: this.form.icon,
					color: this.form.color,
					cardNumber: this.form.cardNumber.trim(),
					desc: this.form.desc.trim()
				})
				uni.showToast({ title: res.success ? '已保存' : (res.message || '保存失败'), icon: res.success ? 'success' : 'none' })
				if (res.success) setTimeout(() => uni.navigateBack(), 600)
			} catch (err) {
				Logger.errorWithException('AccountDetail', '保存失败', err)
				uni.showToast({ title: '保存失败', icon: 'none' })
			} finally {
				this.saving = false
			}
		},
		confirmDelete() {
			uni.showModal({
				title: '删除账户',
				content: `确定删除「${this.form.name}」？\n该账户下的 ${this.accountTransactions.length} 条交易也将被删除。`,
				confirmText: '删除',
				confirmColor: '#E89B9B',
				success: async (res) => {
					if (!res.confirm) return
					const r = await this.$store.dispatch('accounting/deleteAccount', this.accountId)
					uni.showToast({ title: r.success ? '已删除' : (r.message || '删除失败'), icon: r.success ? 'success' : 'none' })
					if (r.success) setTimeout(() => uni.navigateBack(), 600)
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: transparent; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.nav-back { position: fixed; top: calc(var(--status-bar-height) + 16rpx); left: 24rpx; width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 60rpx; color: var(--text-primary, #1A2744); z-index: 10; }
.page-title { padding: calc(var(--status-bar-height) + 24rpx) 32rpx 16rpx; font-size: 36rpx; font-weight: 700; color: var(--text-primary, #1A2744); flex-shrink: 0; }
.scroll { flex: 1; padding: 0 32rpx 200rpx; }

.account-card { border-radius: 24rpx; padding: 40rpx 32rpx; color: var(--card-bg, #FFFFFF); box-shadow: 0 12rpx 32rpx rgba(91, 155, 224, 0.25); margin-bottom: 32rpx; transition: background 0.3s; }
.card-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 32rpx; }
.card-icon { font-size: 56rpx; }
.card-info { display: flex; flex-direction: column; gap: 6rpx; }
.card-name { font-size: 32rpx; font-weight: 700; }
.card-type { font-size: 22rpx; opacity: 0.85; }
.card-balance { display: flex; flex-direction: column; gap: 6rpx; }
.balance-label { font-size: 22rpx; opacity: 0.85; }
.balance-value { font-size: 56rpx; font-weight: 700; letter-spacing: 1rpx; }
.card-number { margin-top: 24rpx; font-size: 26rpx; letter-spacing: 4rpx; opacity: 0.95; font-family: monospace; }

.form-section { background: var(--card-bg, #FFFFFF); border-radius: 24rpx; padding: 8rpx 32rpx; box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.04); margin-bottom: 32rpx; }
.form-group { padding: 24rpx 0; border-bottom: 1px solid var(--border, #E8F0FE); }
.form-group:last-child { border-bottom: none; }
.form-label { display: block; font-size: 24rpx; color: var(--text-secondary, #5A6B8A); margin-bottom: 12rpx; }
.form-input { width: 100%; padding: 12rpx 0; font-size: 30rpx; color: var(--text-primary, #1A2744); box-sizing: border-box; background: transparent; }
.form-textarea { width: 100%; padding: 12rpx 0; font-size: 28rpx; color: var(--text-primary, #1A2744); box-sizing: border-box; min-height: 80rpx; background: transparent; }
.ph { color: var(--text-tertiary, #8A9BB8); }

.type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; }
.type-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; padding: 20rpx 0; background: var(--input-bg, #F2F7FF); border-radius: 16rpx; border: 2rpx solid transparent; transition: all 0.2s; }
.type-item.active { background: rgba(91, 155, 224, 0.1); border-color: var(--primary, #5B9BE0); }
.type-icon { font-size: 40rpx; }
.type-name { font-size: 22rpx; color: var(--text-primary, #1A2744); }

.icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12rpx; }
.icon-item { display: flex; align-items: center; justify-content: center; height: 80rpx; font-size: 40rpx; background: var(--input-bg, #F2F7FF); border-radius: 16rpx; border: 2rpx solid transparent; transition: all 0.2s; }
.icon-item.active { background: rgba(91, 155, 224, 0.1); border-color: var(--primary, #5B9BE0); }

.color-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.color-item { width: 72rpx; height: 72rpx; border-radius: 50%; border: 4rpx solid transparent; transition: all 0.2s; position: relative; }
.color-item.active { border-color: var(--text-primary, #1A2744); transform: scale(1.05); }
.color-item.active::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--card-bg, #FFFFFF); font-size: 28rpx; font-weight: 700; }

.tx-section { background: var(--card-bg, #FFFFFF); border-radius: 24rpx; padding: 8rpx 32rpx; box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.04); }
.section-title { padding: 20rpx 0; font-size: 26rpx; color: var(--text-secondary, #5A6B8A); font-weight: 600; border-bottom: 1px solid var(--border, #E8F0FE); }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 0; border-bottom: 1px solid var(--border, #E8F0FE); }
.tx-item:last-child { border-bottom: none; }
.tx-left { display: flex; flex-direction: column; gap: 4rpx; }
.tx-category { font-size: 28rpx; color: var(--text-primary, #1A2744); font-weight: 500; }
.tx-date { font-size: 22rpx; color: var(--text-tertiary, #8A9BB8); }
.tx-amount { font-size: 30rpx; font-weight: 700; }
.tx-amount.income { color: var(--income, #34C759); }
.tx-amount.expense { color: var(--expense, #FF6B6B); }

.footer-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom)); background: var(--card-bg, #FFFFFF); box-shadow: 0 -4rpx 24rpx rgba(91, 155, 224, 0.08); display: flex; gap: 16rpx; z-index: 10; }
.btn-delete { flex: 0 0 200rpx; height: 88rpx; line-height: 88rpx; text-align: center; font-size: 28rpx; color: #E89B9B; background: #FFF5F5; border-radius: 24rpx; font-weight: 500; }
.btn-save { flex: 1; height: 88rpx; line-height: 88rpx; text-align: center; font-size: 30rpx; color: var(--card-bg, #FFFFFF); background: linear-gradient(135deg, var(--primary, #5B9BE0) 0%, #4A7FC0 100%); border-radius: 24rpx; font-weight: 600; transition: opacity 0.2s; }
.btn-save.disabled { opacity: 0.5; pointer-events: none; }
</style>
