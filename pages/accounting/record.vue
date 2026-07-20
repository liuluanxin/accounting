<template>
	<view class="cosmic-page bill-page">
		<!-- 导航栏：返回 + 类型切换（收入/支出/转账） -->
		<view class="record-nav">
			<view class="record-nav__back" @tap="onNavBack">
				<lucide-icon name="chevron-left" size="36rpx" />
			</view>
			<view class="record-nav__seg">
				<view
					v-for="t in typeTabs"
					:key="t.id"
					class="record-nav__tab"
					:class="{ on: billType === t.id }"
					@tap="setType(t.id)"
				>{{ t.label }}</view>
			</view>
			<view class="record-nav__right" />
		</view>

		<view class="bill-body">
			<scroll-view scroll-y class="bill-scroll" :show-scrollbar="false">

				<!-- <view v-if="billType !== 'transfer'" class="bill-freq">
					<text class="freq-label">常用</text>
					<view
						v-for="(s, i) in frequentSubs"
						:key="'f' + i"
						class="bill-sub bill-sub--sm"
						:class="{ on: isSubSelected(s.cat, s.sub) }"
						@tap="pickSub(s.cat, s.sub)"
					>
						<text class="sic">{{ catEmoji(s.ic) }}</text>
						<text class="snm">{{ s.sub }}</text>
					</view>
				</view> -->

				<view
					v-for="(g, gi) in currentGroups"
					:key="gi"
					class="bill-group"
				>
					<view class="bill-group-hd" :class="{ on: isGroupSelected(g.name) }">
						<text class="gic">{{ catEmoji(g.ic) }}</text>
						<text class="gnm">{{ g.name }}</text>
					</view>
					<view class="bill-sub-grid">
						<view
							v-for="(s, si) in g.subs"
							:key="si"
							class="bill-sub"
							:class="{ on: isSubSelected(g.name, s.name) }"
							@tap="pickSub(g.name, s.name)"
						>
							<text class="sic">{{ catEmoji(s.ic) }}</text>
							<text class="snm">{{ s.name }}</text>
						</view>
					</view>
				</view>

				<view class="bill-scroll-pad" />
			</scroll-view>

			<view class="bill-foot">
				<view class="bill-amt-row">
					<view class="bill-note-wrap">
						<input
							v-model="remark"
							class="bill-note-input"
							placeholder="点击输入备注或分类名"
							maxlength="50"
							:adjust-position="false"
						/>
					</view>
					<view class="bill-amt-wrap">
						<!-- 上方：输入区域，有计算时才显示，可回退删除 -->
						<view v-if="calcExpr.length > 0" class="bill-calc-input">
							<text v-if="displayExpr" class="bill-expr">{{ displayExpr }}</text>
							<text v-if="displayAmount !== '0'" class="bill-amt-num">{{ displayAmount }}</text>
						</view>
						<!-- 下方：直接显示结果 -->
						<view class="bill-calc-result" :class="amountClass">
							<text class="bill-amt-sign">¥</text>
							<text class="bill-amt-num">{{ displayResult }}</text>
						</view>
					</view>
				</view>

				<scroll-view scroll-x class="bill-tags-scroll" :show-scrollbar="false">
					<view class="bill-tags">
						<view class="bill-tag" @tap="onDatePick">
							<text>{{ billDate }}</text>
						</view>
						<view class="bill-tag" @tap="openAccountSheet">
							<text>{{ selectedAcc.name }}</text>
						</view>
						<view class="bill-tag" @tap="openLedgerSheet">
							<text>{{ selectedLedger ? selectedLedger.name : '2026' }}</text>
						</view>
						<view class="bill-tag" :class="{ on: excludeBudget }" @tap="toggleExcludeBudget">
							<text>不计入预算</text>
						</view>
						<view class="bill-tag bill-tag--icon" @tap="onCamera">
							<text>📷</text>
						</view>
					</view>
				</scroll-view>

				<bill-keypad @key="onKey" @save="onSave" @plus="onPlus" @minus="onMinus" />
			</view>
		</view>

		<!-- 选择账户 -->
		<cosmic-sheet
			:visible="accountSheetVisible"
			@update:visible="accountSheetVisible = $event"
			@close="accountSheetVisible = false"
		>
			<text class="sheet-title">选择账户</text>
			<view
				v-for="(acc, i) in accounts"
				:key="i"
				class="acc-row"
				:class="{ on: selectedAcc.name === acc.name }"
				@tap="selectAccount(acc)"
			>
				<text class="acc-name">{{ acc.name }}</text>
				<text class="acc-bal">{{ fmt(acc.bal) }}</text>
			</view>
		</cosmic-sheet>

		<!-- 选择账本 -->
		<cosmic-sheet
			:visible="ledgerSheetVisible"
			@update:visible="ledgerSheetVisible = $event"
			@close="ledgerSheetVisible = false"
		>
			<text class="sheet-title">选择账本</text>
			<view
				v-for="(l, i) in ledgers"
				:key="i"
				class="acc-row"
				:class="{ on: selectedLedger && selectedLedger.id === l.id }"
				@tap="selectLedger(l)"
			>
				<text class="acc-name">{{ l.name }}</text>
			</view>
		</cosmic-sheet>

		<!-- 选择日期（日历弹窗） -->
		<cosmic-sheet
			:visible="dateSheetVisible"
			@update:visible="dateSheetVisible = $event"
			@close="dateSheetVisible = false"
		>
			<text class="sheet-title">选择日期</text>
			<view class="cal-header">
				<view class="cal-nav" @tap="prevMonth">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28rpx;height:28rpx"><polyline points="15 18 9 12 15 6"/></svg>
				</view>
				<text class="cal-title">{{ calYear }}年{{ calMonth }}月</text>
				<view class="cal-nav" @tap="nextMonth">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:28rpx;height:28rpx"><polyline points="9 18 15 12 9 6"/></svg>
				</view>
			</view>
			<view class="cal-weekdays">
				<text v-for="w in weekdays" :key="w" class="cal-wd">{{ w }}</text>
			</view>
			<view class="cal-days">
				<view
					v-for="(d, i) in calDays"
					:key="i"
					class="cal-day"
					:class="{
						other: !d.inMonth,
						sel: d.sel,
						today: d.today
					}"
					@tap="selectDay(d)"
				>
					<text class="cal-day-num">{{ d.day }}</text>
				</view>
			</view>
		</cosmic-sheet>

		</view>
