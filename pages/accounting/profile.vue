<template>
	<view class="profile-page">
		<view class="navbar-spacer"></view>
		<scroll-view scroll-y class="profile-scroll">
			<view class="user-card">
				<view class="gradient-header"></view>
				<view class="user-info">
					<view class="avatar">{{ avatarText }}</view>
					<view class="user-detail">
						<text class="user-name">{{ userName }}</text>
						<text class="user-email">{{ userEmail }}</text>
					</view>
					<view class="badge">累计记账 {{ totalDays }} 天</view>
				</view>
			</view>

			<view class="summary-row">
				<view class="summary-item income">
					<text class="summary-label">本月收入</text>
					<text class="summary-value">¥{{ formatMoney(summary.income) }}</text>
				</view>
				<view class="summary-item expense">
					<text class="summary-label">本月支出</text>
					<text class="summary-value">¥{{ formatMoney(summary.expense) }}</text>
				</view>
				<view class="summary-item balance">
					<text class="summary-label">本月结余</text>
					<text class="summary-value">¥{{ formatMoney(summary.balance) }}</text>
				</view>
			</view>

			<view class="menu-card">
				<view class="menu-item" @click="goLedgerPage">
					<text class="menu-icon">📒</text>
					<text class="menu-text">我的账本</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="showMonthlyReport">
					<text class="menu-icon">📊</text>
					<text class="menu-text">月度报告</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="goBudgetPage">
					<text class="menu-icon">💰</text>
					<text class="menu-text">预算管理</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="showReminder">
					<text class="menu-icon">🎯</text>
					<text class="menu-text">记账提醒</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="goCategoryManage">
					<text class="menu-icon">🏷️</text>
					<text class="menu-text">分类管理</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="exportData">
					<text class="menu-icon">📤</text>
					<text class="menu-text">数据导出</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="goImportPage">
					<text class="menu-icon">📥</text>
					<text class="menu-text">数据导入</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
			</view>

			<view class="menu-card">
				<view class="menu-item" @click="showSecuritySettings">
					<text class="menu-icon">🔒</text>
					<text class="menu-text">安全设置</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="goThemeSettings">
					<text class="menu-icon">🎨</text>
					<text class="menu-text">主题设置</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="showHelp">
					<text class="menu-icon">❓</text>
					<text class="menu-text">帮助与反馈</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
				<view class="menu-item" @click="showAbout">
					<text class="menu-icon">ℹ️</text>
					<text class="menu-text">关于我们</text>
					<view class="menu-arrow" :style="getIconStyle('arrow-right')"></view>
				</view>
			</view>

			<view class="menu-card logout-card">
				<view class="menu-item logout-item" @click="handleLogout">
					<text class="menu-icon">🚪</text>
					<text class="menu-text logout-text">退出登录</text>
				</view>
			</view>
		</scroll-view>

		<TabBar currentTab="profile" :showFab="false" :tabs="[{ id: 'home', label: '首页' }, { id: 'calendar', label: '日历' }, { id: 'stats', label: '统计' }, { id: 'profile', label: '我的' }]"/>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { formatMoney, todayStr } from '@/common/accounting-utils.js'
	import { exportCSV, transactionsToCSV } from '@/common/export-helper.js'
	import TabBar from '@/components/TabBar.vue'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

	export default {
		mixins: [themeMixin],
		components: { TabBar },
		computed: {
			...mapState('accounting', ['data', 'initialized']),
			loginUser() {
				try {
					const raw = uni.getStorageSync('login_user')
					return raw ? JSON.parse(raw) : null
				} catch (e) { return null }
			},
			userEmail() {
				return this.loginUser?.email || uni.getStorageSync('login_email') || '未登录'
			},
			avatarText() {
				const name = this.userName
				return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?'
			},
			userName() {
				if (this.loginUser?.username) return this.loginUser.username
				const email = this.userEmail
				if (!email || email === '未登录') return '用户'
				return email.split('@')[0]
			},
			monthTxs() {
				const now = new Date()
				const p = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
				return this.data.transactions.filter(t => t.date && t.date.indexOf(p) === 0)
			},
			summary() {
				let inc = 0, exp = 0
				this.monthTxs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
				return { income: inc, expense: exp, balance: inc - exp }
			},
			totalDays() {
				if (this.data.transactions.length === 0) return 0
				const dates = new Set(this.data.transactions.map(t => t.date).filter(Boolean))
				return dates.size
			}
		},
		onLoad() {
			if (!this.initialized) this.$store.dispatch('accounting/initialize')
		},
		methods: {
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			formatMoney,
			switchTab(page) { uni.redirectTo({ url: '/pages/accounting/' + page }) },
			goLedgerPage() { uni.navigateTo({ url: '/pages/accounting/ledgers' }) },
			goBudgetPage() { uni.navigateTo({ url: '/pages/accounting/budget' }) },
			goThemeSettings() { uni.navigateTo({ url: '/pages/accounting/theme-settings' }) },
			goImportPage() { uni.navigateTo({ url: '/pages/accounting/import-data' }) },
			showMonthlyReport() {
				uni.showModal({ title: '📊 月度报告', content: '本月收入：¥' + this.formatMoney(this.summary.income) + '\n本月支出：¥' + this.formatMoney(this.summary.expense) + '\n本月结余：¥' + this.formatMoney(this.summary.balance), showCancel: false })
			},
			showReminder() {
				uni.showModal({ title: '🎯 记账提醒', content: '开启记账提醒，养成良好的记账习惯', showCancel: false })
			},
			goCategoryManage() { uni.navigateTo({ url: '/pages/accounting/category-manage' }) },
			showSecuritySettings() {
				uni.showActionSheet({
					itemList: ['隐私密码', '指纹解锁', '修改密码'],
					success: (res) => {
						if (res.tapIndex === 0) uni.showToast({ title: '隐私密码功能', icon: 'none' })
						else if (res.tapIndex === 1) uni.showToast({ title: '指纹解锁开发中', icon: 'none' })
						else if (res.tapIndex === 2) uni.showToast({ title: '修改密码功能', icon: 'none' })
					}
				})
			},
			exportData() {
				if (this.data.transactions.length === 0) {
					uni.showToast({ title: '暂无数据可导出', icon: 'none' })
					return
				}
				const csv = transactionsToCSV(this.data.transactions)
				const filename = '宇宙记账_' + new Date().toISOString().slice(0, 10) + '.csv'
				const r = exportCSV(filename, csv)
				if (r.platform === 'app-plus') {
					uni.showModal({
						title: '💾 导出账单',
						content: '账单：' + this.data.transactions.length + ' 条\n账户：' + this.data.accounts.length + ' 个\n\nCSV 已生成',
						showCancel: false
					})
				} else if (r.success) {
					uni.showToast({ title: '账单已导出', icon: 'success' })
				} else {
					uni.showToast({ title: '导出失败', icon: 'none' })
				}
			},
			showHelp() {
				uni.showModal({ title: '❓ 帮助与反馈', content: '记账助手 v1.0.0\n跨平台 · 离线可用\n\n记账 -> 点击右下角"+"\n分析 -> 统计页查看', showCancel: false })
			},
			showAbout() {
				uni.showModal({ title: 'ℹ️ 关于我们', content: '记账助手 v1.0.0\n简洁高效的记账工具\n\n© 2026 Cosmic Studio', showCancel: false })
			},
			handleLogout() {
				uni.showModal({
					title: '退出登录',
					content: '确定要退出登录吗？',
					confirmText: '退出',
					confirmColor: '#5B9BE0',
					success: function(res) {
						if (!res.confirm) return
						try {
							uni.removeStorageSync('isLoggedIn')
							uni.removeStorageSync('loginTime')
							uni.removeStorageSync('login_email')
							uni.removeStorageSync('login_user')
							uni.removeStorageSync('auth_token')
						} catch (e) { /* ignore */ }
						uni.showToast({ title: '已退出登录', icon: 'none' })
						setTimeout(function() {
							uni.reLaunch({ url: '/pages/accounting/login' })
						}, 400)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-page { position: relative; height: 100vh; width: 100%; background: transparent; box-sizing: border-box; overflow-x: hidden; }
	.navbar-spacer { position: absolute; top: 0; left: 0; right: 0; height: 88rpx; background: transparent; z-index: 10; box-sizing: border-box; }
	.profile-scroll { position: absolute; top: 88rpx; bottom: 0; left: 0; right: 0; padding: 0 40rpx; padding-bottom: 180rpx; box-sizing: border-box; }

	.user-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.06); overflow: hidden; margin-top: 32rpx; }
	.user-card .gradient-header { height: 160rpx; background: linear-gradient(135deg, var(--primary-shadow, rgba(242, 149, 110, 0.5)), rgba(91, 155, 224, 0.2), rgba(91, 155, 224, 0.06)); }
	.user-card .user-info { display: flex; align-items: center; gap: 32rpx; padding: 0 40rpx 40rpx; margin-top: -64rpx; position: relative; }
	.user-card .avatar { width: 100rpx; height: 100rpx; min-width: 100rpx; border-radius: 50%; background: var(--primary, #5B9BE0); display: flex; align-items: center; justify-content: center; font-size: 40rpx; font-weight: 700; color: var(--card-bg, #FFFFFF); border: 6rpx solid var(--card-bg, #FFFFFF); box-shadow: 0 4rpx 8rpx rgba(91, 155, 224, 0.04); }
	.user-card .user-detail { flex: 1; min-width: 0; }
	.user-card .user-name { font-size: 36rpx; font-weight: 600; color: var(--text-primary, #1A2744); line-height: 1.25; display: block; }
	.user-card .user-email { font-size: 26rpx; color: var(--text-tertiary, #8A9BB8); margin-top: 8rpx; display: block; }
	.user-card .badge { padding: 8rpx 24rpx; background: rgba(91, 155, 224, 0.1); border-radius: 50rpx; font-size: 22rpx; color: var(--primary, #5B9BE0); font-weight: 500; white-space: nowrap; }

	.summary-row { display: flex; gap: 24rpx; margin: 32rpx 0; }
	.summary-item { flex: 1; background: var(--card-bg, #FFFFFF); border-radius: 24rpx; box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.04); padding: 32rpx 24rpx; text-align: center; border-top: 4rpx solid transparent; }
	.summary-item.income { border-top-color: var(--income, #34C759); }
	.summary-item.expense { border-top-color: var(--expense, #FF6B6B); }
	.summary-item.balance { border-top-color: var(--primary-shadow, rgba(242, 149, 110, 0.8)); }
	.summary-item .summary-label { font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); display: block; margin-bottom: 16rpx; }
	.summary-item .summary-value { font-size: 36rpx; font-weight: 700; }
	.summary-item.income .summary-value { color: var(--income, #34C759); }
	.summary-item.expense .summary-value { color: var(--expense, #FF6B6B); }
	.summary-item.balance .summary-value { color: var(--text-primary, #1A2744); }

	.menu-card { background: var(--card-bg, #FFFFFF); border-radius: 32rpx; box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.04); margin-bottom: 32rpx; overflow: hidden; }
	.menu-card .menu-item { display: flex; align-items: center; padding: 32rpx 40rpx; border-bottom: 1px solid var(--border, #E8F0FE); }
	.menu-card .menu-item:last-child { border-bottom: none; }
	.menu-card .menu-item:active { background: var(--border, #F5EDE6); }
	.menu-card .menu-icon { font-size: 40rpx; margin-right: 24rpx; }
	.menu-card .menu-text { flex: 1; font-size: 30rpx; color: var(--text-primary, #1A2744); }
	.menu-card .menu-arrow {
		flex-shrink: 0;
		width: 32rpx;
		height: 32rpx;
		background-color: var(--text-tertiary, #C8A896);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}

	.logout-card .logout-item { justify-content: center; }
	.logout-card .logout-item .menu-icon { margin-right: 16rpx; }
	.logout-card .logout-text { color: var(--primary, #5B9BE0); }

	
</style>