<template>
	<view class="calendar-page">
		<!-- 自定义导航栏 - 文字居中 -->
		<view class="custom-nav-bar">
			<text class="nav-title">记账助手</text>
		</view>

		<scroll-view scroll-y class="cal-scroll">
			<view v-if="loading" class="state-container">
				<view class="loading-spinner"></view>
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="error" class="state-container">
				<text class="state-icon">⚠️</text>
				<text class="state-text">{{ error }}</text>
				<view class="btn-secondary" @click="reload" style="margin-top: 32rpx;">重试</view>
			</view>

			<template v-else>
				<view class="calendar-card">
					<!-- 月份标签行：嵌入日历卡片内，箭头在最外两侧 -->
					<view class="card-month-row">
						<view class="card-month-arrow" @click="prevMonth">
							<view class="icon-arrow-left-month"></view>
						</view>
						<text class="card-month-text" @click="showMonthPicker">{{ calYear }}年{{ calMonth }}月</text>
						<view class="card-month-arrow" @click="nextMonth">
							<view class="icon-arrow-right-month"></view>
						</view>
					</view>
					<view class="weekday-header">
						<text class="weekend">日</text>
						<text>一</text>
						<text>二</text>
						<text>三</text>
						<text>四</text>
						<text>五</text>
						<text class="weekend">六</text>
					</view>
					<view class="calendar-grid">
						<view v-for="i in firstDay" :key="'e' + i" class="day-cell empty"></view>
						<view v-for="d in daysInMonth" :key="d" class="day-cell"
							:class="{ today: isToday(d), active: d === calDay }"
							@click="selectDay(d)">
							<text class="day-number">{{ d }}</text>
							<view class="day-amounts">
								<text v-if="dailyData[d] && dailyData[d].expense" class="day-expense">-¥{{ fmtShort(dailyData[d].expense) }}</text>
								<text v-if="dailyData[d] && dailyData[d].income" class="day-income">+¥{{ fmtShort(dailyData[d].income) }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="day-detail-card">
					<view class="day-detail-header">
						<text class="day-detail-title">{{ calMonth }}月{{ calDay }}日 {{ getWeekday(calDay) }}</text>
						<view class="day-detail-summary">
							<text class="expense-val">支出 ¥{{ getDayExpense().toFixed(2) }}</text>
							<text class="summary-divider">|</text>
							<text class="income-val">收入 ¥{{ getDayIncome().toFixed(2) }}</text>
						</view>
					</view>

					<view v-if="dayTxList.length === 0" class="empty-tx">当天没有账单记录</view>
					<view v-else>
						<view v-for="tx in dayTxList" :key="tx.id" class="transaction-item">
							<view class="tx-emoji">{{ getCategoryEmoji(tx.category) }}</view>
							<view class="tx-info">
								<text class="tx-title">{{ tx.note || tx.category }}</text>
								<text class="tx-category">{{ tx.category }}</text>
							</view>
							<text class="tx-amount" :class="tx.type">{{ tx.type === 'income' ? '+' : '-' }}¥{{ tx.amount.toFixed(2) }}</text>
						</view>
						<view class="goto-bills" @click="goToBills">查看账单详情</view>
					</view>
				</view>

				<view style="height: 200rpx;"></view>
			</template>
		</scroll-view>

		<TabBar currentTab="calendar" :showFab="false" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { WEEKDAYS, CAT_ICONS } from '@/common/accounting-utils.js'
	import TabBar from '@/components/TabBar.vue'

	export default {
		components: { TabBar },
		data() {
			const now = new Date()
			return {
				calYear: now.getFullYear(),
				calMonth: now.getMonth() + 1,
				calDay: now.getDate(),
				weekdays: WEEKDAYS,
				today: now
			}
		},
		computed: {
			...mapState('accounting', ['data', 'loading', 'error', 'initialized']),
			firstDay() { return new Date(this.calYear, this.calMonth - 1, 1).getDay() },
			daysInMonth() { return new Date(this.calYear, this.calMonth, 0).getDate() },
			isCurrent() { return this.calYear === this.today.getFullYear() && this.calMonth === this.today.getMonth() + 1 },
			currentDay() { return this.today.getDate() },
			dailyData() {
				const p = this.calYear + '-' + String(this.calMonth).padStart(2, '0')
				const map = {}
				this.data.transactions.filter(t => t.date && t.date.indexOf(p) === 0).forEach(t => {
					const d = parseInt(t.date.split('-')[2], 10)
					if (!map[d]) map[d] = { income: 0, expense: 0 }
					if (t.type === 'income') map[d].income += t.amount
					else map[d].expense += t.amount
				})
				return map
			},
			selectedDate() {
				return this.calYear + '-' + String(this.calMonth).padStart(2, '0') + '-' + String(this.calDay).padStart(2, '0')
			},
			dayTxList() {
				return this.data.transactions.filter(t => t.date === this.selectedDate).sort((a, b) => b.time.localeCompare(a.time))
			}
		},
		onLoad() {
			if (!this.initialized) this.$store.dispatch('accounting/initialize')
		},
		methods: {
			isToday(d) { return this.isCurrent && d === this.currentDay },
			selectDay(d) { this.calDay = d },
			prevMonth() {
				if (this.calMonth === 1) { this.calMonth = 12; this.calYear-- } else this.calMonth--
				this.calDay = 1
			},
			nextMonth() {
				if (this.calMonth === 12) { this.calMonth = 1; this.calYear++ } else this.calMonth++
				this.calDay = 1
			},
			getWeekday(d) {
				const date = new Date(this.calYear, this.calMonth - 1, d)
				const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				return weekdays[date.getDay()]
			},
			getCategoryEmoji(cat) {
				return CAT_ICONS[cat] || '📦'
			},
			getDayExpense() {
				const d = this.dailyData[this.calDay]
				return d ? d.expense : 0
			},
			getDayIncome() {
				const d = this.dailyData[this.calDay]
				return d ? d.income : 0
			},
			showMonthPicker() {
				const items = []
				for (let y = this.today.getFullYear() - 2; y <= this.today.getFullYear() + 1; y++) {
					for (let m = 1; m <= 12; m++) {
						items.push(y + '年' + m + '月')
					}
				}
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const idx = res.tapIndex
						const year = this.today.getFullYear() - 2 + Math.floor(idx / 12)
						const month = (idx % 12) + 1
						this.calYear = year
						this.calMonth = month
						this.calDay = 1
					}
				})
			},
			goToBills() {
				uni.navigateTo({ url: '/pages/accounting/all-transactions' })
			},
			reload() { this.$store.dispatch('accounting/initialize') },
			fmtShort(v) {
				if (v >= 10000) return (v / 10000).toFixed(1).replace('.0', '') + 'w'
				if (v >= 1000) return (v / 1000).toFixed(1).replace('.0', '') + 'k'
				return v.toFixed(0)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.calendar-page { height: 100vh; background: #FFF9F5; box-sizing: border-box; width: 100%; overflow-x: hidden; display: flex; flex-direction: column; }

	/* 自定义导航栏 - 文字居中 */
	.custom-nav-bar { position: sticky; top: 0; z-index: 20; padding: calc(var(--status-bar-height) + 20rpx) 40rpx 16rpx; background: #FFF9F5; display: flex; align-items: center; justify-content: center; }
	.nav-title { font-size: 36rpx; font-weight: 600; color: #3D2316; }

	.cal-scroll { flex: 1; width: 100%; box-sizing: border-box; padding: 0 40rpx 140rpx; }

	/* 月份标签行 - 嵌入日历卡片顶部，箭头在最外两侧 */
	.card-month-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 2rpx solid #F0E4DA; margin: 0 -24rpx 16rpx; padding: 8rpx 0 16rpx; }
	.card-month-arrow { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; color: #7A5C4A; cursor: pointer; flex-shrink: 0; }
	.card-month-arrow:active { background: #F5EDE6; border-radius: 50%; }
	.card-month-arrow .icon-arrow-left-month, .card-month-arrow .icon-arrow-right-month { width: 32rpx; height: 32rpx; background-color: #7A5C4A; mask-size: contain; -webkit-mask-size: contain; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; }
	.card-month-arrow .icon-arrow-left-month { mask-image: url(/static/icons/arrow-left.svg); -webkit-mask-image: url(/static/icons/arrow-left.svg); }
	.card-month-arrow .icon-arrow-right-month { mask-image: url(/static/icons/arrow-right.svg); -webkit-mask-image: url(/static/icons/arrow-right.svg); }
	.card-month-text { font-size: 32rpx; font-weight: 600; color: #3D2316; cursor: pointer; white-space: nowrap; }

	.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 40rpx; }
	.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
	.state-text { font-size: 28rpx; color: #7A5C4A; text-align: center; }
	.loading-spinner { width: 60rpx; height: 60rpx; border: 4rpx solid rgba(232, 115, 74, 0.2); border-top-color: #E8734A; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24rpx; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.calendar-card { background: #FFFFFF; border-radius: 32rpx; padding: 24rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); margin-top: 16rpx; }

	.weekday-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 16rpx; }
	.weekday-header text { text-align: center; font-size: 24rpx; font-weight: 500; color: #A98B78; padding: 8rpx 0; }
	.weekday-header text.weekend { color: #E8734A; }

	.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
	.day-cell { position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 12rpx; min-height: 112rpx; cursor: pointer; border-radius: 24rpx; transition: background 0.2s; }
	.day-cell.empty { cursor: default; min-height: 112rpx; }
	.day-number { font-size: 28rpx; font-weight: 400; color: #3D2316; line-height: 1; }

	.day-cell.today { background: #E8734A; border-radius: 24rpx; }
	.day-cell.today .day-number { color: #FFFFFF; font-weight: 600; }
	.day-cell.active { background: #FDE6D4; }
	.day-cell.active .day-number { color: #E8734A; font-weight: 600; }
	.day-cell.today.active { background: #E8734A; }
	.day-cell.today.active .day-number { color: #FFFFFF; }

	.day-amounts { display: flex; flex-direction: column; align-items: center; gap: 2rpx; margin-top: 6rpx; width: 100%; }
	.day-expense { font-size: 18rpx; font-weight: 500; color: #E8734A; line-height: 1.2; }
	.day-income { font-size: 18rpx; font-weight: 500; color: #4CAF50; line-height: 1.2; }
	.day-cell.today .day-expense { color: rgba(255,255,255,0.9); }
	.day-cell.today .day-income { color: rgba(255,255,255,0.9); }

	.day-detail-card { background: #FFFFFF; border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); margin-top: 24rpx; overflow: hidden; }

	.day-detail-header { padding: 32rpx 40rpx 24rpx; border-bottom: 2rpx solid #F0E4DA; }
	.day-detail-title { font-size: 32rpx; font-weight: 600; color: #3D2316; margin-bottom: 8rpx; }
	.day-detail-summary { font-size: 24rpx; color: #A98B78; display: flex; align-items: center; gap: 12rpx; }
	.day-detail-summary .expense-val { color: #E8734A; font-weight: 500; }
	.day-detail-summary .income-val { color: #4CAF50; font-weight: 500; }
	.summary-divider { color: #E8D5C8; }

	.transaction-item { display: flex; align-items: center; padding: 28rpx 40rpx; border-bottom: 2rpx solid #F0E4DA; gap: 24rpx; }
	.transaction-item:last-child { border-bottom: none; }

	.tx-emoji { font-size: 44rpx; width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; background: #FFF9F5; border-radius: 20rpx; flex-shrink: 0; }

	.tx-info { flex: 1; min-width: 0; }
	.tx-title { font-size: 28rpx; font-weight: 500; color: #3D2316; display: block; }
	.tx-category { font-size: 22rpx; color: #A98B78; margin-top: 4rpx; display: block; }

	.tx-amount { font-size: 28rpx; font-weight: 600; flex-shrink: 0; }
	.tx-amount.expense { color: #E8734A; }
	.tx-amount.income { color: #4CAF50; }

	.empty-tx { text-align: center; padding: 60rpx 40rpx; color: #A98B78; font-size: 26rpx; }

	.goto-bills { display: block; text-align: center; padding: 28rpx 40rpx; font-size: 26rpx; color: #E8734A; font-weight: 500; border-top: 2rpx solid #F0E4DA; }

	.btn-secondary { padding: 20rpx 48rpx; background: #FDE6D4; color: #E8734A; border-radius: 50rpx; font-size: 28rpx; font-weight: 500; }

	@media (min-width: 768px) {
		.cal-scroll { max-width: 650px; margin: 0 auto; width: 100%; padding-left: 48rpx; padding-right: 48rpx; }
		.custom-nav-bar { padding: 32rpx 48rpx 16rpx; }
	}
</style>
