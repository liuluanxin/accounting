<template>
	<view class="stats-page">
		<view class="custom-nav-bar">
			<view class="stats-header">
				<text class="header-title">统计</text>
			</view>
		</view>

		<scroll-view scroll-y class="stats-scroll">
			<view class="period-selector">
				<view class="period-pill" :class="{ active: period === 'week' }" @click="period = 'week'">周</view>
				<view class="period-pill" :class="{ active: period === 'month' }" @click="period = 'month'">月</view>
				<view class="period-pill" :class="{ active: period === 'year' }" @click="period = 'year'">年</view>
				<view class="period-pill" :class="{ active: period === 'custom' }" @click="period = 'custom'">自定义</view>
			</view>
			<view v-if="period === 'custom'" class="custom-date-range">
				<picker mode="date" :value="customStart" :end="todayStr" @change="onStartChange">
					<view class="date-picker">
						<text class="date-label">开始</text>
						<text class="date-value">{{ customStart }}</text>
					</view>
				</picker>
				<text class="date-separator">至</text>
				<picker mode="date" :value="customEnd" :start="customStart" :end="todayStr" @change="onEndChange">
					<view class="date-picker">
						<text class="date-label">结束</text>
						<text class="date-value">{{ customEnd }}</text>
					</view>
				</picker>
			</view>

			<view class="stats-card monthly-overview">
				<text class="overview-label">{{ currentLabel }}总支出</text>
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
				<text class="section-title">{{ trendTitle }}</text>
				<view class="bar-chart">
					<view v-for="item in trendData" :key="item.label" class="bar-col">
						<view class="bar-fill" :class="{ current: item.isCurrent }" :style="{ height: item.height + '%' }"></view>
						<text class="bar-label" :class="{ current: item.isCurrent }">{{ item.label }}</text>
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
			const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
			const sevenDaysAgo = new Date(now)
			sevenDaysAgo.setDate(now.getDate() - 6)
			const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
			return {
				period: 'month',
				year: now.getFullYear(),
				month: now.getMonth() + 1,
				customStart: sevenDaysAgoStr,
				customEnd: todayStr,
				todayStr: todayStr,
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
			currentLabel() {
				if (this.period === 'week') return '本周'
				if (this.period === 'month') return this.month + '月'
				if (this.period === 'year') return this.year + '年'
				return '自定义'
			},
			periodTxs() {
				if (this.period === 'week') {
					const now = new Date()
					const currentDay = now.getDay()
					const dayIndex = currentDay === 0 ? 6 : currentDay - 1
					const monday = new Date(now)
					monday.setDate(now.getDate() - dayIndex)
					const sunday = new Date(monday)
					sunday.setDate(monday.getDate() + 6)
					const startStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
					const endStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`
					return this.filteredTransactions.filter(t => t.date && t.date >= startStr && t.date <= endStr)
				}
				if (this.period === 'month') {
					const p = this.year + '-' + String(this.month).padStart(2, '0')
					return this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0)
				}
				if (this.period === 'year') {
					const p = this.year + '-'
					return this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0)
				}
				// custom
				return this.filteredTransactions.filter(t => t.date && t.date >= this.customStart && t.date <= this.customEnd)
			},
			summary() {
				let inc = 0, exp = 0
				this.periodTxs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
				return { income: inc, expense: exp, balance: inc - exp }
			},
			prevPeriodExpense() {
				if (this.period === 'month') {
					let prevMonth = this.month - 1
					let prevYear = this.year
					if (prevMonth === 0) {
						prevMonth = 12
						prevYear -= 1
					}
					const p = prevYear + '-' + String(prevMonth).padStart(2, '0')
					const txs = this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0 && t.type === 'expense')
					return txs.reduce((sum, t) => sum + t.amount, 0)
				}
				if (this.period === 'week') {
					const now = new Date()
					const currentDay = now.getDay()
					const dayIndex = currentDay === 0 ? 6 : currentDay - 1
					const monday = new Date(now)
					monday.setDate(now.getDate() - dayIndex - 7)
					const sunday = new Date(monday)
					sunday.setDate(monday.getDate() + 6)
					const startStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
					const endStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`
					const txs = this.filteredTransactions.filter(t => t.date && t.date >= startStr && t.date <= endStr && t.type === 'expense')
					return txs.reduce((sum, t) => sum + t.amount, 0)
				}
				if (this.period === 'year') {
					const p = (this.year - 1) + '-'
					const txs = this.filteredTransactions.filter(t => t.date && t.date.indexOf(p) === 0 && t.type === 'expense')
					return txs.reduce((sum, t) => sum + t.amount, 0)
				}
				// custom - 上一个同长度周期
				const start = new Date(this.customStart)
				const end = new Date(this.customEnd)
				const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
				const prevEnd = new Date(start)
				prevEnd.setDate(start.getDate() - 1)
				const prevStart = new Date(prevEnd)
				prevStart.setDate(prevEnd.getDate() - days + 1)
				const startStr = `${prevStart.getFullYear()}-${String(prevStart.getMonth() + 1).padStart(2, '0')}-${String(prevStart.getDate()).padStart(2, '0')}`
				const endStr = `${prevEnd.getFullYear()}-${String(prevEnd.getMonth() + 1).padStart(2, '0')}-${String(prevEnd.getDate()).padStart(2, '0')}`
				const txs = this.filteredTransactions.filter(t => t.date && t.date >= startStr && t.date <= endStr && t.type === 'expense')
				return txs.reduce((sum, t) => sum + t.amount, 0)
			},
			changeText() {
				if (this.prevPeriodExpense === 0) return '上期无数据'
				const change = ((this.summary.expense - this.prevPeriodExpense) / this.prevPeriodExpense * 100).toFixed(1)
				if (parseFloat(change) > 0) return '比上期 ↑' + Math.abs(change) + '%'
				return '比上期 ↓' + Math.abs(change) + '%'
			},
			changeClass() {
				if (this.prevPeriodExpense === 0) return ''
				return ((this.summary.expense - this.prevPeriodExpense) / this.prevPeriodExpense * 100) > 0 ? 'increase' : 'decrease'
			},
			ranking() {
				const txs = this.periodTxs.filter(t => t.type === 'expense')
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
			trendTitle() {
				if (this.period === 'week') return '周趋势'
				if (this.period === 'month') return '月度趋势'
				if (this.period === 'year') return '年度趋势'
				return '自定义趋势'
			},
			trendData() {
				// 周：每天一根柱子（7根）
				if (this.period === 'week') {
					const now = new Date()
					const currentDay = now.getDay()
					const dayIndex = currentDay === 0 ? 6 : currentDay - 1
					const monday = new Date(now)
					monday.setDate(now.getDate() - dayIndex)

					const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
					const days = []
					for (let i = 0; i < 7; i++) {
						const d = new Date(monday)
						d.setDate(monday.getDate() + i)
						const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
						const txs = this.filteredTransactions.filter(t => t.date === dateStr && t.type === 'expense')
						const amount = txs.reduce((sum, t) => sum + t.amount, 0)
						days.push({ label: weekDays[i], amount, isCurrent: i === dayIndex })
					}
					const max = Math.max(...days.map(d => d.amount), 1)
					return days.map(d => ({ ...d, height: (d.amount / max * 100).toFixed(0) }))
				}

				// 月：每周一根柱子（4-5根）
				if (this.period === 'month') {
					const daysInMonth = new Date(this.year, this.month, 0).getDate()
					const weeks = []
					let weekStart = 1
					const today = new Date()

					while (weekStart <= daysInMonth) {
						const weekEnd = Math.min(weekStart + 6, daysInMonth)
						let amount = 0
						for (let d = weekStart; d <= weekEnd; d++) {
							const dateStr = `${this.year}-${String(this.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
							const txs = this.filteredTransactions.filter(t => t.date === dateStr && t.type === 'expense')
							amount += txs.reduce((sum, t) => sum + t.amount, 0)
						}

						const isCurrentWeek = this.year === today.getFullYear() &&
												  this.month === today.getMonth() + 1 &&
												  today.getDate() >= weekStart &&
												  today.getDate() <= weekEnd

						weeks.push({
							label: `第${weeks.length + 1}周`,
							amount,
							isCurrent: isCurrentWeek
						})
						weekStart = weekEnd + 1
					}

					const max = Math.max(...weeks.map(w => w.amount), 1)
					return weeks.map(w => ({ ...w, height: (w.amount / max * 100).toFixed(0) }))
				}

				// 年：每月一根柱子（12根）
				if (this.period === 'year') {
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

				// custom：按天显示
				const start = new Date(this.customStart)
				const end = new Date(this.customEnd)
				const days = []
				const today = new Date()
				const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

				for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
					const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
					const txs = this.filteredTransactions.filter(t => t.date === dateStr && t.type === 'expense')
					const amount = txs.reduce((sum, t) => sum + t.amount, 0)
					days.push({
						label: `${d.getMonth() + 1}/${d.getDate()}`,
						amount,
						isCurrent: dateStr === todayStr
					})
				}
				const max = Math.max(...days.map(d => d.amount), 1)
				return days.map(d => ({ ...d, height: (d.amount / max * 100).toFixed(0) }))
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
			goRecord() { uni.navigateTo({ url: '/pages/accounting/record' }) },
			onStartChange(e) {
				this.customStart = e.detail.value
			},
			onEndChange(e) {
				this.customEnd = e.detail.value
			}
		}
	}
</script>

<style lang="scss" scoped>
	.stats-page { height: 100vh; background: var(--bg, #FFF9F5); box-sizing: border-box; display: flex; flex-direction: column; width: 100%; overflow-x: hidden; }
	.custom-nav-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--bg, #FFF9F5); flex-shrink: 0; width: 100%; box-sizing: border-box; }
	.stats-header { padding: calc(var(--status-bar-height) + 32rpx) 40rpx 24rpx; flex-shrink: 0; width: 100%; box-sizing: border-box; display: flex; justify-content: center; }
	.header-title { font-size: 36rpx; font-weight: 600; color: var(--text-primary, #3D2316); }

	.period-selector { display: flex; gap: 16rpx; padding: 0 40rpx 20rpx; width: 100%; box-sizing: border-box; }
	.period-pill { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 50rpx; background: var(--border, #F5EDE6); color: var(--text-secondary, #7A5C4A); font-size: 28rpx; font-weight: 500; border: 2rpx solid transparent; transition: all 0.2s; }
	.period-pill.active { background: var(--primary, #E8734A); color: #FFFFFF; border-color: var(--primary, #E8734A); }

	.custom-date-range { display: flex; align-items: center; justify-content: center; gap: 24rpx; padding: 0 40rpx 24rpx; width: 100%; box-sizing: border-box; }
	.date-picker { background: var(--border, #F5EDE6); border-radius: 16rpx; padding: 12rpx 20rpx; display: flex; flex-direction: column; align-items: center; min-width: 200rpx; }
	.date-label { font-size: 22rpx; color: var(--text-tertiary, #A98B78); margin-bottom: 4rpx; }
	.date-value { font-size: 26rpx; color: var(--text-primary, #3D2316); font-weight: 500; }
	.date-separator { font-size: 26rpx; color: var(--text-tertiary, #A98B78); }

	.stats-scroll { flex: 1; width: 100%; padding: calc(var(--status-bar-height) + 140rpx) 0 200rpx; box-sizing: border-box; }

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