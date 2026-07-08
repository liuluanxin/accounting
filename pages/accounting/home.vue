<template>
	<view class="home-page">
		<!-- 自定义导航栏：顶部操作栏 + 周期选择器 -->
		<view class="custom-nav-bar">
			<view class="home-header">
				<view class="ledger-switch-btn" @click="showLedgerSwitch">
					<view class="icon-book-open" :style="getIconStyle('book-open')"></view>
					<text>{{ displayLedgerName || '总帐本' }}</text>
					<view class="icon-arrow-down-small" :style="getIconStyle('arrow-down')"></view>
				</view>
				<view class="bell-btn" @click="showNotifications">
					<view class="icon-bell" :style="getIconStyle('bell')"></view>
					<view class="dot"></view>
				</view>
			</view>
			<view class="period-selector" v-if="!loading && !error">
				<view class="month-nav">
					<view class="month-arrow" @click="prevMonth">
						<view class="icon-arrow-left-month" :style="getIconStyle('arrow-left')"></view>
					</view>
					<text class="month-label">{{ periodLabel }}</text>
					<view class="month-arrow" @click="nextMonth">
						<view class="icon-arrow-right-month" :style="getIconStyle('arrow-right')"></view>
					</view>
				</view>
				<view class="period-cycle">
					<view class="period-cycle-btn" @click="toggleViewMode">
						<view class="icon-refresh" :style="getIconStyle('refresh-cw')"></view>
						<text>{{ viewModeText }}</text>
					</view>
				</view>
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
				<view class="balance-card">
					<view class="gradient-strip"></view>
					<view class="card-body">
						<text class="balance-label">{{ summaryLabel }}</text>
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
							<view class="icon-pie-chart" :style="getIconStyle('pie-chart')"></view>
							<text class="budget-card-title">{{ budgetTitle }}</text>
							<view class="budget-card-arrow">
								<view class="icon-arrow-right-budget" :style="getIconStyle('arrow-right')"></view>
							</view>
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
						<view class="icon-help-circle" :style="getIconStyle('help-circle')"></view>
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
						<view v-for="group in groupedTxs.slice(0, 5)" :key="group.date" class="tx-group">
							<view class="tx-date-header" @click="toggleGroup(group.date)">
								<text class="tx-date-label">{{ group.label }}</text>
								<view class="tx-date-right">
									<text class="tx-date-summary">收 ¥{{ formatMoney(group.income) }} 支 ¥{{ formatMoney(group.expense) }}</text>
									<view class="tx-collapse-arrow" :class="{ collapsed: collapsedDates[group.date] }">
										<view class="icon-arrow-down-date" :style="getIconStyle('arrow-down')"></view>
									</view>
								</view>
							</view>
							<view v-for="tx in group.txs" :key="tx.id" class="tx-item" v-if="!collapsedDates[group.date]">
								<text class="tx-emoji">{{ getCategoryEmoji(tx.category) }}</text>
								<view class="tx-info">
									<text class="tx-title">{{ tx.note || getCategoryName(tx.category) }}</text>
									<text class="tx-time">{{ tx.time || '' }}</text>
									<text v-if="tx.note && tx.note !== getCategoryName(tx.category)" class="tx-note">📝 {{ tx.note }}</text>
								</view>
								<view class="tx-right">
									<text class="tx-amount" :class="tx.type === 'income' ? 'income' : 'expense'">
										{{ tx.type === 'income' ? '+' : '-' }}¥{{ formatMoney(tx.amount || 0) }}
									</text>
									<text v-if="getAccountName(tx.accountId)" class="tx-account">{{ getAccountIcon(tx.accountId) }} {{ getAccountName(tx.accountId) }}</text>
								</view>
							</view>
						</view>
					</template>
				</view>

				<view style="height: 240rpx;"></view>
			</template>
		</scroll-view>

		<!-- 账本切换弹窗 -->
		<view class="ledger-overlay" v-if="showLedgerModal" @click="closeLedgerModal">
			<view class="ledger-dropdown" @click.stop>
				<view class="ledger-dropdown-arrow"></view>
				<view class="ledger-dropdown-list">
					<view class="ledger-dropdown-item ledger-all-item"
						:class="{ current: isAllLedgersMode }"
						@click="selectAllLedgers">
						<text class="ledger-dropdown-name">📚 总帐本</text>
						<text v-if="isAllLedgersMode" class="ledger-check">✓</text>
					</view>
					<view class="ledger-dropdown-divider"></view>
					<view v-for="ledger in data.ledgers" :key="ledger.id"
						class="ledger-dropdown-item"
						:class="{ current: !isAllLedgersMode && currentLedgerId === ledger.id }"
						@click="selectLedger(ledger.id)">
						<text class="ledger-dropdown-name">{{ ledger.name }}</text>
						<text v-if="!isAllLedgersMode && currentLedgerId === ledger.id" class="ledger-check">✓</text>
					</view>
				</view>
				<view class="ledger-dropdown-divider"></view>
				<view class="ledger-dropdown-item ledger-new-item" @click="createNewLedger">
					<text class="ledger-new-text">+ 新建账本</text>
				</view>
			</view>
		</view>

		<view class="fab-btn" @click="goRecord">
			<view class="fab-icon" :style="getIconStyle('fab-add')"></view>
		</view>

		<TabBar currentTab="home" :showFab="true" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney, todayStr, CAT_ICONS } from '@/common/accounting-utils.js'
	import Logger from '@/common/logger.js'
	import TabBar from '@/components/TabBar.vue'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

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
		mixins: [themeMixin],
		components: { TabBar },
		data() {
			const now = new Date()
			return {
				homeYear: now.getFullYear(),
				homeMonth: now.getMonth() + 1,
				homeViewMode: 'month',
				homeWeek: getWeekNumber(now),
				collapsedDates: {},
				showLedgerModal: false,
				iconMap: ICONS
			}
		},
		computed: {
			...mapState('accounting', ['data', 'loading', 'error', 'initialized', 'homeLoading', 'homeLedgerMode']),
			isAllLedgersMode() {
				return this.homeLedgerMode === 'all'
			},
			currentLedgerId() {
				const l = this.data.ledgers.find(l => l.current)
				return l ? l.id : null
			},
			displayLedgerName() {
				if (this.isAllLedgersMode) return '总帐本'
				const l = this.data.ledgers.find(l => l.current)
				return l ? l.name : ''
			},
			viewModeText() {
				const map = { week: '按周显示', month: '按月显示', year: '按年显示' }
				return map[this.homeViewMode] || '按月显示'
			},
			emptyViewText() {
				const map = { week: '本周暂无账单记录', month: '本月暂无账单记录', year: '今年暂无账单记录' }
				return map[this.homeViewMode] || '暂无账单记录'
			},
			periodLabel() {
				if (this.homeViewMode === 'year') {
					return this.homeYear + '年'
				} else if (this.homeViewMode === 'week') {
					return this.homeYear + '年 第' + this.homeWeek + '周'
				}
				return this.homeYear + '年' + this.homeMonth + '月'
			},
			summaryLabel() {
				const map = { week: '本周结余', month: '本月结余', year: '今年结余' }
				return map[this.homeViewMode] || '本月结余'
			},
			budgetTitle() {
				if (this.homeViewMode === 'year') return '今年预算'
				return '本月预算'
			},
			// 按账本过滤后的交易
			ledgerFilteredTxs() {
				const txs = this.data.transactions || []
				if (this.isAllLedgersMode) return txs
				const currentL = this.data.ledgers.find(l => l.current)
				if (!currentL) return txs
				return txs.filter(t => !t.ledgerId || t.ledgerId === currentL.id)
			},
			monthTxs() {
				const p = this.homeYear + '-' + String(this.homeMonth).padStart(2, '0')
				return this.ledgerFilteredTxs.filter(t => t.date && t.date.indexOf(p) === 0)
			},
			viewTxs() {
				if (this.homeViewMode === 'week') {
					const start = weekStartDate(this.homeYear, this.homeWeek)
					const end = new Date(start)
					end.setDate(end.getDate() + 6)
					end.setHours(23, 59, 59, 999)
					return this.ledgerFilteredTxs.filter(t => {
						if (!t.date) return false
						const d = new Date(t.date)
						return d >= start && d <= end
					})
				} else if (this.homeViewMode === 'year') {
					const prefix = String(this.homeYear)
					return this.ledgerFilteredTxs.filter(t => t.date && t.date.startsWith(prefix))
				}
				return this.monthTxs
			},
			summary() {
				let inc = 0, exp = 0
				this.viewTxs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
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
				const groups = {}
				this.viewTxs.forEach(t => {
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
			}
		},
		onLoad() {
			if (!this.initialized) this.initData()
		},
		methods: {
			getIconStyle(iconName) {
				const iconUri = ICONS[iconName] || ''
				return {
					'mask-image': 'url(' + iconUri + ')',
					'-webkit-mask-image': 'url(' + iconUri + ')'
				}
			},
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
			getAccountIcon(id) {
				const a = this.data.accounts.find(a => a.id === id)
				return a ? (a.icon || '💳') : ''
			},
			getCategoryName(cat) {
				if (!cat) return '其他'
				return cat
			},
			getCategoryEmoji(cat) {
				return CAT_ICONS[cat] || '📦'
			},
			toggleViewMode() {
				const order = ['week', 'month', 'year']
				const idx = order.indexOf(this.homeViewMode)
				this.homeViewMode = order[(idx + 1) % 3]
			},
			prevMonth() {
				if (this.homeViewMode === 'week') {
					this.homeWeek--
					if (this.homeWeek < 1) { this.homeWeek = 52; this.homeYear-- }
				} else if (this.homeViewMode === 'year') {
					this.homeYear--
				} else {
					if (this.homeMonth === 1) { this.homeMonth = 12; this.homeYear-- }
					else this.homeMonth--
				}
			},
			nextMonth() {
				if (this.homeViewMode === 'week') {
					this.homeWeek++
					if (this.homeWeek > 52) { this.homeWeek = 1; this.homeYear++ }
				} else if (this.homeViewMode === 'year') {
					this.homeYear++
				} else {
					if (this.homeMonth === 12) { this.homeMonth = 1; this.homeYear++ }
					else this.homeMonth++
				}
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
				this.showLedgerModal = true
			},
			closeLedgerModal() {
				this.showLedgerModal = false
			},
			selectAllLedgers() {
				this.showLedgerModal = false
				this.$store.dispatch('accounting/setHomeViewMode', 'all')
				uni.showToast({ title: '已切换到总帐本', icon: 'none' })
			},
			async selectLedger(id) {
				this.showLedgerModal = false
				await this.$store.dispatch('accounting/switchLedger', id)
				this.$store.dispatch('accounting/setHomeViewMode', id)
				uni.showToast({ title: '账本已切换', icon: 'none' })
			},
			createNewLedger() {
				this.showLedgerModal = false
				uni.navigateTo({ url: '/pages/accounting/ledgers' })
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
	.home-page { height: 100vh; width: 100%; background: var(--bg, #FFF9F5); display: flex; flex-direction: column; box-sizing: border-box; overflow-x: hidden; position: relative; }
	.custom-nav-bar { position: sticky; top: 0; z-index: 10; background: var(--bg, #FFF9F5); padding-bottom: 16rpx; flex-shrink: 0; }
	.home-header { padding: calc(var(--status-bar-height) + 24rpx) 40rpx 0; background: var(--bg, #FFF9F5); flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; }
	.ledger-switch-btn { display: flex; align-items: center; gap: 12rpx; color: var(--text-primary, #3D2316); font-weight: 600; font-size: 32rpx; }
	.bell-btn { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); box-shadow: 0 2rpx 4rpx rgba(61, 35, 22, 0.04); display: flex; align-items: center; justify-content: center; color: var(--text-secondary, #7A5C4A); position: relative; flex-shrink: 0; }
	.bell-btn .dot { position: absolute; top: 16rpx; right: 18rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--primary, #E8734A); border: 4rpx solid var(--card-bg, #FFFFFF); }
	.home-scroll { flex: 1; width: 100%; padding: 8rpx 20rpx 0; box-sizing: border-box; }

	.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 40rpx; }
	.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
	.state-text { font-size: 28rpx; color: var(--text-secondary, #7A5C4A); text-align: center; }
	.state-hint { font-size: 24rpx; color: var(--text-tertiary, #A98B78); margin-top: 16rpx; }
	.loading-spinner { width: 60rpx; height: 60rpx; border: 4rpx solid rgba(232, 115, 74, 0.2); border-top-color: var(--primary, #E8734A); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24rpx; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.period-selector { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 0; }
	.month-nav { display: flex; align-items: center; gap: 24rpx; }
	.month-arrow { width: 64rpx; height: 64rpx; border-radius: 50%; border: 1px solid var(--border, #F0E4DA); background: var(--card-bg, #FFFFFF); display: flex; align-items: center; justify-content: center; color: var(--text-secondary, #7A5C4A); }
	.month-arrow:active { background: var(--border, #F5EDE6); }
	.month-label { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #3D2316); min-width: 180rpx; text-align: center; }
	.period-cycle { display: flex; align-items: center; }
	.period-cycle-btn { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 24rpx; background: var(--card-bg, #FFFFFF); border: 1px solid var(--border, #F0E4DA); border-radius: 40rpx; color: var(--text-secondary, #7A5C4A); font-size: 24rpx; font-weight: 500; }
	.period-cycle-btn:active { border-color: var(--primary, #E8734A); color: var(--primary, #E8734A); }

	.balance-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06); overflow: hidden; position: relative; margin-bottom: 40rpx; }
	.balance-card .gradient-strip { height: 20rpx; background: linear-gradient(135deg, var(--primary, #E8734A), var(--primary-shadow, rgba(232, 115, 74, 0.3))); }
	.balance-card .card-body { padding: 25rpx 48rpx; }
	.balance-card .balance-label { font-size: 28rpx; color: var(--text-tertiary, #A98B78); margin-bottom: 8rpx; }
	.balance-card .balance-amount { font-size: 72rpx; font-weight: 700; color: var(--primary, #E8734A); line-height: 1.25; margin-bottom: 40rpx; }
	.balance-card .summary-row { display: flex; gap: 48rpx; }
	.balance-card .summary-item { flex: 1; display: flex; flex-direction: column; }
	.balance-card .summary-item .label { font-size: 22rpx; color: var(--text-tertiary, #A98B78); margin-bottom: 4rpx; }
	.balance-card .summary-item .amount { font-size: 30rpx; font-weight: 600; }
	.balance-card .summary-item .amount.income { color: var(--income, #4CAF50); }
	.balance-card .summary-item .amount.expense { color: var(--primary, #E8734A); }

	.budget-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); padding: 40rpx; margin-bottom: 40rpx; }
	.budget-card-header { margin-bottom: 24rpx; }
	.budget-card-title-row { display: flex; align-items: center; gap: 16rpx; color: var(--text-primary, #3D2316); }
	.budget-card-title { font-size: 32rpx; font-weight: 600; flex: 1; }
	.budget-card-arrow { color: var(--text-tertiary, #A98B78); }
	.budget-progress-row { display: flex; align-items: center; gap: 24rpx; margin-bottom: 32rpx; }
	.budget-progress-bar { flex: 1; height: 16rpx; background: var(--border, #F5EDE6); border-radius: 40rpx; overflow: hidden; }
	.budget-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary-shadow, rgba(242, 149, 110, 0.5)), var(--primary, #E8734A)); border-radius: 40rpx; }
	.budget-progress-label { font-size: 24rpx; font-weight: 500; color: var(--primary, #E8734A); white-space: nowrap; }
	.budget-stats-grid { display: flex; align-items: center; justify-content: space-between; background: var(--bg, #FFF9F5); border-radius: 24rpx; padding: 32rpx 24rpx; margin-bottom: 24rpx; }
	.budget-stat { text-align: center; flex: 1; }
	.budget-stat-label { display: block; font-size: 22rpx; color: var(--text-tertiary, #A98B78); margin-bottom: 8rpx; }
	.budget-stat-value { display: block; font-size: 32rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
	.budget-stat-value.remaining { color: var(--expense, #4CAF50); }
	.budget-stat-value.daily { color: var(--text-primary, #3D2316); }
	.budget-stat-value.today-avail { color: var(--primary, #E8734A); }
	.budget-stat-divider { width: 1px; height: 64rpx; background: var(--border, #F0E4DA); flex-shrink: 0; }
	.budget-tip { display: flex; align-items: flex-start; gap: 16rpx; padding: 24rpx; background: rgba(232, 115, 74, 0.08); border-radius: 24rpx; font-size: 24rpx; color: var(--text-secondary, #7A5C4A); line-height: 1.5; }

	.recent-card { margin: 0; background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); overflow: hidden; }
	.recent-card .card-header { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 40rpx; border-bottom: 1px solid var(--border, #F0E4DA); }
	.recent-card .card-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #3D2316); }
	.recent-card .card-link { font-size: 24rpx; color: var(--text-tertiary, #A98B78); }

	.tx-group:not(:last-child) { border-bottom: 1px solid var(--border, #F0E4DA); }
	.tx-date-header { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 40rpx 12rpx; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
	.tx-date-label { font-size: 26rpx; font-weight: 600; color: var(--text-secondary, #7A5C4A); }
	.tx-date-right { display: flex; align-items: center; gap: 12rpx; }
	.tx-date-summary { font-size: 22rpx; color: var(--text-tertiary, #A98B78); }
	.tx-collapse-arrow { width: 36rpx; height: 36rpx; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; flex-shrink: 0; }
	.tx-collapse-arrow.collapsed { transform: rotate(-90deg); }
	.icon-arrow-down-date { width: 28rpx; height: 28rpx; background-color: var(--text-tertiary, #A98B78); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }

	.tx-item { display: flex; align-items: center; gap: 24rpx; padding: 24rpx 40rpx; }
	.tx-item:last-child { padding-bottom: 32rpx; }
	.tx-item:active { background: var(--border, #F5EDE6); }
	.tx-item .tx-emoji { width: 80rpx; height: 80rpx; border-radius: 24rpx; background: var(--border, #F5EDE6); display: flex; align-items: center; justify-content: center; font-size: 36rpx; flex-shrink: 0; }
	.tx-item .tx-info { flex: 1; display: flex; flex-direction: column; gap: 4rpx; min-width: 0; }
	.tx-item .tx-title { font-size: 32rpx; font-weight: 500; color: var(--text-primary, #3D2316); }
	.tx-item .tx-time { font-size: 24rpx; color: var(--text-tertiary, #A98B78); }
	.tx-item .tx-note { font-size: 24rpx; color: var(--text-secondary, #8B6F5C); background: rgba(232, 115, 74, 0.06); padding: 6rpx 12rpx; border-radius: 8rpx; margin-top: 6rpx; line-height: 1.4; }
	.tx-item .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4rpx; flex-shrink: 0; }
	.tx-item .tx-amount { font-size: 32rpx; font-weight: 600; white-space: nowrap; }
	.tx-item .tx-amount.income { color: var(--income, #4CAF50); }
	.tx-item .tx-amount.expense { color: var(--text-primary, #3D2316); }
	.tx-item .tx-account { font-size: 22rpx; color: var(--text-tertiary, #A98B78); white-space: nowrap; }

	/* 账本切换下拉菜单 */
	.ledger-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: transparent; z-index: 100; }
	.ledger-dropdown { position: absolute; top: calc(var(--status-bar-height) + 90rpx); left: 40rpx; min-width: 280rpx; background: var(--card-bg, #FFFFFF); border-radius: 24rpx; box-shadow: 0 8rpx 32rpx rgba(61,35,22,0.12); }
	.ledger-dropdown-arrow { position: absolute; top: -12rpx; left: 48rpx; width: 0; height: 0; border-left: 14rpx solid transparent; border-right: 14rpx solid transparent; border-bottom: 14rpx solid var(--card-bg, #FFFFFF); filter: drop-shadow(0 -4rpx 4rpx rgba(61,35,22,0.04)); }
	.ledger-dropdown-list { padding: 8rpx 0; }
	.ledger-dropdown-item { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 36rpx; cursor: pointer; transition: background 0.15s; min-width: 200rpx; }
	.ledger-dropdown-item:active { background: rgba(232, 115, 74, 0.06); }
	.ledger-dropdown-item.current { background: rgba(232, 115, 74, 0.06); }
	.ledger-dropdown-name { font-size: 28rpx; color: var(--text-primary, #3D2316); white-space: nowrap; }
	.ledger-dropdown-divider { height: 1px; margin: 4rpx 36rpx; border-top: 1rpx dashed var(--border, #E0D0C4); }
	.ledger-new-item { border-radius: 0 0 24rpx 24rpx; }
	.ledger-new-text { font-size: 28rpx; color: var(--primary, #E8734A); font-weight: 500; }

	.fab-btn { position: fixed; bottom: 180rpx; right: 40rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: linear-gradient(135deg, var(--primary, #E8734A), var(--primary-dark, #D65D35)); box-shadow: 0 8rpx 24rpx var(--primary-shadow, rgba(232, 115, 74, 0.35)); display: flex; align-items: center; justify-content: center; z-index: 40; border: 6rpx solid var(--card-bg, #FFFFFF); }
	.fab-btn:active { transform: scale(0.95); }
	.fab-icon { width: 44rpx; height: 44rpx; background-color: var(--card-bg, #FFFFFF); mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }

	.icon-base { mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-book-open { width: 36rpx; height: 36rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-arrow-down-small { width: 28rpx; height: 28rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-bell { width: 40rpx; height: 40rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-arrow-left-month { width: 32rpx; height: 32rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-arrow-right-month { width: 32rpx; height: 32rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-refresh { width: 28rpx; height: 28rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-pie-chart { width: 36rpx; height: 36rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-arrow-right-budget { width: 28rpx; height: 28rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.icon-help-circle { width: 28rpx; height: 28rpx; background-color: currentColor; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; flex-shrink: 0; }
</style>