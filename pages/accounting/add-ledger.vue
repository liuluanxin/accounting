<template>
	<view class="add-ledger-page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">新建账本</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="form-scroll" show-scrollbar="false">
			<!-- 账本名称 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账本名称</text>
					<text class="label-required">*</text>
				</view>
				<view class="input-wrapper">
					<input
						class="form-input"
						v-model="ledgerName"
						placeholder="例如：家庭账本、旅行账本"
						placeholder-class="input-placeholder"
						maxlength="20"
						:adjust-position="true"
						:cursor-spacing="20"
					/>
				</view>
			</view>

			<!-- 账本封面 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账本封面</text>
				</view>
				<view class="cover-grid">
					<view
						v-for="(cover, idx) in coverOptions"
						:key="idx"
						class="cover-item"
						:class="{ 'cover-selected': selectedCover === cover.icon }"
						:style="selectedCover === cover.icon ? { outlineColor: 'var(--primary, #E8734A)' } : {}"
						@click="selectedCover = cover.icon"
					>
						<view class="cover-preview" :style="{ background: cover.gradient }">
							<text class="cover-emoji">{{ cover.icon }}</text>
						</view>
						<text class="cover-name">{{ cover.name }}</text>
						<view v-if="selectedCover === cover.icon" class="cover-check">
							<text class="check-mark">✓</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 账本分类 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账本分类</text>
				</view>
				<scroll-view scroll-x class="category-scroll" show-scrollbar="false">
					<view
						v-for="cat in categoryOptions"
						:key="cat.value"
						class="category-chip"
						:class="{ 'cat-active': ledgerCategory === cat.value }"
						@click="ledgerCategory = cat.value"
					>
						<text class="cat-emoji">{{ cat.icon }}</text>
						<text class="cat-name">{{ cat.label }}</text>
					</view>
				</scroll-view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<!-- 底部保存按钮 -->
		<view class="bottom-bar">
			<view class="btn-save" :class="{ 'btn-disabled': !canSave }" @click="saveLedger">
				<text class="btn-save-text">创建账本</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import Logger from '@/common/logger.js'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'

	const COVER_OPTIONS = [
		{ icon: '📒', gradient: 'linear-gradient(135deg, #E8734A, #C95A33)', name: '珊瑚暖色' },
		{ icon: '📕', gradient: 'linear-gradient(135deg, #E89B9B, #D47A7A)', name: '红色热情' },
		{ icon: '📗', gradient: 'linear-gradient(135deg, #7BC4A8, #5AAF8E)', name: '绿色自然' },
		{ icon: '📘', gradient: 'linear-gradient(135deg, #54A0FF, #2D7FE0)', name: '天空蓝' },
		{ icon: '📙', gradient: 'linear-gradient(135deg, #FF9F43, #E8832A)', name: '橙色活力' },
		{ icon: '📚', gradient: 'linear-gradient(135deg, #A55EEA, #8B3FD4)', name: '紫色浪漫' },
		{ icon: '💰', gradient: 'linear-gradient(135deg, #FFD700, #F0C000)', name: '金色财富' },
		{ icon: '💎', gradient: 'linear-gradient(135deg, #48DBFB, #1BC5E8)', name: '宝石蓝' },
		{ icon: '🌙', gradient: 'linear-gradient(135deg, #5A4A3A, #3D3028)', name: '深棕夜色' },
		{ icon: '🌸', gradient: 'linear-gradient(135deg, #FF9FF3, #F368E0)', name: '粉色甜心' },
	]

	const CATEGORY_OPTIONS = [
		{ value: 'personal', label: '个人生活', icon: '👤' },
		{ value: 'family', label: '家庭', icon: '👨‍👩‍👧‍👦' },
		{ value: 'travel', label: '旅行', icon: '✈️' },
		{ value: 'business', label: '生意', icon: '💼' },
		{ value: 'investment', label: '投资', icon: '📈' },
		{ value: 'study', label: '学习', icon: '📚' },
		{ value: 'wedding', label: '婚礼', icon: '💒' },
		{ value: 'pet', label: '宠物', icon: '🐾' },
		{ value: 'other', label: '其他', icon: '📦' },
	]

	export default {
		mixins: [themeMixin],
		data() {
			return {
				ledgerName: '',
				selectedCover: '📒',
				ledgerCategory: 'personal',
				coverOptions: COVER_OPTIONS,
				categoryOptions: CATEGORY_OPTIONS,
				saving: false,
				keyboardHeight: 0
			}
		},
		computed: {
			...mapState('accounting', ['initialized']),
			canSave() {
				return this.ledgerName.trim().length > 0 && !this.saving
			}
		},
		methods: {
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			goBack() {
				uni.navigateBack()
			},
			async saveLedger() {
				if (!this.canSave) return

				const name = this.ledgerName.trim()
				if (!name) {
					uni.showToast({ title: '请输入账本名称', icon: 'none' })
					return
				}

				this.saving = true
				try {
					const ledgerData = {
						name,
						cover: this.selectedCover,
						category: this.ledgerCategory,
						color: this.getCoverGradient(this.selectedCover)
					}

					const res = await this.$store.dispatch('accounting/addLedger', ledgerData)
					if (res.success) {
						uni.showToast({ title: '账本创建成功 ✨', icon: 'none' })
						setTimeout(() => uni.redirectTo({ url: '/pages/accounting/ledgers' }), 600)
					} else {
						uni.showToast({ title: res.message || '创建失败', icon: 'none' })
					}
				} catch (err) {
					Logger.error('AddLedger', '创建账本失败', err)
					uni.showToast({ title: '操作失败，请重试', icon: 'none' })
				} finally {
					this.saving = false
				}
			},
			getCoverGradient(cover) {
				const opt = COVER_OPTIONS.find(c => c.icon === cover)
				return opt ? opt.gradient : 'linear-gradient(135deg, #E8734A, #C95A33)'
			},
			onKeyboardHeightChange(e) {
				this.keyboardHeight = (e && e.height) || 0
			}
		},
		onLoad() {
			uni.onKeyboardHeightChange(this.onKeyboardHeightChange)
		},
		onUnload() {
			uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
		}
	}
