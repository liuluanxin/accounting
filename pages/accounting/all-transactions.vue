<template>
	<view class="bills-page">
		<scroll-view scroll-y class="bills-scroll" @scroll="onScroll">
			<view class="summary-card">
				<view class="summary-row">
					<view class="summary-item">
						<text class="summary-label">总支出</text>
						<text class="summary-amount expense">¥{{ formatMoney(summary.expense) }}</text>
					</view>
					<view class="summary-item">
						<text class="summary-label">总收入</text>
						<text class="summary-amount income">¥{{ formatMoney(summary.income) }}</text>
					</view>
				</view>
				<view class="weekly-bar" :class="{ 'has-data': maxWeeklyAmount > 0 }">
					<view v-for="(day, i) in weeklyData" :key="i" class="bar-col">
						<view class="bar-fill" :class="{ current: i === weeklyData.length - 1 }" :style="{ height: day.height + '%' }"></view>
						<text class="bar-label" :class="{ current: i === weeklyData.length - 1 }">{{ day.label }}</text>
					</view>
				</view>
			</view>

			<view v-if="filteredTxs.length === 0" class="empty">
				<text class="empty-icon">🗒️</text>
				<text class="empty-text">暂无账单记录</text>
			</view>

			<view v-for="group in visibleGroups" :key="group.date" class="date-group">
				<view class="group-header">
					<text class="group-date">{{ group.dateLabel }}</text>
					<text class="group-total" :class="group.expense > 0 ? 'expense' : 'income'">
						{{ group.expense > 0 ? '-' : '+' }}¥{{ formatMoney(group.expense > 0 ? group.expense : group.income) }}
					</text>
				</view>
				<view class="tx-card">
					<view v-for="tx in group.items" :key="tx.id" class="tx-item" @click="showTxDetail(tx)">
						<view class="tx-icon">{{ getCategoryEmoji(tx.category) }}</view>
						<view class="tx-info">
							<text class="tx-title">{{ tx.note || getCategoryName(tx.category) }}</text>
							<text class="tx-category">{{ getCategoryName(tx.category) }}</text>
						</view>
						<text class="tx-amount" :class="tx.type">{{ tx.type === 'income' ? '+' : '-' }}¥{{ formatMoney(tx.amount) }}</text>
					</view>
				</view>
			</view>

			<view v-if="visibleGroups.length < groupedTxs.length" class="load-more">
				<text class="load-more-text">上滑加载更多...</text>
			</view>
			<view v-else-if="filteredTxs.length > 0" class="load-more">
				<text class="load-more-text">— 已显示全部 {{ filteredTxs.length }} 条账单 —</text>
			</view>

			<view style="height: 220rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import { formatMoney, CAT_ICONS } from '@/common/accounting-utils.js'

