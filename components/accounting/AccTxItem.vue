<template>
	<view class="tx-item" @click="$emit('click', tx)">
		<view class="tx-icon" :class="tx.type" :style="{ background: iconBg }">
			<text>{{ catIcon }}</text>
		</view>
		<view class="tx-info">
			<view class="tx-title">{{ tx.note || tx.category }}</view>
			<view class="tx-meta">{{ tx.time }} · {{ tx.category }} · {{ accountName }}</view>
		</view>
		<view class="tx-amount">
			<view class="value" :class="tx.type">
				{{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount.toFixed(2) }}
			</view>
		</view>
	</view>
</template>

<script>
	import { CAT_ICONS, CAT_ICONS_COLOR } from '@/common/accounting-utils.js'

	export default {
		name: 'AccTxItem',
		props: {
			tx: { type: Object, required: true },
			accountName: { type: String, default: '' }
		},
		computed: {
			catIcon() { return CAT_ICONS[this.tx.category] || '📌' },
			iconBg() {
				const color = CAT_ICONS_COLOR[this.tx.category] || '#6BA8D9'
				return color + '22'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tx-item {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx;
		background: rgba(255, 255, 255, 0.85);
		-webkit-backdrop-filter: blur(8rpx);
		backdrop-filter: blur(8rpx);
		margin: 0 32rpx 16rpx;
		border-radius: 24rpx;
		transition: transform 0.15s, box-shadow 0.15s;
		box-shadow: 0 1rpx 4rpx rgba(180, 160, 200, 0.08);
		cursor: pointer;
	}
	.tx-item:active { transform: translateX(8rpx); box-shadow: 0 2rpx 12rpx rgba(180, 160, 200, 0.12); }

	.tx-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		font-size: 36rpx;
		flex-shrink: 0;
	}
	.tx-icon.income { background: rgba(232, 155, 155, 0.12); color: #E89B9B; }
	.tx-icon.expense { background: rgba(123, 196, 168, 0.12); color: #7BC4A8; }

	.tx-info { flex: 1; min-width: 0; }
	.tx-title { font-size: 30rpx; font-weight: 500; color: #1F2A47; margin-bottom: 4rpx; }
	.tx-meta { font-size: 24rpx; color: #5A6788; }

	.tx-amount { text-align: right; flex-shrink: 0; }
	.tx-amount .value { font-size: 34rpx; font-weight: 600; }
	.tx-amount .value.income { color: #E89B9B; }
	.tx-amount .value.expense { color: #7BC4A8; }

	@media (min-width: 768px) {
		.tx-item { margin: 0 48rpx 12rpx; }
	}
	@media (max-width: 360px) {
		.tx-item { margin: 0 16rpx 10rpx; padding: 20rpx 16rpx; }
		.tx-icon { width: 64rpx; height: 64rpx; font-size: 28rpx; margin-right: 16rpx; }
		.tx-title { font-size: 26rpx; }
		.tx-amount .value { font-size: 28rpx; }
	}
</style>
