<template>
	<view class="cosmic-page calendar-page">
		<top-bar
			variant="calendar"
			:cal-year="calYear"
			:cal-month="calMonth"
			right-text="今天"
			@step="onCalStep"
			@open-month="onOpenMonth"
			@right="gotoToday"
		/>

		<scroll-view scroll-y class="screen screen--pb" :scroll-into-view="scrollIntoId" @scroll="onScroll">
			<!-- 日历卡片 -->
			<view class="card cal-card" :class="{ 'cal-card--expanded': calExpanded }">
				<!-- 卡片头部：标题 + 展开/折叠 -->
				<view class="cal-card-header" @click="toggleExpand">
					<text class="cal-card-title">{{ calYear }}年{{ calMonth }}月</text>
					<view class="cal-card-toggle">
						<text class="toggle-text">{{ calExpanded ? '收起' : '展开详情' }}</text>
						<lucide-icon :name="calExpanded ? 'chevron-up' : 'chevron-down'" size="24rpx" />
					</view>
				</view>
				<!-- 星期行 -->
				<view class="cal-grid cal-header-row">
					<text v-for="w in weekdays" :key="w" class="wd">{{ w }}</text>
				</view>
				<!-- 日期网格 -->
				<view class="cal-grid" :class="{ 'cal-grid--expanded': calExpanded }">
					<view
						v-for="(cell, i) in calendarCells"
						:key="i"
						class="cal-cell"
						:class="cellClass(cell)"
						@click="selectDay(cell)"
					>
						<template v-if="cell.day">
							<text class="day-num">{{ cell.day }}</text>
							<!-- 展开模式：显示收入和支出两行 -->
							<template v-if="calExpanded && (cell.income || cell.expense)">
								<text v-if="cell.income" class="cam cam-inc">+{{ fmtShort(cell.income) }}</text>
								<text v-if="cell.expense" class="cam cam-exp">-{{ fmtShort(cell.expense) }}</text>
							</template>
							<!-- 折叠模式：显示净额 -->
							<template v-else>
								<text v-if="cell.amountText" class="cam" :class="cell.amountClass">{{ cell.amountText }}</text>
							</template>
							<view v-if="cell.dot" class="dot" />
						</template>
					</view>
				</view>
			</view>

			<!-- 选中日账单 -->
			<view class="card" :id="'bill-' + calSel">
				<view class="between" style="margin-bottom:12rpx">
					<text class="day-title">{{ calMonth }}月{{ calSel }}日</text>
					<text v-if="dayBills.length" class="day-summary">
						支出 <text class="exp">{{ fmt(dayExpense) }}</text>
						<view v-if="dayIncome"> · 收入 <text class="inc">{{ fmt(dayIncome) }}</text></view>
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

		<!-- 月份选择器弹窗 -->
		<view v-if="monthPickerVisible" class="month-picker-overlay" @click="closeMonthPicker">
			<view class="month-picker" @click.stop>
				<view class="mp-header">
					<view class="parrow" @click="mpYear--">
						<lucide-icon name="chevron-left" size="36rpx" />
					</view>
					<text class="mp-year">{{ mpYear }}年</text>
					<view class="parrow" @click="mpYear++">
						<lucide-icon name="chevron-right" size="36rpx" />
					</view>
				</view>
				<view class="mp-grid">
					<view
						v-for="m in 12"
						:key="m"
						class="mp-cell"
						:class="{
							'mp-cell--cur': mpYear === todayYear && m === todayMonth,
							'mp-cell--sel': mpYear === calYear && m === calMonth
						}"
						@click="selectMonth(m)"
					>
						<text>{{ m }}月</text>
					</view>
				</view>
				<view class="mp-footer">
					当前：{{ todayYear }}年{{ todayMonth }}月
				</view>
			</view>
		</view>

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
			todayDay: now.getDate(),
			// 日历卡片展开/折叠
			calExpanded: true,
			// 月份选择器
			monthPickerVisible: false,
			mpYear: now.getFullYear(),
			// 滚动锚点
			scrollIntoId: ''
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
				const entry = this.monthMap[d] || {}
				// 净额（展开模式用）
				const net = (entry.income || 0) - (entry.expense || 0)
				let amountText = ''
				let amountClass = ''
				if (entry.income || entry.expense) {
					if (net > 0) {
						amountText = `+${net}`
						amountClass = 'inc'
					} else if (net < 0) {
						amountText = `${net}`
						amountClass = 'exp'
					} else {
						amountText = '¥0'
						amountClass = 'muted'
					}
				}
				cells.push({
					day: d,
					dot: !!(entry.dot),
					has: !!(entry.income || entry.expense),
					income: entry.income || 0,
					expense: entry.expense || 0,
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
		/** 短金额格式化：去掉 ¥ 前缀，保留整数 */
		fmtShort(n) {
			if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
			if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
			return n % 1 === 0 ? n.toString() : n.toFixed(1)
		},
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
			// 滚动到账单卡片
			this.$nextTick(() => {
				this.scrollIntoId = 'bill-' + cell.day
			})
		},
		/** 展开/折叠日历卡片 */
		toggleExpand() {
			this.calExpanded = !this.calExpanded
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
			this.mpYear = this.calYear
			this.monthPickerVisible = true
		},
		closeMonthPicker() {
			this.monthPickerVisible = false
		},
		selectMonth(m) {
			this.calMonth = m
			this.calYear = this.mpYear
			const dim = new Date(this.calYear, this.calMonth, 0).getDate()
			if (this.calSel > dim) this.calSel = dim
			this.monthPickerVisible = false
		},
		gotoToday() {
			const n = new Date()
			this.calYear = n.getFullYear()
			this.calMonth = n.getMonth() + 1
			this.calSel = n.getDate()
			this.todayYear = n.getFullYear()
			this.todayMonth = n.getMonth() + 1
			this.todayDay = n.getDate()
		},
		onScroll() {
			// 滚动时不做特殊处理
		}
	}
}
</script>

