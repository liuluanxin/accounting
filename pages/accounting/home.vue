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

			<!-- 账户 
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
			-->
			<view class="bill-section-header">
				<text>全部账单</text>
				<text class="link" @click="goAllTransactions">全部账单
					<lucide-icon name="chevron-right" size="16rpx" />
				</text>
			</view>
			<view v-if="bills.length === 0" class="empty">
				<view class="ei"><lucide-icon name="calendar" size="64rpx" /></view>
				<text>暂无账单记录</text>
			</view>
			<view v-else class="bill-list">
				<view v-for="(bg, i) in bills" :key="i" class="bill-day-group">
					<view class="section-header" @click="toggleCollapse(i)">
						<text>{{ formatDateLabel(bg.ts) }}</text>
						<view class="section-header-right">
							<text v-if="bg.income" class="section-income">收 {{ fmt(bg.income) }}</text>
							<text v-if="bg.expense" class="section-expense">支 -{{ fmt(bg.expense) }}</text>
							<view class="section-fold">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:20rpx;height:20rpx;display:block">
									<path :d="collapsedMap[i] ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5'" />
								</svg>
							</view>
						</view>
					</view>
					<view v-if="!collapsedMap[i]">
						<view v-if="isToday(bg.date)" class="today-card">
							<uni-swipe-action-item
								v-for="(item, j) in bg.items" :key="reloadKey + '-' + i + '-' + j"
								:right-options="swipeDeleteOpt"
								@click="onSwipeDelete($event, item)"
								@touchmove.stop.prevent
							>
								<view class="tx-item" @click="editBill(item)">
									<view class="tx-icon" :class="item.amt > 0 ? 'income' : 'expense'">{{ item.iconEmoji }}</view>
									<view class="tx-info">
										<view class="tx-title">{{ item.name }}</view>
										<view class="tx-meta">
											<text>{{ item.acc }}</text>
											<text v-if="item.note" class="tx-note"> · {{ item.note }}</text>
										</view>
									</view>
									<view class="tx-amount">
										<view class="value" :class="item.amt > 0 ? 'inc' : 'exp'">{{ item.amt > 0 ? fmt(item.amt) : '-' + fmt(Math.abs(item.amt)) }}</view>
										<view v-if="item.excludeBudget" class="method">不计入预算</view>
									</view>
								</view>
							</uni-swipe-action-item>
						</view>
						<view v-else>
							<uni-swipe-action-item
								v-for="(item, j) in bg.items" :key="reloadKey + '-' + i + '-' + j"
								:right-options="swipeDeleteOpt"
								@click="onSwipeDelete($event, item)"
								@touchmove.stop.prevent
							>
								<view class="tx-item" @click="editBill(item)">
									<view class="tx-icon" :class="item.amt > 0 ? 'income' : 'expense'">{{ item.iconEmoji }}</view>
									<view class="tx-info">
										<view class="tx-title">{{ item.name }}</view>
										<view class="tx-meta">
											<text>{{ item.acc }}</text>
											<text v-if="item.note" class="tx-note"> · {{ item.note }}</text>
										</view>
									</view>
									<view class="tx-amount">
										<view class="value" :class="item.amt > 0 ? 'inc' : 'exp'">{{ item.amt > 0 ? fmt(item.amt) : '-' + fmt(Math.abs(item.amt)) }}</view>
										<view v-if="item.excludeBudget" class="method">不计入预算</view>
									</view>
								</view>
							</uni-swipe-action-item>
						</view>
					</view>
				</view>
				<view class="end-line">已经到底了</view>
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
import { getAccounts, getLedgers, getLedger, getHomeSummary, getYearBills, getActiveLedgerId, setActiveLedgerId, deleteBill, saveBudgetTotal } from '@/common/app-data.js'
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
			reloadKey: 0,
			collapsedMap: {}
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
			this.bills = getYearBills(lid)
			this.reloadKey++
		},
		isBrand(ic) {
			return isBrandIcon(ic)
		},
		formatDateLabel(ts) {
			const d = new Date(ts)
			const now = new Date()
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
			const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
			const diff = (today - target) / 86400000
			const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
			const wd = weekdays[d.getDay()]
			if (diff === 0) return `今天 ${wd}`
			if (diff === 1) return `昨天 ${wd}`
			return `${d.getMonth() + 1}/${d.getDate()} ${wd}`
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
		},
		isToday(dateLabel) {
			const now = new Date()
			const today = `${now.getMonth() + 1}月${now.getDate()}日`
			return dateLabel === today
		},
		toggleCollapse(i) {
			const key = String(i)
			this.collapsedMap = { ...this.collapsedMap, [key]: !this.collapsedMap[key] }
		}
	}
}
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
