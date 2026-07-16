<template>
	<view class="cosmic-page add-acc-page">
		<status-bar />
		<top-bar title="创建账户" show-back />

		<scroll-view scroll-y class="screen">
			<!-- 预览卡片 -->
			<view class="preview-card acc-preview">
				<view class="icon">
					<lucide-icon :name="selectedIcon" :brand="isBrand(selectedIcon)" size="56rpx" />
				</view>
				<text class="name">{{ accountName || '账户名称' }}</text>
				<text class="balance">¥{{ fmt(previewBalance) }}</text>
			</view>

			<view class="card form-card">
				<view class="form-group">
					<text class="form-label">账户名称</text>
					<input class="field" v-model="accountName" placeholder="输入账户名称" />
				</view>
				<view class="form-group">
					<text class="form-label">初始余额</text>
					<input class="field" v-model="initialBalance" type="digit" placeholder="0.00" />
				</view>
				<view class="form-group">
					<text class="form-label">选择图标</text>
					<view class="acc-ic-grid">
						<view
							v-for="key in iconKeys"
							:key="key"
							class="p"
							:class="{ on: selectedIcon === key }"
							@click="selectedIcon = key"
						>
							<lucide-icon :name="key" :brand="isBrand(key)" size="40rpx" />
						</view>
					</view>
				</view>
			</view>

			<view class="btn-primary create-btn" @click="onCreate">
				<text>创建账户</text>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>
	</view>
</template>

<script>
import { fmt, addAccount } from '@/common/app-data.js'
import { ACC_ICON_KEYS, isBrandIcon } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			accountName: '',
			initialBalance: '',
			selectedIcon: 'wallet',
			iconKeys: ACC_ICON_KEYS
		}
	},
	computed: {
		previewBalance() {
			const n = Number(this.initialBalance)
			return isNaN(n) ? 0 : n
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		fmt,
		isBrand(key) {
			return isBrandIcon(key)
		},
		onCreate() {
			const name = this.accountName.trim()
			if (!name) {
				uni.showToast({ title: '请输入账户名称', icon: 'none' })
				return
			}
			addAccount({
				ic: this.selectedIcon,
				name,
				bal: this.previewBalance
			})
			uni.showToast({ title: '账户已创建', icon: 'success' })
			setTimeout(() => uni.navigateBack(), 600)
		}
	}
}
</script>

<style lang="scss" scoped>
.acc-preview .icon {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
}
.form-card {
	padding: 32rpx;
}
.create-btn {
	margin: 32rpx 28rpx 0;
}
</style>
