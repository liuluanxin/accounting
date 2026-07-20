<template>
	<view class="cosmic-page all-tx-page">
		<top-bar title="全部账单" show-back />

		<scroll-view scroll-y class="screen">
			<!-- 汇总 -->
			<view class="card sum-card">
				<view class="between">
					<text class="muted">共 {{ billData.count }} 笔</text>
					<text class="muted">结余</text>
				</view>
				<text class="amount-lg" :class="billData.totalBalance >= 0 ? 'inc' : 'exp'">
					{{ billData.totalBalance >= 0 ? '+' : '' }}{{ fmt(billData.totalBalance) }}
				</text>
				<view class="between mt-12">
					<view>
						<text class="muted">收入</text>
						<text class="inc block-amt">+{{ fmt(billData.totalInc) }}</text>
					</view>
					<view class="text-right">
						<text class="muted">支出</text>
						<text class="exp block-amt">{{ fmt(billData.totalExp) }}</text>
					</view>
				</view>
			</view>

			<!-- 粘性筛选行 -->
			<view class="sticky-filter">
				<view class="flts">
					<view class="flt" :class="{ on: bookFilter !== '全部账本' }" @click="cycleBook">
						<text>{{ bookFilter }}</text>
						<lucide-icon name="chevron-down" size="20rpx" />
					</view>
					<view class="flt" :class="{ on: dateFilter !== '全部' }" @click="cycleDate">
						<text>{{ dateFilter }}</text>
						<lucide-icon name="chevron-down" size="20rpx" />
					</view>
					<view class="flt" @click="onMoreFilter">
						<text>筛选</text>
						<lucide-icon name="sliders" size="20rpx" />
					</view>
				</view>
			</view>

			<!-- 账单分组 -->
			<view v-if="billData.groups.length" class="bill-list">
				<view v-for="(bg, i) in billData.groups" :key="i" class="bill-group">
					<view class="g-header">
						<text class="date">{{ bg.date }}</text>
						<text class="sum" :class="bg.sum >= 0 ? 'inc' : 'exp'">
							{{ bg.sum >= 0 ? '收' : '支' }} {{ fmt(Math.abs(bg.sum)) }}
						</text>
					</view>
					<view class="g-body">
						<view
							v-for="(item, j) in bg.items"
							:key="j"
							class="bill-item"
							@click="onBillTap(item)"
						>
							<view class="bic">{{ catEmoji(item.ic) }}</view>
							<view class="flex-1">
								<view class="bnm">{{ item.name }}</view>
								<view class="bac">{{ item.acc }}</view>
							</view>
							<view>
								<view class="bam" :class="item.amt > 0 ? 'inc' : 'exp'">
									{{ item.amt > 0 ? '+' : '' }}{{ fmt(item.amt) }}
								</view>
								<view v-if="item.excludeBudget" class="budget-badge">不计入预算</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-else class="empty">
				<view class="ei"><lucide-icon name="receipt" size="64rpx" /></view>
				<text>暂无账单记录</text>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>
	</view>
</template>

<script>
import { fmt, filterBills } from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

const BOOK_OPTS = ['全部账本', '微信', '现金', '交通银行', '银行卡']
const DATE_OPTS = ['全部', '今天', '本月']

export default {
	data() {
		return {
			bookFilter: '全部账本',
			dateFilter: '全部',
			bookIdx: 0,
			dateIdx: 0
		}
	},
	computed: {
		billData() {
			return filterBills(this.bookFilter, this.dateFilter)
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		fmt,
		catEmoji,
		cycleBook() {
			this.bookIdx = (this.bookIdx + 1) % BOOK_OPTS.length
			this.bookFilter = BOOK_OPTS[this.bookIdx]
		},
		cycleDate() {
			this.dateIdx = (this.dateIdx + 1) % DATE_OPTS.length
			this.dateFilter = DATE_OPTS[this.dateIdx]
		},
		onMoreFilter() {
			uni.showToast({ title: '高级筛选', icon: 'none' })
		},
		onBillTap(item) {
			uni.navigateTo({ url: '/pages/accounting/bill-detail?id=' + item.id })
		}
	}
}
</script>

<style lang="scss" scoped>
.all-tx-page .screen {
	padding-bottom: 40rpx;
}
.sum-card {
	padding: 32rpx 28rpx;
}
.block-amt {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	margin-top: 4rpx;
}
.sticky-filter {
	position: sticky;
	top: 0;
	z-index: 10;
	padding: 0 28rpx 16rpx;
	background: linear-gradient(180deg, rgba(234, 244, 255, 0.98) 0%, rgba(241, 236, 255, 0.95) 80%, transparent 100%);
	backdrop-filter: blur(12rpx);
}
.bill-list {
	padding-top: 8rpx;
}
.badge-row {
	text-align: right;
	margin-top: 8rpx;
}
.badge {
	display: inline-block;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	background: var(--divider);
	font-size: 20rpx;
	color: var(--text-muted);
}
.budget-badge {
	display: inline-block;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	background: #FFF3E0;
	font-size: 18rpx;
	color: #E65100;
	margin-top: 4rpx;
	line-height: 1.4;
}
</style>
