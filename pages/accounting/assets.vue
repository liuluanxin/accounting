<template>
	<view class="accounts-page">
		<view class="top-nav">
			<view class="nav-back" @click="backToHome" aria-label="返回">
				<view class="back-svg" :style="getIconStyle('arrow-left')"></view>
			</view>
			<text class="nav-title">我的账户</text>
			<view class="nav-add" @click="showAddAccount" aria-label="添加账户">
				<view class="plus-svg" :style="getIconStyle('plus')"></view>
			</view>
		</view>

		<scroll-view scroll-y class="accounts-scroll">
			<view v-if="assetsLoading" class="state-container">
				<view class="loading-spinner"></view>
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="error" class="state-container">
				<text class="state-icon">⚠️</text>
				<text class="state-text">{{ error }}</text>
				<view class="btn-secondary" @click="reload" style="margin-top: 32rpx;">重试</view>
			</view>

			<template v-else>
				<view class="total-assets-card">
					<view class="gradient-strip"></view>
					<view class="card-body">
						<text class="assets-label">总资产</text>
						<text class="assets-amount">¥{{ formatMoney(totalAssets) }}</text>
						<view class="stats-row">
							<view class="stat-item">
								<text class="stat-label">信用卡</text>
								<text class="stat-value neutral">¥{{ formatMoney(creditCardTotal) }}</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">储蓄卡</text>
								<text class="stat-value green">¥{{ formatMoney(debitCardTotal) }}</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">电子钱包</text>
								<text class="stat-value coral">¥{{ formatMoney(walletTotal) }}</text>
							</view>
						</view>
					</view>
				</view>

				<text class="section-title">账户列表</text>

				<view v-if="data.accounts.length === 0" class="state-container" style="padding: 80rpx 40rpx;">
					<text class="state-icon">🏦</text>
					<text class="state-text">暂无账户</text>
					<text class="state-hint">添加账户以追踪资产</text>
				</view>

				<view v-for="account in data.accounts" :key="account.id" 
					  class="account-card" :class="getAccentClass(account)"
					  @click="showAccountDetail(account)">
					<view class="account-icon" :class="getIconBgClass(account)">
						<text>{{ account.icon || '🏦' }}</text>
					</view>
					<view class="account-info">
						<text class="account-name">{{ account.name }}</text>
						<text class="account-balance">¥{{ formatMoney(account.balance) }}</text>
						<text class="account-summary">{{ getAccountSummary(account) }}</text>
					</view>
					<view class="account-arrow">
						<view class="arrow-svg" :style="getIconStyle('arrow-right')"></view>
					</view>
				</view>

				<view class="add-account-card" @click="showAddAccount">
					<view class="plus-icon">
						<view class="card-plus-svg" :style="getIconStyle('plus')"></view>
					</view>
					<text class="add-label">添加账户</text>
				</view>

				<view style="height: 280rpx;"></view>
			</template>
		</scroll-view>

		<TabBar currentTab="home" :showFab="true" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney } from '@/common/accounting-utils.js'
	import TabBar from '@/components/TabBar.vue'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

	export default {
		components: { TabBar },
		mixins: [themeMixin],
		computed: {
			...mapState('accounting', ['data', 'assetsLoading', 'error', 'initialized']),
			totalAssets() {
				return this.data.accounts.reduce((s, a) => s + (a.balance || 0), 0)
			},
			creditCardTotal() {
				return this.data.accounts.filter(a => a.type === 'credit').reduce((s, a) => s + (a.balance || 0), 0)
			},
			debitCardTotal() {
				return this.data.accounts.filter(a => a.type === 'debit').reduce((s, a) => s + (a.balance || 0), 0)
			},
			walletTotal() {
				return this.data.accounts.filter(a => a.type === 'wallet').reduce((s, a) => s + (a.balance || 0), 0)
			}
		},
		onLoad() {
			if (!this.initialized) this.$store.dispatch('accounting/initialize')
			else this.$store.dispatch('accounting/fetchAccounts')
		},
		methods: {
			formatMoney,
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			getAccentClass(account) {
				const typeMap = { credit: 'accent-blue', debit: 'accent-coral', wallet: 'accent-green' }
				return typeMap[account.type] || 'accent-coral'
			},
			getIconBgClass(account) {
				const typeMap = { credit: 'blue-bg', debit: 'coral-bg', wallet: 'green-bg' }
				return typeMap[account.type] || 'coral-bg'
			},
			getAccountSummary(account) {
				const month = new Date().getMonth() + 1
				const year = new Date().getFullYear()
				const p = year + '-' + String(month).padStart(2, '0')
				const txs = this.data.transactions.filter(t => t.accountId === account.id && t.date && t.date.indexOf(p) === 0)
				let income = 0, expense = 0
				txs.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount })
				const parts = []
				if (income > 0) parts.push('本月收入 ¥' + formatMoney(income))
				if (expense > 0) parts.push('支出 ¥' + formatMoney(expense))
				return parts.join(' | ') || '本月暂无交易'
			},
			showAccountDetail(account) {
				uni.navigateTo({ url: '/pages/accounting/account-detail?id=' + account.id })
			},
			showAddAccount() {
				uni.navigateTo({ url: '/pages/accounting/add-account' })
			},
			switchTab(page) { uni.redirectTo({ url: '/pages/accounting/' + page }) },
			reload() { this.$store.dispatch('accounting/initialize') },
			backToHome() { uni.redirectTo({ url: '/pages/accounting/home' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.accounts-page {
		min-height: 100vh;
		background: transparent;
		font-family: 'Inter', 'PingFang SC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
		display: flex;
		flex-direction: column;
	}

	.top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 40rpx;
		position: relative;
		background: var(--bg, #EFF5FF);
	}
	.nav-back, .nav-add {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: var(--card-bg, #FFFFFF);
		box-shadow: 0 2rpx 4rpx rgba(91, 155, 224, 0.04);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary, #5A6B8A);
	}
	.nav-back:active { background: var(--border, #F5EDE6); }
	.nav-add { color: var(--primary, #5B9BE0); }
	.nav-add:active { background: rgba(91, 155, 224, 0.1); }
	.nav-icon { font-size: 36rpx; }
	.nav-title {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
	}

	.accounts-scroll {
		flex: 1;
		height: 0;
		box-sizing: border-box;
		padding: 0 40rpx 200rpx;
		overflow-y: auto;
	}

	.state-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
	}
	.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
	.state-text { font-size: 28rpx; color: var(--text-secondary, #5A6B8A); text-align: center; }
	.state-hint { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); margin-top: 16rpx; }
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(91, 155, 224, 0.2);
		border-top-color: var(--primary, #5B9BE0);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 24rpx;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	.total-assets-card {
		background: var(--card-bg, #FFFFFF);
		border-radius: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06);
		overflow: hidden;
		margin-top: 32rpx;
	}
	.gradient-strip {
		height: 12rpx;
		background: linear-gradient(135deg, var(--primary, #5B9BE0), var(--primary-shadow, rgba(91, 155, 224, 0.3)));
	}
	.card-body {
		padding: 40rpx 48rpx;
	}
	.assets-label {
		font-size: 26rpx;
		color: var(--text-tertiary, #8A9BB8);
		display: block;
		margin-bottom: 16rpx;
	}
	.assets-amount {
		font-size: 60rpx;
		font-weight: 700;
		color: var(--primary, #5B9BE0);
		display: block;
		line-height: 1.25;
		margin-bottom: 40rpx;
	}
	.stats-row {
		display: flex;
		gap: 32rpx;
	}
	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		padding: 24rpx;
		background: var(--border, #F5EDE6);
		border-radius: 24rpx;
	}
	.stat-label {
		font-size: 22rpx;
		color: var(--text-tertiary, #8A9BB8);
	}
	.stat-value {
		font-size: 26rpx;
		font-weight: 600;
	}
	.stat-value.neutral { color: var(--text-secondary, #5A6B8A); }
	.stat-value.green { color: var(--expense, #4CAF50); }
	.stat-value.coral { color: var(--primary, #5B9BE0); }

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
		margin-top: 64rpx;
		margin-bottom: 32rpx;
		display: block;
	}

	.account-card {
		background: var(--card-bg, #FFFFFF);
		border-radius: 32rpx;
		box-shadow: 0 2rpx 4rpx rgba(91, 155, 224, 0.04);
		padding: 32rpx 40rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 32rpx;
		position: relative;
		overflow: hidden;
	}
	.account-card:active {
		box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.06);
		transform: translateY(-2rpx);
	}
	.account-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 8rpx;
		border-radius: 0 8rpx 8rpx 0;
	}
	.account-card.accent-coral::before { background: var(--primary, #5B9BE0); }
	.account-card.accent-blue::before { background: var(--primary, #42A5F5); }
	.account-card.accent-green::before { background: var(--expense, #4CAF50); }

	.account-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		flex-shrink: 0;
	}
	.account-icon.coral-bg { background: rgba(91, 155, 224, 0.1); color: var(--primary, #5B9BE0); }
	.account-icon.blue-bg { background: rgba(66, 165, 245, 0.1); color: var(--primary, #42A5F5); }
	.account-icon.green-bg { background: rgba(76, 175, 80, 0.1); color: var(--expense, #4CAF50); }

	.account-info {
		flex: 1;
		min-width: 0;
	}
	.account-name {
		font-size: 30rpx;
		font-weight: 500;
		color: var(--text-primary, #1A2744);
		display: block;
		margin-bottom: 4rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.account-balance {
		font-size: 40rpx;
		font-weight: 700;
		color: var(--text-primary, #1A2744);
		display: block;
		line-height: 1.25;
		margin-bottom: 4rpx;
	}
	.account-summary {
		font-size: 22rpx;
		color: var(--text-tertiary, #8A9BB8);
		display: block;
	}

	.account-arrow {
		color: var(--text-tertiary, #C8A896);
		font-size: 32rpx;
		flex-shrink: 0;
	}

	.add-account-card {
		background: transparent;
		border: 4rpx dashed var(--border, #E8D5C8);
		border-radius: 32rpx;
		padding: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		margin-bottom: 24rpx;
	}
	.add-account-card:active {
		border-color: var(--primary, #5B9BE0);
		background: rgba(91, 155, 224, 0.1);
	}
	.plus-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		border: 4rpx solid var(--border, #E8D5C8);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-tertiary, #8A9BB8);
		font-size: 28rpx;
	}
	.add-account-card:active .plus-icon {
		border-color: var(--primary, #5B9BE0);
		color: var(--primary, #5B9BE0);
	}
	.add-label {
		font-size: 30rpx;
		font-weight: 500;
		color: var(--text-tertiary, #8A9BB8);
	}
	.add-account-card:active .add-label {
		color: var(--primary, #5B9BE0);
	}

	.back-svg { width: 20px; height: 20px; background-color: var(--text-primary, #1A2744); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.nav-add .plus-svg { width: 20px; height: 20px; background-color: var(--text-primary, #1A2744); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.arrow-svg { width: 16px; height: 16px; background-color: var(--text-tertiary, #8A9BB8); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.card-plus-svg { width: 24px; height: 24px; background-color: var(--primary, #5B9BE0); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }

	</style>