<template>
	<image
		class="lucide-icon"
		:src="src"
		:style="wrapStyle"
		mode="aspectFit"
	/>
</template>

<script>
import { iconSrc } from '@/common/lucide-icons.js'

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
		wrapStyle() {
			return {
				width: this.size,
				height: this.size,
				display: 'inline-block',
				flexShrink: 0,
				verticalAlign: 'middle'
			}
		}
	}
}
</script>

<style scoped>
.lucide-icon {
	line-height: 0;
}
</style>
