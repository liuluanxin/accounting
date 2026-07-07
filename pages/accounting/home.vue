<template>
	<view class="home-page">
		<view class="home-header">
			<view class="ledger-switch-btn" @click="showLedgerSwitch">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<text>{{ currentLedgerName || '日常账本' }}</text>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</view>
			<view class="bell-btn" @click="showNotifications">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<view class="dot"></view>
			</view>
		</view>

		<scroll-view scroll-y class="home-scroll">
			<view v-if="loading" class="state-container">
				<view class="loading-spinner"></view>
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="error" class="state-container">
				<text class="state-icon">⚠️</text>
				<text class="state-text">{{ error }}</text>
				<view class="btn-secondary" @click="initData" style="margin-top: 32rpx;">重试</view>
			</view>

			<template v-else>
				<view class="period-selector">
					<view class="month-nav">
						<view class="month-arrow" @click="prevMonth">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</view>
						<text class="month-label">{{ homeYear }}年{{ homeMonth }}月</text>
						<view class="month-arrow" @click="nextMonth">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</view>
					</view>
					<view class="period-cycle">
						<view class="period-cycle-btn" @click="toggleViewMode">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M3 12a9 9 0 019-9 9 9 0 019 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
								<path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							</svg>
							<text>{{ viewModeText }}</text>
						</view>
					</view>
				</view>

				<view class="balance-card">
					<view class="gradient-strip"></view>
					<view class="card-body">
						<text class="balance-label">本月结余</text>
						<text class="balance-amount">¥{{ formatMoney(summary.balance) }}</text>
						<view class="summary-row">
							<view class="summary-item">
								<text class="label">收入</text>
								<text class="amount income">¥{{ formatMoney(summary.income) }}</text>
							</view>
							<view class="summary-item">
								<text class="label">支出</text>
								<text class="amount expense">¥{{ formatMoney(summary.expense) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="budget-card" @click="goBudgetPage">
					<view class="budget-card-header">
						<view class="budget-card-title-row">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M21.21 15.89A10 10 0 118 2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M22 12A10 10 0 0012 2v10z" fill="currentColor"/>
							</svg>
							<text class="budget-card-title">本月预算</text>
							<text class="budget-card-arrow">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</text>
						</view>
					</view>
					<view class="budget-progress-row">
						<view class="budget-progress-bar">
							<view class="budget-progress-fill" :style="{ width: budgetPercent + '%' }"></view>
						</view>
						<text class="budget-progress-label">已用 {{ budgetPercent.toFixed(0) }}%</text>
					</view>
					<view class="budget-stats-grid">
						<view class="budget-stat">
							<text class="budget-stat-label">剩余额度</text>
							<text class="budget-stat-value remaining">¥{{ formatMoney(budgetRemain) }}</text>
						</view>
						<view class="budget-stat-divider"></view>
						<view class="budget-stat">
							<text class="budget-stat-label">每日预算</text>
							<text class="budget-stat-value daily">¥{{ formatMoney(dailyBudget) }}</text>
						</view>
						<view class="budget-stat-divider"></view>
						<view class="budget-stat">
							<text class="budget-stat-label">今日可用</text>
							<text class="budget-stat-value today-avail">¥{{ formatMoney(todayAvailable) }}</text>
						</view>
					</view>
					<view class="budget-tip">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2a7 7 0 017 7c0 3-2 4.5-3 6-.5.67-1 1.5-1 3h-2c0-2 .5-2.83 1-3.5 1-1.17 2-2.17 2-4.5a5 5 0 00-10 0c0 .56.09 1.1.25 1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<circle cx="12" cy="22" r="1" fill="currentColor"/>
						</svg>
						<text>{{ budgetTipText }}</text>
					</view>
				</view>

				<view class="recent-card">
					<view class="card-header">
						<text class="card-title">近期账单</text>
						<text class="card-link" @click="goAllTransactions">查看全部 ></text>
					</view>

					<view v-if="homeLoading" class="state-container">
						<view class="loading-spinner"></view>
					</view>

					<view v-else-if="groupedTxs.length === 0" class="state-container">
						<text class="state-icon">📭</text>
						<text class="state-text">{{ emptyViewText }}</text>
						<text class="state-hint">点击右下角 + 按钮开始记账</text>
					</view>

					<template v-else>
						<view v-for="group in groupedTxs.slice(0, 5)" :key="group.date" class="tx-item">
							<text class="tx-emoji">{{ getCategoryEmoji(group.txs[0]?.category) }}</text>
							<view class="tx-info">
								<text class="tx-title">{{ group.txs[0]?.note || getCategoryName(group.txs[0]?.category) }}</text>
								<text class="tx-time">{{ group.label }} {{ group.txs[0]?.time || '' }}</text>
							</view>
							<text class="tx-amount" :class="group.txs[0]?.type === 'income' ? 'income' : 'expense'">
								{{ group.txs[0]?.type === 'income' ? '+' : '-' }}¥{{ formatMoney(group.txs[0]?.amount || 0) }}
							</text>
						</view>
					</template>
				</view>

				<view style="height: 240rpx;"></view>
			</template>
		</scroll-view>

		<view class="fab-btn" @click="goRecord">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 5v14M5 12h14" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
			</svg>
		</view>

		<TabBar currentTab="home" :showFab="true" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney, todayStr } from '@/common/accounting-utils.js'
	import Logger from '@/common/logger.js'
	import TabBar from '@/components/TabBar.vue'

	function getWeekNumber(d) {
		const date = new Date(d.valueOf())
		const dayNum = (date.getDay() + 6) % 7
		date.setDate(date.getDate() - dayNum + 3)
		const firstThursday = date.valueOf()
		date.setMonth(0, 1)
		if (date.getDay() !== 4) {
			date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7)
		}
		return 1 + Math.ceil((firstThursday - date) / 604800000)
	}
	function weekStartDate(year, week) {
		const first = new Date(year, 0, 1)
		const dayNum = (first.getDay() + 6) % 7
		return new Date(year, 0, 1 + (week - 1) * 7 - dayNum)
	}

	export default {
		components: { TabBar },
		data() {
			const now = new Date()
			return {
				homeYear: now.getFullYear(),
				homeMonth: now.getMonth() + 1,
				homeViewMode: 'month',
				homeWeek: getWeekNumber(now),
				collapsedDates: {}
			}
		},
		computed: {
			...mapState('accounting', ['data', 'loading', 'error', 'initialized', 'homeLoading']),
			viewModeText() {
				const map = { week: '按周显示', month: '按月显示', year: '按年显示' }
				return map[this.homeViewMode] || '按月显示'
			},
			emptyViewText() {
				const map = { week: '本周暂无账单记录', month: '本月暂无账单记录', year: '今年暂无账单记录' }
				return map[this.homeViewMode] || '暂无账单记录'
			},
			monthTxs() {
				const p = this.homeYear + '-' + String(this.homeMonth).padStart(2, '0')
				return this.data.transactions.filter(t => t.date && t.date.indexOf(p) === 0)
			},
			summary() {
				let inc = 0, exp = 0
				this.monthTxs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
				return { income: inc, expense: exp, balance: inc - exp }
			},
			budgetTotal() {
				const key = this.homeYear + '-' + String(this.homeMonth).padStart(2, '0')
				const b = this.data.budgets[key]
				return b ? b.total : 0
			},
			budgetPercent() {
				return this.budgetTotal > 0 ? Math.min(100, this.summary.expense / this.budgetTotal * 100) : 0
			},
			budgetRemain() {
				return Math.max(0, this.budgetTotal - this.summary.expense)
			},
			dailyBudget() {
				if (this.budgetTotal <= 0) return 0
				const daysInMonth = new Date(this.homeYear, this.homeMonth, 0).getDate()
				return this.budgetRemain / daysInMonth
			},
			todayAvailable() {
				return this.dailyBudget - this.todayExpense
			},
			todayExpense() {
				const today = todayStr()
				return this.monthTxs.filter(t => t.date === today && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
			},
			budgetTipText() {
				const todayExp = this.todayExpense
				if (todayExp > 0) {
					return `今日已花费 ¥${formatMoney(todayExp)}，还剩 ¥${formatMoney(this.todayAvailable)} 可用，注意控制支出`
				}
				return '今日暂无支出，继续保持'
			},
			groupedTxs() {
				let filtered = []
				if (this.homeViewMode === 'week') {
					const start = weekStartDate(this.homeYear, this.homeWeek)
					const end = new Date(start)
					end.setDate(end.getDate() + 6)
					end.setHours(23, 59, 59, 999)
					filtered = this.data.transactions.filter(t => {
						if (!t.date) return false
						const d = new Date(t.date)
						return d >= start && d <= end
					})
				} else if (this.homeViewMode === 'year') {
					const prefix = String(this.homeYear)
					filtered = this.data.transactions.filter(t => t.date && t.date.startsWith(prefix))
				} else {
					filtered = this.monthTxs
				}
				const groups = {}
				filtered.forEach(t => {
					if (!t.date) return
					if (!groups[t.date]) groups[t.date] = []
					groups[t.date].push(t)
				})
				const sorted = Object.keys(groups).sort((a, b) => b.localeCompare(a))
				const ts = todayStr()
				const yd = new Date(); yd.setDate(yd.getDate() - 1)
				const ys = yd.toISOString().slice(0, 10)
				return sorted.map(date => {
					const txs = groups[date].sort((a, b) => (b.time || '').localeCompare(a.time || ''))
					let inc = 0, exp = 0
					txs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
					return { date, label: date === ts ? '今天' : date === ys ? '昨天' : date, txs, income: inc, expense: exp }
				})
			},
			currentLedgerName() {
				const l = this.data.ledgers.find(l => l.current)
				return l ? l.name : ''
			}
		},
		onLoad() {
			if (!this.initialized) this.initData()
		},
		methods: {
			formatMoney,
			toggleGroup(date) {
				this.collapsedDates = { ...this.collapsedDates, [date]: !this.collapsedDates[date] }
			},
			async initData() {
				await this.$store.dispatch('accounting/initialize')
			},
			getAccountName(id) {
				const a = this.data.accounts.find(a => a.id === id)
				return a ? a.name : ''
			},
			getCategoryName(cat) {
				if (!cat) return '其他'
				const map = {
					food: '餐饮', transport: '交通', shopping: '购物', entertainment: '娱乐',
					medical: '医疗', education: '教育', housing: '住房', salary: '工资',
					bonus: '奖金', investment: '投资', other: '其他'
				}
				return map[cat] || cat
			},
			getCategoryEmoji(cat) {
				if (!cat) return '📦'
				const map = {
					food: '🍜', transport: '🚇', shopping: '🛒', entertainment: '🎮',
					medical: '💊', education: '📚', housing: '🏠', salary: '💰',
					bonus: '🎁', investment: '📈', other: '📦'
				}
				return map[cat] || '📦'
			},
			toggleViewMode() {
				const order = ['week', 'month', 'year']
				const idx = order.indexOf(this.homeViewMode)
				this.homeViewMode = order[(idx + 1) % 3]
				const now = new Date()
				this.homeYear = now.getFullYear()
				this.homeMonth = now.getMonth() + 1
				this.homeWeek = getWeekNumber(now)
				this.$store.dispatch('accounting/fetchDashboard', { year: this.homeYear, month: this.homeMonth })
			},
			prevMonth() {
				if (this.homeMonth === 1) { this.homeMonth = 12; this.homeYear-- }
				else this.homeMonth--
				this.homeWeek = getWeekNumber(new Date(this.homeYear, this.homeMonth - 1, 1))
				this.homeViewMode = 'month'
				this.$store.dispatch('accounting/fetchDashboard', { year: this.homeYear, month: this.homeMonth })
			},
			nextMonth() {
				if (this.homeMonth === 12) { this.homeMonth = 1; this.homeYear++ }
				else this.homeMonth++
				this.homeWeek = getWeekNumber(new Date(this.homeYear, this.homeMonth - 1, 1))
				this.homeViewMode = 'month'
				this.$store.dispatch('accounting/fetchDashboard', { year: this.homeYear, month: this.homeMonth })
			},
			goRecord() { uni.navigateTo({ url: '/pages/accounting/record' }) },
			goBudgetPage() {
				uni.navigateTo({
					url: '/pages/accounting/budget',
					success: () => { Logger.info('Home', '跳转预算页面成功') },
					fail: (err) => {
						Logger.error('Home', '跳转预算页面失败', err)
						uni.showToast({ title: '页面跳转失败', icon: 'none' })
					}
				})
			},
			goLedgerPage() {
				uni.navigateTo({ url: '/pages/accounting/ledgers' })
			},
			goAllTransactions() {
				uni.navigateTo({ url: '/pages/accounting/all-transactions' })
			},
			switchTab(page) { uni.redirectTo({ url: '/pages/accounting/' + page }) },
			async showLedgerSwitch() {
				if (this.data.ledgers.length === 0) { uni.showToast({ title: '暂无账本', icon: 'none' }); return }
				const items = this.data.ledgers.map(l => l.name)
				uni.showActionSheet({
					itemList: items,
					success: async (res) => {
						const id = this.data.ledgers[res.tapIndex].id
						await this.$store.dispatch('accounting/switchLedger', id)
						uni.showToast({ title: '账本已切换', icon: 'none' })
					}
				})
			},
			showNotifications() {
				uni.showToast({ title: '暂无新通知', icon: 'none' })
			},
			showSmartAssistant() {
				uni.navigateTo({ url: '/pages/accounting/smart-assistant' })
			},
			showHomeMore() {
				uni.showActionSheet({
					itemList: ['全部账单', '智能助手', '导出台账', '预算设置'],
					success: (res) => {
						if (res.tapIndex === 0) uni.navigateTo({ url: '/pages/accounting/all-transactions' })
						else if (res.tapIndex === 1) uni.navigateTo({ url: '/pages/accounting/smart-assistant' })
						else if (res.tapIndex === 2) this.exportLedgerCSV()
						else if (res.tapIndex === 3) this.showBudgetSettings()
					}
				})
			},
			exportLedgerCSV() {
				const ledgers = this.data.ledgers || []
				if (ledgers.length === 0) {
					uni.showToast({ title: '暂无账本', icon: 'none' })
					return
				}
				const items = ledgers.map(l => l.name + (l.current ? ' (当前)' : ''))
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const ledger = ledgers[res.tapIndex]
						const txs = (this.data.transactions || []).filter(t => !ledger.id || t.ledgerId === ledger.id || ledger.current)
						if (txs.length === 0) {
							uni.showToast({ title: '此账本暂无账单', icon: 'none' })
							return
						}
						const csv = transactionsToCSV(txs)
						const filename = `宇宙记账_${ledger.name}_${new Date().toISOString().slice(0, 10)}.csv`
						const r = exportCSV(filename, csv)
						if (r.platform === 'app-plus') {
							uni.showModal({
								title: '💾 导出成功',
								content: `账本「${ledger.name}」共 ${txs.length} 条账单\n\nCSV 已生成（演示模式）`,
								showCancel: false
							})
						} else if (r.success) {
							uni.showToast({ title: '已导出 ✅', icon: 'success' })
						} else {
							uni.showToast({ title: '导出失败', icon: 'none' })
						}
					}
				})
			},
			showBudgetSettings() {
				const key = this.homeYear + '-' + String(this.homeMonth).padStart(2, '0')
				const b = this.data.budgets[key]
				uni.showModal({
					title: '💰 预算设置',
					editable: true,
					placeholderText: b ? String(b.total) : '1500',
					success: async (res) => {
						if (res.confirm && res.content) {
							const val = parseFloat(res.content)
							if (val > 0) {
								const r = await this.$store.dispatch('accounting/saveBudget', { year: this.homeYear, month: this.homeMonth, total: val })
								uni.showToast({ title: r.success ? '预算已更新' : r.message, icon: 'none' })
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home-page { height: 100vh; width: 100%; background: #FFF9F5; display: flex; flex-direction: column; box-sizing: border-box; overflow-x: hidden; }
	.home-header { padding: calc(var(--status-bar-height) + 24rpx) 40rpx 0; background: #FFF9F5; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; }
	.ledger-switch-btn { display: flex; align-items: center; gap: 12rpx; color: #3D2316; font-weight: 600; font-size: 32rpx; }
	.bell-btn { width: 80rpx; height: 80rpx; border-radius: 50%; background: #FFFFFF; box-shadow: 0 2rpx 4rpx rgba(61, 35, 22, 0.04); display: flex; align-items: center; justify-content: center; color: #7A5C4A; position: relative; flex-shrink: 0; }
	.bell-btn .dot { position: absolute; top: 16rpx; right: 18rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: #E8734A; border: 4rpx solid #FFFFFF; }
	.home-scroll { flex: 1; width: 100%; padding: 0 40rpx; box-sizing: border-box; }

	.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 40rpx; }
	.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
	.state-text { font-size: 28rpx; color: #7A5C4A; text-align: center; }
	.state-hint { font-size: 24rpx; color: #A98B78; margin-top: 16rpx; }
	.loading-spinner { width: 60rpx; height: 60rpx; border: 4rpx solid rgba(232, 115, 74, 0.2); border-top-color: #E8734A; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24rpx; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.period-selector { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 40rpx; }
	.month-nav { display: flex; align-items: center; gap: 24rpx; }
	.month-arrow { width: 64rpx; height: 64rpx; border-radius: 50%; border: 1px solid #F0E4DA; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: #7A5C4A; }
	.month-arrow:active { background: #F5EDE6; }
	.month-label { font-size: 32rpx; font-weight: 600; color: #3D2316; min-width: 180rpx; text-align: center; }
	.period-cycle { display: flex; align-items: center; }
	.period-cycle-btn { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 24rpx; background: #FFFFFF; border: 1px solid #F0E4DA; border-radius: 40rpx; color: #7A5C4A; font-size: 24rpx; font-weight: 500; }
	.period-cycle-btn:active { border-color: #E8734A; color: #E8734A; }

	.balance-card { margin: 16rpx 40rpx; background: #FFFFFF; border-radius: 32rpx; box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06); overflow: hidden; position: relative; }
	.balance-card .gradient-strip { height: 12rpx; background: linear-gradient(135deg, #E8734A, #F2956E); }
	.balance-card .card-body { padding: 40rpx 48rpx; }
	.balance-card .balance-label { font-size: 28rpx; color: #A98B78; margin-bottom: 8rpx; }
	.balance-card .balance-amount { font-size: 72rpx; font-weight: 700; color: #E8734A; line-height: 1.25; margin-bottom: 40rpx; }
	.balance-card .summary-row { display: flex; gap: 48rpx; }
	.balance-card .summary-item { flex: 1; display: flex; flex-direction: column; }
	.balance-card .summary-item .label { font-size: 22rpx; color: #A98B78; margin-bottom: 4rpx; }
	.balance-card .summary-item .amount { font-size: 30rpx; font-weight: 600; }
	.balance-card .summary-item .amount.income { color: #4CAF50; }
	.balance-card .summary-item .amount.expense { color: #E8734A; }

	.budget-card { margin: 32rpx 40rpx; background: #FFFFFF; border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); padding: 40rpx; }
	.budget-card-header { margin-bottom: 24rpx; }
	.budget-card-title-row { display: flex; align-items: center; gap: 16rpx; color: #3D2316; }
	.budget-card-title { font-size: 32rpx; font-weight: 600; flex: 1; }
	.budget-card-arrow { color: #A98B78; }
	.budget-progress-row { display: flex; align-items: center; gap: 24rpx; margin-bottom: 32rpx; }
	.budget-progress-bar { flex: 1; height: 16rpx; background: #F5EDE6; border-radius: 40rpx; overflow: hidden; }
	.budget-progress-fill { height: 100%; background: linear-gradient(90deg, #F2956E, #E8734A); border-radius: 40rpx; }
	.budget-progress-label { font-size: 24rpx; font-weight: 500; color: #E8734A; white-space: nowrap; }
	.budget-stats-grid { display: flex; align-items: center; justify-content: space-between; background: #FFF9F5; border-radius: 24rpx; padding: 32rpx 24rpx; margin-bottom: 24rpx; }
	.budget-stat { text-align: center; flex: 1; }
	.budget-stat-label { display: block; font-size: 22rpx; color: #A98B78; margin-bottom: 8rpx; }
	.budget-stat-value { display: block; font-size: 32rpx; font-weight: 700; color: #3D2316; }
	.budget-stat-value.remaining { color: #4CAF50; }
	.budget-stat-value.daily { color: #3D2316; }
	.budget-stat-value.today-avail { color: #E8734A; }
	.budget-stat-divider { width: 1px; height: 64rpx; background: #F0E4DA; flex-shrink: 0; }
	.budget-tip { display: flex; align-items: flex-start; gap: 16rpx; padding: 24rpx; background: #FFF0E8; border-radius: 24rpx; font-size: 24rpx; color: #7A5C4A; line-height: 1.5; }

	.recent-card { margin: 0 40rpx; background: #FFFFFF; border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); overflow: hidden; }
	.recent-card .card-header { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 40rpx; border-bottom: 1px solid #F0E4DA; }
	.recent-card .card-title { font-size: 32rpx; font-weight: 600; color: #3D2316; }
	.recent-card .card-link { font-size: 24rpx; color: #A98B78; }

	.tx-item { display: flex; align-items: center; gap: 24rpx; padding: 32rpx 40rpx; border-bottom: 1px solid #F0E4DA; }
	.tx-item:last-child { border-bottom: none; }
	.tx-item:active { background: #F5EDE6; }
	.tx-item .tx-emoji { width: 80rpx; height: 80rpx; border-radius: 24rpx; background: #F5EDE6; display: flex; align-items: center; justify-content: center; font-size: 36rpx; flex-shrink: 0; }
	.tx-item .tx-info { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
	.tx-item .tx-title { font-size: 32rpx; font-weight: 500; color: #3D2316; }
	.tx-item .tx-time { font-size: 24rpx; color: #A98B78; }
	.tx-item .tx-amount { font-size: 32rpx; font-weight: 600; white-space: nowrap; }
	.tx-item .tx-amount.income { color: #4CAF50; }
	.tx-item .tx-amount.expense { color: #3D2316; }

	.fab-btn { position: fixed; bottom: 180rpx; right: 40rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: #E8734A; box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.35); display: flex; align-items: center; justify-content: center; z-index: 40; border: 6rpx solid #FFFFFF; }
	.fab-btn:active { transform: scale(0.95); }
</style>