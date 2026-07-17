<template>
	<view class="lucide-icon" :style="wrapStyle">
		<image
			class="lucide-icon__img"
			:src="src"
			:mode="imgMode"
		/>
	</view>
</template>

<script>
import { iconSrc, isBrandAssetIcon } from '@/common/lucide-icons.js'

export default {
	name: 'LucideIcon',
	props: {
		name: { type: String, required: true },
		size: { type: String, default: '28rpx' },
		brand: { type: Boolean, default: false },
		color: { type: String, default: '#5A6B8A' }
	},
	computed: {
		src() {
			return iconSrc(this.name, this.color, this.brand)
		},
		imgMode() {
			return isBrandAssetIcon(this.name) ? 'aspectFit' : 'scaleToFill'
		},
		wrapStyle() {
			return {
				width: this.size,
				height: this.size,
				flexShrink: 0
			}
		}
	}
}
</script>

<style scoped>
.lucide-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	vertical-align: middle;
	line-height: 0;
	flex-shrink: 0;
}

.lucide-icon__img {
	width: 100%;
	height: 100%;
	display: block;
	pointer-events: none;
}
</style>
