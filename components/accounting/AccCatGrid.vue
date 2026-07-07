<template>
	<view class="cat-grid">
		<view
			v-for="cat in categories"
			:key="cat"
			class="cat-item"
			:class="{ selected: cat === selected }"
			@click="$emit('select', cat)"
		>
			<view class="cat-icon" :style="{ background: getIconBg(cat) }">
				<text>{{ getIcon(cat) }}</text>
			</view>
			<view class="cat-name">{{ cat }}</view>
		</view>
	</view>
</template>

<script>
	import { CAT_ICONS, CAT_ICONS_COLOR } from '@/common/accounting-utils.js'

	export default {
		name: 'AccCatGrid',
		props: {
			categories: { type: Array, required: true },
			selected: { type: String, default: '' }
		},
		methods: {
			getIcon(cat) { return CAT_ICONS[cat] || '📌' },
			getIconBg(cat) {
				const color = CAT_ICONS_COLOR[cat] || '#6BA8D9'
				return color + '22'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16rpx;
		margin-bottom: 32rpx;
	}
	.cat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 20rpx 8rpx;
		border-radius: 24rpx;
		background: transparent;
		border: none;
		transition: background 0.2s;
	}
	.cat-item:active { background: #F8F6FC; }
	.cat-item.selected { background: #F0E8FA; }
	.cat-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
	}
	.cat-name { font-size: 22rpx; color: #5A6788; }

	@media (min-width: 768px) {
		.cat-grid { grid-template-columns: repeat(5, 1fr); gap: 20rpx; }
	}
	@media (max-width: 360px) {
		.cat-grid { grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
		.cat-item { padding: 16rpx 6rpx; }
		.cat-icon { width: 72rpx; height: 72rpx; font-size: 36rpx; }
		.cat-name { font-size: 20rpx; }
	}
</style>
