<template>
	<view class="cosmic-page bill-page">
		<status-bar />
		<top-bar title="记一笔" show-back />

		<view class="bill-body">
			<scroll-view scroll-y class="bill-scroll" :show-scrollbar="false">
				<view class="bill-tabs">
					<view
						v-for="t in typeTabs"
						:key="t.id"
						class="bill-tab"
						:class="{ on: billType === t.id }"
						@tap="setType(t.id)"
					>{{ t.label }}</view>
				</view>

				<view v-if="billType !== 'transfer'" class="bill-freq">
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
				</view>

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
				<view class="bill-amt-row" @tap="openRemarkSheet">
					<view class="bill-note-wrap">
						<text class="bill-note" :class="{ ph: !remark }">
							{{ remark || '点击输入备注或分类名' }}
						</text>
					</view>
					<view class="bill-amt" :class="amountClass">
						<text class="bill-amt-sign">¥</text>
						<text class="bill-amt-num">{{ displayAmount }}</text>
					</view>
				</view>

				<scroll-view scroll-x class="bill-tags-scroll" :show-scrollbar="false">
					<view class="bill-tags">
						<view class="bill-tag" @tap="onTemplate">
							<text>模板</text>
						</view>
						<view class="bill-tag" @tap="onDatePick">
							<text>{{ billDate }}</text>
						</view>
						<view class="bill-tag" @tap="openAccountSheet">
							<text>{{ selectedAcc.name }}</text>
						</view>
						<view class="bill-tag">
							<text>2026</text>
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
				<text class="acc-bal">¥{{ fmt(acc.bal) }}</text>
			</view>
		</cosmic-sheet>

		<cosmic-sheet
			:visible="remarkSheetVisible"
			@update:visible="remarkSheetVisible = $event"
			@close="remarkSheetVisible = false"
		>
			<text class="sheet-title">备注</text>
			<input
				v-model="remarkDraft"
				class="remark-input"
				placeholder="选填，最多50字"
				maxlength="50"
			/>
			<view class="sheet-btn" @tap="confirmRemark">确定</view>
		</cosmic-sheet>
	</view>
</template>

<script>
import { getAccounts, CAT_GROUPS, freqSubs, addBill, getActiveLedgerId, fmt } from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

function todayLabel() {
	const d = new Date()
	return `${d.getMonth() + 1}/${d.getDate()}`
}

export default {
	data() {
		return {
			typeTabs: [
				{ id: 'expense', label: '支出' },
				{ id: 'income', label: '收入' },
				{ id: 'transfer', label: '转账' }
			],
			billType: 'expense',
			amount: '0',
			cat: null,
			subcat: null,
			remark: '',
			remarkDraft: '',
			billDate: todayLabel(),
			selectedAcc: getAccounts()[0],
			accounts: getAccounts(),
			excludeBudget: false,
			accountSheetVisible: false,
			remarkSheetVisible: false
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
			if (!this.amount || this.amount === '0') return '0.00'
			if (this.amount.endsWith('.')) return this.amount
			const parts = this.amount.split('.')
			if (parts.length === 1) return this.amount + '.00'
			const dec = (parts[1] || '').padEnd(2, '0').slice(0, 2)
			return parts[0] + '.' + dec
		},
		amountClass() {
			if (this.billType === 'income') return 'inc'
			if (this.billType === 'expense') return 'exp'
			return 'xfer'
		}
	},
	onShow() {
		applyThemeToPage()
	},
	methods: {
		fmt,
		catEmoji,
		setType(type) {
			this.billType = type
			this.cat = null
			this.subcat = null
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
		onKey(k) {
			if (k === 'again') {
				this.saveBill(true)
				return
			}
			let a = this.amount
			if (k === 'bk') {
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
		onPlus() {
			this.billType = 'income'
			this.cat = null
			this.subcat = null
		},
		onMinus() {
			this.billType = 'expense'
			this.cat = null
			this.subcat = null
		},
		validate() {
			const amt = parseFloat(this.amount)
			if (!amt || amt <= 0 || isNaN(amt)) {
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
		saveBill(again) {
			if (!this.validate()) return
			// 保存到本地存储
			const amt = this.billType === 'expense' ? -Math.abs(Number(this.amount)) : Math.abs(Number(this.amount))
			addBill({
				ic: this.cat ? this.frequentSubs.find(f => f.cat === this.cat)?.ic || 'circle' : 'circle',
				cat: this.cat || '其他',
				subcat: this.subcat || '',
				ledger: getActiveLedgerId(),
				name: (this.cat || '') + (this.subcat ? ' · ' + this.subcat : ''),
				acc: this.selectedAcc?.name || '未分类',
				amt: amt,
				type: this.billType,
				note: this.remark,
				excludeBudget: this.excludeBudget,
				ts: Date.now()
			})
			if (again) {
				uni.showToast({ title: '已保存，继续记账', icon: 'none' })
				this.amount = '0'
				this.cat = null
				this.subcat = null
				return
			}
			uni.showToast({ title: '已保存', icon: 'success' })
			setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
		},
		openAccountSheet() {
			this.accountSheetVisible = true
		},
		selectAccount(acc) {
			this.selectedAcc = acc
			this.accountSheetVisible = false
		},
		openRemarkSheet() {
			this.remarkDraft = this.remark
			this.remarkSheetVisible = true
		},
		confirmRemark() {
			this.remark = this.remarkDraft.trim()
			this.remarkSheetVisible = false
		},
		onDatePick() {
			uni.showToast({ title: '选择日期', icon: 'none' })
		},
		onTemplate() {
			uni.showToast({ title: '模板', icon: 'none' })
		},
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
	margin-top: calc(var(--statusbar-height, 92rpx) + 100rpx);
	display: flex;
	flex-direction: column;
}

.bill-scroll {
	flex: 1;
	min-height: 0;
	padding: 16rpx 24rpx 0;
	box-sizing: border-box;
}

.bill-scroll-pad {
	height: 24rpx;
}

.bill-tabs {
	display: flex;
	justify-content: center;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.bill-tab {
	padding: 14rpx 44rpx;
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-secondary, #5a6b8a);
	background: #fff;
	box-shadow: 0 2rpx 12rpx rgba(91, 140, 210, 0.1);
}

.bill-tab.on {
	background: var(--primary, #4a90d9);
	color: #fff;
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

.bill-amt {
	flex-shrink: 0;
	display: flex;
	align-items: baseline;
	font-weight: 800;
}

.bill-amt-sign {
	font-size: 32rpx;
	margin-right: 4rpx;
}

.bill-amt-num {
	font-size: 52rpx;
	line-height: 1;
}

.bill-amt.exp {
	color: var(--expense, #e85d5d);
}

.bill-amt.inc {
	color: var(--income, #3cb878);
}

.bill-amt.xfer {
	color: var(--primary, #4a90d9);
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
</style>
