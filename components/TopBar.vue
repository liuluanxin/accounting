<template>
	<view class="topbar" :class="[variant, { 'has-back': showBack }]">
		<view v-if="showBack" class="topbar__back" @click="onBack">
			<lucide-icon name="chevron-left" size="36rpx" />
		</view>
		<view v-else-if="variant !== 'home' && variant !== 'calendar'" class="topbar__back topbar__back--placeholder" />

		<!-- 首页：账本下拉 -->
		<view v-if="variant === 'home'" class="topbar-home-ledger" @click="toggleLedger">
			<text>{{ currentLedger.name }}</text>
			<lucide-icon name="chevron-down" size="20rpx" />
			<view v-if="ledgerOpen" class="ledger-dropdown" @click.stop>
				<view
					v-for="l in ledgers"
					:key="l.id"
					class="ledger-option"
					:class="{ on: l.id === currentLedger.id }"
					@click="selectLedger(l)"
				>
					<text class="lo-name">{{ l.name }}</text>
					<lucide-icon v-if="l.id === currentLedger.id" name="check" size="18rpx" class="lo-check" />
				</view>
			</view>
		</view>

		<!-- 日历：年月居中 -->
		<view v-else-if="variant === 'calendar'" class="topbar-cal-center">
			<view class="parrow" @click="$emit('step', -1)">
				<lucide-icon name="chevron-left" size="36rpx" />
			</view>
			<view class="period-center" @click="$emit('open-month')">
				<text>{{ calYear }}年{{ calMonth }}月</text>
				<lucide-icon name="chevron-down" size="20rpx" />
			</view>
			<view class="parrow" @click="$emit('step', 1)">
				<lucide-icon name="chevron-right" size="36rpx" />
			</view>
		</view>

		<!-- 默认标题 -->
		<text v-else class="topbar__title">{{ title }}</text>

		<view class="topbar__actions">
			<slot name="actions">
				<view v-if="variant === 'home'" class="topbar-home-habits">
					<view class="act" @click="$emit('search')"><lucide-icon name="search" size="28rpx" /></view>
					<view class="act" @click="$emit('all-bills')"><lucide-icon name="receipt" size="28rpx" /></view>
					<view class="act" @click="$emit('customize')"><lucide-icon name="pencil" size="28rpx" /></view>
				</view>
				<view v-else-if="rightText" class="act act-sm" @click="$emit('right')">
					<text>{{ rightText }}</text>
				</view>
			</slot>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TopBar',
	props: {
		title: { type: String, default: '' },
		variant: { type: String, default: 'default' },
		showBack: { type: Boolean, default: false },
		backDelta: { type: Number, default: 1 },
		currentLedger: { type: Object, default: () => ({ id: 'general', name: '总账本' }) },
		ledgers: { type: Array, default: () => [] },
		calYear: { type: Number, default: 2026 },
		calMonth: { type: Number, default: 7 },
		rightText: { type: String, default: '' }
	},
	data() {
		return {
			ledgerOpen: false
		}
	},
	mounted() {
		// 点击外部关闭下拉
		this._onTap = () => { this.ledgerOpen = false }
		uni.$on('tap', this._onTap)
	},
	beforeDestroy() {
		uni.$off('tap', this._onTap)
	},
	methods: {
		onBack() {
			this.$emit('back')
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack({ delta: this.backDelta })
			}
		},
		toggleLedger() {
			this.ledgerOpen = !this.ledgerOpen
		},
		selectLedger(l) {
			this.ledgerOpen = false
			this.$emit('ledger-change', l)
		}
	}
}
</script>

<style lang="scss" scoped>
.topbar {
	position: fixed;
	top: var(--statusbar-height, 92rpx);
	left: 0;
	right: 0;
	z-index: 998;
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	background: transparent;
}
.topbar.home {
	justify-content: space-between;
}
.topbar__back {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: var(--text-primary);
}
.topbar__back--placeholder {
	visibility: hidden;
}
.topbar__title {
	flex: 1;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
	color: var(--text-primary);
	position: absolute;
	left: 0;
	right: 0;
	pointer-events: none;
}
.topbar__actions {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 8rpx;
	z-index: 2;
}
.topbar-home-ledger {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 44rpx;
	font-weight: 700;
	color: var(--text-primary);
	position: relative;
	z-index: 999;
}
.topbar-home-habits {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.act {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.8);
	border: 1rpx solid rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
	box-shadow: 0 2rpx 8rpx rgba(91, 140, 210, 0.08);
}
.act-sm {
	width: auto;
	padding: 0 20rpx;
	font-size: 26rpx;
	font-weight: 600;
	border-radius: 999rpx;
}
.topbar-cal-center {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}
.period-center {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: var(--text-primary);
}
.parrow {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
}

/* ===== 账本下拉菜单 ===== */
.ledger-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	margin-top: 12rpx;
	min-width: 240rpx;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(20rpx);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	padding: 8rpx 0;
	z-index: 1000;
}
.ledger-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 22rpx 24rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-primary);
}
.ledger-option.on {
	color: var(--primary, #5B9BE0);
	font-weight: 600;
}
.ledger-option:active {
	background: rgba(91, 155, 224, 0.08);
}
.lo-check {
	color: var(--primary, #5B9BE0);
}
</style>