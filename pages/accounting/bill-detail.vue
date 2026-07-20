<template>
	<view class="cosmic-page detail-page">
		<top-bar title="账单详情" show-back />

		<scroll-view scroll-y class="screen">
			<!-- 账单头部：分类图标 + 金额 -->
			<view class="detail-hero">
				<view class="detail-icon">{{ catEmoji(bill.ic) }}</view>
				<view class="detail-amt" :class="bill.amt > 0 ? 'inc' : 'exp'">
					<text class="detail-amt-sign">¥</text>
					<text class="detail-amt-num">{{ displayAmount }}</text>
				</view>
				<text class="detail-name">{{ bill.name }}</text>
			</view>

			<!-- 编辑表单 -->
			<view class="card">
				<view class="form-row">
					<text class="form-label">分类</text>
					<view class="form-value-wrap" @click="showCatPicker = true">
						<text class="form-value">{{ bill.cat }} · {{ bill.subcat }}</text>
						<lucide-icon name="chevron-right" size="24rpx" />
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">金额</text>
					<view class="form-value-wrap">
						<input
							class="form-input"
							type="digit"
							:value="editAmount"
							@input="onAmountInput"
							placeholder="0.00"
						/>
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">日期</text>
					<view class="form-value-wrap" @click="showDatePicker = true">
						<text class="form-value">{{ billDate }}</text>
						<lucide-icon name="chevron-right" size="24rpx" />
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">账户</text>
					<view class="form-value-wrap" @click="showAccPicker = true">
						<text class="form-value">{{ bill.acc }}</text>
						<lucide-icon name="chevron-right" size="24rpx" />
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">备注</text>
					<view class="form-value-wrap">
						<input
							class="form-input"
							v-model="editNote"
							placeholder="选填"
							maxlength="50"
						/>
					</view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-bar">
				<view class="btn btn-save" @click="onSave">保存修改</view>
				<view class="btn btn-delete" @click="onDelete">删除此账单</view>
			</view>
		</scroll-view>

		<!-- 选择分类 -->
		<cosmic-sheet
			:visible="showCatPicker"
			@update:visible="showCatPicker = $event"
			@close="showCatPicker = false"
		>
			<text class="sheet-title">选择分类</text>
			<view v-for="(g, gi) in catGroups" :key="gi" class="cat-group">
				<text class="cat-group-name">{{ g.name }}</text>
				<view v-for="(s, si) in g.subs" :key="si" class="cat-item"
					:class="{ on: bill.cat === g.name && bill.subcat === s.name }"
					@click="pickCat(g.name, s.name, g.ic, s.ic)"
				>
					<text class="cat-item-emoji">{{ catEmoji(s.ic) }}</text>
					<text class="cat-item-name">{{ s.name }}</text>
				</view>
			</view>
		</cosmic-sheet>

		<!-- 选择日期 -->
		<cosmic-sheet
			:visible="showDatePicker"
			@update:visible="showDatePicker = $event"
			@close="showDatePicker = false"
		>
			<text class="sheet-title">选择日期</text>
			<view class="cal-header">
				<view class="cal-nav" @click="prevMonth">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28rpx;height:28rpx"><polyline points="15 18 9 12 15 6"/></svg>
				</view>
				<text class="cal-title">{{ calYear }}年{{ calMonth }}月</text>
				<view class="cal-nav" @click="nextMonth">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28rpx;height:28rpx"><polyline points="9 18 15 12 9 6"/></svg>
				</view>
			</view>
			<view class="cal-weekdays">
				<text v-for="w in weekdays" :key="w" class="cal-wd">{{ w }}</text>
			</view>
			<view class="cal-days">
				<view v-for="(d, i) in calDays" :key="i" class="cal-day"
					:class="{ other: !d.inMonth, sel: d.sel, today: d.today }"
					@click="selectDay(d)"
				>
					<text class="cal-day-num">{{ d.day }}</text>
				</view>
			</view>
		</cosmic-sheet>

		<!-- 选择账户 -->
		<cosmic-sheet
			:visible="showAccPicker"
			@update:visible="showAccPicker = $event"
			@close="showAccPicker = false"
		>
			<text class="sheet-title">选择账户</text>
			<view v-for="(acc, i) in accounts" :key="i" class="acc-row"
				:class="{ on: bill.acc === acc.name }"
				@click="selectAcc(acc)"
			>
				<text class="acc-name">{{ acc.name }}</text>
				<text class="acc-bal">{{ fmt(acc.bal) }}</text>
			</view>
		</cosmic-sheet>
	</view>
