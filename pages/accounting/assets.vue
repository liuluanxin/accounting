<template>
	<view class="cosmic-page assets-page">
		<status-bar />
		<top-bar title="资产" />

		<scroll-view scroll-y class="screen screen--pb">
			<!-- 净资产卡片 -->
			<view class="card net-card">
				<text class="muted">净资产</text>
				<text class="net">¥{{ fmt(netAssets) }}</text>
				<view class="acc-list">
					<view v-for="(acc, i) in accounts" :key="i" class="acc-row">
						<view class="acc-row-left">
							<lucide-icon :name="acc.ic" :brand="isBrand(acc.ic)" size="72rpx" />
							<text class="acc-name">{{ acc.name }}</text>
						</view>
						<text class="acc-bal">¥{{ fmt(acc.bal) }}</text>
					</view>
				</view>
			</view>

			<!-- 本月预算 -->
			<view class="card" @click="goBudget">
				<view class="between">
					<text class="card-title" style="margin:0">本月预算</text>
					<text class="muted budget-meta">
						¥{{ fmt(budgetTotal) }} / 已用 {{ fmt(budgetUsed) }}
						<lucide-icon name="chevron-right" size="20rpx" />
					</text>
				</view>
				<view class="progress warn">
					<view class="progress-fill" :style="{ width: budgetPct + '%' }" />
				</view>
				<text class="muted pct-label">{{ budgetPct }}%</text>
			</view>

			<view class="add-link" @click="goAddAccount">
				<lucide-icon name="plus" size="28rpx" />
				<text>添加账户</text>
			</view>

			<view style="height:40rpx" />
		</scroll-view>

		<tab-bar current-tab="assets" />
	</view>
</template>

<script>
import { fmt } from '@/common/constants.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import { getNetAssets, getBudgetTotal, getAccounts, getBills, getActiveLedgerId } from '@/common/app-data.js'
import { isBrandIcon } from '@/common/lucide-icons.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		return {
			accounts: [],
			budgetTotal: 0,
			budgetUsed: 0,
			ledgerId: getActiveLedgerId()
		}
	},
	computed: {
		netAssets() {
			return getNetAssets()
		},
		budgetPct() {
			return this.budgetTotal > 0
				? Math.floor(this.budgetUsed / this.budgetTotal * 100)
				: 0
		}
	},
	onShow() {
		applyThemeToPage(this)
		this.ledgerId = getActiveLedgerId()
		this.accounts = getAccounts()
		this.budgetTotal = getBudgetTotal()
		// 计算本月支出（按账本过滤）
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
		isBrand(ic) {
			return isBrandIcon(ic)
		},
		goBudget() {
			uni.navigateTo({ url: '/pages/accounting/budget' })
		},
		goAddAccount() {
			uni.navigateTo({ url: '/pages/accounting/add-account' })
		}
	}
}
</script>

<style lang="scss" scoped>
.assets-page {
	height: 100vh;
	overflow: hidden;
}

.net-card {
	padding-bottom: 8rpx;
}

.net {
	display: block;
	font-size: 60rpx;
	font-weight: 800;
	color: var(--text-primary);
	margin: 8rpx 0 24rpx;
	letter-spacing: -2rpx;
}

.acc-list {
	border-top: 1rpx solid var(--divider);
	padding-top: 8rpx;
}

.acc-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
	border-bottom: 1rpx solid var(--divider);
}
.acc-row:last-child {
	border-bottom: none;
}

.acc-row-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.acc-name {
	font-size: 28rpx;
	color: var(--text-primary);
}

.acc-bal {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.budget-meta {
	display: flex;
	align-items: center;
	gap: 4rpx;
	font-size: 24rpx;
}

.progress {
	height: 16rpx;
	background: var(--divider);
	border-radius: 8rpx;
	overflow: hidden;
	margin-top: 16rpx;
}
.progress.warn .progress-fill {
	background: var(--warning);
}
.progress-fill {
	height: 100%;
	border-radius: 8rpx;
	background: var(--primary);
	transition: width 0.4s ease;
}

.pct-label {
	display: block;
	font-size: 24rpx;
	margin-top: 12rpx;
}

.add-link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	margin: 0 28rpx;
	padding: 24rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--primary);
}
</style>
