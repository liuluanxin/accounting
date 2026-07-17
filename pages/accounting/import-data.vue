<template>
	<view class="cosmic-page import-page">
		<status-bar />
		<top-bar title="数据导入" show-back />

		<scroll-view scroll-y class="screen">
			<view class="import-intro">
				<text class="muted">从其他平台导出账单文件，一键导入宇宙记账</text>
			</view>

			<view
				v-for="item in importSources"
				:key="item.id"
				class="card import-card"
				@click="onImport(item)"
			>
				<view class="import-card__icon" :style="{ background: item.gradient }">
					<lucide-icon :name="item.icon" :brand="item.brand" size="64rpx" />
				</view>
				<view class="import-card__body">
					<text class="import-card__title">{{ item.title }}</text>
					<text class="import-card__desc muted">{{ item.desc }}</text>
				</view>
				<lucide-icon name="chevron-right" size="28rpx" class="import-card__arrow" />
			</view>

			<view class="card import-tips">
				<view class="tips-head">
					<lucide-icon name="info" size="28rpx" />
					<text class="tips-title">导入说明</text>
				</view>
				<text class="muted tips-text">支持 CSV、Excel 格式账单文件。导入不会覆盖现有数据，系统会自动匹配分类。</text>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>
	</view>
</template>

<script>
import { applyThemeToPage } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			importSources: [
				{
					id: 'bank',
					title: '银行账单',
					desc: '支持各大银行导出的 CSV / Excel',
					icon: 'credit-card',
					brand: false,
					gradient: 'linear-gradient(135deg, #5B9BE0, #4A7FC0)'
				},
				{
					id: 'alipay',
					title: '支付宝',
					desc: '导入支付宝账单明细',
					icon: 'alipay',
					brand: true,
					gradient: 'linear-gradient(135deg, #1677FF, #4096FF)'
				},
				{
					id: 'wechat',
					title: '微信',
					desc: '导入微信支付账单',
					icon: 'wechat',
					brand: true,
					gradient: 'linear-gradient(135deg, #07C160, #34D399)'
				},
				{
					id: 'other',
					title: '其他来源',
					desc: '自定义 CSV 或其他记账 App 导出',
					icon: 'upload',
					brand: false,
					gradient: 'linear-gradient(135deg, #9B59B6, #BB6BD9)'
				}
			]
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		onImport(item) {
			uni.showToast({ title: `导入${item.title}`, icon: 'none' })
		}
	}
}
</script>

<style lang="scss" scoped>
.import-intro {
	padding: 0 28rpx 20rpx;
	font-size: 24rpx;
	line-height: 1.6;
}
.import-card {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx 32rpx;
}
.import-card__icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: #fff;
	overflow: hidden;
	padding: 8rpx;
	box-sizing: border-box;
}
.import-card__body {
	flex: 1;
	min-width: 0;
}
.import-card__title {
	font-size: 30rpx;
	font-weight: 600;
	color: var(--text-primary);
	display: block;
}
.import-card__desc {
	display: block;
	margin-top: 4rpx;
	font-size: 22rpx;
}
.import-card__arrow {
	color: #C0C8D0;
	flex-shrink: 0;
}
.import-tips {
	padding: 28rpx 32rpx;
}
.tips-head {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 12rpx;
	color: var(--primary);
}
.tips-title {
	font-size: 26rpx;
	font-weight: 600;
	color: var(--text-primary);
}
.tips-text {
	font-size: 22rpx;
	line-height: 1.6;
	display: block;
}
</style>
