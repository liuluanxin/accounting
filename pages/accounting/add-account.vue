<template>
	<view class="cosmic-page add-acc-page">
		<status-bar />
		<top-bar title="创建账户" show-back right-text="保存" @right="onCreate" />

		<view class="screen add-acc-screen">
			<!-- 账户预览卡 -->
		<view class="acc-card">
			<view class="acc-card__head">
				<view class="acc-card__icon" @click="openIconSheet">
					<lucide-icon :name="selectedIcon" :brand="true" size="96rpx" />
				</view>
				<view class="acc-card__pick" @click="openIconSheet">
					<view class="acc-card__pick-square" />
				</view>
			</view>
			<view class="acc-card__no">
				<input
					v-model="cardNo"
					class="acc-card__no-input"
					placeholder="输入卡号（选填）"
					placeholder-class="acc-ph"
					maxlength="30"
				/>
				<lucide-icon name="pencil" size="28rpx" color="rgba(255,255,255,0.7)" />
			</view>
		</view>

		<!-- 基本信息 -->
		<view class="section-title">基本信息</view>
		<view class="form-card">
			<view class="form-row">
				<text class="form-label">账户名称</text>
				<input
					v-model="accountName"
					class="form-input"
					placeholder="点击输入..."
					placeholder-class="form-ph"
					maxlength="20"
				/>
			</view>

			<view class="form-row" @click="openGroupSheet">
				<text class="form-label">分组</text>
				<view class="form-value">
					<text :class="['form-value__text', !group && 'form-value__placeholder']">
						{{ group || '请选择分组' }}
					</text>
					<lucide-icon name="chevron-right" size="32rpx" color="#c2c7d0" />
				</view>
			</view>

			<view class="form-row">
				<text class="form-label">余额</text>
				<view class="form-value">
					<text class="amount-symbol">￥</text>
					<input
						v-model="initialBalance"
						class="form-input form-input--amount"
						type="digit"
						placeholder="0.00"
						placeholder-class="form-ph"
					/>
				</view>
			</view>

			<view class="form-row form-row--col form-row--last">
				<view class="form-row-head">
					<view>
						<text class="form-label">信贷账户</text>
						<text class="form-desc">信用卡、花呗等账户可打开此开关</text>
					</view>
					<switch
						:checked="isCredit"
						@change="e => isCredit = e.detail.value"
						color="#2f63a8"
					/>
				</view>
			</view>
		</view>

		<!-- 其他设置 -->
		<view class="section-title">其他设置</view>
		<view class="form-card">
			<view class="form-row form-row--col" @click="openLedgerSheet">
				<view class="form-row-head">
					<view>
						<text class="form-label">所属账本</text>
						<text class="form-desc">设置后在指定账本中显示（建议需要多套账时设置）</text>
					</view>
					<view class="form-value">
						<text class="form-value__text">{{ ledgerLabel }}</text>
						<lucide-icon name="chevron-right" size="32rpx" color="#c2c7d0" />
					</view>
				</view>
			</view>

			<view class="form-row">
				<text class="form-label">计入总资产</text>
				<switch
					:checked="includeInTotal"
					@change="e => includeInTotal = e.detail.value"
					color="#2f63a8"
				/>
			</view>

			<view class="form-row form-row--col">
				<view class="form-row-head">
					<view>
						<text class="form-label">不计入预算</text>
						<text class="form-desc">开启后，选择该账户记账时默认将账单设为不计入预算</text>
					</view>
					<switch
						:checked="excludeFromBudget"
						@change="e => excludeFromBudget = e.detail.value"
						color="#2f63a8"
					/>
				</view>
			</view>

			<view class="form-row form-row--col">
				<view class="form-row-head">
					<view>
						<text class="form-label">账户别名</text>
						<text class="form-desc">用于自动记账匹配，多个别名请用逗号分隔</text>
					</view>
					<input
						v-model="aliases"
						class="form-input form-input--inline"
						placeholder="点击输入..."
						placeholder-class="form-ph"
					/>
				</view>
			</view>

			<view class="form-row form-row--col form-row--last">
				<view class="form-row-head">
					<text class="form-label">备注</text>
					<lucide-icon name="chevron-up" size="32rpx" color="#c2c7d0" />
				</view>
				<textarea
					v-model="note"
					class="form-textarea"
					placeholder="点击输入备注..."
					placeholder-class="form-ph"
					:auto-height="false"
				/>
			</view>
		</view>

		<!-- 底部创建按钮 -->
		<view class="footer">
			<button class="btn-create" @click="onCreate">创建</button>
		</view>
		</view>

		<!-- 图标选择弹窗 -->
		<view v-if="showIconSheet" class="sheet-mask" @click="closeIconSheet">
			<view class="picker-sheet" @click.stop>
				<view class="sheet-handle" />
				<view class="sheet-title">
					<text class="sheet-title__text">选择图标</text>
					<view class="sheet-close" @click="closeIconSheet">
						<lucide-icon name="x" size="36rpx" color="#8A9099" />
					</view>
				</view>
				<view class="icon-toolbar">
					<view class="search-box">
						<lucide-icon name="search" size="32rpx" color="#8A9099" />
						<input
							v-model="searchQ"
							class="search-input"
							placeholder="如：微信、工行等"
							placeholder-class="search-ph"
						/>
					</view>
					<view class="custom-btn" @click="onCustom">
						<lucide-icon name="pencil" size="28rpx" color="#5A6B8A" />
						<text>自定义</text>
					</view>
				</view>
				<view class="icon-scroll">
					<view v-if="payIcons.length" class="icon-grid">
						<view
							v-for="item in payIcons"
							:key="item.key"
							class="icon-cell"
							:class="{ on: selectedIcon === item.key }"
							@click="selectIcon(item)"
						>
							<view class="icon-circle">
								<lucide-icon :name="item.key" :brand="true" size="100%" />
							</view>
							<text class="icon-label">{{ item.label }}</text>
						</view>
					</view>
					<view v-if="showBankSection" class="section-title-inline">银行</view>
					<view v-if="bankIcons.length" class="icon-grid">
						<view
							v-for="item in bankIcons"
							:key="item.key"
							class="icon-cell"
							:class="{ on: selectedIcon === item.key }"
							@click="selectIcon(item)"
						>
							<view class="icon-circle icon-circle--bank">
								<lucide-icon :name="item.key" :brand="true" size="100%" />
							</view>
							<text class="icon-label">{{ item.label }}</text>
						</view>
					</view>
					<view v-if="!payIcons.length && !bankIcons.length" class="empty-hint">
						<text>未找到「{{ searchQ }}」相关图标</text>
					</view>
					<view class="icon-scroll-pad" />
				</view>
			</view>
		</view>

		<!-- 分组选择弹窗 -->
		<view v-if="showGroupSheet" class="sheet-mask" @click="closeGroupSheet">
			<view class="picker-sheet picker-sheet--short" @click.stop>
				<view class="sheet-handle" />
				<view class="sheet-title">
					<text class="sheet-title__text">选择分组</text>
					<view class="sheet-close" @click="closeGroupSheet">
						<lucide-icon name="x" size="36rpx" color="#8A9099" />
					</view>
				</view>
				<view class="picker-list">
					<view
						v-for="g in groupOptions"
						:key="g"
						class="picker-item"
						:class="{ on: group === g }"
						@click="pickGroup(g)"
					>
						<text>{{ g }}</text>
						<lucide-icon v-if="group === g" name="check" size="36rpx" color="#2f63a8" />
					</view>
				</view>
			</view>
		</view>

		<!-- 账本选择弹窗 -->
		<view v-if="showLedgerSheet" class="sheet-mask" @click="closeLedgerSheet">
			<view class="picker-sheet picker-sheet--short" @click.stop>
				<view class="sheet-handle" />
				<view class="sheet-title">
					<text class="sheet-title__text">选择账本</text>
					<view class="sheet-close" @click="closeLedgerSheet">
						<lucide-icon name="x" size="36rpx" color="#8A9099" />
					</view>
				</view>
				<view class="picker-list">
					<view
						v-for="l in ledgerOptions"
						:key="l.value"
						class="picker-item"
						:class="{ on: ledger === l.value }"
						@click="pickLedger(l.value)"
					>
						<text>{{ l.label }}</text>
						<lucide-icon v-if="ledger === l.value" name="check" size="36rpx" color="#2f63a8" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { addAccount } from '@/common/app-data.js'
