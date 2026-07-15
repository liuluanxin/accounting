<template>
	<view class="page">
		<view class="nav-back" @click="goBack"><text>‹</text></view>
		<view class="page-title">智能记账助手</view>

		<scroll-view scroll-y class="scroll">
			<view class="hero-card">
				<text class="hero-icon">✨</text>
				<view class="hero-text">
					<text class="hero-title">让记账更轻松</text>
					<text class="hero-subtitle">拍照、语音或选择场景，3 秒完成一笔记录</text>
				</view>
			</view>

			<!-- 三大入口 -->
			<view class="quick-grid">
				<view class="quick-card" @click="goQuickRecord('photo')">
					<view class="quick-icon" style="background: rgba(91, 155, 224, 0.12); color: var(--primary, #5B9BE0);">📷</view>
					<text class="quick-name">拍照记账</text>
					<text class="quick-desc">拍小票自动识别</text>
				</view>
				<view class="quick-card" @click="goQuickRecord('voice')">
					<view class="quick-icon" style="background: rgba(232, 165, 100, 0.15); color: #E8A564;">🎙️</view>
					<text class="quick-name">语音记账</text>
					<text class="quick-desc">说话即可记录</text>
				</view>
				<view class="quick-card" @click="goQuickRecord('ai')">
					<view class="quick-icon" style="background: rgba(169, 139, 120, 0.15); color: var(--text-tertiary, #A98B78);">🤖</view>
					<text class="quick-name">AI 识别</text>
					<text class="quick-desc">智能分析场景</text>
				</view>
			</view>

			<!-- 场景模板 -->
			<view class="section">
				<text class="section-title">🎯 常用场景</text>
				<view class="template-list">
					<view v-for="t in templates" :key="t.name" class="template-item" @click="applyTemplate(t)">
						<text class="tpl-emoji">{{ t.emoji }}</text>
						<view class="tpl-info">
							<text class="tpl-name">{{ t.name }}</text>
							<text class="tpl-desc">{{ t.desc }}</text>
						</view>
						<text class="tpl-arrow">›</text>
					</view>
				</view>
			</view>

			<view class="tip">
				<text class="tip-icon">ℹ️</text>
				<text class="tip-text">更多智能能力正在开发中，敬请期待 🚀</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import themeMixin from '@/common/theme-mixin.js'
import ICONS from '@/common/icon-base64.js'

