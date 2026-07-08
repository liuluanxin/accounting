<template>
	<view class="ledgers-page">
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">我的账本</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="ledgers-scroll">
			<view v-if="loading" class="state-container">
				<view class="loading-spinner"></view>
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="error" class="state-container">
				<view class="state-icon state-icon-warning" :style="getIconStyle('alert-triangle')"></view>
				<text class="state-text">{{ error }}</text>
				<view class="btn-secondary" @click="initData">重试</view>
			</view>

			<template v-else>
				<view v-if="ledgers.length === 0" class="state-container">
					<view class="state-icon state-icon-empty" :style="getIconStyle('book')"></view>
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
						<view v-for="ledger in ledgers" :key="ledger.id" class="swipe-wrap">
							<view class="swipe-delete" @click="handleDeleteLedger(ledger)">
								<text class="swipe-delete-text">删除</text>
							</view>
							<view class="swipe-content" 
								:style="{ transform: 'translateX(' + (swipedId === ledger.id ? '-160rpx' : '0') + ')' }"
								@touchstart="onSwipeStart($event, ledger.id)"
								@touchmove="onSwipeMove($event, ledger.id)"
								@touchend="onSwipeEnd($event, ledger.id)"
								@click="handleSwitchLedger(ledger)">
								<view class="ledger-card" 
									:class="{ 'ledger-current': ledger.current }"
									:data-accent="getAccentColor(ledger.id)">
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
									<view class="ledger-arrow" :style="getIconStyle('arrow-right')"></view>
								</view>
							</view>
						</view>
					</view>

					<view class="add-ledger-card" @click="goAddLedger">
						<view class="add-icon-large" :style="getIconStyle('plus')"></view>
						<text class="add-text">新建账本</text>
					</view>

					<view style="height: 200rpx;"></view>
				</template>
			</template>
		</scroll-view>

	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import Logger from '@/common/logger.js'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

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
		mixins: [themeMixin],
		data() {
			return {
				coverOptions: COVER_OPTIONS,
				swipedId: null,
				swipeStartX: 0
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
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
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
			onSwipeStart(e, id) {
				this.swipeStartX = e.touches[0].clientX
				this.swipeStartId = id
			},
			onSwipeMove(e, id) {
				// 阻止纵向滚动干扰
			},
			onSwipeEnd(e, id) {
				const endX = e.changedTouches[0].clientX
				const diff = this.swipeStartX - endX
				if (diff > 60) {
					// 左滑超过阈值，打开删除按钮
					this.swipedId = id
				} else if (diff < -30) {
					// 右滑，关闭
					this.swipedId = null
				}
			},
			handleDeleteLedger(ledger) {
				uni.showModal({
					title: '删除账本',
					content: `确定要删除「${ledger.name}」吗？账单记录不会被删除。`,
					success: async (res) => {
						if (res.confirm) {
							await this.$store.dispatch('accounting/deleteLedger', ledger.id)
							this.swipedId = null
							uni.showToast({ title: '账本已删除', icon: 'none' })
						}
					}
				})
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
		height: 100vh;
		background: var(--bg, #FFF9F5);
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	/* ===== 自定义导航栏 ===== */
	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height) + 16rpx) 24rpx;
		background: var(--bg, #FFF9F5);
		position: sticky;
		top: 0;
		z-index: 100;
		width: 100%;
		box-sizing: border-box;
		flex-shrink: 0;
	}
	.nav-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--input-bg, #FFF5EE);
		transition: all 0.2s;
	}
	.nav-back:active {
		background: var(--border, #F0E4DA);
		transform: scale(0.95);
	}
	.back-icon {
		font-size: 48rpx;
		color: var(--text-primary, #3D2316);
		line-height: 1;
		margin-top: -4rpx;
	}
	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #3D2316);
	}
	.nav-placeholder {
		width: 72rpx;
	}

	.ledgers-scroll {
		flex: 1;
		width: 100%;
		padding: 16rpx 40rpx 180rpx;
		box-sizing: border-box;
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
	}
	.state-icon-warning {
		background-color: var(--primary, #E8734A);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.state-icon-empty {
		background-color: var(--primary, #E8734A);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.state-text {
		font-size: 28rpx;
		color: var(--text-secondary, #7A5C4A);
		text-align: center;
	}
	.state-hint {
		font-size: 24rpx;
		color: var(--text-tertiary, #A98B78);
		margin-top: 16rpx;
	}
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(232, 115, 74, 0.2);
		border-top-color: var(--primary, #E8734A);
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
		color: var(--primary, #E8734A);
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
		background: var(--card-bg, #FFFFFF);
		border-radius: 24rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04);
	}
	.summary-label {
		display: block;
		font-size: 22rpx;
		color: var(--text-tertiary, #A98B78);
		font-weight: 500;
		margin-bottom: 8rpx;
	}
	.summary-value {
		display: block;
		font-size: 36rpx;
		font-weight: 700;
		color: var(--text-primary, #3D2316);
		letter-spacing: -1rpx;
		margin-bottom: 4rpx;
	}
	.summary-value.income {
		color: #4CAF50;
	}
	.summary-sub {
		display: block;
		font-size: 22rpx;
		color: var(--text-tertiary, #A98B78);
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
		color: var(--text-primary, #3D2316);
	}
	.section-count {
		font-size: 26rpx;
		color: var(--text-tertiary, #A98B78);
	}

	.ledger-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.ledger-card {
		position: relative;
		background: var(--card-bg, #FFFFFF);
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
		color: var(--text-primary, #3D2316);
	}
	.ledger-badge {
		font-size: 20rpx;
		padding: 2rpx 12rpx;
		border-radius: 20rpx;
		background: rgba(232, 115, 74, 0.1);
		color: var(--primary-dark, #C95A33);
		font-weight: 500;
		flex-shrink: 0;
	}
	.ledger-meta {
		display: flex;
		align-items: center;
		gap: 24rpx;
		font-size: 26rpx;
		color: var(--text-secondary, #7A5C4A);
		margin-bottom: 16rpx;
	}
	.ledger-amount {
		font-weight: 600;
		color: var(--text-primary, #3D2316);
	}
	.ledger-amount.income {
		color: #4CAF50;
	}
	.meta-divider {
		color: var(--border, #F0E4DA);
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
		color: var(--text-tertiary, #A98B78);
	}
	.progress-value {
		font-size: 22rpx;
		color: var(--primary, #E8734A);
		font-weight: 500;
	}
	.progress-track {
		width: 100%;
		height: 12rpx;
		background: var(--border, #F0E4DA);
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
		background-color: var(--text-tertiary, #A98B78);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
		margin-top: 8rpx;
		flex-shrink: 0;
	}

	.add-ledger-card {
		background: transparent;
		border: 2rpx dashed var(--border, #F0E4DA);
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
		background: rgba(232, 115, 74, 0.1);
	}
	.add-icon-large {
		width: 56rpx;
		height: 56rpx;
		background-color: var(--text-tertiary, #A98B78);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.add-text {
		font-size: 28rpx;
		color: var(--text-tertiary, #A98B78);
		font-weight: 500;
	}

	/* ===== 左滑删除 ===== */
	.swipe-wrap {
		position: relative;
		overflow: hidden;
		border-radius: 24rpx;
	}
	.swipe-delete {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 160rpx;
		background: #FF5252;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0 24rpx 24rpx 0;
	}
	.swipe-delete-text {
		color: var(--card-bg, #FFFFFF);
		font-size: 28rpx;
		font-weight: 500;
	}
	.swipe-content {
		position: relative;
		z-index: 2;
		background: transparent;
		transition: transform 0.25s ease;
		will-change: transform;
		border-radius: 24rpx;
	}

	@media (min-width: 768px) {
		.nav-bar { padding: calc(var(--status-bar-height) + 16rpx) 48rpx 16rpx; }
		.ledgers-scroll { max-width: 750px; margin: 0 auto; width: 100%; }
	}
	@media (max-width: 360px) {
		.nav-bar { padding: calc(var(--status-bar-height) + 12rpx) 16rpx 12rpx; }
		.ledgers-scroll { padding: 16rpx 24rpx 180rpx; }
		.ledger-card { padding: 18rpx; padding-left: 40rpx; }
		.summary-row { gap: 16rpx; }
		.summary-card { padding: 16rpx; }
		.summary-value { font-size: 30rpx; }
	}
</style>
