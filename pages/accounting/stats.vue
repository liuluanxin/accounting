<template>
	<view class="cosmic-page stats-page">
		<status-bar />
		<top-bar title="统计" />

		<scroll-view scroll-y class="screen screen--pb">
			<!-- 时间维度 -->
			<view class="seg">
				<button
					v-for="r in ranges"
					:key="r.key"
					:class="{ on: statRange === r.key }"
					@click="setRange(r.key)"
				>{{ r.label }}</button>
			</view>

			<!-- 期间导航 -->
			<view class="sticky-head">
				<view class="period-flex">
					<button v-if="showArrows" class="parrow" @click="stepPeriod(-1)">
						<lucide-icon name="chevron-left" size="36rpx" />
					</button>
					<text class="period-center">{{ periodLabel }}</text>
					<button v-if="showArrows" class="parrow" @click="stepPeriod(1)">
						<lucide-icon name="chevron-right" size="36rpx" />
					</button>
				</view>
				<view class="flt" @click="onFilter">
					<lucide-icon name="sliders" size="24rpx" />
					<text>筛选</text>
				</view>
			</view>

			<!-- 收支总览 -->
			<view class="card">
				<text class="card-title">收支总览 · {{ rangeLabel }}</text>
				<text class="overview-amt" :class="statType === 'income' ? 'inc' : 'exp'">
					{{ fmt(mainAmount) }}
				</text>
				<view class="row between muted-line">
					<text class="muted">收入 {{ fmt(sd.income) }}</text>
					<text class="muted">支出 {{ fmt(sd.expense) }}</text>
				</view>
				<view class="row between muted-line">
					<text class="muted">
						结余
						<text :class="sd.balance < 0 ? 'exp' : 'inc'">{{ fmt(sd.balance) }}</text>
					</text>
					<text class="muted">共 {{ sd.count }} 笔</text>
				</view>
			</view>

			<!-- 分类统计 -->
			<view class="card">
				<view class="between">
					<text class="card-title" style="margin:0">分类统计</text>
					<view class="seg2" style="width:240rpx;margin:0">
						<button :class="{ on: statType === 'expense' }" @click="setStatType('expense')">支出</button>
						<button :class="{ on: statType === 'income' }" @click="setStatType('income')">收入</button>
					</view>
				</view>
				<view class="donut-row">
					<view class="donut" :style="{ background: donutBg }">
						<view class="hole">
							<text class="muted hole-label">{{ srcLabel }}合计</text>
							<text class="hole-amt">{{ fmt(mainAmount) }}</text>
						</view>
					</view>
					<view class="legend-col">
						<view v-if="sd.cats.length === 0" class="muted empty-cat">
							该区间暂无{{ statType === 'income' ? '收入' : '支出' }}数据
						</view>
						<view v-for="c in sd.cats" :key="c.name" class="cat-line">
							<view class="cic" :style="{ background: catColor(c.name) + '1f' }">{{ c.emoji }}</view>
							<view class="dot" :style="{ background: catColor(c.name) }" />
							<text class="cat-name">{{ c.name }}</text>
							<text class="pct">{{ c.pct }}%</text>
							<text class="val">{{ fmt(c.sum) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 收支流向 -->
			<view class="card">
				<text class="card-title" style="margin:0">收支流向</text>
				<view class="sankey">
					<view class="sankey-col">
						<view class="sankey-node" :style="{ borderColor: srcColor }">
							{{ srcLabel }} ¥{{ fmt(mainAmount) }}
						</view>
					</view>
					<view class="sankey-col">
						<view
							v-for="(node, i) in sankeyNodes"
							:key="i"
							class="sankey-node"
							:style="{ borderColor: node.color }"
						>{{ node.emoji }} {{ node.name }} {{ fmt(node.sum) }}</view>
					</view>
				</view>
			</view>

			<!-- 总账单汇总 -->
			<view class="card">
				<text class="card-title">{{ rangeLabel }}账单汇总</text>
				<view class="sum-table-wrap">
					<view class="sum-table">
						<view class="sum-row sum-head">
							<text class="sum-cell">{{ colLabel }}</text>
							<text class="sum-cell">收入</text>
							<text class="sum-cell">支出</text>
							<text class="sum-cell">结余</text>
						</view>
						<view v-for="(row, i) in tableRows" :key="i" class="sum-row">
							<text class="sum-cell">{{ row.label }}</text>
							<text class="sum-cell">{{ row.income ? fmt(row.income) : '-' }}</text>
							<text class="sum-cell">{{ row.expense ? fmt(row.expense) : '-' }}</text>
							<text class="sum-cell" :class="row.balance < 0 ? 'exp' : 'inc'">{{ fmt(row.balance) }}</text>
						</view>
						<view class="sum-row sum-total">
							<text class="sum-cell">总计</text>
							<text class="sum-cell">{{ sd.income ? fmt(sd.income) : '-' }}</text>
							<text class="sum-cell">{{ sd.expense ? fmt(sd.expense) : '-' }}</text>
							<text class="sum-cell" :class="sd.balance < 0 ? 'exp' : 'inc'">{{ fmt(sd.balance) }}</text>
						</view>
					</view>
				</view>
			</view>

			<view style="height:40rpx" />
		</scroll-view>

		<tab-bar current-tab="stats" />
	</view>
</template>

<script>
import { fmt } from '@/common/constants.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import { statData, statRows, getActiveLedgerId } from '@/common/app-data.js'
import { CAT_META } from '@/common/lucide-icons.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		const now = new Date()
		const ws = new Date()
		ws.setDate(ws.getDate() - ws.getDay() + 1)
		ws.setHours(0, 0, 0, 0)
		return {
			statRange: 'total',
			statType: 'expense',
			statYear: now.getFullYear(),
			statMonth: now.getMonth() + 1,
			statWeekStart: ws.getTime(),
			ledgerId: getActiveLedgerId(),
			ranges: [
				{ key: 'total', label: '总' },
				{ key: 'year', label: '年' },
				{ key: 'month', label: '月' },
				{ key: 'week', label: '周' }
			]
		}
	},
	computed: {
		cursor() {
			return {
				statYear: this.statYear,
				statMonth: this.statMonth,
				statWeekStart: this.statWeekStart
			}
		},
		sd() {
			const data = statData(this.statRange, this.statType, this.cursor, this.ledgerId)
			return {
				...data,
				cats: data.cats.map(c => ({
					...c,
					color: (CAT_META[c.name] || {}).color || '#c0c8d2'
				}))
			}
		},
		tableRows() {
			return statRows(this.statRange, this.sd.bills)
		},
		rangeLabel() {
			return { total: '总', year: '年', month: '月', week: '周' }[this.statRange]
		},
		colLabel() {
			return { total: '年份', year: '月份', month: '周期', week: '日期' }[this.statRange]
		},
		showArrows() {
			return this.statRange !== 'total'
		},
		periodLabel() {
			if (this.statRange === 'total') return '全部列表'
			if (this.statRange === 'year') return `${this.statYear}年`
			if (this.statRange === 'month') return `${this.statYear}年${this.statMonth}月`
			const ws = new Date(this.statWeekStart)
			const we = new Date(this.statWeekStart)
			we.setDate(we.getDate() + 6)
			return `${ws.getMonth() + 1}月${ws.getDate()}日 - ${we.getMonth() + 1}月${we.getDate()}日`
		},
		mainAmount() {
			return this.statType === 'income' ? this.sd.income : this.sd.expense
		},
		srcLabel() {
			return this.statType === 'income' ? '收入' : '支出'
		},
		srcColor() {
			return this.statType === 'income' ? 'var(--income)' : 'var(--expense)'
		},
		donutBg() {
			const cats = this.sd.cats
			if (!cats.length) return 'conic-gradient(#c0c8d2 0 100%)'
			let from = 0
			const stops = cats.map(c => {
				const to = from + c.pct
				const s = `${c.color} ${from}% ${to}%`
				from = to
				return s
			})
			return `conic-gradient(${stops.join(',')})`
		},
		sankeyNodes() {
			const top = this.sd.cats.slice(0, 3)
			const otherSum = this.sd.cats.slice(3).reduce((s, c) => s + c.sum, 0)
			const nodes = top.map(c => ({
				name: c.name,
				sum: c.sum,
				emoji: c.emoji,
				color: c.color
			}))
			if (otherSum > 0) {
				nodes.push({ name: '其他', sum: otherSum, emoji: '📦', color: '#c0c8d2' })
			}
			if (nodes.length === 0) {
				nodes.push({ name: '暂无数据', sum: 0, emoji: '', color: '#c0c8d2' })
			}
			return nodes
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		fmt,
		catColor(name) {
			return (CAT_META[name] || {}).color || '#c0c8d2'
		},
		setRange(r) {
			this.statRange = r
			const now = new Date()
			if (r === 'year') this.statYear = now.getFullYear()
			else if (r === 'month') {
				this.statYear = now.getFullYear()
				this.statMonth = now.getMonth() + 1
			} else if (r === 'week') {
				const ws = new Date()
				ws.setDate(ws.getDate() - ws.getDay() + 1)
				ws.setHours(0, 0, 0, 0)
				this.statWeekStart = ws.getTime()
			}
		},
		setStatType(t) {
			this.statType = t
		},
		stepPeriod(dir) {
			if (this.statRange === 'year') {
				this.statYear += dir
			} else if (this.statRange === 'month') {
				let m = this.statMonth - 1 + dir
				let y = this.statYear
				if (m < 0) { m = 11; y-- }
				else if (m > 11) { m = 0; y++ }
				this.statMonth = m + 1
				this.statYear = y
			} else if (this.statRange === 'week') {
				this.statWeekStart += dir * 7 * 86400000
			}
		},
		onFilter() {
			uni.showToast({ title: '筛选', icon: 'none' })
		}
	}
}
</script>

<style lang="scss" scoped>
.stats-page {
	height: 100vh;
	overflow: hidden;
}

.seg {
	display: flex;
	background: #eef1f5;
	border-radius: 20rpx;
	padding: 6rpx;
	margin: 0 28rpx 24rpx;
	height: 80rpx;
	align-items: center;
}
.seg button {
	flex: 1;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-secondary);
	border-radius: 16rpx;
	border: none;
	background: transparent;
}
.seg button.on {
	background: #fff;
	color: var(--primary);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.sticky-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 28rpx 16rpx;
}
.period-flex {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	flex: 1;
}
.period-center {
	font-size: 30rpx;
	font-weight: 600;
	color: var(--text-primary);
	min-width: 200rpx;
	text-align: center;
}
.parrow {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.8);
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
}
.flt {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 26rpx;
	color: var(--primary);
	flex-shrink: 0;
}

