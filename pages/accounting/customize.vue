<template>
	<view class="cosmic-page">
		<status-bar />
		<top-bar title="自定义首页" show-back right-text="" @back="goBack">
			<template #actions>
				<view class="act" @click="onAdd">
					<lucide-icon name="plus" size="32rpx" />
				</view>
			</template>
		</top-bar>

		<scroll-view scroll-y class="screen screen--pb">
			<view v-if="showBanner" class="banner">
				<lucide-icon name="lightbulb" size="28rpx" />
				<text>点击组件可以快速配置组件参数</text>
				<text class="x" @click="showBanner = false">✕</text>
			</view>

			<view
				v-for="(comp, i) in components"
				:key="i"
				class="comp-card"
				:class="{ sel: selected === i }"
				@click="selected = i"
			>
				<view v-if="selected === i" class="ops">
					<button class="op-btn" @click.stop="onReplace">替换</button>
					<button class="op-btn" @click.stop="onSettings">设置</button>
				</view>
				<view class="card" style="margin:0">
					<text style="font-weight:600;font-size:28rpx">{{ comp.title }}</text>
					<text style="font-size:44rpx;font-weight:800;margin:8rpx 0;display:block">{{ comp.value }}</text>
					<text class="muted">{{ comp.desc }}</text>
				</view>
			</view>

			<view class="bottom-bar">
				<button class="bar-btn" @click="onAdd"><lucide-icon name="plus" size="28rpx" /> 添加</button>
				<button class="bar-btn" :disabled="selected < 0" @click="onDelete"><lucide-icon name="trash" size="28rpx" /> 删除</button>
				<button class="bar-btn" @click="onSort"><lucide-icon name="list-ordered" size="28rpx" /> 排序</button>
				<button class="bar-btn save" @click="onSave"><lucide-icon name="save" size="28rpx" /> 保存</button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { applyThemeToPage } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			showBanner: true,
			selected: 3,
			components: [
				{ title: '7月 · 支出', value: '6,309.16', desc: '本月支出主卡片' },
				{ title: '本月预算', value: '1,000.00 剩余额度', desc: '预算进度卡' },
				{ title: '我的账户', value: '现金/银行卡/微信…', desc: '资产卡片' },
				{ title: '近7天账单', value: '全部账单 ›', desc: '账单列表' }
			]
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		onAdd() {
			uni.showToast({ title: '添加组件', icon: 'none' })
		},
		onReplace() {
			if (this.selected < 0) return this.toastSelect()
			uni.showToast({ title: '替换为同类型组件', icon: 'none' })
		},
		onSettings() {
			if (this.selected < 0) return this.toastSelect()
			uni.showToast({ title: '设置参数', icon: 'none' })
		},
		onDelete() {
			if (this.selected < 0) return this.toastSelect()
			if (this.components.length <= 1) {
				uni.showToast({ title: '至少保留一个组件', icon: 'none' })
				return
			}
			this.components.splice(this.selected, 1)
			this.selected = Math.min(this.selected, this.components.length - 1)
		},
		onSort() {
			uni.showToast({ title: '排序模式', icon: 'none' })
		},
		onSave() {
			uni.showToast({ title: '已保存首页配置', icon: 'success' })
			setTimeout(() => uni.navigateBack(), 600)
		},
		toastSelect() {
			uni.showToast({ title: '请先选择组件', icon: 'none' })
		}
	}
}
</script>

<style lang="scss" scoped>
.screen--pb {
	padding-top: 192rpx;
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}
.banner {
	background: #fff8e8; color: #9a7b20; font-size: 24rpx;
	padding: 20rpx 24rpx; border-radius: 20rpx;
	display: flex; align-items: center; gap: 12rpx; margin: 0 28rpx 20rpx;
}
.banner .x { margin-left: auto; color: #c9b06a; font-weight: bold; }
.comp-card {
	border: 4rpx solid transparent; border-radius: 32rpx;
	margin: 0 28rpx 24rpx; position: relative;
}
.comp-card.sel { border-color: var(--primary); }
.comp-card .ops {
	position: absolute; top: 20rpx; right: 20rpx;
	display: flex; gap: 12rpx; z-index: 3;
}
.op-btn {
	background: var(--primary); color: #fff; font-size: 24rpx;
	font-weight: 600; padding: 8rpx 24rpx; border-radius: 16rpx; border: none;
}
.bottom-bar {
	display: flex; gap: 16rpx; margin: 8rpx 28rpx 40rpx;
}
.bar-btn {
	flex: 1; background: var(--surface); border-radius: 24rpx;
	padding: 26rpx; font-size: 26rpx; font-weight: 600;
	box-shadow: var(--card-shadow); display: flex; align-items: center;
	justify-content: center; gap: 8rpx; border: none;
}
.bar-btn.save { background: var(--primary); color: #fff; }
.bar-btn[disabled] { opacity: 0.5; }
.act {
	width: 68rpx; height: 68rpx; border-radius: 50%;
	background: rgba(255,255,255,0.8);
	display: flex; align-items: center; justify-content: center;
}
</style>
