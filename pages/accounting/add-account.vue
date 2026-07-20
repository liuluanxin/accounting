<template>
	<view class="cosmic-page add-acc-page">
		<top-bar title="创建账户" show-back />

		<scroll-view scroll-y class="screen">
			<!-- 实时预览卡片（独立，在表单卡片上方） -->
			<view class="preview-card">
				<view class="preview-card__icon">
					<lucide-icon :name="selectedIcon" :brand="true" size="96rpx" />
				</view>
				<view class="preview-card__info">
					<view class="preview-card__name">{{ displayName }}</view>
					<view class="preview-card__balance">¥{{ displayBalance }}</view>
				</view>
			</view>

			<!-- 表单大卡片（PRD 布局：一个卡片内含所有内容） -->
			<AccCard :padding="'0'" :margin="'0 24rpx'">
				<!-- 🏷 账户名称 -->
				<view class="form-row">
					<view class="form-row__label">
						<text class="form-row__emoji">🏷</text>
						<text>账户名称</text>
					</view>
					<input
						v-model="accountName"
						class="form-row__input"
						placeholder="点击输入"
						placeholder-class="form-ph"
						maxlength="20"
					/>
				</view>

				<!-- 💰 初始余额 -->
				<view class="form-row">
					<view class="form-row__label">
						<text class="form-row__emoji">💰</text>
						<text>初始余额</text>
					</view>
					<view class="form-row__input-wrap">
						<text class="form-row__currency">¥</text>
						<input
							v-model="initialBalance"
							class="form-row__input form-row__input--amount"
							type="digit"
							placeholder="0.00"
							placeholder-class="form-ph"
						/>
					</view>
				</view>

				<!-- 分割线 + 选择账户图标 -->
				<view class="form-divider" />
				<view class="icon-section">
					<view class="icon-section__title">选择账户图标</view>
					<view class="icon-grid">
						<view
							v-for="item in allIcons"
							:key="item.key"
							class="icon-cell"
							:class="{ on: selectedIcon === item.key }"
							@click="selectIcon(item.key)"
						>
							<view class="icon-cell__circle">
								<lucide-icon :name="item.key" :brand="true" size="56rpx" />
							</view>
							<view class="icon-cell__label">{{ item.label }}</view>
						</view>
					</view>
				</view>

				<!-- 创建账户按钮 -->
				<view class="card-action">
					<button
						class="btn-create"
						:class="{ 'btn-create--disabled': !isValid }"
						:disabled="!isValid"
						@click="onCreate"
					>创建账户</button>
					<view class="btn-reset" @click="onReset">重置</view>
				</view>
			</AccCard>

			<view class="bottom-spacer" />
		</scroll-view>
	</view>
</template>

<script>
import { addAccount } from '@/common/app-data.js'
import { getAccountIcons } from '@/common/account-icon-registry.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import AccCard from '@/components/accounting/AccCard.vue'

// PRD 5.14 节指定的图标顺序（4行×5列）
const PRD_ICON_ORDER = [
	'wallet', 'credit-card', 'banknote', 'wechat', 'alipay',
	'qq', 'trending-up', 'icbc', 'ccb', 'abc',
	'boc', 'comm', 'cmb', 'spdb', 'cgb',
	'cmbc', 'citic', 'jd', 'meituan', 'huabei'
]