export default {
	mixins: [themeMixin],
	data() {
		return {
			templates: [
				{ name: '早餐', emoji: '🥐', desc: '¥15 ~ ¥30', amount: 20, category: '餐饮', type: 'expense' },
				{ name: '午餐', emoji: '🍱', desc: '¥20 ~ ¥50', amount: 35, category: '餐饮', type: 'expense' },
				{ name: '晚餐', emoji: '🍜', desc: '¥30 ~ ¥80', amount: 50, category: '餐饮', type: 'expense' },
				{ name: '打车', emoji: '🚖', desc: '¥15 ~ ¥40', amount: 25, category: '交通', type: 'expense' },
				{ name: '咖啡', emoji: '☕', desc: '¥15 ~ ¥35', amount: 25, category: '餐饮', type: 'expense' },
				{ name: '日用品', emoji: '🛒', desc: '¥10 ~ ¥200', amount: 50, category: '购物', type: 'expense' }
			]
		}
	},
	computed: {
		...mapState('accounting', ['data', 'initialized'])
	},
	methods: {
		getIconStyle(name) {
			return { 'mask-image': 'url(' + ICONS[name] + ')', '-webkit-mask-image': 'url(' + ICONS[name] + ')' }
		},
		goBack() { uni.navigateBack() },
		goQuickRecord(mode) {
			if (mode === 'photo') {
				uni.navigateTo({ url: '/pages/accounting/photo-record' })
			} else if (mode === 'voice') {
				uni.showModal({
					title: '🎙️ 语音记账',
					content: '语音识别功能开发中\n\n您可使用「记一笔」手动记录，或选择下方场景模板快速记账。',
					showCancel: false,
					confirmText: '知道了'
				})
			} else if (mode === 'ai') {
				uni.showModal({
					title: '🤖 AI 识别',
					content: 'AI 智能分析功能开发中\n\n您可使用「记一笔」手动记录，或选择下方场景模板快速记账。',
					showCancel: false,
					confirmText: '知道了'
				})
			}
		},
		async applyTemplate(t) {
			uni.showModal({
				title: '使用此模板记账？',
				content: `${t.emoji} ${t.name} · ¥${t.amount}\n分类：${t.category}`,
				success: async (res) => {
					if (!res.confirm) return
					const accounts = (this.data && this.data.accounts) || []
					const accountId = accounts[0] ? accounts[0].id : null
					if (!accountId) {
						uni.showToast({ title: '请先添加账户', icon: 'none' })
						return
					}
					const r = await this.$store.dispatch('accounting/addTransaction', {
						amount: t.amount,
						type: t.type,
						category: t.category,
						accountId,
						note: t.name
					})
					uni.showToast({ title: r.success ? '已记录' : (r.message || '失败'), icon: r.success ? 'success' : 'none' })
					if (r.success) setTimeout(() => uni.navigateBack(), 600)
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: transparent; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.nav-back { position: fixed; top: calc(var(--status-bar-height) + 16rpx); left: 24rpx; width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 60rpx; color: var(--text-primary, #3D2316); z-index: 10; }
.page-title { padding: calc(var(--status-bar-height) + 24rpx) 32rpx 16rpx; font-size: 36rpx; font-weight: 700; color: var(--text-primary, #3D2316); flex-shrink: 0; }
.scroll { flex: 1; padding: 0 32rpx 80rpx; }

.hero-card { background: linear-gradient(135deg, var(--hero-from, #EAF4FF) 0%, var(--hero-via, #F1ECFF) 50%, var(--hero-to, #FFFFFF) 100%); border-radius: 24rpx; padding: 40rpx 32rpx; display: flex; align-items: center; gap: 24rpx; box-shadow: 0 8rpx 24rpx var(--primary-shadow, rgba(91, 155, 224, 0.3)); }
.hero-icon { font-size: 80rpx; }
.hero-text { display: flex; flex-direction: column; gap: 6rpx; flex: 1; }
.hero-title { font-size: 32rpx; font-weight: 700; color: var(--text-primary, #1A2744); }
.hero-subtitle { font-size: 22rpx; color: var(--text-secondary, #5A6B8A); }

.quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx; margin: 24rpx 0 8rpx; }
.quick-card { background: var(--card-bg, #FFFFFF); border-radius: 20rpx; padding: 28rpx 16rpx; display: flex; flex-direction: column; align-items: center; gap: 10rpx; box-shadow: 0 2rpx 12rpx rgba(91, 155, 224, 0.06); transition: all 0.2s; }
.quick-card:active { transform: scale(0.96); }
.quick-icon { width: 80rpx; height: 80rpx; line-height: 80rpx; text-align: center; font-size: 44rpx; border-radius: 24rpx; }
.quick-name { font-size: 26rpx; font-weight: 600; color: var(--text-primary, #3D2316); }
.quick-desc { font-size: 20rpx; color: var(--text-secondary, #7A5C4A); }

.section { background: var(--card-bg, #FFFFFF); border-radius: 24rpx; padding: 24rpx 28rpx; margin-top: 24rpx; box-shadow: 0 2rpx 12rpx rgba(61, 35, 22, 0.06); }
.section-title { display: block; font-size: 28rpx; font-weight: 700; color: var(--text-primary, #3D2316); margin-bottom: 16rpx; }
.template-list { display: flex; flex-direction: column; }
.template-item { display: flex; align-items: center; gap: 20rpx; padding: 20rpx 0; border-bottom: 1px solid var(--border, #F0E4DA); }
.template-item:last-child { border-bottom: none; }
.tpl-emoji { font-size: 48rpx; }
.tpl-info { display: flex; flex-direction: column; gap: 4rpx; flex: 1; }
.tpl-name { font-size: 28rpx; font-weight: 600; color: var(--text-primary, #3D2316); }
.tpl-desc { font-size: 22rpx; color: var(--text-secondary, #7A5C4A); }
.tpl-arrow { font-size: 36rpx; color: var(--text-tertiary, #A98B78); }

.tip { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 24rpx; background: var(--card-bg, #FFFFFF); border-radius: 16rpx; margin-top: 24rpx; }
.tip-icon { font-size: 28rpx; }
.tip-text { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); flex: 1; }
</style>