import {
	searchAccountIcons,
	getAccountIcons,
	getAccountIconLabel
} from '@/common/lucide-icons.js'
import { applyThemeToPage } from '@/common/theme-manager.js'

export default {
	data() {
		return {
			accountName: '',
			cardNo: '',
			initialBalance: '',
			selectedIcon: 'wechat',
			searchQ: '',
			showIconSheet: false,
			showGroupSheet: false,
			showLedgerSheet: false,
			group: '',
			groupOptions: ['现金', '储蓄', '信用卡', '投资', '其他'],
			isCredit: false,
			ledger: '',
			ledgerOptions: [
				{ label: '不设置', value: '' },
				{ label: '日常账本', value: 'default' },
				{ label: '生意账本', value: 'business' }
			],
			includeInTotal: true,
			excludeFromBudget: false,
			aliases: '',
			note: ''
		}
	},
	computed: {
		filteredIcons() {
			return searchAccountIcons(this.searchQ)
		},
		payIcons() {
			if (this.searchQ.trim()) return this.filteredIcons
			return this.filteredIcons.filter(i => i.group === 'pay')
		},
		bankIcons() {
			if (this.searchQ.trim()) return []
			return getAccountIcons('bank')
		},
		showBankSection() {
			return !this.searchQ.trim() && this.bankIcons.length > 0
		},
		selectedIconItem() {
			const all = getAccountIcons()
			return all.find(i => i.key === this.selectedIcon) || null
		},
		ledgerLabel() {
			const item = this.ledgerOptions.find(l => l.value === this.ledger)
			return item ? item.label : '不设置'
		}
	},
	watch: {
		selectedIconItem(item) {
			if (item) {
				const g = item.group
				if (g === 'bank' && !this.isCredit) {
					// 选银行图标默认同步为储蓄分组
					if (!this.group) this.group = '储蓄'
				} else if (g === 'pay' && !this.isCredit) {
					if (!this.group) this.group = '现金'
				}
			}
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		selectIcon(item) {
			this.selectedIcon = item.key
			if (!this.accountName.trim()) {
				this.accountName = item.label
			}
			this.closeIconSheet()
		},
		openIconSheet() {
			this.showIconSheet = true
		},
		closeIconSheet() {
			this.showIconSheet = false
		},
		openGroupSheet() {
			this.showGroupSheet = true
		},
		closeGroupSheet() {
			this.showGroupSheet = false
		},
		pickGroup(g) {
			this.group = g
			this.closeGroupSheet()
		},
		openLedgerSheet() {
			this.showLedgerSheet = true
		},
		closeLedgerSheet() {
			this.showLedgerSheet = false
		},
		pickLedger(v) {
			this.ledger = v
			this.closeLedgerSheet()
		},
		onCustom() {
			uni.showToast({ title: '自定义图标（二期）', icon: 'none' })
		},
		onCreate() {
			const name = this.accountName.trim() || getAccountIconLabel(this.selectedIcon)
			const bal = Number(this.initialBalance) || 0
			const item = this.selectedIconItem
			addAccount({
				ic: this.selectedIcon,
				name,
				bal,
				type: this.isCredit ? 'credit' : (item ? item.group : 'pay'),
				group: this.group,
				isCredit: this.isCredit,
				cardNo: this.cardNo,
				ledger: this.ledger,
				includeInTotal: this.includeInTotal,
				excludeFromBudget: this.excludeFromBudget,
				aliases: this.aliases,
				note: this.note
			})
			uni.showToast({ title: '账户已创建', icon: 'success' })
			setTimeout(() => uni.navigateBack(), 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.add-acc-page {
	height: 100vh;
	overflow: hidden;
	background: #f0f2f5;
}

.add-acc-screen {
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

/* 预览卡（红棕色） */
.acc-card {
	margin: 16rpx 24rpx 0;
	padding: 28rpx 28rpx 22rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #c45c4a 0%, #9e3d32 55%, #7a2e28 100%);
	box-shadow: 0 8rpx 24rpx rgba(158, 61, 50, 0.32);
}

.acc-card__head {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 22rpx;
}

.acc-card__icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.18);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.acc-card__pick {
	padding: 8rpx;
}

.acc-card__pick-square {
	width: 44rpx;
	height: 44rpx;
	border-radius: 8rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.6);
	background: rgba(255, 255, 255, 0.08);
}

.acc-card__no {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.acc-card__no-input {
	flex: 1;
	color: #fff;
	font-size: 26rpx;
}

.acc-ph {
	color: rgba(255, 255, 255, 0.5);
}

/* 区块标题 */
.section-title {
	margin: 32rpx 32rpx 12rpx;
	font-size: 24rpx;
	color: #8a8f99;
	font-weight: 500;
}

/* 表单卡片 */
.form-card {
	margin: 0 24rpx;
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.form-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 28rpx;
	border-bottom: 1rpx solid #f0f1f4;
}

.form-row--last {
	border-bottom: none;
}

.form-row--col {
	flex-direction: column;
	align-items: stretch;
}

.form-row-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16rpx;
	width: 100%;
}

.form-label {
	font-size: 30rpx;
	color: #333;
}

.form-desc {
	display: block;
	font-size: 24rpx;
	color: #9aa0aa;
	margin-top: 6rpx;
}

.form-input {
	flex: 1;
	text-align: right;
	font-size: 30rpx;
	color: #333;
	margin-left: 20rpx;
}

.form-input--amount {
	font-size: 32rpx;
	font-weight: 600;
}

.form-input--inline {
	text-align: right;
	min-width: 240rpx;
}

.form-ph {
	color: #b6bac3;
}

.form-value {
	display: flex;
	align-items: center;
	gap: 6rpx;
	flex-shrink: 0;
}

.form-value__text {
	font-size: 30rpx;
	color: #333;
}

.form-value__placeholder {
	color: #b6bac3;
}

.amount-symbol {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.form-textarea {
	width: 100%;
	height: 140rpx;
	background: #f6f7f9;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-top: 16rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	color: #333;
}

/* 底部创建按钮 */
.footer {
	padding: 48rpx 24rpx 0;
}

.btn-create {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #4a90d9, #3a78c2);
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 20rpx rgba(74, 144, 217, 0.35);
	border: none;
}

.btn-create::after {
	border: none;
}

/* 弹窗通用 */
.sheet-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 99;
	display: flex;
	align-items: flex-end;
}

.picker-sheet {
	width: 100%;
	max-height: 78vh;
	background: #fff;
	border-radius: 32rpx 32rpx 0 0;
	display: flex;
	flex-direction: column;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
	animation: sheet-rise 0.24s ease;
}

.picker-sheet--short {
	max-height: 70vh;
}

@keyframes sheet-rise {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.sheet-handle {
	width: 72rpx;
	height: 8rpx;
	border-radius: 999rpx;
	background: #e2e4e9;
	margin: 16rpx auto 4rpx;
	flex-shrink: 0;
}

.sheet-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8rpx 24rpx 4rpx;
	flex-shrink: 0;
}

.sheet-title__text {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.sheet-close {
	padding: 8rpx;
}

/* 图标选择 */
.icon-toolbar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx 24rpx 12rpx;
	flex-shrink: 0;
}

.search-box {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: #f5f6f8;
	border-radius: 999rpx;
	padding: 14rpx 24rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.search-ph {
	color: #b0b4bc;
}

.custom-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	font-size: 26rpx;
	color: #5a6b8a;
	flex-shrink: 0;
	padding: 8rpx;
}

.icon-scroll {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
}

.section-title-inline {
	padding: 16rpx 24rpx 8rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.icon-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 0 12rpx;
}

.icon-cell {
	width: 20%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 0;
	box-sizing: border-box;
}

.icon-circle {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f9fb;
}

.icon-circle--bank {
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 0 0 1rpx rgba(0, 0, 0, 0.06);
}

.icon-cell.on .icon-circle {
	box-shadow: 0 0 0 3rpx var(--primary, #4a90d9);
}

.icon-label {
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #333;
	text-align: center;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 0 4rpx;
	box-sizing: border-box;
}

.empty-hint {
	padding: 60rpx;
	text-align: center;
	color: #8a9099;
	font-size: 28rpx;
}

.icon-scroll-pad {
	height: calc(40rpx + env(safe-area-inset-bottom));
}

/* 单列选择 */
.picker-list {
	padding: 8rpx 0 24rpx;
}

.picker-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
	font-size: 30rpx;
	color: #333;
}

.picker-item.on {
	color: #2f63a8;
	font-weight: 600;
}
</style>
