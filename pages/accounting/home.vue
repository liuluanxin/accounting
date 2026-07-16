<template>
	<view class="cosmic-page home-page">
		<status-bar />
		<top-bar
			variant="home"
			:current-ledger="currentLedger"
			:ledgers="ledgers"
			@search="onSearch"
			@all-bills="goAllTransactions"
			@customize="goCustomize"
			@ledger-change="onLedgerChange"
		/>

		<scroll-view scroll-y class="screen home-screen">
			<!-- Hero -->
			<view class="hero">
				<view class="hero-main">
					<text class="lab">{{ summary.month }}月 · 支出</text>
					<text class="amt">{{ fmt(summary.monthExpense) }}</text>
					<view class="sub">
						<text>收入 {{ fmt(summary.monthIncome) }}</text>
						<text>结余 <text :class="summary.monthBalance >= 0 ? 'inc' : 'exp'">{{ fmt(summary.monthBalance) }}</text></text>
					</view>
				</view>
				<view class="hero-planet">
					<svg viewBox="0 0 100 100" width="100%" height="100%">
						<defs><radialGradient id="pg" cx="38%" cy="32%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#BFE0FF"/></radialGradient></defs>
						<ellipse cx="50" cy="54" rx="45" ry="13" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4" transform="rotate(-22 50 54)"/>
						<circle cx="48" cy="46" r="27" fill="url(#pg)"/>
						<circle cx="76" cy="28" r="12" fill="#FFD66B" stroke="#fff" stroke-width="2.5"/>
						<text x="76" y="33" text-anchor="middle" fill="#B7791F" font-size="15" font-weight="bold" font-family="system-ui,sans-serif">¥</text>
					</svg>
				</view>
			</view>

			<!-- 预算 -->
			<view class="card" @click="goBudget">
				<view class="between" style="margin-bottom:8px">
					<text class="card-title" style="margin:0">本月预算</text>
					<text class="link" @click.stop="showBudgetSettings">
						<lucide-icon name="pencil" size="24rpx" />
						{{ fmt(summary.budgetTotal) }}
					</text>
				</view>
				<view class="ring-wrap">
					<view class="ring" :style="budgetRingStyle">
						<view class="hole" />
					</view>
					<view style="flex:1">
						<view class="row" style="justify-content:space-between;font-size:26rpx">
							<text class="muted">已消费</text>
							<text>{{ fmt(summary.budgetUsed) }}</text>
						</view>
						<view class="row" style="justify-content:space-between;font-size:26rpx">
							<text class="muted">剩余额度</text>
							<text style="font-weight:600">{{ fmt(summary.budgetRemain) }}</text>
						</view>
						<view class="muted" style="font-size:24rpx;margin-top:12rpx">
							本月日均 {{ fmt(summary.dailyBudget) }} · 剩余每日可消费 {{ fmt(summary.todayAvailable) }}
						</view>
					</view>
				</view>
			</view>

			<!-- 账户 -->
			<view class="card">
				<view class="card-title">我的账户</view>
				<scroll-view scroll-x class="asset-scroll" show-scrollbar="false">
					<view v-for="(acc, i) in accounts" :key="i" class="asset-pill" @click="goAssetPage">
						<view class="ic">
							<lucide-icon :name="acc.ic" :brand="isBrand(acc.ic)" size="44rpx" />
						</view>
						<text class="nm">{{ acc.name }}</text>
						<text class="bl">¥{{ fmt(acc.bal) }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 近7天账单 -->
			<view class="card">
				<view class="between" style="margin-bottom:8rpx">
					<text class="card-title" style="margin:0">近7天账单</text>
					<text class="link" @click="goAllTransactions">全部账单
						<lucide-icon name="chevron-right" size="16rpx" />
					</text>
				</view>
				<view v-if="bills.length === 0" class="empty">
					<view class="ei"><lucide-icon name="calendar" size="64rpx" /></view>
					<text>暂无账单记录</text>
				</view>
				<view v-else class="bill-group">
					<view v-for="(bg, i) in bills" :key="i" style="margin-bottom:16rpx">
						<view class="ghead">{{ bg.date }} · <text class="exp">支 {{ fmt(Math.abs(bg.sum)) }}</text></view>
						<view v-for="(item, j) in bg.items" :key="j" class="bill-item" @click="editBill(item)">
							<view class="bic">{{ item.iconEmoji }}</view>
							<view class="bill-info-wrap">
								<view class="bnm">{{ item.name }}</view>
								<view class="bac">{{ item.acc }}</view>
							</view>
							<view class="bill-amt-wrap">
								<view class="bam" :class="item.amt > 0 ? 'inc' : 'exp'">{{ item.amt > 0 ? '+' : '' }}{{ fmt(item.amt) }}</view>
								<view v-if="item.excludeBudget" class="budget-badge">不计入预算</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="fab" @click="goRecord">
			<lucide-icon name="plus" size="36rpx" color="#FFFFFF" />
		</view>

		<tab-bar current-tab="home" />
	</view>
</template>

<script>
import { fmt } from '@/common/constants.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import { getAccounts, getLedgers, getLedger, getHomeSummary, getRecentBills, getActiveLedgerId, setActiveLedgerId } from '@/common/app-data.js'
import { isBrandIcon } from '@/common/lucide-icons.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		return {
			accounts: [],
			bills: [],
			summary: {},
			currentLedger: getLedger(getActiveLedgerId()),
			ledgers: getLedgers()
		}
	},
	computed: {
		budgetRingStyle() {
			const pct = this.summary.budgetPercent || 0
			return {
				background: `conic-gradient(#FFB020 0 ${pct}%, #E3ECF7 ${pct}% 100%)`
			}
		}
	},
	onShow() {
		applyThemeToPage(this)
		// 同步全局选中账本
		this.currentLedger = getLedger(getActiveLedgerId())
		this.loadData()
	},
	methods: {
		fmt,
		loadData() {
			const lid = this.currentLedger.id
			this.summary = getHomeSummary(lid)
			this.accounts = getAccounts()
			this.bills = getRecentBills(7, lid)
		},
		isBrand(ic) {
			return isBrandIcon(ic)
		},
		onSearch() {
			uni.showToast({ title: '搜索', icon: 'none' })
		},
		onLedgerChange(l) {
			this.currentLedger = l
			setActiveLedgerId(l.id)
			uni.$emit('ledgerChange', l.id)
			this.loadData()
		},
		goCustomize() {
			uni.navigateTo({ url: '/pages/accounting/customize' })
		},
		goRecord() {
			uni.navigateTo({ url: '/pages/accounting/record' })
		},
		goAssetPage() {
			uni.reLaunch({ url: '/pages/accounting/assets' })
		},
		goAllTransactions() {
			uni.navigateTo({ url: '/pages/accounting/all-transactions' })
		},
		goBudget() {
			uni.navigateTo({ url: '/pages/accounting/budget' })
		},
		showBudgetSettings() {
			uni.showToast({ title: '编辑总预算', icon: 'none' })
		},
		editBill(item) {
			uni.navigateTo({ url: '/pages/accounting/bill-detail?id=' + item.id })
		}
	}
}
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
