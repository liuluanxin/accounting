<template>
	<view class="statusbar">
		<text class="statusbar-time">{{ time }}</text>
		<view class="statusbar-right">
			<view class="signal-bars" aria-hidden="true">
				<view
					v-for="(h, i) in barHeights"
					:key="i"
					class="signal-bar"
					:style="{ height: h }"
				/>
			</view>
			<view class="battery" aria-hidden="true">
				<view class="battery-level" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'StatusBar',
	props: {
		time: { type: String, default: '9:41' }
	},
	data() {
		return {
			barHeights: ['40%', '55%', '70%', '85%']
		}
	}
}
</script>

<style lang="scss" scoped>
.statusbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	height: var(--statusbar-height, 92rpx);
	padding: env(safe-area-inset-top) 28rpx 0;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	overflow: hidden;
	background: linear-gradient(180deg, #EAF4FF 0%, transparent 100%);
	pointer-events: none;
	color: var(--text-primary);
}
.statusbar-time {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 1;
}
.statusbar-right {
	display: flex;
	align-items: center;
	gap: 10rpx;
}
.signal-bars {
	display: flex;
	align-items: flex-end;
	gap: 3rpx;
	height: 20rpx;
}
.signal-bar {
	width: 6rpx;
	border-radius: 2rpx;
	background: currentColor;
	opacity: 0.6;
}
.signal-bar:nth-child(4) { opacity: 1; }
.battery {
	width: 40rpx;
	height: 18rpx;
	border: 2rpx solid currentColor;
	border-radius: 4rpx;
	display: flex;
	align-items: center;
	padding: 2rpx;
	position: relative;
}
.battery::after {
	content: '';
	position: absolute;
	right: -5rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 3rpx;
	height: 8rpx;
	background: currentColor;
	border-radius: 0 2rpx 2rpx 0;
}
.battery-level {
	width: 70%;
	height: 100%;
	background: currentColor;
	border-radius: 2rpx;
}
</style>