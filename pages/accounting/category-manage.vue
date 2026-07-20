<template>
	<view class="cosmic-page cat-manage-page">
		<top-bar title="分类管理" show-back>
			<template #actions>
				<view class="act act-sm" @click="toggleEdit">
					<text>{{ editMode ? '完成' : '编辑' }}</text>
				</view>
			</template>
		</top-bar>

		<scroll-view scroll-y class="screen">
			<view class="seg2-wrap">
				<view class="seg2">
					<button :class="{ on: catType === 'expense' }" @click="setType('expense')">支出</button>
					<button :class="{ on: catType === 'income' }" @click="setType('income')">收入</button>
				</view>
			</view>

			<view class="td-grid">
				<view
					v-for="(cat, i) in currentCats"
					:key="cat.id"
					class="cat-cell"
					@click="onCatTap(cat)"
				>
					<view class="ico">
						<text>{{ catEmoji(cat.ic) }}</text>
						<view v-if="editMode" class="td-del" @click.stop="onDeleteCat(i)">×</view>
					</view>
					<text class="txt">{{ cat.name }}</text>
				</view>

				<view class="cat-cell" @click="onAddCat">
					<view class="ico add-ico">
						<lucide-icon name="plus" size="36rpx" />
					</view>
					<text class="txt muted">添加</text>
				</view>
			</view>

			<view class="bottom-entry">
				<view class="be" @click="onCatMarket">
					<lucide-icon name="tag" size="28rpx" />
					<text>分类市场</text>
				</view>
				<view class="be" @click="onSystemCats">
					<lucide-icon name="folder" size="28rpx" />
					<text>系统分类</text>
				</view>
			</view>

			<view style="height: 40rpx;" />
		</scroll-view>
	</view>
</template>

<script>
import { CAT_GROUPS } from '@/common/app-data.js'
import { catEmoji } from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

function cloneGroups() {
	return {
		expense: CAT_GROUPS.expense.map((g, i) => ({ ...g, id: `e${i}`, subs: g.subs.map(s => ({ ...s })) })),
		income: CAT_GROUPS.income.map((g, i) => ({ ...g, id: `i${i}`, subs: g.subs.map(s => ({ ...s })) }))
	}
}

export default {
	data() {
		return {
			catType: 'expense',
			editMode: false,
			groups: cloneGroups()
		}
	},
	computed: {
		currentCats() {
			return this.groups[this.catType] || []
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		catEmoji,
		setType(type) {
			this.catType = type
			this.editMode = false
		},
		toggleEdit() {
			this.editMode = !this.editMode
		},
		onCatTap(cat) {
			if (this.editMode) return
			uni.showToast({ title: cat.name, icon: 'none' })
		},
		onDeleteCat(idx) {
			uni.showModal({
				title: '删除分类',
				content: `确定删除「${this.currentCats[idx].name}」吗？`,
				success: (res) => {
					if (res.confirm) {
						this.groups[this.catType].splice(idx, 1)
						uni.showToast({ title: '已删除', icon: 'none' })
					}
				}
			})
		},
		onAddCat() {
			uni.showToast({ title: '添加分类', icon: 'none' })
		},
		onCatMarket() {
			uni.showToast({ title: '分类市场', icon: 'none' })
		},
		onSystemCats() {
			uni.showToast({ title: '系统分类', icon: 'none' })
		}
	}
}
</script>

<style lang="scss" scoped>
.seg2-wrap {
	margin: 0 28rpx 24rpx;
}
.td-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16rpx;
	padding: 0 28rpx;
}
.td-grid .ico {
	position: relative;
}
.add-ico {
	color: var(--text-muted);
	opacity: 0.5;
}
.bottom-entry {
	margin-top: 48rpx;
}
.bottom-entry .be {
	gap: 8rpx;
}
</style>
