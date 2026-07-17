<template>
	<view class="cosmic-page calendar-page">
		<status-bar />
		<top-bar
			variant="calendar"
			:cal-year="calYear"
			:cal-month="calMonth"
			right-text="今天"
			@step="onCalStep"
			@open-month="onOpenMonth"
			@right="gotoToday"
		/>

		<scroll-view scroll-y class="screen screen--pb">
			<!-- 日历网格 -->
			<view class="card cal-card">
				<view class="cal-grid cal-header-row">
					<text v-for="w in weekdays" :key="w" class="wd">{{ w }}</text>
				</view>
				<view class="cal-grid">
					<view
						v-for="(cell, i) in calendarCells"
						:key="i"
						class="cal-cell"
						:class="cellClass(cell)"
						@click="selectDay(cell)"
					>
						<template v-if="cell.day">
							<text class="day-num">{{ cell.day }}</text>
							<text v-if="cell.amountText" class="cam" :class="cell.amountClass">{{ cell.amountText }}</text>
							<view v-if="cell.dot" class="dot" />
						</template>
					</view>
				</view>
			</view>

			<!-- 选中日账单 -->
			<view class="card">
				<view class="between" style="margin-bottom:12rpx">
					<text class="day-title">{{ calMonth }}月{{ calSel }}日</text>
					<text v-if="dayBills.length" class="day-summary">
						支出 <text class="exp">¥{{ fmt(dayExpense) }}</text>
						<view v-if="dayIncome"> · 收入 <text class="inc">¥{{ fmt(dayIncome) }}</text></view>
					</text>
					<text v-else class="muted">暂无账单</text>
				</view>
				<view v-if="dayBills.length === 0" class="empty">
					<view class="ei">
						<lucide-icon name="calendar" size="64rpx" />
					</view>
					<text>这一天还没有账单</text>
				</view>
				<view v-else>
					<view v-for="(item, j) in dayBills" :key="j" class="bill-item">
						<view class="bic">{{ item.emoji }}</view>
						<view>
							<view class="bnm">{{ item.name }}</view>
							<view class="bac">{{ item.account }}</view>
						</view>
						<view class="bam" :class="item.amount > 0 ? 'inc' : 'exp'">
							{{ item.amount > 0 ? '+' : '' }}{{ fmt(item.amount) }}
						</view>
					</view>
				</view>
			</view>

			<view style="height:40rpx" />
		</scroll-view>

		<tab-bar current-tab="calendar" />
	</view>
</template>

<script>
import { fmt } from '@/common/constants.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import { getCalMonthMap, getCalDayBills, getActiveLedgerId } from '@/common/app-data.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		const now = new Date()
		return {
			calYear: now.getFullYear(),
			calMonth: now.getMonth() + 1,
			calSel: now.getDate(),
			ledgerId: getActiveLedgerId(),
			weekdays: ['日', '一', '二', '三', '四', '五', '六'],
			todayYear: now.getFullYear(),
			todayMonth: now.getMonth() + 1,
			todayDay: now.getDate()
		}
	},
	computed: {
		monthMap() {
			return getCalMonthMap(this.calYear, this.calMonth, this.ledgerId)
		},
		calendarCells() {
			const year = this.calYear
			const month = this.calMonth
			const firstDay = new Date(year, month - 1, 1).getDay()
			const daysInMonth = new Date(year, month, 0).getDate()
			const cells = []
			for (let i = 0; i < firstDay; i++) {
				cells.push({ day: null })
			}
			for (let d = 1; d <= daysInMonth; d++) {
				const entry = this.monthMap[d]
				let amountText = ''
				let amountClass = ''
				if (entry && entry.m !== undefined) {
					if (entry.m > 0) {
						amountText = `+${entry.m}`
						amountClass = 'inc'
					} else if (entry.m < 0) {
						amountText = `${entry.m}`
						amountClass = 'exp'
					} else {
						amountText = '¥0'
						amountClass = 'muted'
					}
				}
				cells.push({
					day: d,
					dot: entry && entry.dot,
					has: entry && entry.m,
					amountText,
					amountClass,
					sel: this.calSel === d
				})
			}
			return cells
		},
		dayBills() {
			return getCalDayBills(this.calYear, this.calMonth, this.calSel, this.ledgerId)
		},
		dayExpense() {
			return this.dayBills
				.filter(b => b.amount < 0)
				.reduce((s, b) => s + Math.abs(b.amount), 0)
		},
		dayIncome() {
			return this.dayBills
				.filter(b => b.amount > 0)
				.reduce((s, b) => s + b.amount, 0)
		}
	},
	onShow() {
		applyThemeToPage(this)
		this.ledgerId = getActiveLedgerId()
	},
	methods: {
		fmt,
		cellClass(cell) {
			if (!cell.day) return 'cal-cell--empty'
			return {
				sel: cell.sel,
				has: cell.has,
				dot: cell.dot,
				today: this.calYear === this.todayYear
					&& this.calMonth === this.todayMonth
					&& cell.day === this.todayDay
			}
		},
		selectDay(cell) {
			if (!cell.day) return
			this.calSel = cell.day
		},
		onCalStep(dir) {
			let m = this.calMonth - 1 + dir
			let y = this.calYear
			if (m < 0) { m = 11; y-- }
			else if (m > 11) { m = 0; y++ }
			this.calMonth = m + 1
			this.calYear = y
			const dim = new Date(y, this.calMonth, 0).getDate()
			if (this.calSel > dim) this.calSel = dim
		},
		onOpenMonth() {
			uni.showToast({ title: '选择年月', icon: 'none' })
		},
		gotoToday() {
			const n = new Date()
			this.calYear = n.getFullYear()
			this.calMonth = n.getMonth() + 1
			this.calSel = n.getDate()
			this.todayYear = n.getFullYear()
			this.todayMonth = n.getMonth() + 1
			this.todayDay = n.getDate()
		}
	}
}
</script>

<style lang="scss" scoped>
.calendar-page {
	height: 100vh;
	overflow: hidden;
}

.cal-card {
	padding: 28rpx;
}

.cal-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 8rpx;
	text-align: center;
}

.cal-header-row {
	margin-bottom: 8rpx;
}

.wd {
	font-size: 22rpx;
	color: var(--text-secondary);
	padding: 12rpx 0;
}

.cal-cell {
	aspect-ratio: 1;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	font-size: 26rpx;
	color: var(--text-primary);
}
.cal-cell--empty {
	visibility: hidden;
}
.cal-cell.today .day-num {
	font-weight: 700;
	color: var(--primary);
}
.cal-cell.sel {
	background: linear-gradient(135deg, #8FC9FF 0%, #5B9BE0 55%, #8B7FF0 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.3);
}
.cal-cell.sel .day-num,
.cal-cell.sel .cam {
	color: #fff;
}
.cal-cell.has .cam {
	font-weight: 700;
}

.day-num {
	line-height: 1.3;
}

.cam {
	font-size: 18rpx;
	margin-top: 2rpx;
	line-height: 1.2;
}

.cal-cell .dot {
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	background: var(--warning);
	position: absolute;
	bottom: 6rpx;
}

.day-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.day-summary {
	font-size: 24rpx;
	color: var(--text-secondary);
}
</style>
