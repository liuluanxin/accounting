<template>
	<view class="cosmic-page budget-page">
		<status-bar />
		<top-bar title="预算" show-back :right-text="monthLabel" @right="onMonthPick" />

		<scroll-view scroll-y class="screen">
			<!-- 月度总预算 -->
			<view class="card budget-hero">
				<view class="between">
					<text class="card-title" style="margin:0">本月总预算</text>
					<text class="amount-lg">¥{{ fmt(budgetTotal) }}</text>
				</view>
				<view class="between mt-16">
					<text class="muted">已使用 ¥{{ fmt(budgetUsed) }}</text>
					<text class="muted">剩余 ¥{{ fmt(monthRemain) }}</text>
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
			<view class="section-label">分类预算</view>
			<view
				v-for="(cat, i) in budgetCats"
				:key="i"
				class="card budget-cat-card"
				:class="{ 'budget-cat-card--over': cat.over }"
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
						{{ cat.over ? '超出 ¥' + fmt(cat.used - cat.limit) : '剩余 ¥' + fmt(cat.limit - cat.used) }}
					</text>
				</view>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>
	</view>
</template>

<script>
import {
	fmt,
	getBudgetTotal,
	getBudgetCats,
	getBills,
	getActiveLedgerId
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
			month: new Date().getMonth() + 1
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
		this.ledgerId = getActiveLedgerId()
		this.budgetTotal = getBudgetTotal()
		this.budgetCats = getBudgetCats().map(c => ({ ...c }))
		// 计算本月实际支出（按账本过滤）
		const now = new Date()
		const ms = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
		const me = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
		const lid = this.ledgerId
		this.budgetUsed = getBills().filter(b =>
			b.ts >= ms && b.ts < me && b.amt < 0 &&
			(lid === 'general' || b.ledger === lid)
		).reduce((s, b) => s + Math.abs(b.amt), 0)
	},
	methods: {
		fmt,
		catEmoji,
		catPct(cat) {
			return cat.limit > 0 ? Math.min(100, Math.round(cat.used / cat.limit * 100)) : 0
		},
		onMonthPick() {
			uni.showToast({ title: '选择月份', icon: 'none' })
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
</style>
