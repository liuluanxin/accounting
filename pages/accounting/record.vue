<template>
	<view class="record-page">
		<view class="page-header">
			<view class="close-btn" @click="goBack">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
					<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</view>
			<text class="header-title">记一笔</text>
			<view class="save-btn" @click="saveRecord">{{ saving ? '保存中...' : '保存' }}</view>
		</view>

		<scroll-view scroll-y class="record-scroll">
			<view class="type-toggle">
				<view class="type-btn" :class="{ active: recordType === 'expense' }" @click="setType('expense')">支出</view>
				<view class="type-btn" :class="{ active: recordType === 'income' }" @click="setType('income')">收入</view>
			</view>

			<view class="amount-row" @click="focusAmount">
				<text class="currency-sign">¥</text>
				<text class="amount-display" :class="{ placeholder: !amount }">{{ amountDisplay }}</text>
				<view class="amount-cursor" v-if="amountFocused"></view>
				<input class="amount-hidden-input" ref="amountHiddenInput" type="digit"
					:value="amount" @input="onHiddenInput" @blur="onHiddenBlur"
					@focus="onHiddenFocus" :adjust-position="true" :cursor-spacing="20" />
			</view>

			<view class="category-grid">
				<view v-for="cat in currentCategories" :key="cat" class="category-item" :class="{ selected: recordCat === cat }" @click="selectCat(cat)">
					<view class="cat-icon">{{ getCategoryEmoji(cat) }}</view>
					<text class="cat-name">{{ getCategoryName(cat) }}</text>
				</view>
			</view>

			<view class="input-field">
				<input class="note-input" v-model="note" placeholder="添加备注..." @focus="noteFocused = true" @blur="noteFocused = false" />
			</view>

			<view class="form-row">
				<view class="form-item" @click="showDatePicker">
					<svg class="form-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					<text class="form-text">{{ displayDate }}</text>
				</view>
				<view class="form-item" @click="showAccountPicker">
					<svg class="form-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					<text class="form-text">{{ selectedAccountName || '默认账户' }}</text>
				</view>
			</view>

			<view style="height: 400rpx;"></view>
		</scroll-view>

		<view class="custom-keypad">
			<view class="keypad-body">
				<view class="keypad-left">
					<view class="keypad-row">
						<view class="key" @click="onKeyboardPress('1')"><text>1</text></view>
						<view class="key" @click="onKeyboardPress('2')"><text>2</text></view>
						<view class="key" @click="onKeyboardPress('3')"><text>3</text></view>
					</view>
					<view class="keypad-row">
						<view class="key" @click="onKeyboardPress('4')"><text>4</text></view>
						<view class="key" @click="onKeyboardPress('5')"><text>5</text></view>
						<view class="key" @click="onKeyboardPress('6')"><text>6</text></view>
					</view>
					<view class="keypad-row">
						<view class="key" @click="onKeyboardPress('7')"><text>7</text></view>
						<view class="key" @click="onKeyboardPress('8')"><text>8</text></view>
						<view class="key" @click="onKeyboardPress('9')"><text>9</text></view>
					</view>
					<view class="keypad-row">
						<view class="key" @click="onKeyboardPress('.')"><text>.</text></view>
						<view class="key" @click="onKeyboardPress('0')"><text>0</text></view>
						<view class="key key-del" @click="onKeyboardPress('del')"><text>⌫</text></view>
					</view>
				</view>
				<view class="keypad-right">
					<view class="action-btn btn-again" @click="saveAndNew">
						<text class="action-label">再记</text>
					</view>
					<view class="action-btn btn-add" @click="onCalculatorInput('+')">
						<text class="action-symbol">+</text>
					</view>
					<view class="action-btn btn-sub" @click="onCalculatorInput('-')">
						<text class="action-symbol">−</text>
					</view>
					<view class="action-btn btn-save" @click="saveRecord">
						<text class="action-label">保存</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import { todayStr } from '@/common/accounting-utils.js'
	import Logger from '@/common/logger.js'

	export default {
		data() {
			return {
				recordType: 'expense',
				recordCat: '餐饮',
				recordAccountId: null,
				recordDate: todayStr(),
				amount: '',
				note: '',
				saving: false,
				accounts: [],
				categories: { expense: [], income: [] },
				amountFocused: true,
				noteFocused: false,
				keyboardHeight: 0,
				calcOperator: '',
				calcPrevAmount: ''
			}
		},
		computed: {
			...mapState('accounting', ['data', 'initialized']),
			currentCategories() {
				return this.categories[this.recordType === 'expense' ? 'expense' : 'income'] || []
			},
			selectedAccountName() {
				const a = this.accounts.find(a => a.id === this.recordAccountId)
				return a ? a.name : ''
			},
			displayDate() {
				if (!this.recordDate) return '选择日期'
				const today = new Date().toISOString().slice(0, 10)
				if (this.recordDate === today) return '今天'
				return this.recordDate
			},
			amountDisplay() {
				if (!this.amount) return '0.00'
				return this.amount
			}
		},
		onLoad() {
			if (this.initialized) this.loadFromStore()
			else {
				this.$store.dispatch('accounting/initialize').then(() => this.loadFromStore())
			}
			uni.onKeyboardHeightChange(this.onKeyboardHeightChange)
		},
		onUnload() {
			uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
		},
		methods: {
			onKeyboardHeightChange(e) {
				this.keyboardHeight = (e && e.height) || 0
			},
			loadFromStore() {
				this.accounts = (this.data && this.data.accounts) || []
				this.categories = (this.data && this.data.categories) || { expense: [], income: [] }
				if (this.accounts.length > 0 && !this.recordAccountId) {
					this.recordAccountId = this.accounts[0].id
				}
			},
			setType(type) {
				this.recordType = type
				this.recordCat = type === 'expense' ? '餐饮' : '薪资'
			},
			selectCat(cat) { this.recordCat = cat },
			focusAmount() {
				this.amountFocused = true
				if (this.$refs.amountHiddenInput) this.$refs.amountHiddenInput.blur()
			},
			getCategoryName(cat) {
				if (!cat) return '其他'
				return cat
			},
			getCategoryEmoji(cat) {
				if (!cat) return '📦'
				const map = {
					'餐饮': '🍜', '交通': '🚗', '购物': '🛒', '娱乐': '🎬',
					'医疗': '💊', '教育': '📚', '居住': '🏠', '薪资': '💰',
					'奖金': '🎁', '理财': '📈', '其他': '📦', '通讯': '📱', '兼职': '💼', '服饰': '👔', '红包': '🧧'
				}
				return map[cat] || '📦'
			},
			onKeyboardPress(val) {
				if (this.calcOperator && val !== 'del' && val !== '.') {
					this.amount = ''
					this.calcOperator = ''
					this.calcPrevAmount = ''
				}
				if (val === 'del') {
					if (this.amount.length > 0) this.amount = this.amount.slice(0, -1)
					this.$forceUpdate()
					return
				}
				if (val === '.') {
					if (this.amount.indexOf('.') !== -1) return
					if (!this.amount) { this.amount = '0.'; this.$forceUpdate(); return }
					this.amount += '.'
					this.$forceUpdate()
					return
				}
				if (!this.amount && val === '0') { this.$forceUpdate(); return }
				const parts = this.amount.split('.')
				if (parts.length === 2 && parts[1].length >= 2) { this.$forceUpdate(); return }
				if (this.amount.replace('.', '').length >= 10) { this.$forceUpdate(); return }
				this.amount += val
				this.$forceUpdate()
			},
			onCalculatorInput(op) {
				if (!this.amount || parseFloat(this.amount) <= 0) {
					uni.showToast({ title: '请先输入金额', icon: 'none' })
					return
				}
				if (this.calcOperator && this.calcPrevAmount) {
					this.executeCalc()
				}
				this.calcPrevAmount = this.amount
				this.calcOperator = op
				this.amount = ''
				uni.showToast({ title: op === '+' ? '输入加数' : '输入减数', icon: 'none' })
			},
			executeCalc() {
				const prev = parseFloat(this.calcPrevAmount)
				const curr = parseFloat(this.amount) || 0
				if (this.calcOperator === '+') {
					this.amount = String(parseFloat((prev + curr).toFixed(2)))
				} else if (this.calcOperator === '-') {
					this.amount = String(parseFloat((prev - curr).toFixed(2)))
				}
				this.calcPrevAmount = ''
				this.calcOperator = ''
				this.$forceUpdate()
			},
			async saveAndNew() {
				const ok = await this.doSave()
				if (ok) {
					uni.showToast({ title: '保存成功，继续记账 ✨', icon: 'none' })
					this.amount = ''
					this.note = ''
					this.recordCat = this.recordType === 'expense' ? '餐饮' : '薪资'
					this.calcPrevAmount = ''
					this.calcOperator = ''
					this.amountFocused = true
					this.$nextTick(() => {
						this.$forceUpdate()
					})
				}
			},
			onHiddenInput(e) {
				const raw = e.detail.value
				let cleaned = raw.replace(/[^\d.]/g, '')
				const dotIdx = cleaned.indexOf('.')
				if (dotIdx !== -1) {
					cleaned = cleaned.slice(0, dotIdx + 1) + cleaned.slice(dotIdx + 1).replace(/\./g, '')
				}
				const parts = cleaned.split('.')
				if (parts.length === 2 && parts[1].length > 2) {
					cleaned = parts[0] + '.' + parts[1].slice(0, 2)
				}
				if (cleaned.replace('.', '').length > 10) return
				this.amount = cleaned
				this.$forceUpdate()
			},
			onHiddenBlur() {
				if (this.amount && this.amount !== '.') {
					const n = parseFloat(this.amount)
					if (!isNaN(n) && n > 0) this.amount = String(n)
					if (this.amount.endsWith('.')) this.amount += '0'
				}
				this.$forceUpdate()
			},
			onHiddenFocus() {},
			async doSave() {
				if (this.calcOperator && this.calcPrevAmount && this.amount) {
					this.executeCalc()
				}
				if (!this.amount || parseFloat(this.amount) <= 0) { uni.showToast({ title: '请输入有效金额', icon: 'none' }); return false }
				if (!this.recordAccountId) { uni.showToast({ title: '请先添加账户', icon: 'none' }); return false }

				this.saving = true
				try {
					const res = await this.$store.dispatch('accounting/addTransaction', {
						amount: parseFloat(this.amount),
						type: this.recordType,
						category: this.recordCat,
						accountId: this.recordAccountId,
						date: this.recordDate,
						note: this.note
					})
					if (res && res.success) return true
					else {
						let msg = (res && res.message) || '保存失败'
						if (res && res.code === 'LOCAL_ERROR' && res.message && res.message.indexOf('校验失败') !== -1) {
							msg = '请检查输入信息是否完整'
						}
						uni.showToast({ title: msg, icon: 'none' })
						return false
					}
				} catch (err) {
					Logger.error('Record', '保存异常', err)
					uni.showToast({ title: '保存异常，请重试', icon: 'none' })
					return false
				} finally {
					this.saving = false
				}
			},
			async saveRecord() {
				const ok = await this.doSave()
				if (ok) {
					uni.showToast({ title: '账单已保存 ✨', icon: 'none' })
					setTimeout(() => {
						const pages = getCurrentPages()
						if (pages.length > 1) uni.navigateBack({ delta: 1 })
						else uni.reLaunch({ url: '/pages/accounting/home' })
					}, 500)
				}
			},
			showDatePicker() {
				uni.showModal({
					title: '选择日期',
					editable: true,
					placeholderText: 'YYYY-MM-DD',
					success: (res) => {
						if (res.confirm && res.content) this.recordDate = res.content
					}
				})
			},
			showAccountPicker() {
				this.accounts = (this.data && this.data.accounts) || []
				if (this.accounts.length === 0) { uni.showToast({ title: '暂无账户', icon: 'none' }); return }
				const items = this.accounts.map(a => a.name)
				uni.showActionSheet({
					itemList: items,
					success: (res) => { this.recordAccountId = this.accounts[res.tapIndex].id }
				})
			},
			goBack() { uni.navigateBack() }
		}
	}
