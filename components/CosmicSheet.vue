<template>
	<view>
		<view v-if="visible" class="sheet-mask" @click="close" />
		<view class="sheet" :class="{ show: visible }">
			<view class="handle" />
			<slot />
		</view>
	</view>
</template>

<script>
export default {
	name: 'CosmicSheet',
	props: {
		visible: { type: Boolean, default: false }
	},
	methods: {
		close() {
			this.$emit('update:visible', false)
			this.$emit('close')
		}
	}
}
</script>

<style lang="scss" scoped>
.sheet-mask {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.35);
	z-index: 1000;
}
.sheet {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1001;
	background: linear-gradient(180deg, #FFFFFF, #F1ECFF);
	border-radius: 44rpx 44rpx 0 0;
	padding: 28rpx 32rpx calc(52rpx + env(safe-area-inset-bottom));
	transform: translateY(100%);
	transition: transform 0.3s ease;
	max-height: 78vh;
	overflow-y: auto;
}
.sheet.show {
	transform: translateY(0);
}
.handle {
	width: 76rpx;
	height: 8rpx;
	background: #d8dde4;
	border-radius: 6rpx;
	margin: 0 auto 24rpx;
}
</style>