export default {
	components: {},
	data() {
		return {
			filter: {
				type: 'all',
				date: 'current'
			},
			renderLimit: 50,   // 初始渲染条数
			pageSize: 30        // 每次加载更多条数
		}
	},
	computed: {
		...mapState('accounting', ['data', 'homeYear', 'homeMonth']),
		filteredTxs() {
			const cur = (this.data.ledgers || []).find(l => l.current)
			const curId = cur ? cur.id : null
			return (this.data.transactions || []).filter(tx => {
				if (this.filter.type !== 'all' && tx.type !== this.filter.type) return false
				if (tx.ledgerId && curId && tx.ledgerId !== curId) return false
				if (this.filter.date === 'current') {
					const p = `${this.homeYear}-${String(this.homeMonth).padStart(2, '0')}`
					return tx.date && tx.date.startsWith(p)
				}
				if (this.filter.date !== 'all') {
					return tx.date && tx.date.startsWith(this.filter.date)
				}
				return true
			})
		},
		summary() {
			let income = 0, expense = 0
			this.filteredTxs.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount })
			return { income, expense, balance: income - expense }
		},
		maxWeeklyAmount() {
			return Math.max(...this.weeklyData.map(d => d.amount), 0)
		},
		weeklyData() {
			const days = ['一', '二', '三', '四', '五', '六', '日']
			const data = []
			const today = new Date()
			for (let i = 6; i >= 0; i--) {
				const d = new Date(today.getTime() - i * 86400000)
				const dateStr = d.toISOString().slice(0, 10)
				const dayLabel = days[d.getDay() === 0 ? 6 : d.getDay() - 1]
				const txs = this.data.transactions.filter(t => t.date === dateStr && t.type === 'expense')
				const amount = txs.reduce((sum, t) => sum + t.amount, 0)
				data.push({ label: dayLabel, amount, date: dateStr })
			}
			const max = Math.max(...data.map(d => d.amount), 1)
			return data.map(d => ({ ...d, height: (d.amount / max * 100).toFixed(0) }))
		},
		groupedTxs() {
			const map = {}
			this.filteredTxs.forEach(tx => {
				if (!map[tx.date]) map[tx.date] = []
				map[tx.date].push(tx)
			})
			return Object.keys(map).sort((a, b) => b.localeCompare(a)).map(date => {
				const items = map[date].sort((a, b) => b.time.localeCompare(a.time))
				let income = 0, expense = 0
				items.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount })
				return { date, dateLabel: this.formatDateLabel(date), items, income, expense }
			})
		},
		// 分页：按 renderLimit 截取可见的交易组列表
		visibleGroups() {
			let count = 0
			const result = []
			for (const group of this.groupedTxs) {
				const remaining = this.renderLimit - count
				if (remaining <= 0) break
				if (group.items.length <= remaining) {
					result.push(group)
					count += group.items.length
				} else {
					result.push({ ...group, items: group.items.slice(0, remaining) })
					count += remaining
				}
			}
			return result
		}
	},
	methods: {
		formatMoney,
		formatDateLabel(d) {
			const today = new Date()
			const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
			const yesterday = new Date(today.getTime() - 86400000)
			const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
			if (d === todayStr) return '今天'
			if (d === yStr) return '昨天'
			const date = new Date(d)
			const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
			const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
			return `${months[date.getMonth()]}${date.getDate()}日 ${weekdays[date.getDay()]}`
		},
		getCategoryName(cat) {
			if (!cat) return '其他'
			return cat
		},
		getCategoryEmoji(cat) {
			return CAT_ICONS[cat] || '📦'
		},
		showTxDetail(tx) {
			uni.showActionSheet({
				itemList: ['删除此账单'],
				itemColor: '#E8734A',
				success: async (res) => {
					if (res.tapIndex === 0) {
						uni.showModal({
							title: '确认删除',
							content: `删除「${tx.note || getCategoryName(tx.category)} ¥${tx.amount}」?`,
							confirmColor: '#E8734A',
							success: async (r) => {
								if (r.confirm) {
									const resp = await this.$store.dispatch('accounting/deleteTransaction', tx.id)
									uni.showToast({ title: resp.success ? '已删除' : (resp.message || '失败'), icon: resp.success ? 'success' : 'none' })
								}
							}
						})
					}
				}
			})
		},
		// 滚动加载更多：接近底部时增加渲染条数
		onScroll(e) {
			const scrollView = e.detail
			if (!scrollView) return
			const { scrollHeight, scrollTop, deltaY } = scrollView
			// 当 deltaY > 0（向下滑）且距离底部 < 200px 时加载更多
			if (deltaY > 0 && scrollHeight - scrollTop - scrollView.clientHeight < 200) {
				if (this.renderLimit < this.filteredTxs.length) {
					this.renderLimit += this.pageSize
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.bills-page { min-height: 100vh; width: 100%; background: #FFF9F5; display: flex; flex-direction: column; box-sizing: border-box; overflow-x: hidden; }
	.bills-scroll { flex: 1; width: 100%; padding: 0 40rpx 200rpx; box-sizing: border-box; }

	.summary-card { background: #FFFFFF; border-radius: 32rpx; box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06); padding: 40rpx; margin-bottom: 40rpx; margin-top: 16rpx; }
	.summary-row { display: flex; gap: 48rpx; margin-bottom: 48rpx; }
	.summary-item { flex: 1; }
	.summary-label { font-size: 28rpx; color: #A98B78; display: block; margin-bottom: 8rpx; }
	.summary-amount { font-size: 48rpx; font-weight: 700; line-height: 1.25; }
	.summary-amount.expense { color: #E8734A; }
	.summary-amount.income { color: #4CAF50; }
	.weekly-bar { display: flex; align-items: flex-end; gap: 12rpx; height: 100rpx; padding-top: 32rpx; border-top: 2rpx solid #F0E4DA; }
	.weekly-bar.has-data { height: 180rpx; }
	.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx; height: 100%; justify-content: flex-end; }
	.bar-fill { width: 100%; border-radius: 6rpx; transition: height 0.5s ease; min-height: 8rpx; background: #FBBE9E; }
	.bar-fill.current { background: #E8734A; }
	.bar-label { font-size: 22rpx; color: #A98B78; }
	.bar-label.current { color: #3D2316; font-weight: 500; }

	.empty { display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 160rpx 0; }
	.empty-icon { font-size: 80rpx; opacity: 0.4; }
	.empty-text { font-size: 28rpx; color: #A98B78; }

	.date-group { margin-bottom: 40rpx; }
	.group-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
	.group-date { font-size: 30rpx; font-weight: 600; color: #3D2316; }
	.group-total { font-size: 28rpx; font-weight: 600; }
	.group-total.expense { color: #E8734A; }
	.group-total.income { color: #4CAF50; }

	.tx-card { background: #FFFFFF; border-radius: 24rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); overflow: hidden; }
	.tx-item { display: flex; align-items: center; gap: 24rpx; padding: 32rpx; border-bottom: 2rpx solid #F0E4DA; }
	.tx-item:last-child { border-bottom: none; }
	.tx-item:active { background: #F5EDE6; }
	.tx-icon { width: 72rpx; height: 72rpx; border-radius: 16rpx; background: #FDE6D4; display: flex; align-items: center; justify-content: center; font-size: 36rpx; flex-shrink: 0; }
	.tx-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }
	.tx-title { font-size: 30rpx; font-weight: 500; color: #3D2316; }
	.tx-category { font-size: 24rpx; color: #A98B78; }
	.tx-amount { font-size: 30rpx; font-weight: 600; white-space: nowrap; }
	.tx-amount.income { color: #4CAF50; }
	.tx-amount.expense { color: #E53935; }

	.load-more { display: flex; justify-content: center; align-items: center; padding: 40rpx 0; }
	.load-more-text { font-size: 24rpx; color: #A98B78; }
</style>