</script>

<style lang="scss" scoped>
	.add-ledger-page {
		height: 100vh;
		background: var(--bg, #FFF9F5);
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	/* ===== 导航栏 ===== */
	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height) + 16rpx) 24rpx;
		background: var(--bg, #FFF9F5);
		position: sticky;
		top: 0;
		z-index: 100;
		width: 100%;
		box-sizing: border-box;
		flex-shrink: 0;
	}
	.nav-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--input-bg, #FFF5EE);
		transition: all 0.2s;
	}
	.nav-back:active {
		background: var(--border, #F0E4DA);
		transform: scale(0.95);
	}
	.back-icon {
		font-size: 48rpx;
		color: var(--text-primary, #3D2316);
		line-height: 1;
		margin-top: -4rpx;
	}
	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #3D2316);
	}
	.nav-placeholder {
		width: 72rpx;
	}

	/* ===== 滚动区域 ===== */
	.form-scroll {
		flex: 1;
		width: 100%;
		padding: 20rpx 28rpx;
		box-sizing: border-box;
	}

	/* ===== 表单区块 ===== */
	.form-section {
		margin-bottom: 36rpx;
	}
	.section-label {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		gap: 8rpx;
	}
	.label-text {
		font-size: 28rpx;
		font-weight: 500;
		color: var(--text-primary, #3D2316);
	}
	.label-required {
		color: #FF6B6B;
		font-size: 28rpx;
	}

	/* ===== 输入框 ===== */
	.input-wrapper {
		background: var(--card-bg, #FFFFFF);
		border-radius: 16rpx;
		border: 2rpx solid var(--border, #F0E4DA);
		padding: 0 24rpx;
		transition: border-color 0.2s;
	}
	.input-wrapper:focus-within {
		border-color: var(--primary, #E8734A);
	}
	.form-input {
		height: 92rpx;
		font-size: 30rpx;
		color: var(--text-primary, #3D2316);
	}
	.input-placeholder {
		color: var(--text-tertiary, #A98B78);
		font-size: 28rpx;
	}

	/* ===== 封面选择网格 ===== */
	.cover-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 16rpx;
	}
	.cover-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 8rpx;
		border-radius: 20rpx;
		background: var(--card-bg, #FFFFFF);
		border: 2rpx solid var(--border, #F0E4DA);
		transition: all 0.25s;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}
	.cover-item:active {
		transform: scale(0.95);
	}
	.cover-selected {
		border-color: var(--primary, #E8734A);
		background: rgba(232, 115, 74, 0.06);
		box-shadow: 0 0 0 2rpx rgba(232, 115, 74, 0.2), 0 4rpx 16rpx rgba(232, 115, 74, 0.15);
	}
	.cover-preview {
		width: 80rpx;
		height: 80rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	.cover-emoji {
		font-size: 40rpx;
	}
	.cover-name {
		font-size: 22rpx;
		color: var(--text-secondary, #7A5C4A);
	}
	.cover-check {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: var(--primary, #E8734A);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 6rpx rgba(232, 115, 74, 0.4);
	}
	.check-mark {
		font-size: 20rpx;
		color: var(--card-bg, #FFFFFF);
		font-weight: 700;
	}

	/* ===== 分类选择 ===== */
	.category-scroll {
		white-space: nowrap;
		padding-bottom: 8rpx;
	}
	.category-chip {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding: 16rpx 28rpx;
		margin-right: 16rpx;
		background: var(--card-bg, #FFFFFF);
		border-radius: 20rpx;
		border: 2rpx solid var(--border, #F0E4DA);
		min-width: 100rpx;
		transition: all 0.2s;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}
	.category-chip:active {
		transform: scale(0.95);
	}
	.cat-active {
		background: rgba(232, 115, 74, 0.08);
		border-color: var(--primary, #E8734A);
		color: var(--primary, #E8734A);
		box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.15);
	}
	.cat-emoji {
		font-size: 36rpx;
	}
	.cat-name {
		font-size: 22rpx;
		color: inherit;
	}

	/* ===== 底部保存按钮 ===== */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 28rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: linear-gradient(to top, var(--bg, #FFF9F5) 60%, transparent);
		z-index: 100;
		box-sizing: border-box;
	}
	.btn-save {
		height: 96rpx;
		background: linear-gradient(135deg, var(--primary, #E8734A), #D65D35);
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.35);
		transition: all 0.25s;
	}
	.btn-save:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.25);
	}
	.btn-disabled {
		opacity: 0.5;
		box-shadow: none;
	}
	.btn-disabled:active {
		transform: none;
	}
	.btn-save-text {
		font-size: 32rpx;
		font-weight: 600;
		color: var(--card-bg, #FFFFFF);
	}

	/* ===== 响应式 ===== */
	@media (min-width: 768px) {
		.form-scroll {
			max-width: 700px;
			margin: 0 auto;
			width: 100%;
		}
		.bottom-bar {
			max-width: 700px;
			left: 50%;
			transform: translateX(-50%);
			width: 100%;
		}
		.cover-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}
	@media (max-width: 360px) {
		.form-scroll {
			padding: 16rpx 16rpx;
		}
		.cover-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 12rpx;
		}
		.cover-preview {
			width: 68rpx;
			height: 68rpx;
		}
		.cover-emoji {
			font-size: 34rpx;
		}
		.category-chip {
			padding: 12rpx 20rpx;
			min-width: 80rpx;
		}
	}
</style>
