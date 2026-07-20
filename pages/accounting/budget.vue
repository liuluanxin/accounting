<template>
	<view class="cosmic-page budget-page">
		<top-bar title="预算" show-back :right-text="monthLabel + ' ▾'" @right="onMonthPick" />

		<scroll-view scroll-y class="screen">
			<!-- 月度总预算 - 可点击编辑 -->
			<view class="card budget-hero" @click="editTotalBudget">
				<view class="between">
					<text class="card-title" style="margin:0">{{ month }}月总预算</text>
					<text class="amount-lg">{{ fmt(budgetTotal) }}</text>
				</view>
				<view class="between mt-16">
					<text class="muted">已使用 {{ fmt(budgetUsed) }}</text>
					<text class="muted">剩余 {{ fmt(monthRemain) }}</text>
				</view>
				<view class="progress-bar mt-12">
					<view class="progress-bar__fill" :style="{ width: monthPct + '%' }" />
				</view>
				<text class="muted mt-8">{{ monthPct }}%</text>
			</view>

			<!-- 超支提醒 -->
			<view class="card toggle-row">
				<view>
					<text class="toggle-title">超支提醒</text>
					<text class="muted block-hint">分类预算超支时推送通知</text>
				</view>
				<view class="toggle" :class="{ on: overAlert }" @click="overAlert = !overAlert">
					<view class="dot" />
				</view>
			</view>

			<!-- 分类预算 -->
			<view class="section-label">分类预算 · 点击可编辑</view>
			<view
				v-for="(cat, i) in budgetCats"
				:key="i"
				class="card budget-cat-card"
				:class="{ 'budget-cat-card--over': cat.over }"
				@click="editCatBudget(cat)"
			>
				<view class="between">
					<view class="row">
						<text class="cat-emoji">{{ catEmoji(cat.ic) }}</text>
						<text class="cat-name">{{ cat.name }}</text>
						<text v-if="cat.over" class="over-tag">超支</text>
					</view>
					<text class="muted">{{ fmt(cat.used) }} / {{ fmt(cat.limit) }}</text>
				</view>
				<view class="progress-bar mt-12">
					<view
						class="progress-bar__fill"
						:class="{ 'progress-bar__fill--orange': cat.over }"
						:style="{ width: catPct(cat) + '%' }"
					/>
				</view>
				<view class="between mt-8">
					<text class="muted">{{ catPct(cat) }}%</text>
					<text class="muted" :class="{ exp: cat.over }">
						{{ cat.over ? '超出' + fmt(cat.used - cat.limit) : '剩余' + fmt(cat.limit - cat.used) }}
					</text>
				</view>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>

		<!-- 月份选择弹窗 -->
		<view v-if="showMonthPicker" class="month-mask" @click="closeMonthPicker">
			<view class="month-picker" @click.stop>
				<view class="month-picker__title">选择月份</view>
				<view class="month-grid">
					<view
						v-for="m in 12"
						:key="m"
						class="month-cell"
						:class="{ on: month === m }"
						@click="setMonth(m)"
					>{{ m }}月</view>
				</view>
				<view class="month-picker__close" @click="closeMonthPicker">取消</view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	fmt,
	getBudgetTotal,
	getBudgetCats,
	getBills,
	getActiveLedgerId,
	saveBudgetTotal,
	saveBudgetCats
} from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			budgetTotal: 0,
			budgetUsed: 0,
			budgetCats: [],
			ledgerId: getActiveLedgerId(),
			overAlert: true,
			month: new Date().getMonth() + 1,
			showMonthPicker: false
		}
	},
	computed: {
		monthLabel() {
			return `${this.month}月`
		},
		monthPct() {
			return this.budgetTotal > 0
				? Math.min(100, Math.floor(this.budgetUsed / this.budgetTotal * 100))
				: 0
		},
		monthRemain() {
			return Math.max(0, this.budgetTotal - this.budgetUsed)
		}
	},
	onShow() {
		applyThemeToPage(this)
		this.loadData()
	},
	methods: {
		fmt,
		catEmoji,
		catPct(cat) {
			return cat.limit > 0 ? Math.min(100, Math.round(cat.used / cat.limit * 100)) : 0
		},
		// 按当前选中月份加载数据
		loadData() {
			this.ledgerId = getActiveLedgerId()
			this.budgetTotal = getBudgetTotal()
			this.budgetCats = getBudgetCats().map(c => ({ ...c }))
			// 按选中月份计算实际支出
			const now = new Date()
			const year = now.getFullYear()
			const ms = new Date(year, this.month - 1, 1).getTime()
			const me = new Date(year, this.month, 1).getTime()
			const lid = this.ledgerId
			this.budgetUsed = getBills().filter(b =>
				b.ts >= ms && b.ts < me && b.amt < 0 &&
				(lid === 'general' || b.ledger === lid)
			).reduce((s, b) => s + Math.abs(b.amt), 0)
			// 同步更新分类预算的已用金额
			this.budgetCats.forEach(cat => {
				cat.used = getBills().filter(b =>
					b.ts >= ms && b.ts < me && b.amt < 0 &&
					b.cat === cat.name &&
					(lid === 'general' || b.ledger === lid)
				).reduce((s, b) => s + Math.abs(b.amt), 0)
				cat.over = cat.used > cat.limit
			})
		},
		// 月份选择
		onMonthPick() {
			this.showMonthPicker = true
		},
		closeMonthPicker() {
			this.showMonthPicker = false
		},
		setMonth(m) {
			this.month = m
			this.showMonthPicker = false
			this.loadData()
		},
		// 编辑总预算
		editTotalBudget() {
			uni.showModal({
				title: '编辑' + this.month + '月总预算',
				content: '输入预算金额',
				editable: true,
				placeholderText: String(this.budgetTotal || ''),
				success: (res) => {
					if (res.confirm && res.content) {
						const val = Number(res.content)
						if (isNaN(val) || val <= 0) {
							uni.showToast({ title: '请输入有效金额', icon: 'none' })
							return
						}
						saveBudgetTotal(val)
						uni.showToast({ title: '预算已更新', icon: 'success' })
						this.loadData()
					}
				}
			})
		},
		// 编辑分类预算
		editCatBudget(cat) {
			uni.showModal({
				title: '编辑「' + cat.name + '」预算',
				content: '输入该分类预算限额',
				editable: true,
				placeholderText: String(cat.limit || ''),
				success: (res) => {
					if (res.confirm && res.content) {
						const val = Number(res.content)
						if (isNaN(val) || val < 0) {
							uni.showToast({ title: '请输入有效金额', icon: 'none' })
							return
						}
						cat.limit = val
						cat.over = cat.used > cat.limit
						// 保存到数据库
						saveBudgetCats(this.budgetCats)
						uni.showToast({ title: '预算已更新', icon: 'success' })
						this.loadData()
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.budget-hero {
	padding: 32rpx 28rpx;
}
.toggle-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
}
.toggle-title {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
	display: block;
}
.block-hint {
	display: block;
	margin-top: 4rpx;
}
.section-label {
	font-size: 24rpx;
	color: var(--text-secondary);
	padding: 8rpx 28rpx 12rpx;
	font-weight: 500;
}
.budget-cat-card {
	padding: 28rpx 32rpx;
}
.budget-cat-card--over {
	border-color: rgba(255, 107, 107, 0.25);
}
.cat-emoji {
	font-size: 36rpx;
}
.cat-name {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}
.over-tag {
	font-size: 20rpx;
	color: #fff;
	background: var(--expense);
	padding: 2rpx 12rpx;
	border-radius: 8rpx;
	margin-left: 8rpx;
}

/* 月份选择弹窗 */
.month-mask {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0,0,0,0.35);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}
.month-picker {
	background: rgba(255,255,255,0.92);
	backdrop-filter: blur(20px);
	border-radius: 32rpx;
	padding: 32rpx;
	width: 560rpx;
	box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.15);
}
.month-picker__title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1A2744;
	text-align: center;
	margin-bottom: 24rpx;
}
.month-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	justify-content: center;
}
.month-cell {
	width: 110rpx;
	height: 80rpx;
	border-radius: 20rpx;
	background: rgba(240, 247, 255, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 500;
	color: #1A2744;
}
.month-cell.on {
	background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
	color: #FFFFFF;
	box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.35);
}
.month-picker__close {
	text-align: center;
	margin-top: 24rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #8A9BB8;
}
</style>