export default {
	components: { AccCard },
	data() {
		return {
			accountName: '',
			initialBalance: '',
			selectedIcon: 'wallet'
		}
	},
	computed: {
		allIcons() {
			const registry = getAccountIcons()
			const map = {}
			registry.forEach(i => { map[i.key] = i })
			return PRD_ICON_ORDER.map(key => map[key]).filter(Boolean)
		},
		displayName() {
			return this.accountName.trim() || '新账户'
		},
		displayBalance() {
			const bal = Number(this.initialBalance) || 0
			return bal.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
		},
		isValid() {
			return this.accountName.trim().length > 0
		}
	},
	onShow() {
		applyThemeToPage(this)
		this.onReset()
	},
	methods: {
		selectIcon(key) {
			this.selectedIcon = key
		},
		onReset() {
			this.accountName = ''
			this.initialBalance = ''
			this.selectedIcon = 'wallet'
		},
		onCreate() {
			const name = this.accountName.trim()
			if (!name) {
				uni.showToast({ title: '请输入账户名称', icon: 'none' })
				return
			}
			const bal = Number(this.initialBalance) || 0
			addAccount({
				ic: this.selectedIcon,
				name,
				bal,
				type: 'pay'
			})
			uni.showToast({ title: '已创建：' + name, icon: 'success' })
			setTimeout(() => uni.navigateBack(), 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.add-acc-page {
	height: 100vh;
	overflow: hidden;
	background: transparent;
}

/* ── 预览卡片（宇宙玻璃拟态） ── */
.preview-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin: 0 24rpx 32rpx;
	padding: 32rpx;
	background: linear-gradient(170deg, #FFFFFF, #F0F7FF, #F5F0FF);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 44rpx;
	box-shadow: 0 8rpx 32rpx rgba(91, 155, 224, 0.08);
	-webkit-backdrop-filter: blur(20px);
	backdrop-filter: blur(20px);
}

.preview-card__icon {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	overflow: hidden;
}

.preview-card__info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.preview-card__name {
	font-size: 34rpx;
	font-weight: 600;
	color: #1A2744;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.preview-card__balance {
	font-size: 28rpx;
	color: #5A6B8A;
}

/* ── 表单行 ── */
.form-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
	min-height: 88rpx;
}

.form-row__label {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 30rpx;
	font-weight: 500;
	color: #1A2744;
	flex-shrink: 0;
}

.form-row__emoji {
	font-size: 32rpx;
	line-height: 1;
}

.form-row__input {
	flex: 1;
	text-align: right;
	font-size: 30rpx;
	color: #1A2744;
	margin-left: 20rpx;
}

.form-row__input--amount {
	font-size: 32rpx;
	font-weight: 600;
}

.form-row__input-wrap {
	display: flex;
	align-items: center;
	gap: 6rpx;
	flex-shrink: 0;
}

.form-row__currency {
	font-size: 30rpx;
	font-weight: 600;
	color: #1A2744;
}

.form-ph {
	color: #8A9BB8;
}

/* ── 分割线 ── */
.form-divider {
	height: 1px;
	background: rgba(200, 210, 230, 0.4);
	margin: 0 32rpx;
}

/* ── 图标选择区 ── */
.icon-section {
	padding: 24rpx 24rpx 28rpx;
}

.icon-section__title {
	font-size: 28rpx;
	font-weight: 500;
	color: #5A6B8A;
	margin-bottom: 16rpx;
	padding: 0 8rpx;
}

/* 图标网格 — 5列 */
.icon-grid {
	display: flex;
	flex-wrap: wrap;
	row-gap: 8rpx;
}

.icon-cell {
	width: 20%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 8rpx 0;
	box-sizing: border-box;
}

.icon-cell__circle {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(240, 247, 255, 0.8);
	overflow: hidden;
	transition: all 0.2s ease;
}

.icon-cell.on .icon-cell__circle {
	box-shadow: 0 0 0 4rpx #5B9BE0, 0 0 0 8rpx rgba(91, 155, 224, 0.15);
	background: rgba(91, 155, 224, 0.08);
}

.icon-cell__label {
	margin-top: 8rpx;
	font-size: 22rpx;
	color: #5A6B8A;
	text-align: center;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 0 4rpx;
	box-sizing: border-box;
}

/* ── 卡片底部操作区 ── */
.card-action {
	padding: 0 24rpx 36rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.btn-create {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.35);
	border: none;
	transition: opacity 0.2s ease;
}

.btn-create::after {
	border: none;
}

.btn-create--disabled {
	opacity: 0.45;
	box-shadow: none;
}

.btn-reset {
	margin-top: 24rpx;
	font-size: 26rpx;
	color: #8A9BB8;
	padding: 12rpx 24rpx;
	text-decoration: underline;
}

.bottom-spacer {
	height: calc(40rpx + env(safe-area-inset-bottom));
}
</style>