</template>

<script>
import { fmt, getBillById, updateBill, deleteBill, getAccounts, CAT_GROUPS } from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

function formatDateLabel(d) {
	const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${weekdays[d.getDay()]}`
}

export default {
	data() {
		return {
			bill: { ic: 'circle', name: '', cat: '', subcat: '', acc: '', amt: 0, ts: Date.now(), note: '' },
			editAmount: '0',
			editNote: '',
			billDate: '',
			billDateTs: Date.now(),
			accounts: [],
			showCatPicker: false,
			showDatePicker: false,
			showAccPicker: false,
			calYear: new Date().getFullYear(),
			calMonth: new Date().getMonth() + 1,
			calDay: new Date().getDate(),
			weekdays: ['日', '一', '二', '三', '四', '五', '六']
		}
	},
	computed: {
		displayAmount() {
			const v = Math.abs(this.bill.amt)
			if (!v || v === 0) return '0.00'
			return v.toFixed(2)
		},
		catGroups() {
			const type = this.bill.amt > 0 ? 'income' : 'expense'
			return CAT_GROUPS[type] || CAT_GROUPS.expense
		},
		/** 生成日历天数网格 */
		calDays() {
			const y = this.calYear
			const m = this.calMonth
			const firstDay = new Date(y, m - 1, 1).getDay()
			const daysInMonth = new Date(y, m, 0).getDate()
			const daysInPrev = new Date(y, m - 1, 0).getDate()
			const today = new Date()
			const cells = []
			// 上月填充
			for (let i = firstDay - 1; i >= 0; i--) {
				cells.push({ day: daysInPrev - i, inMonth: false, sel: false, today: false })
			}
			// 本月
			for (let i = 1; i <= daysInMonth; i++) {
				const sel = i === this.calDay
				const isToday = y === today.getFullYear() && m === today.getMonth() + 1 && i === today.getDate()
				cells.push({ day: i, inMonth: true, sel, today: isToday })
			}
			// 下月填充
			const remaining = 7 - (cells.length % 7)
			if (remaining < 7) {
				for (let i = 1; i <= remaining; i++) {
					cells.push({ day: i, inMonth: false, sel: false, today: false })
				}
			}
			return cells
		}
	},
	onLoad(options) {
		applyThemeToPage(this)
		if (options.id) {
			const b = getBillById(options.id)
			if (b) {
				this.bill = { ...b }
				this.editAmount = String(Math.abs(b.amt))
				this.editNote = b.note || ''
				const d = new Date(b.ts)
				this.billDate = formatDateLabel(d)
				this.billDateTs = b.ts
				this.calYear = d.getFullYear()
				this.calMonth = d.getMonth() + 1
				this.calDay = d.getDate()
			}
		}
		this.accounts = getAccounts()
	},
	methods: {
		fmt,
		catEmoji,
		onAmountInput(e) {
			this.editAmount = e.detail.value
		},
		pickCat(cat, subcat, gic, sic) {
			this.bill.cat = cat
			this.bill.subcat = subcat
			this.bill.ic = sic || gic
			this.bill.name = cat + ' · ' + subcat
			this.showCatPicker = false
		},
		prevMonth() {
			if (this.calMonth === 1) { this.calYear--; this.calMonth = 12 }
			else { this.calMonth-- }
		},
		nextMonth() {
			if (this.calMonth === 12) { this.calYear++; this.calMonth = 1 }
			else { this.calMonth++ }
		},
		selectDay(d) {
			if (!d.inMonth) return
			this.calDay = d.day
			const dt = new Date(this.calYear, this.calMonth - 1, d.day)
			this.billDate = formatDateLabel(dt)
			this.billDateTs = dt.getTime()
			this.showDatePicker = false
		},
		selectAcc(acc) {
			this.bill.acc = acc.name
			this.showAccPicker = false
		},
		onSave() {
			const amtVal = parseFloat(this.editAmount)
			if (!amtVal || amtVal <= 0 || isNaN(amtVal)) {
				uni.showToast({ title: '请输入有效金额', icon: 'none' })
				return
			}
			// 保留原符号
			const sign = this.bill.amt >= 0 ? 1 : -1
			const updated = {
				ic: this.bill.ic,
				cat: this.bill.cat,
				subcat: this.bill.subcat,
				name: this.bill.name,
				acc: this.bill.acc,
				amt: sign * amtVal,
				note: this.editNote,
				ts: this.billDateTs
			}
			updateBill(this.bill.id, updated)
			uni.showToast({ title: '已保存', icon: 'success' })
			setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
		},
		onDelete() {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这笔账单吗？',
				success: (res) => {
					if (res.confirm) {
						deleteBill(this.bill.id)
						uni.showToast({ title: '已删除', icon: 'success' })
						setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-page .screen {
	padding: 192rpx 28rpx 40rpx;
}

.detail-hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0 32rpx;
}

.detail-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: #EEF4FF;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	margin-bottom: 16rpx;
}

.detail-amt {
	display: flex;
	align-items: baseline;
	font-weight: 800;
	margin-bottom: 8rpx;
}

.detail-amt.inc { color: var(--income, #FF6B6B); }
.detail-amt.exp { color: var(--expense, #34C759); }

.detail-amt-sign {
	font-size: 36rpx;
	margin-right: 4rpx;
}

.detail-amt-num {
	font-size: 64rpx;
	line-height: 1.2;
}

.detail-name {
	font-size: 28rpx;
	color: var(--text-secondary, #5a6b8a);
}

/* 表单 */
.form-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 0;
	border-bottom: 1rpx solid var(--divider, #edeff2);
}

.form-row:last-child {
	border-bottom: none;
}

.form-label {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary, #1a2744);
	flex-shrink: 0;
	margin-right: 24rpx;
}

.form-value-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8rpx;
	min-width: 0;
}

.form-value {
	font-size: 28rpx;
	color: var(--text-secondary, #5a6b8a);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.form-input {
	font-size: 28rpx;
	color: var(--text-primary, #1a2744);
	text-align: right;
	width: 100%;
}

/* 操作按钮 */
.action-bar {
	margin-top: 40rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.btn {
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	border-radius: 20rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.btn-save {
	background: var(--primary, #4a90d9);
	color: #fff;
}

.btn-delete {
	background: #fff;
	color: var(--expense, #34C759);
	border: 2rpx solid var(--expense, #34C759);
}

/* 日历选择器 */
.cal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 0 20rpx;
}
.cal-title {
	font-size: 30rpx;
	font-weight: 700;
	color: var(--text-primary, #1a2744);
}
.cal-nav {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f8fe;
	cursor: pointer;
}
.cal-weekdays {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4rpx;
	margin-bottom: 12rpx;
}
.cal-wd {
	text-align: center;
	font-size: 24rpx;
	font-weight: 600;
	color: var(--text-secondary, #8a9099);
	padding: 8rpx 0;
}
.cal-days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4rpx;
}
.cal-day {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16rpx 0;
	border-radius: 16rpx;
	cursor: pointer;
}
.cal-day.other .cal-day-num {
	color: #d0d5dd;
}
.cal-day.today .cal-day-num {
	font-weight: 700;
	color: var(--primary, #4a90d9);
}
.cal-day.sel {
	background: var(--primary, #4a90d9);
}
.cal-day.sel .cal-day-num {
	color: #fff;
	font-weight: 700;
}
.cal-day-num {
	font-size: 28rpx;
	color: var(--text-primary, #1a2744);
}

/* 分类选择 */
.sheet-title {
	display: block;
	text-align: center;
	font-size: 32rpx;
	font-weight: 700;
	margin-bottom: 24rpx;
}
.cat-group {
	margin-bottom: 20rpx;
}
.cat-group-name {
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-secondary, #5a6b8a);
	margin-bottom: 12rpx;
	display: block;
}
.cat-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 12rpx;
	border-radius: 12rpx;
	margin-bottom: 4rpx;
}
.cat-item.on {
	background: rgba(74, 144, 217, 0.1);
}
.cat-item-emoji {
	font-size: 32rpx;
}
.cat-item-name {
	font-size: 28rpx;
	color: var(--text-primary, #1a2744);
}

/* 账户选择 */
.acc-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 8rpx;
	border-bottom: 1rpx solid var(--divider, #edeff2);
}
.acc-row.on {
	color: var(--primary, #4a90d9);
}
.acc-name {
	font-size: 28rpx;
	font-weight: 600;
}
.acc-bal {
	font-size: 24rpx;
	color: var(--text-secondary, #8a9099);
}
</style>