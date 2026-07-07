<template>
	<view class="glass-card" :style="cardStyle">
		<slot />
	</view>
</template>

<script>
	export default {
		name: 'AccCard',
		props: {
			padding: { type: String, default: '32rpx' },
			margin: { type: String, default: '12rpx 32rpx' }
		},
		computed: {
			cardStyle() {
				return {
					padding: this.padding,
					margin: this.margin
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.glass-card {
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(180, 160, 200, 0.15);
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(180, 160, 200, 0.1);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
	}
	@supports not ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
		.glass-card { background: rgba(255, 255, 255, 0.9); }
	}
</style>
