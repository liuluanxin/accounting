<template>
	<view class="cosmic-page profile-page">
		<status-bar />
		<top-bar title="我的" />

		<scroll-view scroll-y class="screen screen--pb">
			<view class="user-card" @click="onProfile">
				<view class="user-avatar">
					<lucide-icon name="user" size="56rpx" />
				</view>
				<text class="user-name">{{ userName }}</text>
				<text class="user-email">{{ userEmail }}</text>
			</view>

			<view class="menu-list">
				<view v-for="item in mainMenus" :key="item.id" class="menu-item" @click="onMenu(item)">
					<view class="menu-item-icon">
						<lucide-icon :name="item.icon" size="36rpx" />
					</view>
					<text class="menu-item-label">{{ item.label }}</text>
					<lucide-icon name="chevron-right" size="28rpx" class="menu-item-arrow" />
				</view>
			</view>

			<view class="section-label">扩展功能</view>
			<view class="menu-list">
				<view v-for="item in extMenus" :key="item.id" class="menu-item" @click="onMenu(item)">
					<view class="menu-item-icon">
						<lucide-icon :name="item.icon" size="36rpx" />
					</view>
					<text class="menu-item-label">{{ item.label }}</text>
					<lucide-icon name="chevron-right" size="28rpx" class="menu-item-arrow" />
				</view>
			</view>

			<view class="logout-btn" @click="logout">
				<text>退出登录</text>
			</view>
			<view style="height:200rpx;" />
		</scroll-view>

		<tab-bar current-tab="profile" />
	</view>
</template>

<script>
import { getUser, saveUser } from '@/common/app-data.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		return {
			userName: '用户',
			userEmail: '',
			mainMenus: [
				{ id: 'budget', label: '预算管理', icon: 'bar-chart', url: '/pages/accounting/budget' },
				{ id: 'category', label: '分类管理', icon: 'tag', url: '/pages/accounting/category-manage' },
				{ id: 'import', label: '数据导入', icon: 'upload', url: '/pages/accounting/import-data' },
				{ id: 'backup', label: '数据备份与恢复', icon: 'cloud', toast: '数据备份与恢复' },
				{ id: 'export', label: '账单导出', icon: 'download', toast: '账单导出' },
				{ id: 'theme', label: '主题设置', icon: 'palette', url: '/pages/accounting/theme-settings' },
				{ id: 'about', label: '关于宇宙记账', icon: 'info', toast: '关于宇宙记账' }
			],
			extMenus: [
				{ id: 'ledgers', label: '账本管理', icon: 'receipt', url: '/pages/accounting/ledgers' },
				{ id: 'assistant', label: '智能助手', icon: 'lightbulb', url: '/pages/accounting/smart-assistant' },
				{ id: 'photo', label: '拍照记账', icon: 'camera', url: '/pages/accounting/photo-record' }
			]
		}
	},
	onShow() {
		applyThemeToPage(this)
		const u = getUser()
		this.userName = u.name || '用户'
		this.userEmail = u.email || ''
	},
	methods: {
		onProfile() {
			uni.showToast({ title: '个人资料', icon: 'none' })
		},
		onMenu(item) {
			if (item.url) {
				uni.navigateTo({ url: item.url })
			} else {
				uni.showToast({ title: item.toast || item.label, icon: 'none' })
			}
		},
		logout() {
			uni.showModal({
				title: '提示',
				content: '确定退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('isLoggedIn')
						uni.removeStorageSync('loginTime')
						uni.removeStorageSync('login_phone')
						uni.reLaunch({ url: '/pages/accounting/login' })
					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-page {
	height: 100vh;
	overflow: hidden;
	background: linear-gradient(170deg, #EAF4FF 0%, #F1ECFF 55%, #FFFFFF 100%);
}
.screen {
	padding-top: 192rpx;
}
.section-label {
	margin: 8rpx 28rpx 16rpx;
	font-size: 24rpx;
	color: var(--text-muted);
	font-weight: 600;
}
.user-card {
	background: linear-gradient(135deg, #8FC9FF 0%, #5B9BE0 55%, #8B7FF0 100%);
	border-radius: 32rpx;
	padding: 48rpx 32rpx;
	margin: 0 28rpx 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 14rpx 32rpx rgba(91, 155, 224, 0.35);
	color: #fff;
}
.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.4);
}
.user-name {
	font-size: 34rpx;
	font-weight: 700;
	margin-bottom: 6rpx;
}
.user-email {
	font-size: 24rpx;
	opacity: 0.85;
}
.menu-list {
	margin: 0 28rpx 24rpx;
	background: rgba(255, 255, 255, 0.92);
	border-radius: 28rpx;
	overflow: hidden;
	box-shadow: var(--card-shadow);
}
.menu-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx 24rpx;
	border-bottom: 1rpx solid var(--divider);
}
.menu-item:last-child { border-bottom: none; }
.menu-item-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #EEF4FF;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	color: var(--primary);
}
.menu-item-label {
	flex: 1;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-primary);
}
.menu-item-arrow {
	color: var(--text-secondary);
	flex: none;
}
.logout-btn {
	margin: 0 28rpx 24rpx;
	background: rgba(255, 255, 255, 0.92);
	border-radius: 28rpx;
	padding: 28rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--expense);
	box-shadow: var(--card-shadow);
}
</style>
