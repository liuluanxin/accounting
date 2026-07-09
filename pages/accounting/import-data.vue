<template>
	<view class="import-data-page">
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="nav-title">数据导入</text>
			<view class="nav-placeholder"></view>
		</view>

		<scroll-view scroll-y class="scroll">
			<view class="section-desc">
				<text>支持从多种平台导入账单数据，快速迁移到宇宙记账</text>
			</view>

			<view class="import-list">
				<view class="import-card" :class="{ active: selectedType === 'alipay' }" @click="selectImportType('alipay')">
					<view class="import-icon-wrap alipay">
						<view class="import-icon alipay">支</view>
					</view>
					<view class="import-info">
						<text class="import-name">支付宝</text>
						<text class="import-desc">导入支付宝账单明细</text>
					</view>
					<view class="import-check" v-if="selectedType === 'alipay'">✓</view>
					<view class="import-arrow" v-else :style="getIconStyle('arrow-right')"></view>
				</view>

				<view class="import-card" :class="{ active: selectedType === 'wechat' }" @click="selectImportType('wechat')">
					<view class="import-icon-wrap wechat">
						<view class="import-icon wechat">微</view>
					</view>
					<view class="import-info">
						<text class="import-name">微信</text>
						<text class="import-desc">导入微信支付账单</text>
					</view>
					<view class="import-check" v-if="selectedType === 'wechat'">✓</view>
					<view class="import-arrow" v-else :style="getIconStyle('arrow-right')"></view>
				</view>

				<view class="import-card" :class="{ active: selectedType === 'bank' }" @click="selectImportType('bank')">
					<view class="import-icon-wrap bank">
						<view class="import-icon bank">银</view>
					</view>
					<view class="import-info">
						<text class="import-name">银行App</text>
						<text class="import-desc">导入银行卡交易流水</text>
					</view>
					<view class="import-check" v-if="selectedType === 'bank'">✓</view>
					<view class="import-arrow" v-else :style="getIconStyle('arrow-right')"></view>
				</view>

				<view class="import-card" :class="{ active: selectedType === 'other' }" @click="selectImportType('other')">
					<view class="import-icon-wrap other">
						<view class="import-icon other">记</view>
					</view>
					<view class="import-info">
						<text class="import-name">其他记账App</text>
						<text class="import-desc">导入随手记/鲨鱼记账等导出的CSV</text>
					</view>
					<view class="import-check" v-if="selectedType === 'other'">✓</view>
					<view class="import-arrow" v-else :style="getIconStyle('arrow-right')"></view>
				</view>
			</view>

			<view v-if="selectedType" class="import-panel">
				<view class="panel-header">
					<text class="panel-title">{{ currentTypeInfo.name }}数据导入</text>
				</view>

				<view class="step-tip">
					<text class="step-icon">📋</text>
					<view class="step-content">
						<text class="step-title">操作步骤</text>
						<text class="step-desc">{{ currentTypeInfo.steps }}</text>
					</view>
				</view>

				<view class="file-area">
					<view class="file-drop" @click="chooseFile">
						<view class="file-icon-wrap">
							<text class="file-icon">📄</text>
						</view>
						<view class="file-text">
							<text class="file-title">选择账单文件</text>
							<text class="file-desc">支持 {{ currentTypeInfo.formats }} 格式，点击上传</text>
						</view>
						<view class="file-btn">
							<text class="file-btn-text">选择文件</text>
						</view>
					</view>
					<view v-if="selectedFile" class="file-selected">
						<view class="selected-icon">✅</view>
						<view class="selected-info">
							<text class="selected-name">{{ selectedFile.name }}</text>
							<text class="selected-size">{{ formatFileSize(selectedFile.size) }} · 已就绪</text>
						</view>
						<view class="clear-btn" @click="clearFile">
							<text>重新选择</text>
						</view>
					</view>
				</view>

				<view class="import-options">
					<view class="option-item">
						<text class="option-label">导入到账户</text>
						<picker mode="selector" :range="accountNames" @change="onAccountChange">
							<view class="option-value">
								<text>{{ selectedAccount || '请选择账户' }}</text>
								<view class="option-arrow" :style="getIconStyle('arrow-down')"></view>
							</view>
						</picker>
					</view>
					<view class="option-item">
						<text class="option-label">跳过重复记录</text>
						<switch :checked="skipDuplicate" color="#E8734A" @change="onSkipDuplicateChange" />
					</view>
				</view>

				<view v-if="previewData.length > 0" class="preview-section">
					<view class="preview-header">
						<text class="preview-title">数据预览</text>
						<text class="preview-count">共 {{ importStats.total }} 条</text>
					</view>
					<view class="preview-table">
						<view class="preview-row header">
							<text class="preview-col date">日期</text>
							<text class="preview-col type">类型</text>
							<text class="preview-col amount">金额</text>
							<text class="preview-col category">分类</text>
						</view>
						<view v-for="(item, idx) in previewData" :key="idx" class="preview-row">
							<text class="preview-col date">{{ item.date }}</text>
							<text class="preview-col type" :class="item.type">{{ item.type === 'income' ? '收入' : '支出' }}</text>
							<text class="preview-col amount" :class="item.type">{{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}</text>
							<text class="preview-col category">{{ item.category }}</text>
						</view>
					</view>
					<view v-if="importStats.duplicate > 0" class="duplicate-tip">
						<text>⚠️ 检测到 {{ importStats.duplicate }} 条重复记录，将被跳过</text>
					</view>
				</view>

				<view class="action-buttons">
					<view class="btn-secondary" @click="resetImport">
						<text class="btn-secondary-text">重置</text>
					</view>
					<view class="btn-primary" :class="{ disabled: !selectedFile || !selectedAccount || importing, loading: importing }" @click="startImport">
						<text v-if="importing" class="btn-primary-text">导入中...</text>
						<text v-else class="btn-primary-text">开始导入</text>
						<text v-if="!importing && importStats.total > 0" class="btn-primary-badge">{{ importStats.total }}条</text>
					</view>
				</view>
			</view>

			<view class="tip">
				<text class="tip-icon">💡</text>
				<text class="tip-text">导入数据不会覆盖现有数据，请放心操作。如遇问题请联系客服。</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { mapState } from 'vuex'
import themeMixin from '@/common/theme-mixin.js'
import ICONS from '@/common/icon-base64.js'

const TYPE_CONFIG = {
	alipay: {
		name: '支付宝',
		formats: 'CSV',
		steps: '1. 打开支付宝App → 我的 → 账单\n2. 点击右上角「...」→ 开具交易流水证明\n3. 选择「用于个人对账」，导出CSV文件\n4. 将文件发送到手机并选择导入'
	},
	wechat: {
		name: '微信',
		formats: 'CSV',
		steps: '1. 打开微信 → 我 → 服务 → 钱包\n2. 点击右上角「账单」→ 常见问题\n3. 下载账单 → 用于个人对账\n4. 选择时间范围，导出后发送到手机'
	},
	bank: {
		name: '银行App',
		formats: 'CSV / Excel',
		steps: '1. 打开对应银行App\n2. 找到交易明细/账单页面\n3. 选择导出账单，选择CSV或Excel格式\n4. 将导出的文件导入本App'
	},
	other: {
		name: '其他记账App',
		formats: 'CSV',
		steps: '1. 打开原记账App，找到数据导出功能\n2. 导出CSV格式的账单数据\n3. 将导出文件发送到手机\n4. 选择文件进行导入'
	}
}

export default {
	mixins: [themeMixin],
	computed: {
		...mapState('accounting', ['data']),
		accountNames() {
			return this.data.accounts.map(a => a.name)
		},
		currentTypeInfo() {
			return TYPE_CONFIG[this.selectedType] || TYPE_CONFIG.other
		},
		previewData() {
			return this.parsedData.slice(0, 5)
		}
	},
	data() {
		return {
			selectedType: '',
			selectedFile: null,
			selectedAccount: '',
			selectedAccountId: '',
			skipDuplicate: true,
			parsedData: [],
			importing: false,
			importStats: {
				total: 0,
				success: 0,
				duplicate: 0,
				failed: 0
			}
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
		selectImportType(type) {
			this.selectedType = type
			this.resetImport()
		},
		chooseFile() {
			// #ifdef H5
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = '.csv,.xlsx,.xls'
			input.onchange = (e) => {
				const file = e.target.files[0]
				if (file) {
					this.selectedFile = { name: file.name, size: file.size, file }
					this.parseFile(file)
				}
			}
			input.click()
			// #endif
			// #ifndef H5
			uni.chooseFile({
				count: 1,
				extension: ['.csv', '.xlsx', '.xls'],
				success: (res) => {
					const file = res.tempFiles[0]
					this.selectedFile = { name: file.name, size: file.size, path: file.path }
					this.parseFile(file)
				},
				fail: () => {
					uni.showToast({ title: '选择文件失败', icon: 'none' })
				}
			})
			// #endif
		},
		parseFile(file) {
			uni.showLoading({ title: '解析中...' })
			
			// #ifdef H5
			const reader = new FileReader()
			reader.onload = (e) => {
				const content = e.target.result
				this.parseCSV(content)
				uni.hideLoading()
			}
			reader.onerror = () => {
				uni.hideLoading()
				uni.showToast({ title: '文件读取失败', icon: 'none' })
			}
			reader.readAsText(file, 'UTF-8')
			// #endif
			
			// #ifndef H5
			// 小程序/App端模拟解析
			setTimeout(() => {
				this.mockParseData()
				uni.hideLoading()
			}, 800)
			// #endif
		},
		parseCSV(content) {
			const lines = content.split('\n').filter(line => line.trim())
			if (lines.length < 2) {
				uni.showToast({ title: '文件内容为空', icon: 'none' })
				return
			}
			
			const result = []
			let startIdx = 0
			
			// 支付宝和微信的CSV通常有几行说明文字，需要找到表头
			for (let i = 0; i < Math.min(lines.length, 10); i++) {
				const line = lines[i]
				if (line.includes('交易时间') || line.includes('日期') || line.includes('交易日期')) {
					startIdx = i
					break
				}
			}
			
			const headers = this.parseCSVLine(lines[startIdx])
			
			for (let i = startIdx + 1; i < lines.length; i++) {
				const values = this.parseCSVLine(lines[i])
				if (values.length < 3) continue
				
				const record = this.mapToRecord(headers, values)
				if (record && record.amount > 0) {
					result.push(record)
				}
			}
			
			this.parsedData = result
			this.importStats.total = result.length
			this.checkDuplicates()
		},
		parseCSVLine(line) {
			const result = []
			let current = ''
			let inQuotes = false
			
			for (let i = 0; i < line.length; i++) {
				const char = line[i]
				if (char === '"') {
					inQuotes = !inQuotes
				} else if (char === ',' && !inQuotes) {
					result.push(current.trim())
					current = ''
				} else {
					current += char
				}
			}
			result.push(current.trim())
			return result
		},
		mapToRecord(headers, values) {
			const record = {
				date: '',
				time: '',
				type: 'expense',
				amount: 0,
				category: '其他',
				note: ''
			}
			
			headers.forEach((header, idx) => {
				const val = values[idx] || ''
				
				if (header.includes('交易时间') || header.includes('日期') || header.includes('交易日期')) {
					const dt = this.parseDate(val)
					record.date = dt.date
					record.time = dt.time
				}
				if (header.includes('金额') || header.includes('交易金额') || header.includes('金额(元)')) {
					record.amount = Math.abs(parseFloat(val.replace(/[^\d.-]/g, '')) || 0)
				}
				if (header.includes('收/支') || header.includes('收支') || header.includes('类型')) {
					if (val.includes('收入')) record.type = 'income'
					else if (val.includes('支出')) record.type = 'expense'
				}
				if (header.includes('交易分类') || header.includes('分类') || header.includes('商品')) {
					if (val) record.category = val
				}
				if (header.includes('备注') || header.includes('说明') || header.includes('交易说明')) {
					record.note = val
				}
			})
			
			if (!record.date) {
				const today = new Date()
				record.date = today.toISOString().slice(0, 10)
				record.time = today.toTimeString().slice(0, 5)
			}
			
			return record
		},
		parseDate(dateStr) {
			const result = { date: '', time: '00:00' }
			
			// 尝试匹配多种日期格式
			const patterns = [
				/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日\s]*(\d{1,2})?:?(\d{1,2})?/,
				/(\d{4})(\d{2})(\d{2})\s*(\d{2})?(\d{2})?/
			]
			
			for (const pattern of patterns) {
				const match = dateStr.match(pattern)
				if (match) {
					result.date = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`
					if (match[4]) {
						result.time = `${String(match[4]).padStart(2, '0')}:${match[5] || '00'}`
					}
					break
				}
			}
			
			return result
		},
		mockParseData() {
			const mockData = []
			const categories = ['餐饮', '交通', '购物', '娱乐', '工资', '转账']
			const types = ['expense', 'expense', 'expense', 'expense', 'income', 'expense']
			
			for (let i = 0; i < 20; i++) {
				const typeIdx = i % 6
				const d = new Date()
				d.setDate(d.getDate() - i)
				mockData.push({
					date: d.toISOString().slice(0, 10),
					time: `${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
					type: types[typeIdx],
					amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
					category: categories[typeIdx],
					note: `示例交易${i + 1}`
				})
			}
			
			this.parsedData = mockData
			this.importStats.total = mockData.length
			this.checkDuplicates()
		},
		checkDuplicates() {
			if (!this.skipDuplicate) {
				this.importStats.duplicate = 0
				return
			}
			
			const existingKeys = new Set(
				this.data.transactions.map(t => `${t.date}_${t.amount}_${t.type}`)
			)
			
			let dupCount = 0
			this.parsedData.forEach(item => {
				const key = `${item.date}_${item.amount}_${item.type}`
				if (existingKeys.has(key)) dupCount++
			})
			
			this.importStats.duplicate = dupCount
		},
		onAccountChange(e) {
			const idx = e.detail.value
			this.selectedAccount = this.accountNames[idx]
			this.selectedAccountId = this.data.accounts[idx].id
		},
		onSkipDuplicateChange(e) {
			this.skipDuplicate = e.detail.value
			this.checkDuplicates()
		},
		clearFile() {
			this.selectedFile = null
			this.parsedData = []
			this.importStats = { total: 0, success: 0, duplicate: 0, failed: 0 }
		},
		async startImport() {
			if (!this.selectedAccountId) {
				uni.showToast({ title: '请先选择账户', icon: 'none' })
				return
			}
			if (this.parsedData.length === 0) {
				uni.showToast({ title: '没有可导入的数据', icon: 'none' })
				return
			}
			
			this.importing = true
			uni.showLoading({ title: '导入中...' })
			
			let successCount = 0
			let failCount = 0
			
			const existingKeys = this.skipDuplicate 
				? new Set(this.data.transactions.map(t => `${t.date}_${t.amount}_${t.type}`))
				: new Set()
			
			for (const item of this.parsedData) {
				try {
					const key = `${item.date}_${item.amount}_${item.type}`
					if (this.skipDuplicate && existingKeys.has(key)) {
						continue
					}
					
					const newTx = {
						id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
						date: item.date,
						time: item.time || '00:00',
						type: item.type,
						category: item.category || (item.type === 'income' ? '其他收入' : '其他支出'),
						amount: item.amount,
						accountId: this.selectedAccountId,
						note: item.note || '',
						createdAt: new Date().toISOString()
					}
					
					this.$store.commit('accounting/addTransaction', newTx)
					successCount++
					
					if (this.skipDuplicate) {
						existingKeys.add(key)
					}
				} catch (e) {
					failCount++
				}
			}
			
			this.importStats.success = successCount
			this.importStats.failed = failCount
			
			uni.hideLoading()
			this.importing = false
			
			uni.showModal({
				title: '导入完成',
				content: `成功导入：${successCount} 条\n重复跳过：${this.importStats.duplicate} 条\n失败：${failCount} 条`,
				showCancel: false,
				success: () => {
					this.$store.dispatch('accounting/saveData')
				}
			})
		},
		resetImport() {
			this.selectedFile = null
			this.selectedAccount = ''
			this.selectedAccountId = ''
			this.parsedData = []
			this.importStats = { total: 0, success: 0, duplicate: 0, failed: 0 }
		},
		formatFileSize(bytes) {
			if (bytes < 1024) return bytes + ' B'
			if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
			return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
		}
	}
}
</script>

<style lang="scss" scoped>
.import-data-page { height: 100vh; background: var(--bg, #FFF9F5); display: flex; flex-direction: column; width: 100%; box-sizing: border-box; overflow-x: hidden; }

.nav-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: calc(var(--status-bar-height) + 16rpx) 24rpx 16rpx; background: var(--bg, #FFF9F5); width: 100%; box-sizing: border-box; }
.nav-back { width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 56rpx; color: var(--text-primary, #3D2316); }
.back-icon { font-weight: 300; }
.nav-title { flex: 1; text-align: center; font-size: 34rpx; font-weight: 700; color: var(--text-primary, #3D2316); }
.nav-placeholder { width: 64rpx; }

.scroll { flex: 1; padding: calc(var(--status-bar-height) + 120rpx) 32rpx 80rpx; width: 100%; box-sizing: border-box; }

.section-desc { padding: 8rpx 0 32rpx; font-size: 24rpx; color: var(--text-secondary, #7A5C4A); text-align: center; }

.import-list { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 32rpx; }

.import-card { display: flex; align-items: center; padding: 28rpx 32rpx; background: var(--card-bg, #fff); border-radius: 24rpx; box-shadow: 0 2rpx 12rpx rgba(61, 35, 22, 0.06); border: 3rpx solid transparent; transition: all 0.25s ease; position: relative; overflow: hidden; }
.import-card:active { transform: scale(0.98); }
.import-card.active { border-color: var(--primary, #E8734A); box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.18); background: linear-gradient(135deg, var(--card-bg, #fff) 0%, rgba(232, 115, 74, 0.04) 100%); }

.import-icon-wrap { position: relative; margin-right: 24rpx; }
.import-icon { width: 80rpx; height: 80rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; font-weight: 700; color: #fff; }
.import-icon.alipay { background: linear-gradient(135deg, #1677FF 0%, #4096FF 100%); box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3); }
.import-icon.wechat { background: linear-gradient(135deg, #07C160 0%, #34D399 100%); box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3); }
.import-icon.bank { background: linear-gradient(135deg, #E8734A 0%, #F2956E 100%); box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.3); }
.import-icon.other { background: linear-gradient(135deg, #9B59B6 0%, #BB6BD9 100%); box-shadow: 0 4rpx 12rpx rgba(155, 89, 182, 0.3); }

.import-info { flex: 1; min-width: 0; }
.import-name { font-size: 30rpx; font-weight: 600; color: var(--text-primary, #3D2316); display: block; }
.import-desc { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); margin-top: 6rpx; display: block; }

.import-check { width: 40rpx; height: 40rpx; line-height: 40rpx; text-align: center; border-radius: 50%; background: var(--primary, #E8734A); color: #fff; font-size: 24rpx; font-weight: 700; flex-shrink: 0; }

.import-arrow {
	flex-shrink: 0;
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

.import-panel { background: var(--card-bg, #fff); border-radius: 24rpx; padding: 32rpx; box-shadow: 0 2rpx 12rpx rgba(61, 35, 22, 0.06); margin-bottom: 32rpx; }

.panel-header { margin-bottom: 24rpx; }
.panel-title { font-size: 32rpx; font-weight: 700; color: var(--text-primary, #3D2316); }

.step-tip { display: flex; gap: 20rpx; padding: 24rpx; background: var(--bg, #FFF9F5); border-radius: 16rpx; margin-bottom: 28rpx; }
.step-icon { font-size: 36rpx; flex-shrink: 0; }
.step-content { flex: 1; min-width: 0; }
.step-title { font-size: 26rpx; font-weight: 600; color: var(--text-primary, #3D2316); display: block; margin-bottom: 8rpx; }
.step-desc { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); line-height: 1.6; white-space: pre-line; }

.file-area { margin-bottom: 28rpx; }

.file-drop { display: flex; align-items: center; padding: 32rpx 28rpx; background: linear-gradient(135deg, var(--card-bg, #fff) 0%, var(--bg, #FFF9F5) 100%); border: 2rpx dashed var(--border, #E8D5C4); border-radius: 20rpx; transition: all 0.25s ease; }
.file-drop:active { transform: scale(0.98); border-color: var(--primary, #E8734A); background: linear-gradient(135deg, #FFF5F0 0%, var(--bg, #FFF9F5) 100%); }

.file-icon-wrap { width: 80rpx; height: 80rpx; border-radius: 20rpx; background: linear-gradient(135deg, rgba(232, 115, 74, 0.12) 0%, rgba(232, 115, 74, 0.06) 100%); display: flex; align-items: center; justify-content: center; margin-right: 24rpx; flex-shrink: 0; }
.file-icon { font-size: 40rpx; }

.file-text { flex: 1; min-width: 0; }
.file-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary, #3D2316); display: block; margin-bottom: 6rpx; }
.file-desc { font-size: 22rpx; color: var(--text-secondary, #7A5C4A); display: block; }

.file-btn { flex-shrink: 0; padding: 16rpx 28rpx; background: var(--primary, #E8734A); border-radius: 40rpx; box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.3); }
.file-btn-text { font-size: 24rpx; font-weight: 600; color: #fff; }

.file-selected { display: flex; align-items: center; padding: 24rpx 28rpx; background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.03) 100%); border: 2rpx solid rgba(76, 175, 80, 0.2); border-radius: 20rpx; margin-top: 16rpx; }
.selected-icon { font-size: 36rpx; margin-right: 20rpx; flex-shrink: 0; }
.selected-info { flex: 1; min-width: 0; }
.selected-name { font-size: 26rpx; font-weight: 600; color: var(--text-primary, #3D2316); display: block; margin-bottom: 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-size { font-size: 22rpx; color: var(--income, #4CAF50); display: block; }
.clear-btn { flex-shrink: 0; padding: 12rpx 24rpx; background: var(--card-bg, #fff); border: 1px solid var(--border, #E8D5C4); border-radius: 32rpx; }
.clear-btn text { font-size: 22rpx; color: var(--text-secondary, #7A5C4A); }

.import-options { margin-bottom: 28rpx; }
.option-item { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 0; border-bottom: 1px solid var(--border, #F0E4DA); }
.option-item:last-child { border-bottom: none; }
.option-label { font-size: 28rpx; color: var(--text-primary, #3D2316); }
.option-value { display: flex; align-items: center; gap: 8rpx; }
.option-value text { font-size: 26rpx; color: var(--text-secondary, #7A5C4A); }
.option-arrow {
	width: 24rpx;
	height: 24rpx;
	background-color: var(--text-tertiary, #C8A896);
	mask-size: contain;
	mask-repeat: no-repeat;
	mask-position: center;
	-webkit-mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
}

.preview-section { margin-bottom: 28rpx; }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.preview-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary, #3D2316); }
.preview-count { font-size: 22rpx; color: var(--text-secondary, #7A5C4A); }

.preview-table { border: 1px solid var(--border, #F0E4DA); border-radius: 12rpx; overflow: hidden; }
.preview-row { display: flex; padding: 16rpx 12rpx; border-bottom: 1px solid var(--border, #F0E4DA); }
.preview-row:last-child { border-bottom: none; }
.preview-row.header { background: var(--bg, #FFF9F5); font-weight: 600; }
.preview-col { font-size: 22rpx; color: var(--text-primary, #3D2316); }
.preview-col.date { flex: 2; }
.preview-col.type { flex: 1; text-align: center; }
.preview-col.amount { flex: 2; text-align: right; font-weight: 600; }
.preview-col.category { flex: 2; text-align: right; }
.preview-col.income { color: var(--income, #4CAF50); }
.preview-col.expense { color: var(--primary, #E8734A); }

.duplicate-tip { margin-top: 12rpx; padding: 12rpx 16rpx; background: rgba(255, 152, 0, 0.1); border-radius: 8rpx; }
.duplicate-tip text { font-size: 22rpx; color: #FF9800; }

.action-buttons { display: flex; gap: 20rpx; align-items: center; }

.btn-primary { flex: 2; height: 96rpx; display: flex; align-items: center; justify-content: center; position: relative; background: linear-gradient(135deg, var(--primary, #E8734A) 0%, #F2956E 100%); border-radius: 48rpx; box-shadow: 0 8rpx 24rpx rgba(232, 115, 74, 0.35); transition: all 0.25s ease; }
.btn-primary:active { transform: scale(0.96); box-shadow: 0 4rpx 12rpx rgba(232, 115, 74, 0.25); }
.btn-primary.disabled { opacity: 0.5; box-shadow: none; }
.btn-primary.disabled:active { transform: none; }
.btn-primary.loading { opacity: 0.8; }
.btn-primary-text { font-size: 30rpx; font-weight: 600; color: #fff; }
.btn-primary-badge { margin-left: 12rpx; padding: 4rpx 16rpx; background: rgba(255, 255, 255, 0.25); border-radius: 20rpx; font-size: 22rpx; font-weight: 600; color: #fff; }

.btn-secondary { flex: 1; height: 96rpx; display: flex; align-items: center; justify-content: center; background: var(--card-bg, #fff); border: 2rpx solid var(--border, #E8D5C4); border-radius: 48rpx; transition: all 0.25s ease; }
.btn-secondary:active { transform: scale(0.96); background: var(--bg, #FFF9F5); }
.btn-secondary-text { font-size: 30rpx; font-weight: 500; color: var(--text-secondary, #7A5C4A); }

.tip { display: flex; align-items: flex-start; gap: 12rpx; padding: 20rpx 24rpx; background: var(--card-bg, #fff); border-radius: 16rpx; border: 1px solid var(--border, #F0E4DA); }
.tip-icon { font-size: 28rpx; flex-shrink: 0; }
.tip-text { font-size: 24rpx; color: var(--text-secondary, #7A5C4A); flex: 1; line-height: 1.5; }
</style>
