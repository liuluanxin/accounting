<template>
	<view class="cosmic-page home-page">
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
						<view>结余 <text :class="summary.monthBalance >= 0 ? 'inc' : 'exp'">{{ fmt(summary.monthBalance) }}</text></view>
					</view>
				</view>
				<view class="hero-planet">
					<view class="planet-ring"></view>
					<view class="planet-body"></view>
					<view class="planet-sun"></view>
					<text class="planet-yen">¥</text>
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
						<view class="hole">
							<text class="ring-pct">{{ budgetRemainPct }}%</text>
						</view>
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
							<lucide-icon :name="acc.ic" :brand="isBrand(acc.ic)" size="72rpx" />
						</view>
						<text class="nm">{{ acc.name }}</text>
						<text class="bl">{{ fmt(acc.bal) }}</text>
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
						<uni-swipe-action-item
							v-for="(item, j) in bg.items" :key="reloadKey + '-' + i + '-' + j"
							:right-options="swipeDeleteOpt"
							@click="onSwipeDelete($event, item)"
							@touchmove.stop.prevent
						>
							<view class="bill-item" @click="editBill(item)">
								<view class="bic">{{ item.iconEmoji }}</view>
								<view class="bill-info-wrap">
									<view class="bnm">{{ item.name }}</view>
									<view class="bac">{{ item.acc }}</view>
									<view class="bnn" v-if="item.note">{{ item.note }}</view>
								</view>
								<view class="bill-amt-wrap">
									<view class="bam" :class="item.amt > 0 ? 'inc' : 'exp'">{{ item.amt > 0 ? '+' : '' }}{{ fmt(item.amt) }}</view>
									<view v-if="item.excludeBudget" class="budget-badge">不计入预算</view>
								</view>
							</view>
						</uni-swipe-action-item>
					</view>
					<view class="end-line">已经到底了</view>
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
import { getAccounts, getLedgers, getLedger, getHomeSummary, getRecentBills, getActiveLedgerId, setActiveLedgerId, deleteBill, saveBudgetTotal } from '@/common/app-data.js'
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
			ledgers: getLedgers(),
			swipeDeleteOpt: [{
				text: '删除',
				style: { backgroundColor: '#E85D5D' }
			}],
			reloadKey: 0
		}
	},
	computed: {
		budgetRingStyle() {
			const pct = this.summary.budgetPercent || 0
			return {
				background: `conic-gradient(#FFB020 0 ${pct}%, #E3ECF7 ${pct}% 100%)`
			}
		},
		budgetRemainPct() {
			const pct = this.summary.budgetPercent || 0
			return Math.round(100 - pct)
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
			this.reloadKey++
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
			uni.showModal({
				title: '编辑总预算',
				content: '输入本月总预算金额',
				editable: true,
				placeholderText: String(this.summary.budgetTotal || ''),
				success: (res) => {
					if (res.confirm && res.content) {
						const val = Number(res.content)
						if (isNaN(val) || val <= 0) {
							uni.showToast({ title: '请输入有效金额', icon: 'none' })
							return
						}
						saveBudgetTotal(val)
						this.loadData()
						uni.showToast({ title: '预算已更新', icon: 'success' })
					}
				}
			})
		},
		editBill(item) {
			uni.navigateTo({ url: '/pages/accounting/bill-detail?id=' + item.id })
		},
		onSwipeDelete(e, item) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这笔账单吗？',
				success: (res) => {
					if (res.confirm) {
						deleteBill(item.id)
						this.loadData()
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
