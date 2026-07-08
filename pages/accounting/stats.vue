<template>
	<view class="stats-page">
		<view class="custom-nav-bar">
			<view class="stats-header">
				<text class="header-title">统计</text>
			</view>
			<view class="period-selector">
				<view class="period-pill" :class="{ active: period === 'week' }" @click="period = 'week'">周</view>
				<view class="period-pill" :class="{ active: period === 'month' }" @click="period = 'month'">月</view>
				<view class="period-pill" :class="{ active: period === 'year' }" @click="period = 'year'">年</view>
			</view>
		</view>

		<scroll-view scroll-y class="stats-scroll">
			<view class="stats-card monthly-overview">
				<text class="overview-label">{{ currentMonthLabel }}总支出</text>
				<text class="overview-amount">¥{{ formatMoney(summary.expense) }}</text>
				<text class="overview-change" :class="changeClass">{{ changeText }}</text>
			</view>

			<view class="stats-card donut-section">
				<view class="donut-chart" :class="{ empty: ranking.length === 0 }" :style="{ background: donutGradient }">
					<view class="donut-center"></view>
				</view>
				<view v-if="ranking.length > 0" class="donut-legend">
					<view v-for="(item, i) in ranking.slice(0, 5)" :key="item.name" class="legend-item">
						<view class="legend-dot" :style="{ background: donutColors[i] }"></view>
						<text class="legend-text">{{ item.name }} {{ totalAmount > 0 ? (item.amount / totalAmount * 100).toFixed(0) : 0 }}%</text>
					</view>
				</view>
			</view>

			<view v-if="ranking.length > 0" class="stats-card ranking-section">
				<text class="section-title">支出排行</text>
				<view v-for="(item, i) in ranking" :key="item.name" class="ranking-item">
					<text class="rank-emoji">{{ getCategoryEmoji(item.name) }}</text>
					<view class="ranking-info">
						<view class="ranking-header">
							<text class="ranking-name">{{ getCategoryName(item.name) }}</text>
							<text class="ranking-amount">¥{{ formatMoney(item.amount) }}</text>
						</view>
						<view class="progress-bar-track">
							<view class="progress-bar-fill" :style="{ width: barWidth(item) + '%' }"></view>
						</view>
					</view>
				</view>
			</view>

			<view class="stats-card trend-section">
				<text class="section-title">月度趋势</text>
				<view class="bar-chart">
					<view v-for="month in trendData" :key="month.label" class="bar-col">
						<view class="bar-fill" :class="{ current: month.isCurrent }" :style="{ height: month.height + '%' }"></view>
						<text class="bar-label" :class="{ current: month.isCurrent }">{{ month.label }}</text>
					</view>
				</view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<TabBar currentTab="stats" :showFab="false" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney, CAT_ICONS } from '@/common/accounting-utils.js'
	import TabBar from '@/components/TabBar.vue'
	import themeMixin from '@/common/theme-mixin.js'

	export default {
		mixins: [themeMixin],
		components: {
			TabBar
		},
		data() {
			const now = new Date()
			return {
				period: 'month',
				year: now.getFullYear(),
				month: now.getMonth() + 1,
				donutColors: ['#E8734A', '#F2956E', '#FF9800', '#FBBE9E', '#A98B78']
			}
		},
		computed: {
			...mapState('accounting', ['data', 'initialized', 'homeLedgerMode']),
			filteredTransactions() {
				const mode = this.homeLedgerMode
				const txs = this.data.transactions || []
				if (mode === 'all') return txs
				const currentL = this.data.ledgers.find(l => l.current)
				if (!currentL) return txs
				return txs.filter(t => !t.ledgerId || t.ledgerId === currentL.id)
			},
			currentMonthLabel() {
				return this.month + '月'
			},
			monthTxs() {
				const p = this.year + '-' + String(this.month).padStart(2, '0')
				return this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0)
			},
			summary() {
				let inc = 0, exp = 0
				this.monthTxs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
				return { income: inc, expense: exp, balance: inc - exp }
			},
			prevMonthExpense() {
				let prevMonth = this.month - 1
				let prevYear = this.year
				if (prevMonth === 0) {
					prevMonth = 12
					prevYear -= 1
				}
				const p = prevYear + '-' + String(prevMonth).padStart(2, '0')
				const txs = this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0 && t.type === 'expense')
				return txs.reduce((sum, t) => sum + t.amount, 0)
			},
			changeText() {
				if (this.prevMonthExpense === 0) return '上月无数据'
				const change = ((this.summary.expense - this.prevMonthExpense) / this.prevMonthExpense * 100).toFixed(1)
				if (parseFloat(change) > 0) return '比上月 ↑' + Math.abs(change) + '%'
				return '比上月 ↓' + Math.abs(change) + '%'
			},
			changeClass() {
				if (this.prevMonthExpense === 0) return ''
				return ((this.summary.expense - this.prevMonthExpense) / this.prevMonthExpense * 100) > 0 ? 'increase' : 'decrease'
			},
			ranking() {
				const txs = this.monthTxs.filter(t => t.type === 'expense')
				const map = {}
				txs.forEach(t => { if (t.category) map[t.category] = (map[t.category] || 0) + t.amount })
				return Object.entries(map).map(([n, a]) => ({ name: n, amount: Math.round(a * 100) / 100 })).sort((a, b) => b.amount - a.amount)
			},
			totalAmount() { return this.ranking.reduce((s, r) => s + r.amount, 0) },
			donutGradient() {
				if (this.ranking.length === 0) return 'none'
				let pct = 0
				const stops = this.ranking.slice(0, 5).map((r, i) => {
					const p = this.totalAmount > 0 ? r.amount / this.totalAmount * 100 : 0
					const s = pct; pct += p
					return this.donutColors[i % this.donutColors.length] + ' ' + s + '% ' + pct + '%'
				}).join(', ')
				return 'conic-gradient(' + stops + ')'
			},
			maxAmount() { return this.ranking.length > 0 ? this.ranking[0].amount : 1 },
			trendData() {
				const months = []
				for (let i = 0; i < 12; i++) {
					const month = i + 1
					const p = this.year + '-' + String(month).padStart(2, '0')
					const txs = this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0 && t.type === 'expense')
					const amount = txs.reduce((sum, t) => sum + t.amount, 0)
					months.push({ label: month + '月', amount, year: this.year, isCurrent: month === this.month })
				}
				const max = Math.max(...months.map(m => m.amount), 1)
				return months.map(m => ({ ...m, height: (m.amount / max * 100).toFixed(0) }))
			}
		},
		onLoad() {
			if (!this.initialized) this.$store.dispatch('accounting/initialize')
		},
		onShow() {
			this.$forceUpdate()
		},
		methods: {
			formatMoney,
			getCategoryName(cat) {
				if (!cat) return '其他'
				return cat
			},
			getCategoryEmoji(cat) {
				return CAT_ICONS[cat] || '📦'
			},
			barWidth(item) { return (item.amount / this.maxAmount * 100).toFixed(0) },
			switchTab(page) { uni.redirectTo({ url: '/pages/accounting/' + page }) },
			goRecord() { uni.navigateTo({ url: '/pages/accounting/record' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.stats-page { height: 100vh; background: var(--bg, #FFF9F5); box-sizing: border-box; display: flex; flex-direction: column; width: 100%; overflow-x: hidden; }
	.custom-nav-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--bg, #FFF9F5); flex-shrink: 0; width: 100%; box-sizing: border-box; }
	.stats-header { padding: calc(var(--status-bar-height) + 32rpx) 40rpx 16rpx; flex-shrink: 0; width: 100%; box-sizing: border-box; display: flex; justify-content: center; }
	.header-title { font-size: 48rpx; font-weight: 700; color: var(--text-primary, #3D2316); }

	.period-selector { display: flex; gap: 16rpx; padding: 0 40rpx 24rpx; flex-shrink: 0; width: 100%; box-sizing: border-box; }
	.period-pill { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 50rpx; background: var(--border, #F5EDE6); color: var(--text-secondary, #7A5C4A); font-size: 28rpx; font-weight: 500; border: 2rpx solid transparent; transition: all 0.2s; }
	.period-pill.active { background: var(--primary, #E8734A); color: #FFFFFF; border-color: var(--primary, #E8734A); }

	.stats-scroll { flex: 1; width: 100%; padding: calc(var(--status-bar-height) + 200rpx) 40rpx 200rpx; box-sizing: border-box; }

	.stats-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); padding: 40rpx; margin-bottom: 32rpx; }

	.monthly-overview .overview-label { font-size: 28rpx; color: var(--text-tertiary, #A98B78); display: block; margin-bottom: 8rpx; }
	.monthly-overview .overview-amount { font-size: 64rpx; font-weight: 700; color: var(--text-primary, #3D2316); display: block; margin-bottom: 8rpx; letter-spacing: -1rpx; }
	.monthly-overview .overview-change { font-size: 28rpx; }
	.monthly-overview .overview-change.decrease { color: var(--expense, #4CAF50); }
	.monthly-overview .overview-change.increase { color: var(--primary, #E8734A); }

	.donut-section { display: flex; flex-direction: column; align-items: center; }
	.donut-chart { width: 320rpx; height: 320rpx; border-radius: 50%; position: relative; margin-bottom: 40rpx; background: var(--border, #F5EDE6); }
	.donut-chart.empty { background: var(--border, #F5EDE6) !important; border: 4rpx dashed var(--border, #E0D4C8); }
	.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 180rpx; height: 180rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); }
	.donut-legend { display: flex; flex-wrap: wrap; gap: 24rpx 40rpx; justify-content: center; width: 100%; }
	.legend-item { display: flex; align-items: center; gap: 12rpx; }
	.legend-dot { width: 20rpx; height: 20rpx; border-radius: 50%; flex-shrink: 0; }
	.legend-text { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); }

	.ranking-section .section-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #3D2316); margin-bottom: 32rpx; display: block; }
	.ranking-item { display: flex; align-items: center; gap: 24rpx; margin-bottom: 32rpx; }
	.ranking-item:last-child { margin-bottom: 0; }
	.rank-emoji { font-size: 40rpx; width: 56rpx; text-align: center; }
	.ranking-info { flex: 1; min-width: 0; }
	.ranking-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8rpx; }
	.ranking-name { font-size: 30rpx; font-weight: 500; color: var(--text-primary, #3D2316); }
	.ranking-amount { font-size: 28rpx; font-weight: 600; color: var(--text-primary, #3D2316); }
	.progress-bar-track { height: 12rpx; background: var(--border, #F5EDE6); border-radius: 6rpx; overflow: hidden; flex: 1; }
	.progress-bar-fill { height: 100%; border-radius: 6rpx; background: var(--primary, #E8734A); transition: width 0.6s ease; }

	.trend-section .section-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #3D2316); margin-bottom: 32rpx; display: block; }
	.bar-chart { display: flex; align-items: flex-end; gap: 8rpx; height: 260rpx; padding-top: 16rpx; }
	.bar-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 12rpx; height: 100%; justify-content: flex-end; }
	.bar-fill { width: 100%; border-radius: 8rpx 8rpx 4rpx 4rpx; transition: height 0.5s ease; min-height: 8rpx; background: rgba(232, 115, 74, 0.3); }
	.bar-fill.current { background: var(--primary, #E8734A); }
	.bar-label { font-size: 22rpx; color: var(--text-tertiary, #A98B78); white-space: nowrap; }
	.bar-label.current { color: var(--text-primary, #3D2316); font-weight: 500; }

	
</style>