<style lang="scss" scoped>
.calendar-page {
	height: 100vh;
	overflow: hidden;
}

/* ===== 日历卡片 ===== */
.cal-card {
	padding: 24rpx 28rpx;
	transition: all 0.3s ease;
}

.cal-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid var(--border, rgba(180, 200, 230, 0.25));
}

.cal-card-title {
	font-size: 28rpx;
	font-weight: 700;
	color: var(--text-primary);
}

.cal-card-toggle {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(91, 155, 224, 0.1);
	color: var(--primary, #5B9BE0);
}

.toggle-text {
	font-size: 22rpx;
	font-weight: 500;
}

/* ===== 日历网格 ===== */
.cal-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 6rpx;
	text-align: center;
}

.cal-header-row {
	margin-bottom: 6rpx;
}

.wd {
	font-size: 22rpx;
	color: var(--text-secondary);
	padding: 10rpx 0;
}

.cal-cell {
	aspect-ratio: 1;
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	font-size: 26rpx;
	color: var(--text-primary);
	padding: 4rpx 0;
	transition: background 0.2s, box-shadow 0.2s;
}

.cal-grid--expanded .cal-cell {
	aspect-ratio: auto;
	min-height: 96rpx;
	padding: 6rpx 2rpx;
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
	font-weight: 600;
}

.day-num {
	line-height: 1.3;
	font-size: 26rpx;
}

.cam {
	font-size: 16rpx;
	margin-top: 1rpx;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}

.cam-inc {
	color: var(--income, #34C759);
}

.cam-exp {
	color: var(--expense, #FF6B6B);
}

.cal-cell .dot {
	width: 6rpx;
	height: 6rpx;
	border-radius: 50%;
	background: var(--warning);
	position: absolute;
	bottom: 4rpx;
}

/* ===== 账单卡片 ===== */
.day-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.day-summary {
	font-size: 24rpx;
	color: var(--text-secondary);
}

/* ===== 月份选择器 ===== */
.month-picker-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
}

.month-picker {
	width: 560rpx;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(20rpx);
	border-radius: 32rpx;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
	padding: 32rpx;
	box-sizing: border-box;
}

.mp-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24rpx;
	margin-bottom: 28rpx;
}

.mp-year {
	font-size: 36rpx;
	font-weight: 700;
	color: var(--text-primary);
	min-width: 160rpx;
	text-align: center;
}

.parrow {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
	border-radius: 50%;
}

.parrow:active {
	background: rgba(91, 155, 224, 0.1);
}

.mp-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16rpx;
}

.mp-cell {
	padding: 20rpx 0;
	border-radius: 16rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-primary);
	background: rgba(91, 155, 224, 0.04);
	transition: all 0.2s;
}

.mp-cell:active {
	background: rgba(91, 155, 224, 0.12);
}

.mp-cell--cur {
	color: var(--primary, #5B9BE0);
	font-weight: 600;
	border: 1rpx solid var(--primary, #5B9BE0);
}

.mp-cell--sel {
	background: linear-gradient(135deg, #8FC9FF 0%, #5B9BE0 55%, #8B7FF0 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.3);
}

.mp-footer {
	text-align: center;
	margin-top: 24rpx;
	font-size: 22rpx;
	color: var(--text-tertiary);
}
</style>