</script>

<style lang="scss" scoped>
	.record-page { height: 100vh; width: 100%; background: #FFF9F5; display: flex; flex-direction: column; position: relative; box-sizing: border-box; overflow-x: hidden; }

	.page-header { display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 20rpx) 40rpx 16rpx; background: #FFF9F5; flex-shrink: 0; width: 100%; box-sizing: border-box; }
	.close-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: #F5EDE6; display: flex; align-items: center; justify-content: center; color: #7A5C4A; flex-shrink: 0; }
	.header-title { font-size: 36rpx; font-weight: 600; color: #3D2316; }
	.save-btn { padding: 12rpx 32rpx; border-radius: 50rpx; background: #E8734A; color: #FFFFFF; font-size: 28rpx; font-weight: 500; flex-shrink: 0; }

	.record-scroll { flex: 1; width: 100%; padding: 0 40rpx; overflow-y: auto; padding-bottom: calc(500rpx + env(safe-area-inset-bottom)); box-sizing: border-box; }

	.type-toggle { display: flex; gap: 16rpx; background: #F5EDE6; border-radius: 50rpx; padding: 6rpx; margin-bottom: 48rpx; }
	.type-btn { flex: 1; text-align: center; padding: 20rpx 0; border-radius: 44rpx; font-size: 28rpx; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #7A5C4A; }
	.type-btn.active { background: #E8734A; color: #FFFFFF; box-shadow: 0 4rpx 8rpx rgba(232, 115, 74, 0.2); }

	.amount-row { display: flex; align-items: center; justify-content: center; gap: 8rpx; margin-bottom: 48rpx; padding: 12rpx 0; position: relative; }
	.currency-sign { font-size: 48rpx; font-weight: 700; color: #3D2316; opacity: 0.6; margin-top: 8rpx; }
	.amount-display { display: inline-flex; align-items: center; font-size: 72rpx; font-weight: 700; color: #3D2316; letter-spacing: -2rpx; min-width: 200rpx; text-align: center; justify-content: center; }
	.amount-display.placeholder { color: #C8A896; font-weight: 400; }
	.amount-cursor { width: 4rpx; height: 56rpx; background: #E8734A; animation: blink 1s step-end infinite; margin-left: 4rpx; flex-shrink: 0; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	.amount-hidden-input { position: absolute; left: -9999px; top: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

	.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24rpx 16rpx; margin-bottom: 40rpx; }
	.category-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; cursor: pointer; }
	.category-item .cat-icon { width: 104rpx; height: 104rpx; border-radius: 50%; background: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 48rpx; border: 5rpx solid transparent; transition: all 0.2s; }
	.category-item.selected .cat-icon { border-color: #E8734A; box-shadow: 0 2rpx 8rpx rgba(61, 35, 22, 0.04); }
	.category-item .cat-name { font-size: 24rpx; color: #7A5C4A; font-weight: 500; }
	.category-item.selected .cat-name { color: #3D2316; }

	.input-field { margin-bottom: 24rpx; }
	.note-input { width: 100%; padding: 24rpx 32rpx; background: #FFF5EE; border: 2rpx solid #F0E4DA; border-radius: 24rpx; font-size: 28rpx; color: #3D2316; box-sizing: border-box; }
	.note-input::-webkit-input-placeholder { color: #C8A896; }

	.form-row { display: flex; gap: 24rpx; }
	.form-item { flex: 1; display: flex; align-items: center; gap: 16rpx; padding: 24rpx 32rpx; background: #FFF5EE; border: 2rpx solid #F0E4DA; border-radius: 24rpx; font-size: 28rpx; color: #3D2316; cursor: pointer; }
	.form-icon { color: #A98B78; flex-shrink: 0; }
	.form-text { flex: 1; min-width: 0; }

	.custom-keypad { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; background: #FFFFFF; padding: 12rpx 16rpx calc(12rpx + env(safe-area-inset-bottom)); border-top: 2rpx solid #F0E4DA; flex-shrink: 0; box-sizing: border-box; z-index: 100; }
	.keypad-body { display: flex; gap: 12rpx; }
	.keypad-left { flex: 1; display: flex; flex-direction: column; gap: 12rpx; }
	.keypad-right { width: 140rpx; display: flex; flex-direction: column; gap: 12rpx; flex-shrink: 0; }
	.keypad-row { display: flex; gap: 12rpx; flex: 1; }
	.key { flex: 1; background: #F5EDE6; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #3D2316; font-weight: 500; transition: all 0.1s; user-select: none; }
	.key:active { background: #F0E4DA; transform: scale(0.96); }
	.key-del { background: #FDE6D4; color: #E8734A; }
	.key-del:active { background: #FBBE9E; }

	.action-btn { flex: 1; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.15s; user-select: none; }
	.action-btn:active { transform: scale(0.95); }
	.action-label { font-size: 26rpx; color: #FFFFFF; font-weight: 600; }
	.action-symbol { font-size: 44rpx; font-weight: 400; }
	.btn-again { background: linear-gradient(135deg, #FBBE9E, #F2956E); }
	.btn-add { background: #F5EDE6; }
	.btn-add .action-symbol { color: #E8734A; }
	.btn-add:active { background: #F0E4DA; }
	.btn-sub { background: #F5EDE6; }
	.btn-sub .action-symbol { color: #E8734A; }
	.btn-sub:active { background: #F0E4DA; }
	.btn-save { background: linear-gradient(135deg, #E8734A, #C95A33); box-shadow: 0 4rpx 16rpx rgba(232, 115, 74, 0.35); }
	.btn-save .action-label { color: #FFFFFF; font-size: 28rpx; }

	@media (min-width: 768px) {
		.record-scroll { max-width: 650px; margin: 0 auto; width: 100%; padding-left: 48rpx; padding-right: 48rpx; }
		.page-header { padding: 32rpx 48rpx; }
		.custom-keypad { max-width: 650px; margin: 0 auto; }
		.keypad-right { width: 160rpx; }
	}
</style>