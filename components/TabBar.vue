<template>
	<view class="bottom-nav">
		<view
			v-for="tab in tabs"
			:key="tab.id"
			class="bn-item"
			:class="{ active: currentTab === tab.id }"
			@click="handleTabClick(tab)"
		>
			<view class="ic">
				<lucide-icon
					:name="tab.icon"
					size="42rpx"
					:color="currentTab === tab.id ? '#4A90D9' : '#8A9099'"
				/>
			</view>
			<text class="label">{{ tab.label }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TabBar',
	props: {
		currentTab: { type: String, required: true },
		tabs: {
			type: Array,
			default: () => [
				{ id: 'home', label: '首页', icon: 'home' },
				{ id: 'stats', label: '统计', icon: 'bar-chart' },
				{ id: 'calendar', label: '日历', icon: 'calendar' },
				{ id: 'assets', label: '资产', icon: 'wallet' },
				{ id: 'profile', label: '我的', icon: 'user' }
			]
		}
	},
	methods: {
		handleTabClick(tab) {
			if (tab.id !== this.currentTab) {
				uni.reLaunch({ url: '/pages/accounting/' + tab.id })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.bottom-nav {
	position: fixed;
	bottom: calc(24rpx + env(safe-area-inset-bottom));
	left: 24rpx;
	right: 24rpx;
	z-index: 999;
	height: 120rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.88);
	backdrop-filter: blur(24rpx);
	-webkit-backdrop-filter: blur(24rpx);
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08), 0 0 2rpx rgba(0, 0, 0, 0.04);
	display: flex;
	align-items: center;
	justify-content: space-around;
}
.bn-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	font-size: 20rpx;
	color: #8A9099;
	position: relative;
}
.bn-item.active {
	color: #4A90D9;
}
.bn-item .ic {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.bn-item .label {
	font-size: 20rpx;
	line-height: 1.2;
}
</style>
