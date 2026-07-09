<template>
	<view class="category-manage-page">
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">分类管理</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="scroll">
			<view class="tabs">
				<view class="tab-item" :class="{ active: activeTab === 'expense' }" @click="activeTab = 'expense'">
					<text class="tab-text">支出分类</text>
					<view class="tab-badge">{{ categories.expense.length }}</view>
				</view>
				<view class="tab-item" :class="{ active: activeTab === 'income' }" @click="activeTab = 'income'">
					<text class="tab-text">收入分类</text>
					<view class="tab-badge">{{ categories.income.length }}</view>
				</view>
			</view>

			<view class="category-grid">
				<view class="category-item" v-for="(cat, idx) in currentCategories" :key="cat.name" @click="showCategoryMenu(cat)">
					<view class="category-icon" :style="{ background: cat.color }">
						<text>{{ cat.icon }}</text>
					</view>
					<text class="category-name">{{ cat.name }}</text>
					<text class="category-count">{{ getCategoryUsage(cat.name) }}笔</text>
					<view class="category-menu-icon">⋮</view>
				</view>

				<view class="category-item add-item" @click="showAddModal">
					<view class="category-icon add-icon">
						<text>+</text>
					</view>
					<text class="category-name">添加分类</text>
				</view>
			</view>

			<view class="default-categories" v-if="currentCategories.length === 0">
				<text class="empty-icon">📋</text>
				<text class="empty-title">暂无分类</text>
				<text class="empty-desc">点击上方「添加分类」按钮创建您的第一个分类</text>
			</view>

			<view class="tip">
				<text class="tip-icon">💡</text>
				<text class="tip-text">已被使用的分类无法删除，删除前请确保该分类下没有交易记录</text>
			</view>
		</scroll-view>

		<view v-if="showModal" class="modal-overlay" @click="closeModal">
			<view class="modal-content category-modal" @click.stop>
				<text class="modal-title">{{ modalTitle }}</text>
				
				<view class="modal-section">
					<text class="section-label">选择图标</text>
					<view class="icon-selector" @click="showIconPicker = true">
						<view class="selected-icon" :style="{ background: selectedCategoryColor }">
							<text>{{ selectedCategoryIcon }}</text>
						</view>
						<text class="icon-hint">点击选择图标</text>
						<view class="selector-arrow" :style="getIconStyle('arrow-right')"></view>
					</view>
				</view>

				<view class="modal-section">
					<text class="section-label">分类名称</text>
					<input class="modal-input" v-model="newCategoryName" placeholder="请输入分类名称" maxlength="10" @confirm="confirmModal" />
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="closeModal">取消</view>
					<view class="modal-btn confirm" @click="confirmModal">确定</view>
				</view>
			</view>
		</view>

		<view v-if="showIconPicker" class="modal-overlay" @click="showIconPicker = false">
			<view class="icon-picker-modal" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择图标</text>
					<text class="picker-close" @click="showIconPicker = false">✕</text>
				</view>
				<scroll-view scroll-y class="icon-grid">
					<view 
						v-for="(item, idx) in iconOptions" 
						:key="idx" 
						class="icon-option"
						:class="{ active: selectedCategoryIcon === item.icon && selectedCategoryColor === item.color }"
						@click="selectIcon(item)"
					>
						<view class="option-icon" :style="{ background: item.color }">
							<text>{{ item.icon }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view v-if="showActionSheet" class="sheet-overlay" @click="closeActionSheet">
			<view class="sheet-content" @click.stop>
				<view class="sheet-item" @click="handleEdit">
					<text class="sheet-icon">✏️</text>
					<text class="sheet-text">编辑分类</text>
				</view>
				<view class="sheet-item" :class="{ disabled: getCategoryUsage(selectedCategoryObj.name) > 0 }" @click="handleDelete">
					<text class="sheet-icon">🗑️</text>
					<text class="sheet-text">删除分类</text>
					<text v-if="getCategoryUsage(selectedCategoryObj.name) > 0" class="sheet-hint">（有{{ getCategoryUsage(selectedCategoryObj.name) }}笔交易）</text>
				</view>
				<view class="sheet-cancel" @click="closeActionSheet">取消</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import themeMixin from '@/common/theme-mixin.js'
import ICONS from '@/common/icon-base64.js'

const EXPENSE_ICONS = [
	{ icon: '🍔', color: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)' },
	{ icon: '🚗', color: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)' },
	{ icon: '🛍️', color: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)' },
	{ icon: '🎬', color: 'linear-gradient(135deg, #9B59B6 0%, #BB6BD9 100%)' },
	{ icon: '🏠', color: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)' },
	{ icon: '💊', color: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
	{ icon: '📚', color: 'linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)' },
	{ icon: '🎁', color: 'linear-gradient(135deg, #E74C3C 0%, #E67E22 100%)' },
	{ icon: '🍺', color: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)' },
	{ icon: '🎟️', color: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
	{ icon: '✈️', color: 'linear-gradient(135deg, #2980B9 0%, #3498DB 100%)' },
	{ icon: '🏋️', color: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
	{ icon: '🍰', color: 'linear-gradient(135deg, #E8734A 0%, #F5B7B1 100%)' },
	{ icon: '🚲', color: 'linear-gradient(135deg, #17A589 0%, #148F77 100%)' },
	{ icon: '📱', color: 'linear-gradient(135deg, #5DADE2 0%, #3498DB 100%)' },
	{ icon: '☕', color: 'linear-gradient(135deg, #A0522D 0%, #CD853F 100%)' },
	{ icon: '🎮', color: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)' },
	{ icon: '🧋', color: 'linear-gradient(135deg, #D68910 0%, #F39C12 100%)' },
	{ icon: '💄', color: 'linear-gradient(135deg, #E84393 0%, #FD79A8 100%)' },
	{ icon: '🐾', color: 'linear-gradient(135deg, #7B8D8E 0%, #B2BABB 100%)' },
	{ icon: '💡', color: 'linear-gradient(135deg, #F1C40F 0%, #F7DC6F 100%)' },
	{ icon: '📞', color: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
	{ icon: '🧧', color: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)' },
	{ icon: '🍜', color: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' }
]

const INCOME_ICONS = [
	{ icon: '💼', color: 'linear-gradient(135deg, #2980B9 0%, #3498DB 100%)' },
	{ icon: '💰', color: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)' },
	{ icon: '🎁', color: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)' },
	{ icon: '🏆', color: 'linear-gradient(135deg, #D4AC0D 0%, #F1C40F 100%)' },
	{ icon: '📈', color: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
	{ icon: '🎯', color: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)' },
	{ icon: '🎪', color: 'linear-gradient(135deg, #9B59B6 0%, #BB6BD9 100%)' },
	{ icon: '💸', color: 'linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)' },
	{ icon: '🌾', color: 'linear-gradient(135deg, #D4AC0D 0%, #B7950B 100%)' },
	{ icon: '🍊', color: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' },
	{ icon: '📦', color: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
	{ icon: '💎', color: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)' },
	{ icon: '🌟', color: 'linear-gradient(135deg, #F1C40F 0%, #F7DC6F 100%)' },
	{ icon: '🎨', color: 'linear-gradient(135deg, #E84393 0%, #FD79A8 100%)' },
	{ icon: '🏠', color: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)' }
]

const DEFAULT_EXPENSE = [
	{ name: '餐饮', icon: '🍔', color: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)' },
	{ name: '交通', icon: '🚗', color: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)' },
	{ name: '购物', icon: '🛍️', color: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)' },
	{ name: '娱乐', icon: '🎬', color: 'linear-gradient(135deg, #9B59B6 0%, #BB6BD9 100%)' },
	{ name: '住房', icon: '🏠', color: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)' },
	{ name: '医疗', icon: '💊', color: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
	{ name: '教育', icon: '📚', color: 'linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)' },
	{ name: '礼品', icon: '🎁', color: 'linear-gradient(135deg, #E74C3C 0%, #E67E22 100%)' },
	{ name: '酒水', icon: '🍺', color: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)' },
	{ name: '休闲', icon: '🎟️', color: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)' },
	{ name: '旅行', icon: '✈️', color: 'linear-gradient(135deg, #2980B9 0%, #3498DB 100%)' },
	{ name: '运动', icon: '🏋️', color: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
	{ name: '甜品', icon: '🍰', color: 'linear-gradient(135deg, #E8734A 0%, #F5B7B1 100%)' },
	{ name: '出行', icon: '🚲', color: 'linear-gradient(135deg, #17A589 0%, #148F77 100%)' },
	{ name: '数码', icon: '📱', color: 'linear-gradient(135deg, #5DADE2 0%, #3498DB 100%)' }
]

const DEFAULT_INCOME = [
	{ name: '工资', icon: '💼', color: 'linear-gradient(135deg, #2980B9 0%, #3498DB 100%)' },
	{ name: '奖金', icon: '💰', color: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)' },
	{ name: '红包', icon: '🎁', color: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)' },
	{ name: '投资', icon: '📈', color: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
	{ name: '理财', icon: '🏆', color: 'linear-gradient(135deg, #D4AC0D 0%, #F1C40F 100%)' },
	{ name: '兼职', icon: '🎯', color: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)' },
	{ name: '其他', icon: '🌟', color: 'linear-gradient(135deg, #F1C40F 0%, #F7DC6F 100%)' }
]

function normalizeCategory(cat, idx, type) {
	if (typeof cat === 'string') {
		const icons = type === 'expense' ? EXPENSE_ICONS : INCOME_ICONS
		const preset = icons.find(i => i.icon === cat) || icons[idx % icons.length]
		return { name: cat, icon: preset.icon, color: preset.color }
	}
	return cat
}

export default {
	mixins: [themeMixin],
	computed: {
		...mapState('accounting', ['data']),
		categories() {
			const expRaw = this.data.categories.expense.length > 0 ? this.data.categories.expense : DEFAULT_EXPENSE
			const incRaw = this.data.categories.income.length > 0 ? this.data.categories.income : DEFAULT_INCOME
			return {
				expense: expRaw.map((c, i) => normalizeCategory(c, i, 'expense')),
				income: incRaw.map((c, i) => normalizeCategory(c, i, 'income'))
			}
		},
		currentCategories() {
			return this.categories[this.activeTab] || []
		},
		iconOptions() {
			return this.activeTab === 'expense' ? EXPENSE_ICONS : INCOME_ICONS
		},
		selectedCategoryObj() {
			if (!this.selectedCategory) return {}
			return this.currentCategories.find(c => c.name === this.selectedCategory) || {}
		}
	},
	data() {
		return {
			activeTab: 'expense',
			showModal: false,
			modalType: 'add',
			modalTitle: '',
			newCategoryName: '',
			selectedCategory: '',
			selectedCategoryIcon: '🍔',
			selectedCategoryColor: 'linear-gradient(135deg, #E8734A 0%, #F2956E 100%)',
			showActionSheet: false,
			showIconPicker: false
		}
	},
	watch: {
		activeTab() {
			const icons = this.activeTab === 'expense' ? EXPENSE_ICONS : INCOME_ICONS
			this.selectedCategoryIcon = icons[0].icon
			this.selectedCategoryColor = icons[0].color
		}
	},
	methods: {
		getIconStyle(name) {
			return {
				'mask-image': 'url(' + ICONS[name] + ')',
				'-webkit-mask-image': 'url(' + ICONS[name] + ')'
			}
		},
		goBack() { uni.navigateBack() },
		getCategoryUsage(categoryName) {
			return this.data.transactions.filter(t => t.type === this.activeTab && t.category === categoryName).length
		},
		showAddModal() {
			const icons = this.activeTab === 'expense' ? EXPENSE_ICONS : INCOME_ICONS
			this.modalType = 'add'
			this.modalTitle = '添加分类'
			this.newCategoryName = ''
			this.selectedCategoryIcon = icons[0].icon
			this.selectedCategoryColor = icons[0].color
			this.showModal = true
		},
		showCategoryMenu(category) {
			this.selectedCategory = category.name
			this.showActionSheet = true
		},
		closeModal() {
			this.showModal = false
			this.newCategoryName = ''
			this.showIconPicker = false
		},
		closeActionSheet() {
			this.showActionSheet = false
			this.selectedCategory = ''
		},
		selectIcon(item) {
			this.selectedCategoryIcon = item.icon
			this.selectedCategoryColor = item.color
			this.showIconPicker = false
		},
		handleEdit() {
			this.closeActionSheet()
			const cat = this.selectedCategoryObj
			this.modalType = 'edit'
			this.modalTitle = '编辑分类'
			this.newCategoryName = cat.name
			this.selectedCategoryIcon = cat.icon
			this.selectedCategoryColor = cat.color
			this.showModal = true
		},
		handleDelete() {
			const usage = this.getCategoryUsage(this.selectedCategory)
			if (usage > 0) {
				uni.showToast({ title: '该分类下有交易记录，无法删除', icon: 'none' })
				return
			}

			uni.showModal({
				title: '确认删除',
				content: `确定要删除「${this.selectedCategory}」分类吗？`,
				confirmText: '删除',
				confirmColor: '#E8734A',
				success: async (res) => {
					if (!res.confirm) return
					this.closeActionSheet()
					const result = await this.$store.dispatch('accounting/deleteCategory', { type: this.activeTab, name: this.selectedCategory })
					if (result.success) {
						uni.showToast({ title: '删除成功', icon: 'success' })
					} else {
						uni.showToast({ title: result.message || '删除失败', icon: 'none' })
					}
				}
			})
		},
		async confirmModal() {
			const name = this.newCategoryName.trim()
			if (!name) {
				uni.showToast({ title: '请输入分类名称', icon: 'none' })
				return
			}
			if (name.length > 10) {
				uni.showToast({ title: '分类名称最多10个字符', icon: 'none' })
				return
			}
			const existingNames = this.currentCategories.map(c => c.name)
			if (existingNames.includes(name) && !(this.modalType === 'edit' && name === this.selectedCategory)) {
				uni.showToast({ title: '该分类已存在', icon: 'none' })
				return
			}

			this.closeModal()

			const categoryData = {
				name,
				icon: this.selectedCategoryIcon,
				color: this.selectedCategoryColor
			}

			let result
			if (this.modalType === 'add') {
				result = await this.$store.dispatch('accounting/addCategory', { type: this.activeTab, category: categoryData })
			} else {
				result = await this.$store.dispatch('accounting/updateCategory', { type: this.activeTab, oldName: this.selectedCategory, category: categoryData })
			}

			if (result.success) {
				uni.showToast({ title: this.modalType === 'add' ? '添加成功' : '修改成功', icon: 'success' })
			} else {
				uni.showToast({ title: result.message || '操作失败', icon: 'none' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.category-manage-page { height: 100vh; background: var(--bg, #FFF9F5); display: flex; flex-direction: column; width: 100%; box-sizing: border-box; overflow-x: hidden; }

.nav-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 16rpx) 24rpx 16rpx; background: var(--bg, #FFF9F5); width: 100%; box-sizing: border-box; }
.nav-back { width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 56rpx; color: var(--text-primary, #3D2316); }
.back-icon { font-weight: 300; }
.nav-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
.nav-placeholder { width: 64rpx; }

.scroll { flex: 1; padding: calc(var(--status-bar-height) + 120rpx) 32rpx 80rpx; width: 100%; box-sizing: border-box; }

.tabs { display: flex; background: var(--card-bg, #fff); border-radius: 20rpx; padding: 8rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); }
.tab-item { flex: 1; display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 24rpx; border-radius: 16rpx; transition: all 0.25s ease; }
.tab-item.active { background: var(--primary, #E8734A); }
.tab-item.active .tab-text { color: #fff; }
.tab-item.active .tab-badge { background: rgba(255, 255, 255, 0.3); color: #fff; }
.tab-text { font-size: 28rpx; font-weight: 600; color: var(--text-secondary, #7A5C4A); }
.tab-badge { padding: 4rpx 16rpx; background: var(--bg, #FFF9F5); border-radius: 20rpx; font-size: 22rpx; font-weight: 600; color: var(--text-tertiary, #A98B78); }

.category-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }

.category-item { width: calc(33.33% - 14rpx); display: flex; flex-direction: column; align-items: center; padding: 24rpx 16rpx; background: var(--card-bg, #fff); border-radius: 24rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); position: relative; transition: all 0.25s ease; }
.category-item:active { transform: scale(0.96); }
.category-item.add-item { border: 2rpx dashed var(--border, #E8D5C4); background: transparent; }

.category-icon { width: 80rpx; height: 80rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; margin-bottom: 12rpx; box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.15); }
.category-icon.add-icon { background: var(--bg, #FFF9F5); border: 2rpx dashed var(--border, #E8D5C4); font-size: 40rpx; color: var(--text-tertiary, #A98B78); }

.category-name { font-size: 26rpx; font-weight: 500; color: var(--text-primary, #3D2316); margin-bottom: 6rpx; text-align: center; }
.category-count { font-size: 20rpx; color: var(--text-tertiary, #A98B78); }

.category-menu-icon { position: absolute; top: 16rpx; right: 16rpx; font-size: 24rpx; color: var(--text-tertiary, #A98B78); }

.default-categories { display: flex; flex-direction: column; align-items: center; padding: 80rpx 40rpx; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #3D2316); margin-bottom: 12rpx; }
.empty-desc { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); text-align: center; }

.tip { display: flex; align-items: flex-start; gap: 12rpx; padding: 20rpx 24rpx; background: var(--card-bg, #fff); border-radius: 16rpx; border: 1px solid var(--border, #F0E4DA); margin-top: 32rpx; }
.tip-icon { font-size: 28rpx; flex-shrink: 0; }
.tip-text { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); flex: 1; line-height: 1.5; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { width: 600rpx; background: var(--card-bg, #fff); border-radius: 32rpx; padding: 48rpx 40rpx; }
.category-modal { width: 640rpx; }
.modal-title { font-size: 34rpx; font-weight: 700; color: var(--text-primary, #3D2316); display: block; text-align: center; margin-bottom: 32rpx; }

.modal-section { margin-bottom: 28rpx; }
.section-label { font-size: 26rpx; font-weight: 600; color: var(--text-secondary, #7A5C4A); display: block; margin-bottom: 16rpx; }
.modal-input { width: 100%; height: 88rpx; line-height: 88rpx; padding: 0 24rpx; background: var(--bg, #FFF9F5); border-radius: 16rpx; font-size: 30rpx; color: var(--text-primary, #3D2316); box-sizing: border-box; }

.icon-selector { display: flex; align-items: center; padding: 20rpx 24rpx; background: var(--bg, #FFF9F5); border-radius: 16rpx; }
.icon-selector:active { background: var(--border, #F5EDE6); }
.selected-icon { width: 64rpx; height: 64rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; margin-right: 20rpx; box-shadow: 0 2rpx 8rpx rgba(232, 115, 74, 0.15); }
.icon-hint { flex: 1; font-size: 28rpx; color: var(--text-secondary, #7A5C4A); }
.selector-arrow {
	width: 28rpx;
	height: 28rpx;
	background-color: var(--text-tertiary, #C8A896);
	mask-size: contain;
	mask-repeat: no-repeat;
	mask-position: center;
	-webkit-mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
}

.modal-actions { display: flex; gap: 24rpx; margin-top: 16rpx; }
.modal-btn { flex: 1; height: 88rpx; line-height: 88rpx; text-align: center; border-radius: 44rpx; font-size: 30rpx; font-weight: 600; }
.modal-btn.cancel { background: var(--bg, #FFF9F5); color: var(--text-secondary, #7A5C4A); }
.modal-btn.confirm { background: var(--primary, #E8734A); color: #fff; }

.icon-picker-modal { width: 90%; max-height: 70vh; background: var(--card-bg, #fff); border-radius: 32rpx; overflow: hidden; }
.picker-header { display: flex; align-items: center; justify-content: space-between; padding: 32rpx; border-bottom: 1px solid var(--border, #F0E4DA); }
.picker-title { font-size: 32rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
.picker-close { font-size: 32rpx; color: var(--text-tertiary, #A98B78); width: 48rpx; height: 48rpx; line-height: 48rpx; text-align: center; }

.icon-grid { height: 500rpx; padding: 24rpx; box-sizing: border-box; }
.icon-option { width: 20%; float: left; margin-bottom: 20rpx; display: flex; justify-content: center; }
.icon-option.active .option-icon { transform: scale(1.15); box-shadow: 0 6rpx 20rpx rgba(232, 115, 74, 0.4); border: 3rpx solid var(--primary, #E8734A); }
.option-icon { width: 80rpx; height: 80rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.08); transition: all 0.2s ease; }

.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet-content { width: 100%; background: var(--card-bg, #fff); border-radius: 32rpx 32rpx 0 0; padding: 32rpx; padding-bottom: calc(32rpx + env(safe-area-inset-bottom)); }
.sheet-item { display: flex; align-items: center; padding: 32rpx; background: var(--bg, #FFF9F5); border-radius: 20rpx; margin-bottom: 16rpx; }
.sheet-item.disabled { opacity: 0.5; }
.sheet-icon { font-size: 36rpx; margin-right: 20rpx; }
.sheet-text { flex: 1; font-size: 30rpx; color: var(--text-primary, #3D2316); }
.sheet-hint { font-size: 24rpx; color: var(--text-tertiary, #A98B78); }
.sheet-cancel { margin-top: 16rpx; height: 88rpx; line-height: 88rpx; text-align: center; font-size: 30rpx; color: var(--text-secondary, #7A5C4A); }
</style>
