<template>
	<view class="photo-record-page">
		<!-- 导航栏 -->
		<view class="page-header">
			<view class="back-btn" @click="goBack">
				<view class="back-icon"></view>
			</view>
			<text class="header-title">拍照记账</text>
			<view style="width: 72rpx;"></view>
		</view>

		<scroll-view scroll-y class="content-scroll">
			<!-- 未选图状态 -->
			<view class="upload-area" v-if="!imagePath && !recognizing && !recognized">
				<view class="upload-card" @click="chooseImageSource">
					<view class="upload-icon">📷</view>
					<text class="upload-title">拍照 / 选择图片</text>
					<text class="upload-desc">拍摄小票、账单或截图，AI自动识别金额和分类</text>
				</view>

				<view class="source-row">
					<view class="source-btn" @click="takePhoto">
						<view class="source-icon-wrap" style="background: rgba(91, 155, 224, 0.12);">
							<text class="source-icon">📸</text>
						</view>
						<text class="source-name">相机拍照</text>
					</view>
					<view class="source-btn" @click="chooseFromAlbum">
						<view class="source-icon-wrap" style="background: rgba(169, 139, 120, 0.15);">
							<text class="source-icon">🖼️</text>
						</view>
						<text class="source-name">相册选择</text>
					</view>
				</view>

				<view class="tip-card">
					<text class="tip-emoji">💡</text>
					<view class="tip-content">
						<text class="tip-title">识别小贴士</text>
						<text class="tip-text">• 确保图片清晰，光线充足\n• 小票金额、商户名完整可见\n• 支持超市小票、餐厅账单、购物截图等</text>
					</view>
				</view>
			</view>

			<!-- 识别中状态 -->
			<view class="recognizing-area" v-if="recognizing">
				<view class="image-preview-wrap">
					<image :src="imagePath" mode="aspectFit" class="image-preview"></image>
					<view class="recognizing-overlay">
						<view class="scanning-line"></view>
						<view class="recognizing-text-wrap">
							<view class="loading-dots">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
							<text class="recognizing-text">AI识别中...</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 识别结果 -->
			<view class="result-area" v-if="recognized && result">
				<!-- 图片预览 -->
				<view class="result-image-wrap" @click="previewImage">
					<image :src="imagePath" mode="aspectFit" class="result-image"></image>
					<view class="retake-btn">
						<text class="retake-text">重新拍照</text>
					</view>
				</view>

				<!-- 识别结果卡片 -->
				<view class="result-card">
					<view class="result-header">
						<text class="result-title">识别结果</text>
						<view class="confidence-badge">
							<text class="confidence-text">置信度 {{ (result.confidence * 100).toFixed(0) }}%</text>
						</view>
					</view>

					<!-- 金额 -->
					<view class="result-row amount-row">
						<text class="row-label">金额</text>
						<view class="amount-display">
							<text class="amount-sign">¥</text>
							<text class="amount-value">{{ formatMoney(result.amount) }}</text>
						</view>
					</view>

					<!-- 类型切换 -->
					<view class="result-row">
						<text class="row-label">类型</text>
						<view class="type-toggle">
							<view class="type-btn" :class="{ active: editType === 'expense' }" @click="editType = 'expense'">支出</view>
							<view class="type-btn" :class="{ active: editType === 'income' }" @click="editType = 'income'">收入</view>
						</view>
					</view>

					<!-- 分类 -->
					<view class="result-row">
						<text class="row-label">分类</text>
						<scroll-view scroll-x class="cat-scroll">
							<view class="cat-list">
								<view v-for="cat in availableCategories" :key="cat" class="cat-chip"
									:class="{ selected: editCategory === cat }" @click="editCategory = cat">
									<text class="cat-chip-emoji">{{ getCategoryEmoji(cat) }}</text>
									<text class="cat-chip-name">{{ cat }}</text>
								</view>
							</view>
						</scroll-view>
					</view>

					<!-- 备注 -->
					<view class="result-row">
						<text class="row-label">备注</text>
						<input class="note-edit" v-model="editNote" placeholder="添加备注..." />
					</view>

					<!-- 日期 -->
					<view class="result-row">
						<text class="row-label">日期</text>
						<text class="date-text" @click="showDatePicker = !showDatePicker">{{ editDate }}</text>
					</view>

					<!-- 账户 -->
					<view class="result-row" @click="showAccountPicker">
						<text class="row-label">账户</text>
						<text class="account-text">{{ selectedAccountName || '选择账户' }}</text>
						<text class="arrow">›</text>
					</view>

					<!-- 商户信息 -->
					<view class="result-row" v-if="result.merchant">
						<text class="row-label">商户</text>
						<text class="merchant-text">{{ result.merchant }}</text>
					</view>
				</view>

				<!-- 保存按钮 -->
				<view class="save-btn" :class="{ disabled: saving }" @click="saveRecord">
					<text class="save-btn-text">{{ saving ? '保存中...' : '保存记账' }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 日期选择器 -->
		<view class="date-picker-overlay" v-if="showDatePicker" @click="showDatePicker = false">
			<view class="date-picker-panel" @click.stop>
				<view class="dp-header">
					<view class="dp-nav" @click="dpPrevMonth">‹</view>
					<text class="dp-title">{{ dpYear }}年{{ dpMonth }}月</text>
					<view class="dp-nav" @click="dpNextMonth">›</view>
				</view>
				<view class="dp-weekdays">
					<text class="dp-weekday" v-for="d in weekDays" :key="d">{{ d }}</text>
				</view>
				<view class="dp-days">
					<text class="dp-day dp-day-empty" v-for="n in dpStartPad" :key="'pad'+n"></text>
					<text v-for="day in dpDaysInMonth" :key="day" class="dp-day"
						:class="{ 'dp-day-selected': isDpSelected(day) }"
						@click="selectDpDay(day)">{{ day }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import { CAT_ICONS, formatMoney, todayStr } from '@/common/accounting-utils.js'
import AccountingService from '@/services/accounting-service.js'
import Logger from '@/common/logger.js'

export default {
	data() {
		const now = new Date()
		return {
			imagePath: '',
			recognizing: false,
			recognized: false,
			result: null,
			saving: false,
			editType: 'expense',
			editCategory: '',
			editNote: '',
			editDate: todayStr(),
			editAccountId: null,
			showDatePicker: false,
			dpYear: now.getFullYear(),
			dpMonth: now.getMonth() + 1,
			weekDays: ['日', '一', '二', '三', '四', '五', '六']
		}
	},
	computed: {
		...mapState('accounting', ['data', 'initialized']),
		availableCategories() {
			if (!this.data || !this.data.categories) return []
			return this.editType === 'expense' ? this.data.categories.expense : this.data.categories.income
		},
		selectedAccountName() {
			if (!this.editAccountId || !this.data) return ''
			const a = this.data.accounts.find(a => a.id === this.editAccountId)
			return a ? a.name : ''
		},
		dpDaysInMonth() {
			return new Date(this.dpYear, this.dpMonth, 0).getDate()
		},
		dpStartPad() {
			return new Date(this.dpYear, this.dpMonth - 1, 1).getDay()
		}
	},
	onLoad() {
		if (this.initialized) this.initAccount()
		else this.$store.dispatch('accounting/initialize').then(() => this.initAccount())
	},
	methods: {
		formatMoney,
		initAccount() {
			if (this.data && this.data.accounts && this.data.accounts.length > 0) {
				this.editAccountId = this.data.accounts[0].id
			}
		},
		getCategoryEmoji(cat) {
			return CAT_ICONS[cat] || '📦'
		},
		goBack() { uni.navigateBack() },

		chooseImageSource() {
			uni.showActionSheet({
				itemList: ['拍照', '从相册选择'],
				success: (res) => {
					if (res.tapIndex === 0) this.takePhoto()
					else this.chooseFromAlbum()
				}
			})
		},
		takePhoto() {
			uni.chooseImage({
				count: 1,
				sourceType: ['camera'],
				sizeType: ['compressed'],
				success: (res) => {
					this.imagePath = res.tempFilePaths[0]
					this.doRecognize()
				},
				fail: (err) => {
					if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						uni.showToast({ title: '拍照失败，请检查权限', icon: 'none' })
					}
				}
			})
		},
		chooseFromAlbum() {
			uni.chooseImage({
				count: 1,
				sourceType: ['album'],
				sizeType: ['compressed'],
				success: (res) => {
					this.imagePath = res.tempFilePaths[0]
					this.doRecognize()
				},
				fail: (err) => {
					if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						uni.showToast({ title: '选择图片失败', icon: 'none' })
					}
				}
			})
		},
		async doRecognize() {
			this.recognizing = true
			this.recognized = false
			try {
				const res = await AccountingService.recognizeReceipt(this.imagePath)
				if (res.success && res.data) {
					this.result = res.data
					this.editType = res.data.type || 'expense'
					this.editCategory = res.data.category || ''
					this.editNote = res.data.note || ''
					this.editDate = res.data.date || todayStr()
					this.recognized = true
				} else {
					uni.showToast({ title: res.message || '识别失败', icon: 'none' })
					this.resetState()
				}
			} catch (err) {
				Logger.error('PhotoRecord', '识别异常', err)
				uni.showToast({ title: '识别异常，请重试', icon: 'none' })
				this.resetState()
			} finally {
				this.recognizing = false
			}
		},
		resetState() {
			this.imagePath = ''
			this.recognized = false
			this.result = null
		},
		previewImage() {
			if (!this.imagePath) return
			uni.previewImage({ urls: [this.imagePath] })
		},
		showAccountPicker() {
			if (!this.data || !this.data.accounts || this.data.accounts.length === 0) {
				uni.showToast({ title: '暂无账户', icon: 'none' })
				return
			}
			const items = this.data.accounts.map(a => a.name)
			uni.showActionSheet({
				itemList: items,
				success: (res) => {
					this.editAccountId = this.data.accounts[res.tapIndex].id
				}
			})
		},
		async saveRecord() {
			if (this.saving) return
			if (!this.editCategory) {
				uni.showToast({ title: '请选择分类', icon: 'none' })
				return
			}
			if (!this.editAccountId) {
				uni.showToast({ title: '请先添加账户', icon: 'none' })
				return
			}
			this.saving = true
			try {
				const res = await this.$store.dispatch('accounting/addTransaction', {
					amount: this.result.amount,
					type: this.editType,
					category: this.editCategory,
					accountId: this.editAccountId,
					date: this.editDate,
					note: this.editNote
				})
				if (res.success) {
					uni.showToast({ title: '记账成功 ✨', icon: 'none' })
					setTimeout(() => {
						const pages = getCurrentPages()
						if (pages.length > 1) uni.navigateBack({ delta: 1 })
						else uni.reLaunch({ url: '/pages/accounting/home' })
					}, 600)
				} else {
					uni.showToast({ title: res.message || '保存失败', icon: 'none' })
				}
			} catch (err) {
				Logger.error('PhotoRecord', '保存异常', err)
				uni.showToast({ title: '保存异常，请重试', icon: 'none' })
			} finally {
				this.saving = false
			}
		},
		// 日期选择器
		isDpSelected(day) {
			const parts = this.editDate.split('-')
			return this.dpYear === parseInt(parts[0]) && this.dpMonth === parseInt(parts[1]) && day === parseInt(parts[2])
		},
		selectDpDay(day) {
			this.editDate = `${this.dpYear}-${String(this.dpMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
			this.showDatePicker = false
		},
		dpPrevMonth() {
			if (this.dpMonth === 1) { this.dpMonth = 12; this.dpYear-- }
			else this.dpMonth--
		},
		dpNextMonth() {
			if (this.dpMonth === 12) { this.dpMonth = 1; this.dpYear++ }
			else this.dpMonth++
		}
	}
}
</script>

<style lang="scss" scoped>
.photo-record-page { height: 100vh; width: 100%; background: transparent; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }

.page-header { display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 20rpx) 40rpx 16rpx; background: transparent; flex-shrink: 0; width: 100%; box-sizing: border-box; }
.back-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.back-icon { width: 36rpx; height: 36rpx; background-color: #7A5C4A; mask: url(/static/icons/arrow-left.svg) center/contain no-repeat; -webkit-mask: url(/static/icons/arrow-left.svg) center/contain no-repeat; }
.header-title { font-size: 36rpx; font-weight: 600; color: #3D2316; }

.content-scroll { flex: 1; width: 100%; padding: 0 40rpx; overflow-y: auto; box-sizing: border-box; }

/* 上传区域 */
.upload-area { padding-top: 20rpx; }
.upload-card { background: #FFFFFF; border: 3rpx dashed var(--border, #E8F0FE); border-radius: 24rpx; padding: 60rpx 40rpx; display: flex; flex-direction: column; align-items: center; gap: 16rpx; margin-bottom: 32rpx; transition: all 0.2s; }
.upload-card:active { border-color: var(--primary, #5B9BE0); background: var(--card-bg, #FFFFFF); }
.upload-icon { font-size: 80rpx; }
.upload-title { font-size: 32rpx; font-weight: 600; color: #3D2316; }
.upload-desc { font-size: 24rpx; color: #A98B78; text-align: center; line-height: 1.5; }

.source-row { display: flex; gap: 20rpx; margin-bottom: 32rpx; }
.source-btn { flex: 1; background: #FFFFFF; border-radius: 20rpx; padding: 32rpx 0; display: flex; flex-direction: column; align-items: center; gap: 12rpx; box-shadow: 0 2rpx 12rpx rgba(61, 35, 22, 0.06); transition: all 0.2s; }
.source-btn:active { transform: scale(0.96); }
.source-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.source-icon { font-size: 40rpx; }
.source-name { font-size: 26rpx; font-weight: 600; color: #3D2316; }

.tip-card { display: flex; gap: 16rpx; padding: 24rpx; background: #FFFFFF; border-radius: 16rpx; }
.tip-emoji { font-size: 32rpx; flex-shrink: 0; }
.tip-content { display: flex; flex-direction: column; gap: 6rpx; }
.tip-title { font-size: 26rpx; font-weight: 600; color: #3D2316; }
.tip-text { font-size: 22rpx; color: #A98B78; line-height: 1.6; }

/* 识别中 */
.recognizing-area { padding-top: 20rpx; }
.image-preview-wrap { position: relative; width: 100%; border-radius: 24rpx; overflow: hidden; }
.image-preview { width: 100%; height: 500rpx; background: var(--card-bg, #FFFFFF); }
.recognizing-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(61, 35, 22, 0.5); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.scanning-line { position: absolute; top: 0; left: 0; right: 0; height: 4rpx; background: linear-gradient(90deg, transparent, var(--primary, #5B9BE0), transparent); box-shadow: 0 0 20rpx var(--primary, #5B9BE0); animation: scan 1.5s ease-in-out infinite; }
@keyframes scan { 0%, 100% { top: 10%; } 50% { top: 90%; } }
.recognizing-text-wrap { display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.loading-dots { display: flex; gap: 12rpx; }
.dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--primary, #5B9BE0); animation: dotPulse 1.4s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
.recognizing-text { font-size: 28rpx; color: #FFFFFF; font-weight: 500; }

/* 结果区域 */
.result-area { padding-top: 20rpx; padding-bottom: 40rpx; }
.result-image-wrap { position: relative; width: 100%; border-radius: 20rpx; overflow: hidden; margin-bottom: 24rpx; }
.result-image { width: 100%; height: 300rpx; background: var(--card-bg, #FFFFFF); }
.retake-btn { position: absolute; bottom: 16rpx; right: 16rpx; background: rgba(61, 35, 22, 0.7); border-radius: 30rpx; padding: 12rpx 24rpx; }
.retake-text { font-size: 24rpx; color: #FFFFFF; }

.result-card { background: #FFFFFF; border-radius: 24rpx; padding: 32rpx 28rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 12rpx rgba(61, 35, 22, 0.06); }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; padding-bottom: 20rpx; border-bottom: 2rpx solid var(--card-bg, #FFFFFF); }
.result-title { font-size: 30rpx; font-weight: 700; color: #3D2316; }
.confidence-badge { background: rgba(91, 155, 224, 0.12); border-radius: 20rpx; padding: 6rpx 16rpx; }
.confidence-text { font-size: 22rpx; color: var(--primary, #5B9BE0); font-weight: 600; }

.result-row { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid var(--card-bg, #FFFFFF); gap: 20rpx; }
.result-row:last-child { border-bottom: none; }
.row-label { font-size: 26rpx; color: #A98B78; width: 100rpx; flex-shrink: 0; }

.amount-row { padding: 24rpx 0; }
.amount-display { display: flex; align-items: baseline; gap: 4rpx; }
.amount-sign { font-size: 32rpx; font-weight: 700; color: var(--primary, #5B9BE0); }
.amount-value { font-size: 56rpx; font-weight: 700; color: var(--primary, #5B9BE0); letter-spacing: -2rpx; }

.type-toggle { display: flex; gap: 12rpx; background: var(--card-bg, #FFFFFF); border-radius: 30rpx; padding: 4rpx; flex: 1; }
.type-btn { flex: 1; text-align: center; padding: 14rpx 0; border-radius: 28rpx; font-size: 24rpx; font-weight: 600; color: #7A5C4A; transition: all 0.2s; }
.type-btn.active { background: var(--primary, #5B9BE0); color: #FFFFFF; }

.cat-scroll { flex: 1; white-space: nowrap; }
.cat-list { display: inline-flex; gap: 12rpx; padding: 4rpx 0; }
.cat-chip { display: inline-flex; align-items: center; gap: 6rpx; padding: 12rpx 20rpx; border-radius: 30rpx; background: var(--card-bg, #FFFFFF); border: 2rpx solid transparent; transition: all 0.2s; }
.cat-chip.selected { border-color: var(--primary, #5B9BE0); background: rgba(91, 155, 224, 0.08); }
.cat-chip-emoji { font-size: 28rpx; }
.cat-chip-name { font-size: 24rpx; color: #3D2316; font-weight: 500; }

.note-edit { flex: 1; padding: 14rpx 20rpx; background: var(--card-bg, #FFFFFF); border: 2rpx solid #F0E4DA; border-radius: 16rpx; font-size: 26rpx; color: #3D2316; }
.date-text { flex: 1; font-size: 26rpx; color: #3D2316; }
.account-text { flex: 1; font-size: 26rpx; color: #3D2316; }
.merchant-text { flex: 1; font-size: 26rpx; color: #3D2316; }
.arrow { font-size: 32rpx; color: #A98B78; }

.save-btn { background: linear-gradient(135deg, var(--primary, #5B9BE0), var(--primary-dark, #4A7FC0)); border-radius: 24rpx; padding: 28rpx 0; text-align: center; box-shadow: 0 4rpx 16rpx rgba(91, 155, 224, 0.35); transition: all 0.2s; }
.save-btn:active { transform: scale(0.98); }
.save-btn.disabled { opacity: 0.6; }
.save-btn-text { font-size: 30rpx; font-weight: 600; color: #FFFFFF; }

/* 日期选择器 */
.date-picker-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 200; }
.date-picker-panel { width: 580rpx; background: #FFFFFF; border-radius: 24rpx; box-shadow: 0 8rpx 40rpx rgba(61,35,22,0.15); overflow: hidden; padding: 24rpx; }
.dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.dp-nav { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); display: flex; align-items: center; justify-content: center; font-size: 44rpx; color: #7A5C4A; }
.dp-title { font-size: 32rpx; font-weight: 600; color: #3D2316; }
.dp-weekdays { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 12rpx; }
.dp-weekday { text-align: center; font-size: 24rpx; color: #A98B78; padding: 8rpx 0; font-weight: 500; }
.dp-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 4rpx; }
.dp-day { text-align: center; padding: 16rpx 0; font-size: 28rpx; color: #3D2316; border-radius: 50%; }
.dp-day-empty { cursor: default; }
.dp-day-selected { background: var(--primary, #5B9BE0); color: #FFFFFF; font-weight: 600; }

@media (min-width: 768px) {
	.content-scroll { max-width: 650px; margin: 0 auto; }
	.page-header { max-width: 650px; margin: 0 auto; }
}
</style>