</template>

<script>
import { getAccounts, CAT_GROUPS, freqSubs, addBill, getActiveLedgerId, fmt, getLedgers, getLedger } from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

function todayLabel() {
	const d = new Date()
	return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateLabel(d) {
	return `${d.getMonth() + 1}/${d.getDate()}`
}

export default {
	data() {
		const now = new Date()
		return {
			typeTabs: [
				{ id: 'expense', label: '支出' },
				{ id: 'income', label: '收入' },
				{ id: 'transfer', label: '转账' }
			],
			billType: 'expense',
			amount: '0',
			sign: -1,            // 1 = 正数, -1 = 负数
			calcTotal: 0,        // 累计计算结果
			calcExpr: [],        // 计算表达式 ['100.00', '+', '20.00', '-']
			pendingOp: null,     // 待定运算符 '+' 或 '-', null 表示无
			cat: null,
			subcat: null,
			remark: '',
			billDate: todayLabel(),
			billDateTs: Date.now(),
			selectedAcc: getAccounts()[0] || { name: '未分类', bal: 0 },
			accounts: getAccounts(),
			excludeBudget: false,
			accountSheetVisible: false,
			// 日历
			dateSheetVisible: false,
			calYear: now.getFullYear(),
			calMonth: now.getMonth() + 1,
			calDay: now.getDate(),
			weekdays: ['日', '一', '二', '三', '四', '五', '六'],
			// 账本
			ledgerSheetVisible: false,
			ledgers: getLedgers(),
			selectedLedger: getLedger(getActiveLedgerId())
		}
	},
	computed: {
		frequentSubs() {
			return freqSubs(this.billType)
		},
		currentGroups() {
			return CAT_GROUPS[this.billType] || CAT_GROUPS.expense
		},
		displayAmount() {
			return this.amount || '0'
		},
		/** 计算表达式（不含当前输入） */
		displayExpr() {
			if (this.calcExpr.length === 0) return ''
			return this.calcExpr.join(' ')
		},
		/** 计算最终结果值 */
		displayResult() {
			if (this.pendingOp === null) {
				return this.amount || '0'
			}
			const val = parseFloat(this.amount) || 0
			let total = this.calcTotal
			if (val > 0) {
				total += this.pendingOp === '+' ? val : -val
			}
			const parts = total.toFixed(2).split('.')
			return parts[0] + '.' + (parts[1] || '00')
		},
		amountClass() {
			if (this.sign === 1) return 'inc'
			return 'exp'
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
	onShow() {
		applyThemeToPage()
		this.accounts = getAccounts()
		this.ledgers = getLedgers()
		this.selectedLedger = getLedger(getActiveLedgerId())
		this.selectedAcc = getAccounts()[0] || { name: '未分类', bal: 0 }
		// 默认符号与类型一致
		if (this.billType === 'expense') this.sign = -1
	},
	methods: {
		fmt,
		catEmoji,
		setType(type) {
			this.billType = type
			this.cat = null
			this.subcat = null
			this.amount = '0'
			this.calcTotal = 0
			this.calcExpr = []
			this.pendingOp = null
			// 切换类型时重置符号
			if (type === 'expense') this.sign = -1
			else if (type === 'income') this.sign = 1
		},
		pickSub(cat, sub) {
			this.cat = cat
			this.subcat = sub
		},
		isSubSelected(cat, sub) {
			return this.cat === cat && this.subcat === sub
		},
		isGroupSelected(name) {
			return this.cat === name
		},
		/** 从 calcExpr 重新计算 calcTotal 和 pendingOp */
		recalcFromExpr() {
			let total = 0
			let lastOp = null
			for (let i = 0; i < this.calcExpr.length; i += 2) {
				const val = parseFloat(this.calcExpr[i]) || 0
				if (i === 0) {
					total = val
				} else if (lastOp === '+') {
					total += val
				} else {
					total -= val
				}
				lastOp = this.calcExpr[i + 1]
			}
			this.calcTotal = total
			this.pendingOp = lastOp
		},
		onKey(k) {
			if (k === 'again') {
				this.saveBill(true)
				return
			}
			let a = this.amount
			if (k === 'bk') {
				// 有计算进行中时：优先删除当前输入值的末位数字
				if (this.pendingOp !== null) {
					if (this.amount !== '0' && this.amount !== '') {
						a = this.amount.length <= 1 ? '0' : this.amount.slice(0, -1)
						if (a === '' || a === '.') a = '0'
						this.amount = a
						return
					}
					// 当前输入为0，回退到上一步表达式
					if (this.calcExpr.length >= 2) {
						const op = this.calcExpr.pop()
						const lastVal = this.calcExpr.pop()
						this.amount = lastVal
						this.recalcFromExpr()
					}
					return
				}
				a = a.length <= 1 ? '0' : a.slice(0, -1)
				if (a === '' || a === '.') a = '0'
			} else if (k === '.') {
				if (!a.includes('.')) a = a === '0' ? '0.' : a + '.'
			} else if (k === '0') {
				if (a !== '0') a += '0'
			} else if (a === '0') {
				a = k
			} else if ((a.split('.')[1] || '').length < 2) {
				a += k
			}
			this.amount = a
		},
		// +/- 加减计算（待定运算符模式）
		onPlus() {
			const val = parseFloat(this.amount) || 0
			if (this.pendingOp === null) {
				// 第一次按运算符：当前输入值作为初始值
				if (val > 0) {
					this.calcTotal = val
					this.calcExpr.push(this.amount, '+')
					this.pendingOp = '+'
					this.amount = '0'
				}
			} else {
				// 已有待定运算符：应用上一个运算符，再更新为 +
				if (val > 0) {
					if (this.pendingOp === '+') this.calcTotal += val
					else this.calcTotal -= val
					this.calcExpr.push(this.amount, '+')
				} else {
					// 没有输入新值，仅切换运算符
					this.calcExpr[this.calcExpr.length - 1] = '+'
				}
				this.pendingOp = '+'
				this.amount = '0'
			}
		},
		onMinus() {
			const val = parseFloat(this.amount) || 0
			if (this.pendingOp === null) {
				if (val > 0) {
					this.calcTotal = val
					this.calcExpr.push(this.amount, '-')
					this.pendingOp = '-'
					this.amount = '0'
				}
			} else {
				if (val > 0) {
					if (this.pendingOp === '+') this.calcTotal += val
					else this.calcTotal -= val
					this.calcExpr.push(this.amount, '-')
				} else {
					this.calcExpr[this.calcExpr.length - 1] = '-'
				}
				this.pendingOp = '-'
				this.amount = '0'
			}
		},
		/** 获取最终总金额（含待定运算符） */
		getTotal() {
			if (this.pendingOp === null) {
				return parseFloat(this.amount) || 0
			}
			const val = parseFloat(this.amount) || 0
			let total = this.calcTotal
			if (val > 0) {
				total += this.pendingOp === '+' ? val : -val
			}
			return total
		},
		validate() {
			const totalAmt = this.getTotal()
			if (!totalAmt || totalAmt <= 0 || isNaN(totalAmt)) {
				uni.showToast({ title: '请输入有效金额', icon: 'none' })
				return false
			}
			if (!this.cat || !this.subcat) {
				uni.showToast({ title: '请选择分类', icon: 'none' })
				return false
			}
			return true
		},
		onSave() {
			this.saveBill(false)
		},
		onNavBack() {
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack({ delta: 1 })
			}
		},
		saveBill(again) {
			if (!this.validate()) return
			const totalAmt = this.getTotal()
			const amt = this.sign * Math.abs(totalAmt)
			addBill({
				ic: this.cat ? this.frequentSubs.find(f => f.cat === this.cat)?.ic || 'circle' : 'circle',
				cat: this.cat || '其他',
				subcat: this.subcat || '',
				ledger: this.selectedLedger ? this.selectedLedger.id : getActiveLedgerId(),
				name: (this.cat || '') + (this.subcat ? ' · ' + this.subcat : ''),
				acc: this.selectedAcc?.name || '未分类',
				amt: amt,
				type: this.billType,
				note: this.remark,
				excludeBudget: this.excludeBudget,
				ts: this.billDateTs
			})
			if (again) {
				uni.showToast({ title: '已保存，继续记账', icon: 'none' })
				this.amount = '0'
				this.calcTotal = 0
				this.calcExpr = []
				this.pendingOp = null
				this.cat = null
				this.subcat = null
				return
			}
			uni.showToast({ title: '已保存', icon: 'success' })
			this.calcTotal = 0
			this.calcExpr = []
			this.pendingOp = null
			setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
		},
		openAccountSheet() {
			this.accountSheetVisible = true
		},
		selectAccount(acc) {
			this.selectedAcc = acc
			this.accountSheetVisible = false
		},
		// ---- 日历 ----
		onDatePick() {
			const now = new Date()
			this.calYear = now.getFullYear()
			this.calMonth = now.getMonth() + 1
			this.calDay = now.getDate()
			this.dateSheetVisible = true
		},
		prevMonth() {
			if (this.calMonth === 1) {
				this.calYear--
				this.calMonth = 12
			} else {
				this.calMonth--
			}
		},
		nextMonth() {
			if (this.calMonth === 12) {
				this.calYear++
				this.calMonth = 1
			} else {
				this.calMonth++
			}
		},
		selectDay(d) {
			if (!d.inMonth) return
			this.calDay = d.day
			const dt = new Date(this.calYear, this.calMonth - 1, d.day)
			this.billDate = formatDateLabel(dt)
			this.billDateTs = dt.getTime()
			this.dateSheetVisible = false
		},
		// ---- 账本 ----
		openLedgerSheet() {
			this.ledgerSheetVisible = true
		},
		selectLedger(l) {
			this.selectedLedger = l
			this.ledgerSheetVisible = false
		},
		// ---- 其他 ----
		toggleExcludeBudget() {
			this.excludeBudget = !this.excludeBudget
		},
		onCamera() {
			uni.showToast({ title: '相机', icon: 'none' })
		}
	}
}
</script>

<style lang="scss" scoped>
.bill-page {
	height: 100vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	background: linear-gradient(180deg, #eaf4ff 0%, #f1ecff 40%, #f7f8fa 100%);
}

.bill-body {
	flex: 1;
	min-height: 0;
	margin-top: calc(var(--status-bar-height) + 100rpx);
	display: flex;
	flex-direction: column;
}

.bill-scroll {
	flex: 1;
	min-height: 0;
	padding: 16rpx 0rpx 0;
	box-sizing: border-box;
}

.bill-scroll-pad {
	height: 24rpx;
}

/* ===== 导航栏 ===== */
.record-nav {
	position: fixed;
	top: var(--status-bar-height);
	left: 0;
	right: 0;
	z-index: 998;
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 24rpx;
	background: linear-gradient(180deg, #EAF4FF 0%, #EAF4FF 50%, transparent 100%);
	backdrop-filter: blur(16rpx);
}
.record-nav__back {
	position: absolute;
	left: 24rpx;
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: var(--text-primary);
	z-index: 2;
}
.record-nav__right {
	position: absolute;
	right: 24rpx;
	width: 72rpx;
	height: 72rpx;
	z-index: 2;
}
.record-nav__seg {
	display: flex;
	background: #fff;
	border-radius: 999rpx;
	box-shadow: 0 2rpx 12rpx rgba(91, 140, 210, 0.1);
	overflow: hidden;
}
.record-nav__tab {
	padding: 10rpx 32rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-secondary, #5a6b8a);
	transition: all 0.2s;
}
.record-nav__tab.on {
	background: var(--primary, #4a90d9);
	color: #fff;
	border-radius: 999rpx;
}

.bill-freq {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
	overflow-x: auto;
}

.freq-label {
	flex-shrink: 0;
	font-size: 24rpx;
	color: var(--text-secondary, #5a6b8a);
}

.bill-group {
	background: #fff;
	border-radius: 24rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(91, 140, 210, 0.08);
}

.bill-group-hd {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
	font-size: 28rpx;
	font-weight: 700;
	color: var(--text-primary, #1a2744);
}

.bill-group-hd.on {
	color: var(--primary, #4a90d9);
}

.gic {
	font-size: 36rpx;
	line-height: 1;
}

.bill-sub-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.bill-sub {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 14rpx 18rpx;
	border-radius: 16rpx;
	background: #f5f8fe;
	font-size: 26rpx;
	color: var(--text-primary, #1a2744);
	box-sizing: border-box;
}

.bill-sub-grid .bill-sub {
	width: calc(50% - 6rpx);
}

.bill-sub--sm {
	flex-shrink: 0;
	padding: 10rpx 16rpx;
}

.bill-sub.on {
	background: var(--primary, #4a90d9);
	color: #fff;
}

.sic {
	font-size: 32rpx;
	line-height: 1;
	flex-shrink: 0;
}

.snm {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.bill-foot {
	flex-shrink: 0;
	width: 100%;
	box-sizing: border-box;
	background: #f7f8fa;
	border-top: 1rpx solid var(--divider, #edeff2);
	padding: 12rpx 20rpx calc(12rpx + env(safe-area-inset-bottom));
}

.bill-amt-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 8rpx 0 12rpx;
	border-bottom: 1rpx solid var(--divider, #edeff2);
	margin-bottom: 12rpx;
}

.bill-note-wrap {
	flex: 1;
	min-width: 0;
}

.bill-note-input {
	font-size: 28rpx;
	color: var(--text-primary, #1a2744);
	width: 100%;
	background: transparent;
	border: none;
	outline: none;
	padding: 0;
	height: 40rpx;
	line-height: 40rpx;
}
.bill-note-input::placeholder {
	color: var(--text-secondary, #8a9099);
}
.bill-note {
	font-size: 28rpx;
	color: var(--text-primary, #1a2744);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.bill-note.ph {
	color: var(--text-secondary, #8a9099);
}

.bill-amt-wrap {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.bill-calc-input {
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
	gap: 6rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-primary, #1a2744);
}
.bill-calc-input .bill-expr {
	font-size: 24rpx;
	color: var(--text-muted, #b0b7c4);
	white-space: nowrap;
}
.bill-calc-input .bill-amt-num {
	font-size: 24rpx;
	font-weight: 400;
	color: var(--text-muted, #b0b7c4);
}
.bill-calc-result {
	display: flex;
	align-items: baseline;
	font-weight: 800;
	margin-top: 6rpx;
}
.bill-calc-result .bill-amt-sign {
	font-size: 32rpx;
	margin-right: 4rpx;
}
.bill-calc-result .bill-amt-num {
	font-size: 52rpx;
	line-height: 1;
}
.bill-calc-result.exp {
	color: var(--expense, #34C759);
}
.bill-calc-result.inc {
	color: var(--income, #FF6B6B);
}
.bill-calc-result.xfer {
	color: var(--primary, #4a90d9);
}
.bill-expr {
	font-size: 22rpx;
	color: var(--text-muted, #b0b7c4);
	margin-bottom: 4rpx;
	white-space: nowrap;
}

.bill-tags-scroll {
	width: 100%;
	margin-bottom: 12rpx;
	white-space: nowrap;
}

.bill-tags {
	display: inline-flex;
	gap: 10rpx;
	padding: 4rpx 0;
}

.bill-tag {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: #fff;
	font-size: 24rpx;
	color: var(--text-secondary, #5a6b8a);
	box-shadow: 0 2rpx 8rpx rgba(91, 140, 210, 0.06);
}

.bill-tag.on {
	background: rgba(74, 144, 217, 0.12);
	color: var(--primary, #4a90d9);
}

.bill-tag--icon {
	padding: 10rpx 16rpx;
}

.sheet-title {
	display: block;
	text-align: center;
	font-size: 32rpx;
	font-weight: 700;
	margin-bottom: 24rpx;
}

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

.remark-input {
	width: 100%;
	padding: 20rpx;
	border: 1rpx solid var(--divider, #edeff2);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-sizing: border-box;
	font-size: 28rpx;
}

.sheet-btn {
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	border-radius: 20rpx;
	background: var(--primary, #4a90d9);
	color: #fff;
	font-size: 30rpx;
	font-weight: 600;
}

/* ===== 日历样式 ===== */
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
.cal-nav:active {
	background: #e8edf5;
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
.cal-day:active {
	background: #f0f4ff;
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
</style>