<template>
	<view class="theme-settings-page">
		<!-- 自定义导航栏 - 标题居中 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">主题设置</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="scroll">
			<view class="section-desc">
				<text>选择您喜欢的主题色，所有页面将立即生效</text>
			</view>

			<view class="theme-list">
				<view v-for="t in themes" :key="t.key" class="theme-card" :class="{ active: t.key === current }" @click="selectTheme(t.key)">
					<view class="theme-preview" :style="{ background: t.preview }">
						<view class="preview-circle c1"></view>
						<view class="preview-circle c2"></view>
						<view class="preview-circle c3"></view>
					</view>
					<view class="theme-info">
						<view class="theme-name-row">
							<text class="theme-name">{{ t.name }}</text>
							<view v-if="t.key === current" class="check-badge">✓</view>
						</view>
						<text class="theme-desc">{{ t.desc }}</text>
						<view class="color-chips">
							<view class="chip" :style="{ background: t.colors['--primary'] }"></view>
							<view class="chip" :style="{ background: t.colors['--expense'] }"></view>
							<view class="chip" :style="{ background: t.colors['--income'] }"></view>
						</view>
					</view>
				</view>
			</view>

			<view class="tip">
				<text class="tip-icon">💡</text>
				<text class="tip-text">主题设置会保存到本地，重新打开 app 也会保留</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { getAllThemes, getCurrentTheme, setTheme } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			themes: [],
			current: 'cosmic'
		}
	},
	onLoad() {
		this.themes = getAllThemes()
		this.current = getCurrentTheme()
	},
	methods: {
		goBack() { uni.navigateBack() },
		selectTheme(key) {
			if (key === this.current) return
			const ok = setTheme(key)
			if (ok) {
				this.current = key
				uni.showToast({ title: '已切换主题', icon: 'success' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.theme-settings-page { min-height: 100vh; background: var(--bg, #FFF9F5); display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }

/* 自定义导航栏 - 标题居中 */
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 16rpx) 24rpx 16rpx; flex-shrink: 0; }
.nav-back { width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 56rpx; color: var(--text-primary, #3D2316); }
.back-icon { font-weight: 300; }
.nav-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
.nav-placeholder { width: 64rpx; }

.scroll { flex: 1; padding: 0 32rpx 80rpx; }

.section-desc { padding: 8rpx 0 24rpx; font-size: 24rpx; color: var(--text-secondary, #7A5C4A); text-align: center; }

.theme-list { display: flex; flex-direction: column; gap: 24rpx; }
.theme-card { background: var(--card-bg, #fff); border-radius: 24rpx; padding: 0; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(61, 35, 22, 0.06); border: 3rpx solid transparent; transition: all 0.25s; }
.theme-card.active { border-color: var(--primary, #E8734A); box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.18); }

.theme-preview { height: 200rpx; position: relative; overflow: hidden; }
.preview-circle { position: absolute; border-radius: 50%; }
.preview-circle.c1 { width: 140rpx; height: 140rpx; top: -40rpx; right: -40rpx; background: rgba(255, 255, 255, 0.5); }
.preview-circle.c2 { width: 80rpx; height: 80rpx; bottom: -20rpx; left: 30rpx; background: rgba(255, 255, 255, 0.4); }
.preview-circle.c3 { width: 50rpx; height: 50rpx; top: 50%; left: 50%; background: rgba(255, 255, 255, 0.35); transform: translate(-50%, -50%); }

.theme-info { padding: 24rpx 28rpx 28rpx; }
.theme-name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.theme-name { font-size: 32rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
.check-badge { width: 40rpx; height: 40rpx; line-height: 40rpx; text-align: center; border-radius: 50%; background: var(--primary, #E8734A); color: #fff; font-size: 24rpx; font-weight: 700; }
.theme-desc { display: block; font-size: 24rpx; color: var(--text-secondary, #7A5C4A); margin-bottom: 16rpx; }
.color-chips { display: flex; gap: 12rpx; }
.chip { width: 48rpx; height: 48rpx; border-radius: 50%; box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08); }

.tip { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 24rpx; background: var(--card-bg, #fff); border-radius: 16rpx; margin-top: 32rpx; border: 1px solid var(--border, #F0E4DA); }
.tip-icon { font-size: 32rpx; }
.tip-text { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); flex: 1; }
</style>