.overview-amt {
	display: block;
	font-size: 52rpx;
	font-weight: 800;
	margin-top: 8rpx;
	letter-spacing: -2rpx;
}
.muted-line {
	justify-content: space-between;
	font-size: 26rpx;
	margin-top: 8rpx;
}

.donut-row {
	display: flex;
	align-items: center;
	gap: 28rpx;
	margin-top: 16rpx;
}
.donut {
	width: 220rpx;
	height: 220rpx;
	border-radius: 50%;
	flex: none;
	position: relative;
}
.hole {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 148rpx;
	height: 148rpx;
	border-radius: 50%;
	background: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4rpx;
}
.hole-label {
	font-size: 22rpx;
}
.hole-amt {
	font-size: 26rpx;
	font-weight: 800;
	color: var(--text-primary);
}
.legend-col {
	flex: 1;
	min-width: 0;
}
.empty-cat {
	font-size: 24rpx;
	text-align: center;
	padding: 16rpx 0;
}
.cat-line {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 14rpx 0;
	font-size: 26rpx;
}
.cic {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	flex: none;
}
.cat-line .dot {
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	flex: none;
}
.cat-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.pct {
	color: var(--text-secondary);
	width: 80rpx;
	text-align: right;
	flex: none;
	font-size: 22rpx;
}
.val {
	font-weight: 600;
	flex: none;
}

.sankey {
	height: 240rpx;
	display: flex;
	align-items: stretch;
	overflow: hidden;
	border-radius: 20rpx;
	background: #fafbfc;
	margin-top: 16rpx;
}
.sankey-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 16rpx;
	padding: 16rpx;
}
.sankey-node {
	background: #fff;
	border-radius: 16rpx;
	padding: 16rpx 20rpx;
	font-size: 22rpx;
	box-shadow: 0 2rpx 8rpx rgba(91, 140, 210, 0.08);
	border-left: 6rpx solid transparent;
}

.sum-table-wrap {
	margin-top: 8rpx;
}
.sum-table {
	width: 100%;
}
.sum-row {
	display: flex;
	border-bottom: 1rpx solid var(--divider);
}
.sum-row.sum-head .sum-cell {
	color: var(--text-secondary);
	font-size: 24rpx;
	font-weight: 500;
}
.sum-row.sum-total {
	font-weight: 700;
	border-bottom: none;
}
.sum-cell {
	flex: 1;
	padding: 18rpx 8rpx;
	font-size: 26rpx;
	color: var(--text-primary);
	text-align: left;
}
</style>
