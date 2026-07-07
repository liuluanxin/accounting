<template>
	<view class="accounts-page">
		<view class="top-nav">
			<view class="nav-back" @click="backToHome" aria-label="返回">
				<view class="back-svg"></view>
			</view>
			<text class="nav-title">我的账户</text>
			<view class="nav-add" @click="showAddAccount" aria-label="添加账户">
				<view class="plus-svg"></view>
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
						<view class="arrow-svg"></view>
					</view>
				</view>

				<view class="add-account-card" @click="showAddAccount">
					<view class="plus-icon">
						<view class="card-plus-svg"></view>
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

	export default {
		components: { TabBar },
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
		background: #FFF9F5;
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
		background: #FFF9F5;
	}
	.nav-back, .nav-add {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: #FFFFFF;
		box-shadow: 0 2rpx 4rpx rgba(61, 35, 22, 0.04);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #7A5C4A;
	}
	.nav-back:active { background: #F5EDE6; }
	.nav-add { color: #E8734A; }
	.nav-add:active { background: #FDE6D4; }
	.nav-icon { font-size: 36rpx; }
	.nav-title {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-size: 34rpx;
		font-weight: 600;
		color: #3D2316;
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
	.state-text { font-size: 28rpx; color: #7A5C4A; text-align: center; }
	.state-hint { font-size: 24rpx; color: #A98B78; margin-top: 16rpx; }
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(232, 115, 74, 0.2);
		border-top-color: #E8734A;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 24rpx;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	.total-assets-card {
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06);
		overflow: hidden;
		margin-top: 32rpx;
	}
	.gradient-strip {
		height: 12rpx;
		background: linear-gradient(135deg, #E8734A, #F2956E);
	}
	.card-body {
		padding: 40rpx 48rpx;
	}
	.assets-label {
		font-size: 26rpx;
		color: #A98B78;
		display: block;
		margin-bottom: 16rpx;
	}
	.assets-amount {
		font-size: 60rpx;
		font-weight: 700;
		color: #E8734A;
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
		background: #F5EDE6;
		border-radius: 24rpx;
	}
	.stat-label {
		font-size: 22rpx;
		color: #A98B78;
	}
	.stat-value {
		font-size: 26rpx;
		font-weight: 600;
	}
	.stat-value.neutral { color: #7A5C4A; }
	.stat-value.green { color: #4CAF50; }
	.stat-value.coral { color: #E8734A; }

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #3D2316;
		margin-top: 64rpx;
		margin-bottom: 32rpx;
		display: block;
	}

	.account-card {
		background: #FFFFFF;
		border-radius: 32rpx;
		box-shadow: 0 2rpx 4rpx rgba(61, 35, 22, 0.04);
		padding: 32rpx 40rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 32rpx;
		position: relative;
		overflow: hidden;
	}
	.account-card:active {
		box-shadow: 0 4rpx 12rpx rgba(61, 35, 22, 0.06);
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
	.account-card.accent-coral::before { background: #E8734A; }
	.account-card.accent-blue::before { background: #42A5F5; }
	.account-card.accent-green::before { background: #4CAF50; }

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
	.account-icon.coral-bg { background: #FDE6D4; color: #E8734A; }
	.account-icon.blue-bg { background: #E3F2FD; color: #42A5F5; }
	.account-icon.green-bg { background: #E8F5E9; color: #4CAF50; }

	.account-info {
		flex: 1;
		min-width: 0;
	}
	.account-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #3D2316;
		display: block;
		margin-bottom: 4rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.account-balance {
		font-size: 40rpx;
		font-weight: 700;
		color: #3D2316;
		display: block;
		line-height: 1.25;
		margin-bottom: 4rpx;
	}
	.account-summary {
		font-size: 22rpx;
		color: #A98B78;
		display: block;
	}

	.account-arrow {
		color: #C8A896;
		font-size: 32rpx;
		flex-shrink: 0;
	}

	.add-account-card {
		background: transparent;
		border: 4rpx dashed #E8D5C8;
		border-radius: 32rpx;
		padding: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		margin-bottom: 24rpx;
	}
	.add-account-card:active {
		border-color: #E8734A;
		background: #FDE6D4;
	}
	.plus-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		border: 4rpx solid #E8D5C8;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #A98B78;
		font-size: 28rpx;
	}
	.add-account-card:active .plus-icon {
		border-color: #E8734A;
		color: #E8734A;
	}
	.add-label {
		font-size: 30rpx;
		font-weight: 500;
		color: #A98B78;
	}
	.add-account-card:active .add-label {
		color: #E8734A;
	}

	.back-svg { width: 20px; height: 20px; background-color: #3D2316; mask: url(/static/icons/arrow-left.svg) center/contain no-repeat; -webkit-mask: url(/static/icons/arrow-left.svg) center/contain no-repeat; }
	.nav-add .plus-svg { width: 20px; height: 20px; background-color: #3D2316; mask: url(/static/icons/plus.svg) center/contain no-repeat; -webkit-mask: url(/static/icons/plus.svg) center/contain no-repeat; }
	.arrow-svg { width: 16px; height: 16px; background-color: #A98B78; mask: url(/static/icons/arrow-right.svg) center/contain no-repeat; -webkit-mask: url(/static/icons/arrow-right.svg) center/contain no-repeat; }
	.card-plus-svg { width: 24px; height: 24px; background-color: #E8734A; mask: url(/static/icons/plus.svg) center/contain no-repeat; -webkit-mask: url(/static/icons/plus.svg) center/contain no-repeat; }

	</style>