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
		background: linear-gradient(170deg, #FFFFFF, #F0F7FF, #F5F0FF);
		border: 1px solid rgba(255, 255, 255, 0.8);
		border-radius: 44rpx;
		box-shadow: 0 8rpx 32rpx rgba(91, 155, 224, 0.08);
		-webkit-backdrop-filter: blur(20px);
		backdrop-filter: blur(20px);
	}
	@supports not ((-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px))) {
		.glass-card { background: rgba(255, 255, 255, 0.9); }
	}
</style>
