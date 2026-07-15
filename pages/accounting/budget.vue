<template>
	<view class="budget-page">
		<view class="budget-nav">
			<view class="nav-btn" @click="goBack">
				<view class="back-svg" :style="getIconStyle('arrow-left')"></view>
			</view>
			<text class="nav-title">预算管理</text>
			<view class="nav-btn primary-btn" @click="showEditBudget">
				<view class="plus-svg" :style="getIconStyle('plus')"></view>
			</view>
		</view>

		<view v-if="pageLoading" class="state-container">
			<view class="loading-spinner"></view>
			<text class="state-text">加载预算数据...</text>
		</view>

		<view v-else-if="pageError" class="state-container">
			<text class="state-icon">⚠️</text>
			<text class="state-text">{{ pageError }}</text>
			<view class="btn-secondary" @click="loadBudgetData" style="margin-top: 32rpx;">重试</view>
		</view>

		<scroll-view v-else scroll-y class="budget-scroll">
			<view class="overview-card">
				<view class="accent-strip"></view>
				<view class="card-body">
					<text class="budget-label">{{ budgetMonth }}月总预算</text>
					<text class="budget-amount">¥{{ formatMoney(currentBudgetTotal) }}</text>
					<view class="progress-track">
						<view class="progress-fill" :style="{ width: budgetPercent + '%' }"></view>
					</view>
					<text class="progress-sub">已用 {{ budgetPercent.toFixed(0) }}% | 剩余 ¥{{ formatMoney(budgetRemain) }}</text>
				</view>
			</view>

			<view class="section-title">分类预算</view>

			<view v-if="categoryBudgets.length === 0" class="empty-cats">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂未设置分类预算</text>
				<text class="empty-hint">点击右上角 + 按钮设置预算</text>
			</view>

			<view v-else>
				<view v-for="cat in categoryBudgets" :key="cat.name" class="budget-item">
					<view class="item-header">
						<view class="item-left">
							<text class="item-emoji">{{ cat.icon }}</text>
							<text class="item-name">{{ cat.name }}</text>
						</view>
						<view class="item-amounts">
							<text class="item-spent">¥{{ formatMoney(cat.used) }}</text>
							<text class="item-budget">/ ¥{{ formatMoney(cat.total) }}</text>
						</view>
					</view>
					<view class="item-progress">
						<view class="progress-track">
							<view class="progress-fill" :class="{ light: cat.percent < 60 }" :style="{ width: cat.percent + '%' }"></view>
						</view>
						<view class="item-remaining">
							<text>剩余 ¥{{ formatMoney(cat.total - cat.used) }}</text>
							<text>{{ cat.percent.toFixed(0) }}%</text>
						</view>
					</view>
				</view>
			</view>

			<view class="tips-card">
				<text class="tips-icon">💡</text>
				<text class="tips-text">{{ tipsText }}</text>
			</view>

			<view style="height: 120rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney } from '@/common/accounting-utils.js'
	import Logger from '@/common/logger.js'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

	export default {
		mixins: [themeMixin],
		data() {
			return {
				budgetYear: new Date().getFullYear(),
				budgetMonth: new Date().getMonth() + 1,
				pageLoading: false,
				pageError: null
			}
		},
		computed: {
			...mapState('accounting', ['data', 'budgetLoading']),
			budgetKey() {
				return this.budgetYear + '-' + String(this.budgetMonth).padStart(2, '0')
			},
			currentBudget() {
				return this.data.budgets[this.budgetKey] || null
			},
			currentBudgetTotal() {
				return this.currentBudget ? this.currentBudget.total : 0
			},
			monthTxs() {
				const p = this.budgetKey
				return this.data.transactions.filter(t => t.date && t.date.indexOf(p) === 0)
			},
			montlyExpense() {
				let exp = 0
				this.monthTxs.forEach(t => { if (t.type === 'expense') exp += t.amount })
				return exp
			},
			budgetPercent() {
				return this.currentBudgetTotal > 0 ? Math.min(100, this.montlyExpense / this.currentBudgetTotal * 100) : 0
			},
			budgetRemain() {
				return Math.max(0, this.currentBudgetTotal - this.montlyExpense)
			},
			categoryBudgets() {
				if (!this.currentBudget || !this.currentBudget.categories) return []
				const cats = this.currentBudget.categories
				return Object.entries(cats).map(([name, total]) => {
					const used = this.monthTxs
						.filter(t => t.type === 'expense' && t.category === name)
						.reduce((s, t) => s + t.amount, 0)
					return {
						name,
						icon: this.getCategoryIcon(name),
						total,
						used,
						percent: total > 0 ? Math.min(100, used / total * 100) : 0
					}
				})
			},
			tipsText() {
				if (this.categoryBudgets.length === 0) return '设置分类预算可以更好地管理您的支出'
				const overBudget = this.categoryBudgets.find(c => c.percent >= 80)
				if (overBudget) return `${overBudget.icon} ${overBudget.name}支出已占预算的${overBudget.percent.toFixed(0)}%，建议适当控制`
				return '本月预算控制良好，继续保持！'
			}
		},
		onLoad() {
			this.loadBudgetData()
		},
		methods: {
			formatMoney,
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			goBack() {
				uni.navigateBack()
			},
			async loadBudgetData() {
				this.pageLoading = true
				this.pageError = null
				try {
					await this.$store.dispatch('accounting/fetchBudgetForMonth', {
						year: this.budgetYear,
						month: this.budgetMonth
					})
				} catch (err) {
					Logger.error('BudgetPage', '加载预算数据失败', err)
					this.pageError = '加载预算数据失败，请重试'
				} finally {
					this.pageLoading = false
				}
			},
			showEditBudget() {
				const b = this.currentBudget
				uni.showModal({
					title: '💰 设置预算',
					editable: true,
					placeholderText: b ? String(b.total) : '输入预算金额',
					success: async (res) => {
						if (res.confirm && res.content) {
							const val = parseFloat(res.content)
							if (val > 0) {
								uni.showLoading({ title: '保存中...' })
								try {
									const r = await this.$store.dispatch('accounting/saveBudget', {
										year: this.budgetYear,
										month: this.budgetMonth,
										total: val
									})
									uni.hideLoading()
									uni.showToast({
										title: r.success ? '预算已更新' : (r.message || '保存失败'),
										icon: r.success ? 'success' : 'none'
									})
								} catch (err) {
									uni.hideLoading()
									uni.showToast({ title: '保存失败，请重试', icon: 'none' })
								}
							} else {
								uni.showToast({ title: '请输入有效的预算金额', icon: 'none' })
							}
						}
					}
				})
			},
			getCategoryIcon(name) {
				const iconMap = {
					'food': '🍜', 'transport': '🚗', 'shopping': '🛒', 'entertainment': '🎬',
					'medical': '💊', 'education': '📚', 'housing': '🏠', 'salary': '💰',
					'communication': '📱', 'other': '📦'
				}
				return iconMap[name] || '📦'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.budget-page { min-height: 100vh; width: 100%; background: transparent; display: flex; flex-direction: column; box-sizing: border-box; overflow-x: hidden; }

	.budget-nav { display: flex; align-items: center; justify-content: space-between; height: 112rpx; padding: calc(var(--status-bar-height) + 16rpx) 40rpx 0; position: relative; width: 100%; box-sizing: border-box; }
	.nav-btn { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); box-shadow: 0 2rpx 4rpx rgba(91, 155, 224, 0.04); display: flex; align-items: center; justify-content: center; color: var(--text-secondary, #5A6B8A); }
	.nav-btn.primary-btn { background: var(--primary, #5B9BE0); color: #FFFFFF; box-shadow: 0 4rpx 16rpx var(--primary-shadow, rgba(91, 155, 224, 0.3)); }
	.nav-title { font-size: 36rpx; font-weight: 600; color: var(--text-primary, #1A2744); position: absolute; left: 50%; transform: translateX(-50%); }
	.back-svg { width: 20px; height: 20px; background-color: var(--text-secondary, #5A6B8A); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.primary-btn .plus-svg { width: 20px; height: 20px; background-color: #FFFFFF; mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }

	.state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 160rpx 40rpx; flex: 1; width: 100%; box-sizing: border-box; }
	.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
	.state-text { font-size: 28rpx; color: var(--text-secondary, #5A6B8A); text-align: center; }
	.loading-spinner { width: 60rpx; height: 60rpx; border: 4rpx solid rgba(91, 155, 224, 0.2); border-top-color: var(--primary, #5B9BE0); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24rpx; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.btn-secondary { padding: 16rpx 48rpx; border-radius: 40rpx; border: 2rpx solid var(--primary, #5B9BE0); color: var(--primary, #5B9BE0); font-size: 28rpx; text-align: center; }

	.budget-scroll { flex: 1; width: 100%; padding: 0 40rpx 200rpx; box-sizing: border-box; }

	.overview-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06); overflow: hidden; position: relative; margin-top: 32rpx; }
	.overview-card .accent-strip { height: 10rpx; background: linear-gradient(135deg, var(--primary, #5B9BE0), var(--primary-shadow, rgba(242, 149, 110, 0.5))); }
	.overview-card .card-body { padding: 40rpx 48rpx; }
	.overview-card .budget-label { font-size: 28rpx; color: var(--text-tertiary, #8A9BB8); display: block; margin-bottom: 8rpx; }
	.overview-card .budget-amount { font-size: 64rpx; font-weight: 700; color: var(--text-primary, #1A2744); display: block; margin-bottom: 32rpx; }
	.progress-track { height: 16rpx; background: var(--border, #F5EDE6); border-radius: 8rpx; overflow: hidden; }
	.progress-fill { height: 100%; border-radius: 8rpx; background: var(--primary, #5B9BE0); transition: width 0.6s ease; }
	.progress-fill.light { background: rgba(91, 155, 224, 0.3); }
	.progress-sub { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); display: block; margin-top: 16rpx; }

	.section-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #1A2744); margin: 48rpx 0 32rpx; }

	.empty-cats { display: flex; flex-direction: column; align-items: center; padding: 48rpx 32rpx; }
	.empty-icon { font-size: 64rpx; margin-bottom: 16rpx; }
	.empty-text { font-size: 28rpx; color: var(--text-secondary, #5A6B8A); margin-bottom: 8rpx; }
	.empty-hint { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); }

	.budget-item { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.04); padding: 32rpx 40rpx; margin-bottom: 24rpx; }
	.budget-item .item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8rpx; }
	.budget-item .item-left { display: flex; align-items: center; gap: 24rpx; }
	.budget-item .item-emoji { font-size: 44rpx; line-height: 1; }
	.budget-item .item-name { font-size: 30rpx; font-weight: 500; color: var(--text-primary, #1A2744); }
	.budget-item .item-amounts { text-align: right; }
	.budget-item .item-spent { font-size: 28rpx; font-weight: 600; color: var(--text-primary, #1A2744); display: block; }
	.budget-item .item-budget { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); }
	.budget-item .item-progress { margin-top: 24rpx; }
	.budget-item .item-progress .progress-track { height: 12rpx; }
	.budget-item .item-remaining { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); margin-top: 16rpx; display: flex; align-items: center; justify-content: space-between; }

	.tips-card { background: rgba(91, 155, 224, 0.08); border-radius: 32rpx; padding: 40rpx; display: flex; gap: 24rpx; align-items: flex-start; margin-top: 32rpx; }
	.tips-card .tips-icon { font-size: 44rpx; line-height: 1; flex-shrink: 0; margin-top: 4rpx; }
	.tips-card .tips-text { font-size: 28rpx; color: var(--text-secondary, #5A6B8A); line-height: 1.75; }
</style>