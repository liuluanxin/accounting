<template>
	<view class="ledgers-page">
		<view class="page-header">
			<view class="header-back" @click="goBack">
				<svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m15 18-6-6 6-6"/>
				</svg>
			</view>
			<text class="header-title">我的账本</text>
			<view class="header-add" @click="goAddLedger">
				<svg class="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 12h14"/>
					<path d="M12 5v14"/>
				</svg>
			</view>
		</view>

		<scroll-view scroll-y class="ledgers-scroll">
			<view v-if="loading" class="state-container">
				<view class="loading-spinner"></view>
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="error" class="state-container">
				<svg class="state-icon state-icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
					<path d="M12 9v4"/>
					<path d="M12 17h.01"/>
				</svg>
				<text class="state-text">{{ error }}</text>
				<view class="btn-secondary" @click="initData">重试</view>
			</view>

			<template v-else>
				<view v-if="ledgers.length === 0" class="state-container">
					<svg class="state-icon state-icon-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 7v14"/>
						<path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
					</svg>
					<text class="state-text">暂无账本</text>
					<text class="state-hint">点击右上角 + 创建你的第一个账本</text>
				</view>

				<template v-else>
					<view class="summary-row">
						<view class="summary-card">
							<text class="summary-label">总余额</text>
							<text class="summary-value">{{ formatAmount(totalBalance) }}</text>
							<text class="summary-sub">全部账本</text>
						</view>
						<view class="summary-card">
							<text class="summary-label">本月净收入</text>
							<text class="summary-value income">{{ formatAmount(thisMonthNet) }}</text>
							<text class="summary-sub">2026年7月</text>
						</view>
					</view>

					<view class="section-header">
						<text class="section-title">全部账本</text>
						<text class="section-count">共 {{ ledgers.length }} 本</text>
					</view>

					<view class="ledger-list">
						<view v-for="ledger in ledgers" :key="ledger.id" 
							class="ledger-card" 
							:class="{ 'ledger-current': ledger.current }"
							:data-accent="getAccentColor(ledger.id)"
							@click="handleSwitchLedger(ledger)">
							<view class="ledger-accent" :style="{ background: getAccentBg(ledger.id) }"></view>
							<view class="ledger-content">
								<view class="ledger-left">
									<view class="dot-indicator" :style="{ background: getAccentBg(ledger.id) }"></view>
									<view class="ledger-info">
										<view class="ledger-name-row">
											<text class="ledger-name">{{ ledger.name }}</text>
											<text v-if="ledger.current" class="ledger-badge">默认</text>
										</view>
										<view class="ledger-meta">
											<text>本月支出 <text class="ledger-amount">{{ formatAmount(getLedgerExpense(ledger.id)) }}</text></text>
											<text class="meta-divider">|</text>
											<text>收入 <text class="ledger-amount income">{{ formatAmount(getLedgerIncome(ledger.id)) }}</text></text>
										</view>
										<view class="ledger-progress">
											<view class="progress-header">
												<text class="progress-label">{{ getLedgerTxCount(ledger.id) }} 笔记录</text>
												<text class="progress-value">{{ getBudgetPercent(ledger.id) }}%</text>
											</view>
											<view class="progress-track">
												<view class="progress-fill" 
													:style="{ width: getBudgetPercent(ledger.id) + '%', background: getAccentBg(ledger.id) }"></view>
											</view>
										</view>
									</view>
								</view>
							</view>
							<svg class="ledger-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="m9 18 6-6-6-6"/>
							</svg>
						</view>
					</view>

					<view class="add-ledger-card" @click="goAddLedger">
						<svg class="add-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M5 12h14"/>
							<path d="M12 5v14"/>
						</svg>
						<text class="add-text">新建账本</text>
					</view>
					</view>

					<view style="height: 200rpx;"></view>
				</template>
			</template>
		</scroll-view>

		<TabBar currentTab="home" :showFab="true" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import Logger from '@/common/logger.js'
	import TabBar from '@/components/TabBar.vue'

	const COVER_OPTIONS = [
		{ icon: '📒', gradient: 'linear-gradient(135deg, #E8734A, #C95A33)', name: '珊瑚暖色' },
		{ icon: '📕', gradient: 'linear-gradient(135deg, #E89B9B, #D47A7A)', name: '红色热情' },
		{ icon: '📗', gradient: 'linear-gradient(135deg, #7BC4A8, #5AAF8E)', name: '绿色自然' },
		{ icon: '📘', gradient: 'linear-gradient(135deg, #F2956E, #D47A50)', name: '橘棕雅致' },
		{ icon: '📙', gradient: 'linear-gradient(135deg, #FF9F43, #E8832A)', name: '橙色活力' },
		{ icon: '📚', gradient: 'linear-gradient(135deg, #C4836A, #A66B50)', name: '棕色典雅' },
		{ icon: '💰', gradient: 'linear-gradient(135deg, #FFD700, #F0C000)', name: '金色财富' },
		{ icon: '💎', gradient: 'linear-gradient(135deg, #A98B78, #8B7358)', name: '暖棕质朴' },
		{ icon: '🌙', gradient: 'linear-gradient(135deg, #5A4A3A, #3D3028)', name: '深棕夜色' },
		{ icon: '🌸', gradient: 'linear-gradient(135deg, #FF9FF3, #F368E0)', name: '粉色甜心' },
	]

	const ACCENT_COLORS = ['#E8734A', '#D4865E', '#4CAF50', '#C4836A']

	export default {
		components: {
			TabBar
		},
		data() {
			return {
				coverOptions: COVER_OPTIONS
			}
		},
		computed: {
			...mapState('accounting', ['data', 'loading', 'error', 'initialized']),
			ledgers() {
				return this.data.ledgers || []
			},
			totalBalance() {
				let total = 0
				if (this.data.accounts) {
					this.data.accounts.forEach(acc => {
						total += parseFloat(acc.balance) || 0
					})
				}
				return total
			},
			thisMonthNet() {
				let income = 0
				let expense = 0
				const now = new Date()
				const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
				if (this.data.transactions) {
					this.data.transactions.forEach(t => {
						if (t.date.startsWith(thisMonth)) {
							if (t.type === 'income') {
								income += parseFloat(t.amount) || 0
							} else {
								expense += parseFloat(t.amount) || 0
							}
						}
					})
				}
				return income - expense
			}
		},
		onLoad() {
			if (!this.initialized) this.initData()
		},
		methods: {
			async initData() {
				await this.$store.dispatch('accounting/initialize')
			},
			goBack() {
				uni.navigateBack()
			},
			formatAmount(amount) {
				const num = parseFloat(amount) || 0
				if (num >= 0) return '¥' + num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
				return '-¥' + Math.abs(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
			},
			getAccentColor(ledgerId) {
				const idx = this.ledgers.findIndex(l => l.id === ledgerId)
				return ACCENT_COLORS[idx % ACCENT_COLORS.length]
			},
			getAccentBg(ledgerId) {
				return this.getAccentColor(ledgerId)
			},
			getLedgerTxCount(ledgerId) {
				if (!ledgerId || !this.data.transactions) return 0
				return this.data.transactions.filter(t => t.ledgerId === ledgerId).length
			},
			getLedgerExpense(ledgerId) {
				let total = 0
				if (!ledgerId || !this.data.transactions) return 0
				this.data.transactions.filter(t => t.ledgerId === ledgerId && t.type === 'expense').forEach(t => {
					total += parseFloat(t.amount) || 0
				})
				return total
			},
			getLedgerIncome(ledgerId) {
				let total = 0
				if (!ledgerId || !this.data.transactions) return 0
				this.data.transactions.filter(t => t.ledgerId === ledgerId && t.type === 'income').forEach(t => {
					total += parseFloat(t.amount) || 0
				})
				return total
			},
			getBudgetPercent(ledgerId) {
				const expense = this.getLedgerExpense(ledgerId)
				const budget = parseFloat(this.data.budget) || 10000
				return Math.min(Math.round((expense / budget) * 100), 100)
			},
			getCoverGradient(cover) {
				const opt = COVER_OPTIONS.find(c => c.icon === cover)
				return opt ? opt.gradient : 'linear-gradient(135deg, #E8734A, #C95A33)'
			},
			getCoverIcon(cover) {
				if (cover && COVER_OPTIONS.find(c => c.icon === cover)) return cover
				return '📒'
			},
			goAddLedger() {
				uni.navigateTo({ url: '/pages/accounting/add-ledger' })
			},
			async handleSwitchLedger(ledger) {
				if (ledger.current) {
					uni.showToast({ title: '当前已是该账本', icon: 'none' })
					return
				}
				await this.$store.dispatch('accounting/switchLedger', ledger.id)
				uni.showToast({ title: `已切换到「${ledger.name}」`, icon: 'none' })
			},
			switchTab(page) {
				uni.redirectTo({ url: '/pages/accounting/' + page })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ledgers-page {
		min-height: 100vh;
		background: #FFF9F5;
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
	}

	.page-header {
		padding: calc(var(--status-bar-height) + 24rpx) 40rpx 16rpx;
		background: #FFF9F5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}
	.header-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}
	.header-back:active {
		background: #F5EDE6;
	}
	.back-icon {
		width: 44rpx;
		height: 44rpx;
		color: #3D2316;
	}
	.header-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #3D2316;
	}
	.header-add {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: #E8734A;
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.25);
		transition: background 0.2s;
	}
	.header-add:active {
		background: #C95A33;
	}
	.add-icon {
		width: 36rpx;
		height: 36rpx;
	}

	.ledgers-scroll {
		flex: 1;
		padding: 16rpx 40rpx 180rpx;
	}

	.state-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
	}
	.state-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 24rpx;
		color: #E8734A;
	}
	.state-text {
		font-size: 28rpx;
		color: #7A5C4A;
		text-align: center;
	}
	.state-hint {
		font-size: 24rpx;
		color: #A98B78;
		margin-top: 16rpx;
	}
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(232, 115, 74, 0.2);
		border-top-color: #E8734A;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 24rpx;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.btn-secondary {
		padding: 16rpx 40rpx;
		border-radius: 24rpx;
		border: 2rpx solid rgba(232, 115, 74, 0.3);
		color: #E8734A;
		font-size: 28rpx;
		background: rgba(255, 255, 255, 0.6);
		margin-top: 32rpx;
	}

	.summary-row {
		display: flex;
		gap: 24rpx;
		margin-bottom: 40rpx;
	}
	.summary-card {
		flex: 1;
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04);
	}
	.summary-label {
		display: block;
		font-size: 22rpx;
		color: #A98B78;
		font-weight: 500;
		margin-bottom: 8rpx;
	}
	.summary-value {
		display: block;
		font-size: 36rpx;
		font-weight: 700;
		color: #3D2316;
		letter-spacing: -1rpx;
		margin-bottom: 4rpx;
	}
	.summary-value.income {
		color: #4CAF50;
	}
	.summary-sub {
		display: block;
		font-size: 22rpx;
		color: #A98B78;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}
	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #3D2316;
	}
	.section-count {
		font-size: 26rpx;
		color: #A98B78;
	}

	.ledger-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.ledger-card {
		position: relative;
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04);
		padding: 24rpx;
		padding-left: 48rpx;
		transition: box-shadow 0.2s, transform 0.15s;
	}
	.ledger-card:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.08);
	}
	.ledger-accent {
		position: absolute;
		left: 0;
		top: 24rpx;
		bottom: 24rpx;
		width: 8rpx;
		border-radius: 0 8rpx 8rpx 0;
	}

	.ledger-content {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}
	.ledger-left {
		display: flex;
		align-items: center;
		gap: 24rpx;
		flex: 1;
		min-width: 0;
	}
	.dot-indicator {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.ledger-info {
		min-width: 0;
	}
	.ledger-name-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 8rpx;
	}
	.ledger-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #3D2316;
	}
	.ledger-badge {
		font-size: 20rpx;
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		background: #FDE6D4;
		color: #C95A33;
		font-weight: 500;
		flex-shrink: 0;
	}
	.ledger-meta {
		display: flex;
		align-items: center;
		gap: 24rpx;
		font-size: 26rpx;
		color: #7A5C4A;
		margin-bottom: 16rpx;
	}
	.ledger-amount {
		font-weight: 600;
		color: #3D2316;
	}
	.ledger-amount.income {
		color: #4CAF50;
	}
	.meta-divider {
		color: #E8D5C8;
	}

	.ledger-progress {
		margin-top: 16rpx;
	}
	.progress-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8rpx;
	}
	.progress-label {
		font-size: 22rpx;
		color: #A98B78;
	}
	.progress-value {
		font-size: 22rpx;
		color: #E8734A;
		font-weight: 500;
	}
	.progress-track {
		width: 100%;
		height: 12rpx;
		background: #F5EDE6;
		border-radius: 6rpx;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		border-radius: 6rpx;
		transition: width 0.4s ease;
	}

	.ledger-arrow {
		width: 36rpx;
		height: 36rpx;
		color: #A98B78;
		margin-top: 8rpx;
		flex-shrink: 0;
	}

	.add-ledger-card {
		background: transparent;
		border: 2rpx dashed #E8D5C8;
		border-radius: 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		padding: 48rpx;
		transition: border-color 0.2s, background 0.2s;
	}
	.add-ledger-card:active {
		border-color: #F2956E;
		background: #FDE6D4;
	}
	.add-icon-large {
		width: 56rpx;
		height: 56rpx;
		color: #A98B78;
	}
	.add-text {
		font-size: 28rpx;
		color: #A98B78;
		font-weight: 500;
	}

	@media (min-width: 768px) {
		.page-header { padding: 32rpx 48rpx 16rpx; }
		.ledgers-scroll { max-width: 750px; margin: 0 auto; width: 100%; }
	}
	@media (max-width: 360px) {
		.page-header { padding: 16rpx 24rpx 8rpx; }
		.ledgers-scroll { padding: 16rpx 24rpx 180rpx; }
		.ledger-card { padding: 18rpx; padding-left: 40rpx; }
		.summary-row { gap: 16rpx; }
		.summary-card { padding: 16rpx; }
		.summary-value { font-size: 30rpx; }
	}
</style>
