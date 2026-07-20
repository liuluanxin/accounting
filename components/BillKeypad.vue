<template>
	<view class="bill-keypad">
		<view class="bill-keypad__grid">
			<view
				v-for="cell in numCells"
				:key="cell.k"
				class="key"
				:class="cell.cls"
				hover-class="key--pressed"
				@tap="onTap(cell)"
			>
				<text class="key-txt">{{ cell.label }}</text>
			</view>
		</view>
		<view class="bill-keypad__side">
			<view class="key key--bk" hover-class="key--pressed" @tap="onTap({ k: 'bk' })">
				<text class="key-txt">⌫</text>
			</view>
			<view class="key key--plus" hover-class="key--pressed" @tap="$emit('plus')">
				<text class="key-txt">+</text>
			</view>
			<view class="key key--minus" hover-class="key--pressed" @tap="$emit('minus')">
				<text class="key-txt">−</text>
			</view>
			<view class="key key--save" hover-class="key--pressed" @tap="$emit('save')">
				<text class="key-txt">保存</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'BillKeypad',
	data() {
		return {
			numCells: [
				{ k: '7', label: '7' },
				{ k: '8', label: '8' },
				{ k: '9', label: '9' },
				{ k: '4', label: '4' },
				{ k: '5', label: '5' },
				{ k: '6', label: '6' },
				{ k: '1', label: '1' },
				{ k: '2', label: '2' },
				{ k: '3', label: '3' },
				{ k: 'again', label: '再记', cls: 'key--fn' },
				{ k: '0', label: '0' },
				{ k: '.', label: '.' }
			]
		}
	},
	methods: {
		onTap(cell) {
			this.$emit('key', cell.k)
		}
	}
}
</script>

<style lang="scss" scoped>
.bill-keypad {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	width: 100%;
	gap: 12rpx;
	box-sizing: border-box;
}

.bill-keypad__grid {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	align-content: flex-start;
}

.bill-keypad__side {
	width: 148rpx;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.key {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(91, 140, 210, 0.08);
}

.bill-keypad__grid .key {
	width: calc((100% - 24rpx) / 3);
	height: 96rpx;
}

.bill-keypad__side .key {
	width: 100%;
	height: 96rpx;
}

.key--save {
	flex: 1;
	background: var(--primary, #4a90d9);
}

.key--bk {
	background: #fff0f0;
}

.key--plus {
	background: #e8f8ee;
}

.key--minus {
	background: #fff0f0;
}

.key--fn {
	font-size: 28rpx;
}

.key-txt {
	font-size: 40rpx;
	font-weight: 600;
	color: var(--text-primary, #1a2744);
	line-height: 1;
}

.key--save .key-txt {
	font-size: 32rpx;
	color: #fff;
}

.key--fn .key-txt {
	font-size: 28rpx;
}

.key--bk .key-txt {
	color: var(--expense, #e85d5d);
}

.key--plus .key-txt {
	font-size: 36rpx;
	color: var(--income, #3cb878);
}

.key--minus .key-txt {
	font-size: 36rpx;
	color: var(--expense, #e85d5d);
}

.key--pressed {
	opacity: 0.75;
	transform: scale(0.97);
}
</style>
