<template>
	<view class="add-account-page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
		<view class="nav-back" @click="goBack">
			<view class="back-icon" :style="getIconStyle('arrow-left')"></view>
		</view>
			<text class="nav-title">添加账户</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="form-scroll" show-scrollbar="false">
			<!-- 账户名称 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账户名称</text>
					<text class="label-required">*</text>
				</view>
				<view class="input-wrapper">
					<input
						class="form-input"
						v-model="accountName"
						placeholder="例如：工资卡、零钱包"
						placeholder-class="input-placeholder"
						maxlength="20"
						:adjust-position="false"
					/>
				</view>
			</view>

			<!-- 账户类型 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账户类型</text>
				</view>
				<scroll-view scroll-x class="type-scroll" show-scrollbar="false">
					<view
						v-for="type in accountTypes"
						:key="type.value"
						class="type-chip"
						:class="{ 'type-active': accountType === type.value }"
						:style="accountType === type.value ? { background: selectedColor + '18', borderColor: selectedColor, color: selectedColor } : {}"
						@click="accountType = type.value"
					>
						<text class="type-emoji">{{ type.icon }}</text>
						<text class="type-name">{{ type.label }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 账户图标 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">账户图标</text>
				</view>
				<!-- 搜索框 -->
				<view class="search-row">
					<view class="search-input-wrapper">
						<view class="search-icon" :style="getIconStyle('search')"></view>
						<input
							class="search-input"
							v-model="iconSearch"
							placeholder="如：微信、工行等"
							placeholder-class="search-placeholder"
							:adjust-position="false"
						/>
					</view>
					<view class="custom-btn" @click="showCustomIcon = true">
						<view class="custom-icon" :style="getIconStyle('edit')"></view>
						<text class="custom-text">自定义</text>
					</view>
				</view>
				<!-- 支付平台 -->
				<view class="icon-section">
					<text class="icon-section-title">支付平台</text>
					<view class="icon-grid">
						<view
							v-for="(item, idx) in payIconList"
							:key="'pay-' + idx"
							class="icon-item"
							:class="{ 'icon-selected': accountIconKey === item.key }"
							:style="accountIconKey === item.key ? { borderColor: selectedColor } : {}"
							@click="selectIcon(item)"
						>
							<image class="icon-svg" :src="item.icon" mode="aspectFit"></image>
							<text class="icon-label">{{ item.name }}</text>
						</view>
					</view>
				</view>
				<!-- 银行 -->
				<view class="icon-section">
					<text class="icon-section-title">银行</text>
					<view class="icon-grid">
						<view
							v-for="(item, idx) in bankIconList"
							:key="'bank-' + idx"
							class="icon-item"
							:class="{ 'icon-selected': accountIconKey === item.key }"
							:style="accountIconKey === item.key ? { borderColor: selectedColor } : {}"
							@click="selectIcon(item)"
						>
							<image class="icon-svg" :src="item.icon" mode="aspectFit"></image>
							<text class="icon-label">{{ item.name }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 主题色 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">主题色</text>
				</view>
				<view class="color-row">
					<view
						v-for="color in presetColors"
						:key="color"
						class="color-dot"
						:class="{ 'color-selected': selectedColor === color }"
						:style="{ background: color }"
						@click="selectedColor = color"
					>
						<text v-if="selectedColor === color" class="color-check">✓</text>
					</view>
				</view>
			</view>

			<!-- 卡号 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">卡号</text>
					<text class="label-hint">选填，支持16-19位银行卡号</text>
				</view>
				<view class="input-wrapper card-input-wrapper">
					<input
						class="form-input card-input"
						:type="cardNumberVisible ? 'text' : 'password'"
						v-model="cardNumberRaw"
						placeholder="请输入银行卡号"
						placeholder-class="input-placeholder"
						maxlength="23"
						:adjust-position="false"
						@input="onCardInput"
					/>
					<view class="card-toggle" @click="cardNumberVisible = !cardNumberVisible">
						<view v-if="cardNumberVisible" class="toggle-icon toggle-icon-open" :style="getIconStyle('eye-open')"></view>
						<view v-else class="toggle-icon toggle-icon-off" :style="getIconStyle('eye-off')"></view>
					</view>
				</view>
				<!-- 安全提示 -->
				<view class="card-hint" :class="{ 'card-hint-valid': cardValid, 'card-hint-invalid': cardNumberRaw && !cardValid }">
					<text>{{ cardHintText }}</text>
				</view>
				<!-- 卡号预览 -->
				<view v-if="cardNumberRaw" class="card-preview" :style="{ borderColor: selectedColor + '44' }">
					<view class="card-preview-top">
						<text class="card-preview-type">{{ currentTypeLabel }}</text>
						<view class="card-preview-icon" :style="getIconStyle('credit-card')"></view>
					</view>
					<text class="card-preview-number">{{ displayCardNumber }}</text>
					<view class="card-preview-bottom">
						<text class="card-preview-label">持卡人</text>
						<text class="card-preview-label">有效期</text>
					</view>
				</view>
			</view>

			<!-- 初始余额 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">初始余额</text>
				</view>
				<view class="input-wrapper balance-input-wrapper">
					<text class="balance-prefix">¥</text>
					<input
						class="form-input balance-input"
						v-model="balance"
						type="digit"
						placeholder="0.00"
						placeholder-class="input-placeholder"
						maxlength="12"
						:adjust-position="true"
						:cursor-spacing="20"
					/>
				</view>
			</view>

			<!-- 备注 -->
			<view class="form-section">
				<view class="section-label">
					<text class="label-text">备注</text>
				</view>
				<view class="input-wrapper">
					<input
						class="form-input"
						v-model="description"
						placeholder="可选备注信息"
						placeholder-class="input-placeholder"
						maxlength="50"
						:adjust-position="false"
					/>
				</view>
			</view>

			<view style="height: 200rpx;"></view>
		</scroll-view>

		<!-- 底部保存按钮 -->
		<view class="bottom-bar">
			<view class="btn-save" :class="{ 'btn-disabled': !canSave }" @click="saveAccount">
				<text class="btn-save-text">保存账户</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import themeMixin from '@/common/theme-mixin.js'
	import ICONS from '@/common/icon-base64.js'
	import {
		ACCOUNT_ICONS_MAP as PAY_ICONS_MAP,
		ICON_WECHAT, ICON_ALIPAY, ICON_HUABEI, ICON_JD, ICON_ECNY,
		ICON_QQWALLET, ICON_MEITUAN, ICON_ELEME, ICON_CHINAMOBILE,
		ICON_CHINATELECOM, ICON_CHINAUNICOM, ICON_SINOPEC, ICON_CNPC,
		ICON_STATEGRID, ICON_LINGQIANGTONG, ICON_LICAITONG, ICON_YUEBAO,
		ICON_DOUYIN, ICON_CHNMEDICAL, ICON_XIAOHEBAO
	} from '@/common/account-icons.js'
	import {
		BANK_ICONS_MAP,
		ICON_CITIC, ICON_CEBBANK, ICON_ABCHINA, ICON_CCB, ICON_PSBC,
		ICON_BOC, ICON_BANKCOMM, ICON_CMBC, ICON_SPDB, ICON_CIB,
		ICON_PINGAN, ICON_ICBC, ICON_CGB, ICON_CMB, ICON_MYBANK
	} from '@/common/account-icons-bank.js'

	const ACCOUNT_TYPES = [
		{ value: 'cash', label: '现金', icon: '💵' },
		{ value: 'bank', label: '银行卡', icon: '💳' },
		{ value: 'credit', label: '信用卡', icon: '🏦' },
		{ value: 'eWallet', label: '电子钱包', icon: '📱' },
		{ value: 'investment', label: '投资理财', icon: '📈' },
		{ value: 'other', label: '其他', icon: '📦' }
	]

	const PAY_ICONS_LIST = Object.entries(PAY_ICONS_MAP).map(([key, val]) => ({
		key, name: val.name, icon: val.icon, color: val.color, bg: val.bg
	}))

	const BANK_ICONS_LIST = Object.entries(BANK_ICONS_MAP).map(([key, val]) => ({
		key, name: val.name, icon: val.icon, color: val.color, bg: val.bg
	}))

	const PRESET_COLORS = [
		'#E8734A', '#FF8C5A', '#FFB07A', '#C4A484',
		'#A98B78', '#8B7355', '#D4956A', '#E67E22',
		'#F39C12', '#D35400', '#B8860B', '#9B7653'
	]

	export default {
		mixins: [themeMixin],
		data() {
			return {
				accountName: '',
				accountType: 'bank',
				accountIconKey: 'wechat',
				accountIcon: ICON_WECHAT,
				selectedColor: '#E8734A',
				cardNumberRaw: '',
				cardNumberVisible: false,
				balance: '',
				description: '',
				iconSearch: '',
				showCustomIcon: false,
				accountTypes: ACCOUNT_TYPES,
				payIconList: PAY_ICONS_LIST,
				bankIconList: BANK_ICONS_LIST,
				presetColors: PRESET_COLORS,
				saving: false
			}
		},
		computed: {
			...mapState('accounting', ['initialized']),
			/** 格式化展示的卡号（隐藏时仅显示后4位） */
			displayCardNumber() {
				const raw = this.cardNumberRaw.replace(/\s/g, '')
				if (!this.cardNumberVisible && raw.length > 4) {
					const last4 = raw.slice(-4)
					const masked = '**** **** ****'
					return masked + ' ' + last4
				}
				return this.formatCardNumber(this.cardNumberRaw)
			},
			/** 卡号校验 */
			cardValid() {
				if (!this.cardNumberRaw) return true // 选填
				const digits = this.cardNumberRaw.replace(/\s/g, '')
				if (digits.length < 16 || digits.length > 19) return false
				return /^\d+$/.test(digits)
			},
			cardHintText() {
				if (!this.cardNumberRaw) return '卡号仅本地存储，保障安全'
				const digits = this.cardNumberRaw.replace(/\s/g, '')
				if (!/^\d+$/.test(digits)) return '卡号仅支持数字'
				if (digits.length < 16) return `还需 ${16 - digits.length} 位`
				if (digits.length > 19) return '卡号过长（最多19位）'
				return '✓ 卡号格式正确'
			},
			currentTypeLabel() {
				const t = ACCOUNT_TYPES.find(t => t.value === this.accountType)
				return t ? t.label : '银行卡'
			},
			/** 是否可以保存 */
			canSave() {
				return this.accountName.trim().length > 0 && !this.saving
			}
		},
		methods: {
			getIconStyle(name) {
				return {
					'mask-image': 'url(' + ICONS[name] + ')',
					'-webkit-mask-image': 'url(' + ICONS[name] + ')'
				}
			},
			/** 选择图标 */
			selectIcon(item) {
				this.accountIconKey = item.key
				this.accountIcon = item.icon
			},
			/** 返回上一页 */
			goBack() {
				uni.navigateBack()
			},
			/** 卡号输入处理 — 自动格式化 */
			onCardInput(e) {
				let val = e.detail.value
				// 仅保留数字
				val = val.replace(/\D/g, '')
				// 限制最大19位数字
				if (val.length > 19) val = val.slice(0, 19)
				// 添加空格分隔（每4位）
				this.cardNumberRaw = this.formatCardNumber(val)
			},
			/** 格式化卡号（每4位加空格） */
			formatCardNumber(val) {
				const digits = val.replace(/\s/g, '')
				const parts = []
				for (let i = 0; i < digits.length; i += 4) {
					parts.push(digits.slice(i, i + 4))
				}
				return parts.join(' ')
			},
			/** 保存账户 */
			async saveAccount() {
				if (!this.canSave) return

				const name = this.accountName.trim()
				if (!name) {
					uni.showToast({ title: '请输入账户名称', icon: 'none' })
					return
				}

				const cardDigits = this.cardNumberRaw.replace(/\s/g, '')
				if (cardDigits && !this.cardValid) {
					uni.showToast({ title: '卡号格式不正确（16-19位数字）', icon: 'none' })
					return
				}

				this.saving = true
				try {
					const accountData = {
						name,
						type: this.accountType,
						icon: this.accountIconKey,
						iconSvg: this.accountIcon,
						color: this.selectedColor,
						balance: parseFloat(this.balance) || 0,
						desc: this.description.trim(),
						cardNumber: cardDigits,
						cardNumberHidden: true
					}

					const res = await this.$store.dispatch('accounting/addAccount', accountData)
					if (res.success) {
						uni.showToast({ title: '账户添加成功 ✨', icon: 'none' })
						setTimeout(() => uni.navigateBack(), 600)
					} else {
						uni.showToast({ title: res.message || '添加失败', icon: 'none' })
					}
				} catch (err) {
					uni.showToast({ title: '操作失败，请重试', icon: 'none' })
				} finally {
					this.saving = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add-account-page {
		min-height: 100vh;
		background: transparent;
		display: flex;
		flex-direction: column;
	}

	/* ===== 导航栏 ===== */
	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height) + 16rpx) 24rpx;
		background: var(--card-bg, #FFFFFF);
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid var(--border, #E8F0FE);
	}
	.nav-back {
		width: 72rpx;
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--input-bg, #F2F7FF);
		transition: all 0.2s;
	}
	.nav-back:active {
		background: var(--border, #E8F0FE);
		transform: scale(0.95);
	}
	.back-icon {
		width: 36rpx;
		height: 36rpx;
		background-color: var(--text-primary, #1A2744);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
	}
	.nav-placeholder {
		width: 72rpx;
	}

	/* ===== 滚动区域 ===== */
	.form-scroll {
		flex: 1;
		padding: 20rpx 28rpx;
	}

	/* ===== 表单区块 ===== */
	.form-section {
		margin-bottom: 32rpx;
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
		color: var(--text-primary, #1A2744);
	}
	.label-required {
		color: #FF6B6B;
		font-size: 28rpx;
	}
	.label-hint {
		font-size: 22rpx;
		color: var(--text-secondary, #5A6B8A);
		margin-left: 8rpx;
	}

	/* ===== 输入框 ===== */
	.input-wrapper {
		background: var(--card-bg, #FFFFFF);
		border-radius: 16rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		padding: 16rpx 24rpx;
		height: 88rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		transition: border-color 0.2s;
	}
	.input-wrapper:focus-within {
		border-color: var(--primary, #5B9BE0);
	}
	.form-input {
		flex: 1;
		padding: 0 0 0 12rpx;
		margin: 0;
		font-size: 30rpx;
		line-height: 56rpx;
		color: var(--text-primary, #1A2744);
	}
	.input-placeholder {
		color: var(--text-tertiary, #8A9BB8);
		font-size: 28rpx;
	}
	.card-input-wrapper {
		display: flex;
		align-items: center;
		padding-right: 8rpx;
	}
	.card-input {
		flex: 1;
	}
	.card-toggle {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}
	.card-toggle:active {
		background: var(--input-bg, #F2F7FF);
	}
	.toggle-icon {
		width: 32rpx;
		height: 32rpx;
	}
	.toggle-icon-open {
		background-color: var(--text-secondary, #5A6B8A);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.toggle-icon-off {
		background-color: var(--text-secondary, #5A6B8A);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.card-hint {
		font-size: 22rpx;
		margin-top: 10rpx;
		padding-left: 8rpx;
	}
	.card-hint-valid {
		color: #1DD1A1;
	}
	.card-hint-invalid {
		color: #FF6B6B;
	}

	/* ===== 卡号预览卡片 ===== */
	.card-preview {
		margin-top: 20rpx;
		padding: 32rpx 28rpx;
		border-radius: 20rpx;
		border: 2rpx solid;
		background: linear-gradient(135deg, var(--text-primary, #1A2744) 0%, #5A3D2E 100%);
		color: var(--card-bg, #FFFFFF);
	}
	.card-preview-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
	}
	.card-preview-type {
		font-size: 26rpx;
		font-weight: 500;
		opacity: 0.9;
	}
	.card-preview-icon {
		width: 40rpx;
		height: 40rpx;
		background-color: var(--card-bg, #FFFFFF);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.card-preview-number {
		font-size: 38rpx;
		font-weight: 600;
		letter-spacing: 2rpx;
		font-family: 'Courier New', monospace;
		margin-bottom: 24rpx;
		display: block;
	}
	.card-preview-bottom {
		display: flex;
		justify-content: space-between;
	}
	.card-preview-label {
		font-size: 18rpx;
		opacity: 0.6;
		text-transform: uppercase;
		letter-spacing: 2rpx;
	}

	/* ===== 账户类型选择 ===== */
	.type-scroll {
		white-space: nowrap;
		padding-bottom: 8rpx;
	}
	.type-chip {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding: 16rpx 28rpx;
		margin-right: 16rpx;
		background: var(--card-bg, #FFFFFF);
		border-radius: 20rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		min-width: 100rpx;
		transition: all 0.2s;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}
	.type-chip:active {
		transform: scale(0.95);
	}
	.type-active {
		background: rgba(91, 155, 224, 0.1);
		border-color: var(--primary, #5B9BE0);
		color: var(--primary, #5B9BE0);
		box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.15);
	}
	.type-emoji {
		font-size: 36rpx;
	}
	.type-name {
		font-size: 22rpx;
		color: inherit;
	}

	/* ===== 搜索行 ===== */
	.search-row {
		display: flex;
		gap: 16rpx;
		align-items: center;
		margin-bottom: 20rpx;
	}
	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background: var(--card-bg, #FFFFFF);
		border-radius: 16rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		padding: 0 20rpx;
		height: 72rpx;
		box-sizing: border-box;
		gap: 12rpx;
	}
	.search-icon {
		width: 28rpx;
		height: 28rpx;
		background-color: var(--text-tertiary, #8A9BB8);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
		flex-shrink: 0;
	}
	.search-input {
		flex: 1;
		font-size: 26rpx;
		color: var(--text-primary, #1A2744);
		height: 100%;
		background: transparent;
		border: none;
		outline: none;
		padding: 0;
	}
	.search-placeholder {
		color: var(--text-tertiary, #8A9BB8);
		font-size: 26rpx;
	}
	.custom-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 0 20rpx;
		height: 72rpx;
		background: var(--card-bg, #FFFFFF);
		border-radius: 16rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		box-sizing: border-box;
		flex-shrink: 0;
		transition: all 0.2s;
	}
	.custom-btn:active {
		transform: scale(0.95);
		background: var(--input-bg, #F2F7FF);
	}
	.custom-icon {
		width: 24rpx;
		height: 24rpx;
		background-color: var(--text-secondary, #5A6B8A);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
	}
	.custom-text {
		font-size: 24rpx;
		color: var(--text-secondary, #5A6B8A);
		font-weight: 500;
	}

	/* ===== 图标分类区块 ===== */
	.icon-section {
		margin-bottom: 24rpx;
	}
	.icon-section-title {
		display: block;
		font-size: 24rpx;
		font-weight: 600;
		color: var(--text-secondary, #5A6B8A);
		margin-bottom: 12rpx;
		padding-left: 4rpx;
	}

	/* ===== 图标网格 ===== */
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 12rpx;
	}
	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding: 12rpx 4rpx;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: all 0.2s;
		cursor: pointer;
		background: var(--card-bg, #FFFFFF);
		box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
	}
	.icon-item:active {
		transform: scale(0.92);
		background: var(--input-bg, #F2F7FF);
	}
	.icon-selected {
		border-color: var(--primary, #5B9BE0);
		background: rgba(91, 155, 224, 0.06);
		box-shadow: 0 0 0 2rpx rgba(91, 155, 224, 0.15);
	}
	.icon-svg {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
	}
	.icon-label {
		font-size: 20rpx;
		color: var(--text-secondary, #5A6B8A);
		text-align: center;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	/* ===== 颜色选择 ===== */
	.color-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		background: var(--card-bg, #FFFFFF);
		padding: 20rpx;
		border-radius: 20rpx;
		border: 2rpx solid var(--border, #E8F0FE);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}
	.color-dot {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		position: relative;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
	}
	.color-dot:active {
		transform: scale(0.9);
	}
	.color-selected {
		transform: scale(1.15);
		box-shadow: 0 0 0 4rpx rgba(91, 155, 224, 0.3), 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
	}
	.color-check {
		font-size: 24rpx;
		color: var(--card-bg, #FFFFFF);
		font-weight: 700;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
	}

	/* ===== 余额输入 ===== */
	.balance-input-wrapper {
		display: flex;
		align-items: center;
	}
	.balance-prefix {
		font-size: 34rpx;
		font-weight: 600;
		color: var(--text-primary, #1A2744);
		margin-right: 12rpx;
	}
	.balance-input {
		flex: 1;
	}

	/* ===== 底部保存按钮 ===== */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 28rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: linear-gradient(to top, var(--bg, #EFF5FF) 60%, transparent);
		z-index: 100;
	}
	.btn-save {
		height: 96rpx;
		background: linear-gradient(135deg, var(--primary, #5B9BE0), #4A7FC0);
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.35);
		transition: all 0.25s;
	}
	.btn-save:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(91, 155, 224, 0.25);
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
		.icon-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}
	@media (max-width: 360px) {
		.form-scroll {
			padding: 16rpx 16rpx;
		}
		.icon-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 8rpx;
		}
		.icon-svg {
			width: 52rpx;
			height: 52rpx;
		}
		.icon-label {
			font-size: 18rpx;
		}
		.type-chip {
			padding: 12rpx 20rpx;
			min-width: 80rpx;
		}
	}
</style>
