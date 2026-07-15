<template>
	<view class="acc-keyboard">
		<view class="kb-body">
			<!-- 左侧数字键区域 -->
			<view class="kb-digits">
				<view class="kb-row">
					<view class="kb-key" @touchstart="onPress('7')" @touchend="onRelease"><text>7</text></view>
					<view class="kb-key" @touchstart="onPress('8')" @touchend="onRelease"><text>8</text></view>
					<view class="kb-key" @touchstart="onPress('9')" @touchend="onRelease"><text>9</text></view>
				</view>
				<view class="kb-row">
					<view class="kb-key" @touchstart="onPress('4')" @touchend="onRelease"><text>4</text></view>
					<view class="kb-key" @touchstart="onPress('5')" @touchend="onRelease"><text>5</text></view>
					<view class="kb-key" @touchstart="onPress('6')" @touchend="onRelease"><text>6</text></view>
				</view>
				<view class="kb-row">
					<view class="kb-key" @touchstart="onPress('1')" @touchend="onRelease"><text>1</text></view>
					<view class="kb-key" @touchstart="onPress('2')" @touchend="onRelease"><text>2</text></view>
					<view class="kb-key" @touchstart="onPress('3')" @touchend="onRelease"><text>3</text></view>
				</view>
				<view class="kb-row">
					<view class="kb-key kb-key-dot" @touchstart="onPress('.')" @touchend="onRelease"><text>.</text></view>
					<view class="kb-key" @touchstart="onPress('0')" @touchend="onRelease"><text>0</text></view>
					<view class="kb-key kb-key-del" @touchstart="onPress('del')" @touchend="onRelease"><text>⌫</text></view>
				</view>
			</view>
			<!-- 右侧操作按钮列 -->
			<view class="kb-actions">
				<view class="kb-action kb-action-again" @touchstart="onActionAgain" @touchend="onRelease">
					<text>再记</text>
				</view>
				<view class="kb-action kb-action-sign" :class="{ active: signType === 'income' }" @touchstart="onActionPlus" @touchend="onRelease">
					<text>+</text>
				</view>
				<view class="kb-action kb-action-sign" :class="{ active: signType === 'expense' }" @touchstart="onActionMinus" @touchend="onRelease">
					<text>-</text>
				</view>
				<view class="kb-action kb-action-save" @touchstart="onActionSave" @touchend="onRelease">
					<text v-if="saving">···</text>
					<text v-else>保存</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'AccCustomKeyboard',
		props: {
			saving: { type: Boolean, default: false },
			signType: { type: String, default: 'expense' }
		},
		methods: {
			onPress(val) {
				this.$emit('press', val)
			},
			onRelease() {
				// touch 结束，由 CSS transition 处理样式恢复
			},
			onActionAgain() {
				this.$emit('again')
			},
			onActionPlus() {
				this.$emit('sign', '+')
			},
			onActionMinus() {
				this.$emit('sign', '-')
			},
			onActionSave() {
				if (!this.saving) this.$emit('save')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.acc-keyboard {
		background: #E8F0FE;
		padding: 8rpx 16rpx calc(env(safe-area-inset-bottom, 12rpx));
		border-top: 2rpx solid rgba(180, 200, 230, 0.15);
		user-select: none;
		-webkit-user-select: none;
	}

	.kb-body {
		display: flex;
		gap: 12rpx;
		align-items: stretch;
	}

	/* ===== 数字键区域 ===== */
	.kb-digits {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		min-width: 0;
	}

	.kb-row {
		display: flex;
		gap: 12rpx;
	}

	.kb-key {
		flex: 1;
		height: 88rpx;
		border-radius: 18rpx;
		background: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		font-weight: 500;
		color: #1F2A47;
		box-shadow: 0 2rpx 6rpx rgba(180, 160, 200, 0.1);
		transition: all 0.12s;
		cursor: pointer;
	}
	.kb-key:active {
		background: #E4DFEE;
		transform: scale(0.92);
	}

	.kb-key-dot {
		font-weight: 700;
		font-size: 44rpx;
	}

	.kb-key-del {
		font-size: 36rpx;
		color: #E89B9B;
	}

	/* ===== 右侧操作按钮列 ===== */
	.kb-actions {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		width: 140rpx;
		flex-shrink: 0;
	}

	.kb-action {
		flex: 1;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.15s;
		cursor: pointer;
	}

	.kb-action-again {
		background: #FFFFFF;
		color: #6BA8D9;
		box-shadow: 0 2rpx 6rpx rgba(180, 160, 200, 0.1);
	}
	.kb-action-again:active {
		background: #E4DFEE;
		transform: scale(0.94);
	}

	.kb-action-sign {
		background: #FFFFFF;
		color: #5A6788;
		font-size: 36rpx;
		box-shadow: 0 2rpx 6rpx rgba(180, 160, 200, 0.1);
	}
	.kb-action-sign:active {
		background: #E4DFEE;
		transform: scale(0.94);
	}
	.kb-action-sign.active {
		background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(107, 168, 217, 0.3);
	}

	.kb-action-save {
		background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
		color: #fff;
		box-shadow: 0 4rpx 16rpx rgba(107, 168, 217, 0.35);
	}
	.kb-action-save:active {
		opacity: 0.85;
		transform: scale(0.94);
	}

	/* ===== 响应式 ===== */
	@media (min-width: 768px) {
		.acc-keyboard {
			padding: 12rpx calc(50% - 325px + 24rpx);
		}
		.kb-key { height: 96rpx; font-size: 44rpx; }
		.kb-actions { width: 160rpx; }
		.kb-action { font-size: 30rpx; }
	}

	@media (max-width: 360px) {
		.acc-keyboard { padding: 6rpx 12rpx; }
		.kb-key { height: 76rpx; font-size: 36rpx; }
		.kb-actions { width: 120rpx; }
		.kb-action { font-size: 24rpx; }
		.kb-body { gap: 8rpx; }
		.kb-digits { gap: 8rpx; }
		.kb-row { gap: 8rpx; }
		.kb-actions { gap: 8rpx; }
	}

	@media (orientation: landscape) and (max-height: 500px) {
		.acc-keyboard { padding: 6rpx 24rpx; }
		.kb-key { height: 64rpx; font-size: 30rpx; }
		.kb-actions { width: 110rpx; }
		.kb-action { font-size: 22rpx; }
		.kb-body { gap: 6rpx; }
		.kb-digits { gap: 6rpx; }
		.kb-row { gap: 6rpx; }
		.kb-actions { gap: 6rpx; }
	}
</style>
