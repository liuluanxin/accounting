<template>
	<view class="record-page">
		<view class="page-header">
			<view class="back-btn" @click="goBack">
				<view class="back-icon" :style="getIconStyle('arrow-left')"></view>
			</view>
			<text class="header-title">记一笔</text>
			<view class="camera-btn" @click="goPhotoRecord">
				<text class="camera-icon">📷</text>
			</view>
		</view>

		<scroll-view scroll-y class="record-scroll">
			<view class="type-toggle">
				<view class="type-btn" :class="{ active: recordType === 'expense' }" @click="setType('expense')">支出</view>
				<view class="type-btn" :class="{ active: recordType === 'income' }" @click="setType('income')">收入</view>
			</view>

			<view class="calc-hint" v-if="calcOperator">
				<text class="calc-hint-text">{{ calcPrevAmount }} {{ calcOperator === '+' ? '+' : '−' }}</text>
			</view>

			<view class="amount-row" @click="focusAmount">
				<text class="currency-sign">¥</text>
				<text class="amount-display" :class="{ placeholder: !amount }">{{ amountDisplay }}</text>
				<view class="amount-cursor" v-if="amountFocused"></view>
				<input class="amount-hidden-input" ref="amountHiddenInput" type="digit"
					:value="amount" @input="onHiddenInput" @blur="onHiddenBlur"
					:adjust-position="true" />
			</view>

			<view class="category-grid">
				<view v-for="cat in currentCategories" :key="cat" class="category-item" :class="{ selected: recordCat === cat }" @click="selectCat(cat)">
					<view class="cat-icon">{{ getCategoryEmoji(cat) }}</view>
					<text class="cat-name">{{ getCategoryName(cat) }}</text>
				</view>
			</view>
		</scroll-view>

		<view class="bottom-bar">
			<view class="input-field">
				<input class="note-input" v-model="note" placeholder="添加备注..." @focus="onNoteFocus" @blur="onNoteBlur" />
			</view>

			<view class="form-row">
				<view class="form-item" @click="toggleCalendar">
					<view class="form-icon" :style="getIconStyle('calendar')"></view>
					<text class="form-text">{{ displayDate }}</text>
				</view>
				<view class="form-item" @click="showAccountPicker">
					<view class="form-icon" :style="getIconStyle('credit-card')"></view>
					<text class="form-text">{{ selectedAccountName || '默认账户' }}</text>
				</view>
			</view>

			<!-- 日历悬浮面板 -->
			<view class="calendar-overlay" v-if="showCalendar" @click="toggleCalendar">
				<view class="calendar-panel" @click.stop>
					<view class="calendar-header">
						<view class="cal-nav" @click="prevMonth">‹</view>
						<text class="cal-title">{{ calendarYear }}年{{ calendarMonth }}月</text>
						<view class="cal-nav" @click="nextMonth">›</view>
					</view>
					<view class="calendar-weekdays">
						<text class="cal-weekday" v-for="d in weekDays" :key="d">{{ d }}</text>
					</view>
					<view class="calendar-days">
						<text class="cal-day cal-day-empty" v-for="n in calendarStartPad" :key="'pad-'+n"></text>
						<text v-for="day in calendarDaysInMonth" :key="day"
							class="cal-day"
							:class="{
								'cal-day-today': isToday(calendarYear, calendarMonth, day),
								'cal-day-selected': isSelected(calendarYear, calendarMonth, day)
							}"
							@click="selectDay(day)">{{ day }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="custom-keypad" v-if="showKeypad">
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
	import { todayStr, CAT_ICONS } from '@/common/accounting-utils.js'
	import Logger from '@/common/logger.js'
	import themeMixin from '@/common/theme-mixin.js'
<<<<<<< Updated upstream
	import ICONS from '@/common/icon-base64.js'
=======
	import { getIconStyle } from '@/common/icon-base64.js'
>>>>>>> Stashed changes

	export default {
		mixins: [themeMixin],
		data() {
			const now = new Date()
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
				calcOperator: '',
				calcPrevAmount: '',
				showCalendar: false,
				calendarYear: now.getFullYear(),
				calendarMonth: now.getMonth() + 1,
				showKeypad: true
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
			},
			weekDays() { return ['日','一','二','三','四','五','六'] },
			calendarDaysInMonth() {
				return new Date(this.calendarYear, this.calendarMonth, 0).getDate()
			},
			calendarStartPad() {
				const first = new Date(this.calendarYear, this.calendarMonth - 1, 1).getDay()
				return first
			}
		},
		onLoad() {
			if (this.initialized) this.loadFromStore()
			else {
				this.$store.dispatch('accounting/initialize').then(() => this.loadFromStore())
			}

		},
		methods: {
			getIconStyle(name) {
<<<<<<< Updated upstream
				const iconUri = ICONS[name] || ''
				return {
					'mask-image': 'url(' + iconUri + ')',
					'-webkit-mask-image': 'url(' + iconUri + ')'
				}
			},
			onKeyboardHeightChange(e) {
				this.keyboardHeight = (e && e.height) || 0
=======
				// 使用 common/icon-base64 的 background-image 方式渲染图标
				// 默认使用 text-primary 色
				return getIconStyle(name, '#1A2744')
>>>>>>> Stashed changes
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
			onNoteFocus() {
				this.showKeypad = false
			},
			onNoteBlur() {
				this.showKeypad = true
			},
			getCategoryName(cat) {
				if (!cat) return '其他'
				return cat
			},
			getCategoryEmoji(cat) {
				return CAT_ICONS[cat] || '📦'
			},
			onKeyboardPress(val) {
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
				this.$forceUpdate()
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
			async doSave() {
				if (this.calcOperator && this.calcPrevAmount && this.amount) {
					this.executeCalc()
				}
				if (!this.amount || parseFloat(this.amount) <= 0) { uni.showToast({ title: '请输入有效金额', icon: 'none' }); return false }
				if (!this.recordAccountId) { uni.showToast({ title: '请先添加账户', icon: 'none' }); return false }

				Logger.debug('Record', '保存账单', { recordDate: this.recordDate, amount: this.amount, type: this.recordType })

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
			toggleCalendar() {
				if (!this.showCalendar) {
					// 重置到当前选中月份
					const parts = this.recordDate.split('-')
					this.calendarYear = parseInt(parts[0])
					this.calendarMonth = parseInt(parts[1])
				}
				this.showCalendar = !this.showCalendar
			},
			prevMonth() {
				if (this.calendarMonth === 1) {
					this.calendarMonth = 12
					this.calendarYear--
				} else {
					this.calendarMonth--
				}
			},
			nextMonth() {
				if (this.calendarMonth === 12) {
					this.calendarMonth = 1
					this.calendarYear++
				} else {
					this.calendarMonth++
				}
			},
			selectDay(day) {
				const m = String(this.calendarMonth).padStart(2, '0')
				const d = String(day).padStart(2, '0')
				this.recordDate = `${this.calendarYear}-${m}-${d}`
				this.showCalendar = false
			},
			isToday(y, m, d) {
				const t = new Date()
				return y === t.getFullYear() && m === t.getMonth() + 1 && d === t.getDate()
			},
			isSelected(y, m, d) {
				const parts = this.recordDate.split('-')
				return y === parseInt(parts[0]) && m === parseInt(parts[1]) && d === parseInt(parts[2])
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
			goBack() { uni.navigateBack() },
			goPhotoRecord() { uni.navigateTo({ url: '/pages/accounting/photo-record' }) }
		}
	}
</script>

<style lang="scss" scoped>
	.record-page { height: 100vh; width: 100%; background: transparent; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }

	.page-header { display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 20rpx) 40rpx 16rpx; background: transparent; flex-shrink: 0; width: 100%; box-sizing: border-box; }
	.back-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: var(--border, #F5EDE6); display: flex; align-items: center; justify-content: center; color: var(--text-secondary, #5A6B8A); flex-shrink: 0; }
	.back-icon { width: 36rpx; height: 36rpx; background-color: currentColor; mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.header-title { font-size: 36rpx; font-weight: 600; color: var(--text-primary, #1A2744); }
	.camera-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: var(--border, #F5EDE6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	.camera-icon { font-size: 36rpx; }

	.record-scroll { flex: 1; width: 100%; padding: 0 40rpx; overflow-y: auto; padding-bottom: 24rpx; box-sizing: border-box; }

	.type-toggle { display: flex; gap: 16rpx; background: var(--border, #F5EDE6); border-radius: 50rpx; padding: 6rpx; margin-bottom: 48rpx; }
	.type-btn { flex: 1; text-align: center; padding: 20rpx 0; border-radius: 44rpx; font-size: 28rpx; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text-secondary, #5A6B8A); }
	.type-btn.active { background: var(--primary, #5B9BE0); color: #FFFFFF; box-shadow: 0 4rpx 8rpx var(--primary-shadow, rgba(91, 155, 224, 0.2)); }

	.amount-row { display: flex; align-items: center; justify-content: center; gap: 8rpx; margin-bottom: 48rpx; padding: 12rpx 0; position: relative; }
	.calc-hint { text-align: center; margin-bottom: 0; margin-top: 16rpx; }
	.calc-hint-text { font-size: 28rpx; color: var(--text-tertiary, #8A9BB8); font-weight: 500; }
	.currency-sign { font-size: 48rpx; font-weight: 700; color: var(--text-primary, #1A2744); opacity: 0.6; margin-top: 8rpx; }
	.amount-display { display: inline-flex; align-items: center; font-size: 72rpx; font-weight: 700; color: var(--text-primary, #1A2744); letter-spacing: -2rpx; min-width: 200rpx; text-align: center; justify-content: center; }
	.amount-display.placeholder { color: #C8A896; font-weight: 400; }
	.amount-cursor { width: 4rpx; height: 56rpx; background: var(--primary, #5B9BE0); animation: blink 1s step-end infinite; margin-left: 4rpx; flex-shrink: 0; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	.amount-hidden-input { position: absolute; left: -9999px; top: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

	.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24rpx 16rpx; margin-bottom: 40rpx; }
	.category-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; cursor: pointer; }
	.category-item .cat-icon { width: 104rpx; height: 104rpx; border-radius: 50%; background: var(--card-bg, #FFFFFF); display: flex; align-items: center; justify-content: center; font-size: 48rpx; border: 5rpx solid transparent; transition: all 0.2s; }
	.category-item.selected .cat-icon { border-color: var(--primary, #5B9BE0); box-shadow: 0 2rpx 8rpx rgba(91, 155, 224, 0.04); }
	.category-item .cat-name { font-size: 24rpx; color: var(--text-secondary, #5A6B8A); font-weight: 500; }
	.category-item.selected .cat-name { color: var(--text-primary, #1A2744); }

	.input-field { margin-bottom: 24rpx; }
	.note-input { width: 100%; padding: 24rpx 32rpx; background: var(--card-bg, #FFFFFF); border: 2rpx solid var(--border, #E8F0FE); border-radius: 24rpx; font-size: 28rpx; color: var(--text-primary, #1A2744); box-sizing: border-box; }
	.note-input::-webkit-input-placeholder { color: #C8A896; }

	.form-row { display: flex; gap: 24rpx; }
	.form-item { flex: 1; display: flex; align-items: center; gap: 16rpx; padding: 24rpx 32rpx; background: var(--card-bg, #FFFFFF); border: 2rpx solid var(--border, #E8F0FE); border-radius: 24rpx; font-size: 28rpx; color: var(--text-primary, #1A2744); cursor: pointer; }
	.form-icon { width: 32rpx; height: 32rpx; background-color: var(--text-tertiary, #8A9BB8); flex-shrink: 0; mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; }
	.form-text { flex: 1; min-width: 0; }

	.bottom-bar { flex-shrink: 0; background: var(--bg, #EFF5FF); padding: 0 40rpx 16rpx; border-top: 2rpx solid var(--border, #E8F0FE); border-bottom: 1rpx solid var(--border, #E8F0FE); box-sizing: border-box; }
	.bottom-bar .input-field { margin-bottom: 16rpx; }
	.bottom-bar .form-row { gap: 16rpx; }
	.bottom-bar .form-item { padding: 20rpx 28rpx; font-size: 26rpx; }
	.bottom-bar .note-input { padding: 20rpx 28rpx; font-size: 26rpx; }

	/* ===== 日历悬浮面板 ===== */
	.calendar-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 200; }
	.calendar-panel { width: 580rpx; background: var(--card-bg, #FFFFFF); border-radius: 24rpx; box-shadow: 0 8rpx 40rpx rgba(91,155,224,0.15); overflow: hidden; padding: 24rpx; }
	.calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
	.cal-nav { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--border, #F5EDE6); display: flex; align-items: center; justify-content: center; font-size: 44rpx; color: var(--text-secondary, #5A6B8A); cursor: pointer; user-select: none; }
	.cal-nav:active { background: #E8F0FE; }
	.cal-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary, #1A2744); }
	.calendar-weekdays { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 12rpx; }
	.cal-weekday { text-align: center; font-size: 24rpx; color: var(--text-tertiary, #8A9BB8); padding: 8rpx 0; font-weight: 500; }
	.calendar-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 4rpx; }
	.cal-day { text-align: center; padding: 16rpx 0; font-size: 28rpx; color: var(--text-primary, #1A2744); border-radius: 50%; cursor: pointer; user-select: none; transition: all 0.1s; }
	.cal-day:active { background: var(--border, #F5EDE6); }
	.cal-day-empty { cursor: default; }
	.cal-day-today { background: var(--border, #F5EDE6); font-weight: 600; color: var(--primary, #5B9BE0); }
	.cal-day-selected { background: var(--primary, #5B9BE0); color: #FFFFFF; font-weight: 600; }
	.cal-day-selected:active { background: #4A7FC0; }

	.custom-keypad { width: 100%; background: var(--card-bg, #FFFFFF); padding: 0 0 calc(env(safe-area-inset-bottom)); border-top: 0; flex-shrink: 0; box-sizing: border-box; }
	.keypad-body { display: flex; gap: 0; }
	.keypad-left { flex: 1; display: flex; flex-direction: column; gap: 0; }
	.keypad-right { width: 140rpx; display: flex; flex-direction: column; gap: 0; flex-shrink: 0; }
	.keypad-row { display: flex; gap: 0; flex: 1; }
	.key { flex: 1; background: var(--border, #F5EDE6); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: var(--text-primary, #1A2744); font-weight: 500; transition: all 0.1s; user-select: none; min-height: 100rpx; }
	.key:active { background: #E8F0FE; }
	.key-del { background: rgba(91, 155, 224, 0.1); color: var(--primary, #5B9BE0); }
	.key-del:active { background: rgba(91, 155, 224, 0.2); }

	.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.15s; user-select: none; min-height: 100rpx; }
	.action-btn:active { opacity: 0.8; }
	.action-label { font-size: 26rpx; color: #FFFFFF; font-weight: 600; }
	.action-symbol { font-size: 44rpx; font-weight: 400; }
	.btn-again { background: linear-gradient(135deg, rgba(91, 155, 224, 0.4), rgba(91, 155, 224, 0.6)); }
	.btn-add { background: var(--border, #F5EDE6); }
	.btn-add .action-symbol { color: var(--primary, #5B9BE0); }
	.btn-add:active { background: #E8F0FE; }
	.btn-sub { background: var(--border, #F5EDE6); }
	.btn-sub .action-symbol { color: var(--primary, #5B9BE0); }
	.btn-sub:active { background: #E8F0FE; }
	.btn-save { background: linear-gradient(135deg, var(--primary, #5B9BE0), #4A7FC0); box-shadow: 0 4rpx 16rpx var(--primary-shadow, rgba(91, 155, 224, 0.35)); }
	.btn-save .action-label { color: #FFFFFF; font-size: 28rpx; }

	@media (min-width: 768px) {
		.record-scroll { max-width: 650px; margin: 0 auto; width: 100%; padding-left: 48rpx; padding-right: 48rpx; }
		.page-header { padding: 32rpx 48rpx; }
		.bottom-bar { max-width: 650px; margin: 0 auto; padding-left: 48rpx; padding-right: 48rpx; }
		.custom-keypad { max-width: 650px; margin: 0 auto; padding: 0 0 calc(env(safe-area-inset-bottom)); }
		.keypad-right { width: 160rpx; }
		.key { min-height: 110rpx; font-size: 44rpx; }
		.action-btn { min-height: 110rpx; font-size: 30rpx; }
	}
</style>