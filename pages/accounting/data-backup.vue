<template>
	<view class="cosmic-page backup-page">
		<top-bar title="数据备份与恢复" show-back />

		<scroll-view scroll-y class="screen">
			<!-- 说明卡片 -->
			<view class="info-card">
				<view class="info-card__icon">
					<lucide-icon name="cloud" size="64rpx" />
				</view>
				<view class="info-card__text">
					<view class="info-card__title">上传到电脑</view>
					<view class="info-card__desc">将手机上的所有数据（账户、账单、预算、用户信息）上传到本地电脑保存</view>
				</view>
			</view>

			<!-- 服务器配置 -->
			<view class="section-title">电脑配置</view>
			<AccCard :padding="'0'" :margin="'0 24rpx 24rpx'">
				<view class="config-row">
					<view class="config-row__label">电脑 IP</view>
					<input
						v-model="serverIP"
						class="config-row__input"
						placeholder="例如 192.168.1.100"
						placeholder-class="form-ph"
					/>
				</view>
				<view class="config-row config-row--last">
					<view class="config-row__label">端口</view>
					<input
						v-model="serverPort"
						class="config-row__input"
						placeholder="默认 5800"
						placeholder-class="form-ph"
						type="number"
					/>
				</view>
			</AccCard>

			<!-- 数据概览 -->
			<view class="section-title">备份数据概览</view>
			<AccCard :padding="'0'" :margin="'0 24rpx 24rpx'">
				<view v-for="(item, idx) in dataSummary" :key="idx" class="stat-row" :class="{ 'stat-row--last': idx === dataSummary.length - 1 }">
					<view class="stat-row__icon">
						<lucide-icon :name="item.icon" size="36rpx" />
					</view>
					<view class="stat-row__info">
						<view class="stat-row__label">{{ item.label }}</view>
						<view class="stat-row__count">{{ item.count }}</view>
					</view>
				</view>
			</AccCard>

			<!-- 操作按钮 -->
			<view class="action-area">
				<button
					class="btn-upload"
					:class="{ 'btn-upload--loading': uploading }"
					:disabled="uploading || !serverIP.trim()"
					@click="onUpload"
				>
					<text v-if="!uploading">上传数据到电脑</text>
					<text v-else>上传中…</text>
				</button>
				<view v-if="uploadResult" class="upload-result" :class="uploadSuccess ? 'upload-result--ok' : 'upload-result--err'">
					<lucide-icon :name="uploadSuccess ? 'check-circle' : 'alert-circle'" size="32rpx" />
					<text>{{ uploadResult }}</text>
				</view>
			</view>

			<view class="bottom-spacer" />
		</scroll-view>
	</view>
</template>

<script>
import * as db from '@/common/db.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import AccCard from '@/components/accounting/AccCard.vue'

export default {
	components: { AccCard },
	data() {
		return {
			serverIP: '',
			serverPort: '5800',
			uploading: false,
			uploadResult: '',
			uploadSuccess: false
		}
	},
	computed: {
		allData() {
			return {
				accounts: db.getAccounts(),
				bills: db.getBills(),
				budgetTotal: db.getBudgetTotal(),
				budgetCats: db.getBudgetCats(),
				ledgers: db.getLedgers(),
				user: db.getUser(),
				backupTime: new Date().toISOString(),
				version: '1.0'
			}
		},
		dataSummary() {
			const d = this.allData
			return [
				{ icon: 'user', label: '用户信息', count: d.user ? '1 条' : '0 条' },
				{ icon: 'wallet', label: '账户', count: d.accounts.length + ' 个' },
				{ icon: 'receipt', label: '账单', count: d.bills.length + ' 条' },
				{ icon: 'bar-chart', label: '预算', count: d.budgetCats.length + ' 项' },
				{ icon: 'book-open', label: '账本', count: d.ledgers.length + ' 个' }
			]
		}
	},
	onShow() {
		applyThemeToPage(this)
	},
	methods: {
		onUpload() {
			const ip = this.serverIP.trim()
			if (!ip) {
				uni.showToast({ title: '请输入电脑 IP 地址', icon: 'none' })
				return
			}
			const port = this.serverPort || '5800'
			const url = `http://${ip}:${port}/backup`

			this.uploading = true
			this.uploadResult = ''
			this.uploadSuccess = false

			uni.request({
				url,
				method: 'POST',
				data: this.allData,
				header: { 'Content-Type': 'application/json' },
				timeout: 15000,
				success: (res) => {
					if (res.statusCode === 200) {
						this.uploadSuccess = true
						this.uploadResult = '备份成功！数据已保存到电脑'
					} else {
						this.uploadSuccess = false
						this.uploadResult = '服务器返回错误：' + (res.data?.message || res.statusCode)
					}
				},
				fail: (err) => {
					this.uploadSuccess = false
					if (err.errMsg && err.errMsg.includes('timeout')) {
						this.uploadResult = '连接超时，请检查 IP 和端口是否正确'
					} else if (err.errMsg && err.errMsg.includes('refused')) {
						this.uploadResult = '连接被拒绝，请确认电脑端服务已启动'
					} else {
						this.uploadResult = '连接失败：' + (err.errMsg || '未知错误')
					}
				},
				complete: () => {
					this.uploading = false
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.backup-page {
	height: 100vh;
	overflow: hidden;
	background: transparent;
}

.screen {
	padding-top: 192rpx;
	padding-bottom: 40rpx;
}

/* 说明卡片 */
.info-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin: 0 24rpx 32rpx;
	padding: 32rpx;
	background: linear-gradient(170deg, #FFFFFF, #F0F7FF, #F5F0FF);
	border: 1px solid rgba(255, 255, 255, 0.8);
	border-radius: 44rpx;
	box-shadow: 0 8rpx 32rpx rgba(91, 155, 224, 0.08);
	-webkit-backdrop-filter: blur(20px);
	backdrop-filter: blur(20px);
}

.info-card__icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: #FFFFFF;
	overflow: hidden;
}

.info-card__text {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.info-card__title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1A2744;
}

.info-card__desc {
	font-size: 24rpx;
	color: #5A6B8A;
	line-height: 1.5;
}

/* 区块标题 */
.section-title {
	margin: 0 24rpx 16rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #5A6B8A;
	letter-spacing: 0.5rpx;
}

/* 配置行 */
.config-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
	border-bottom: 1px solid rgba(200, 210, 230, 0.4);
	min-height: 88rpx;
}

.config-row--last {
	border-bottom: none;
}

.config-row__label {
	font-size: 30rpx;
	font-weight: 500;
	color: #1A2744;
	flex-shrink: 0;
	width: 120rpx;
}

.config-row__input {
	flex: 1;
	text-align: right;
	font-size: 30rpx;
	color: #1A2744;
	margin-left: 20rpx;
}

.form-ph {
	color: #8A9BB8;
}

/* 统计行 */
.stat-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 24rpx 32rpx;
	border-bottom: 1px solid rgba(200, 210, 230, 0.4);
}

.stat-row--last {
	border-bottom: none;
}

.stat-row__icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: rgba(91, 155, 224, 0.08);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: #5B9BE0;
}

.stat-row__info {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 0;
}

.stat-row__label {
	font-size: 28rpx;
	font-weight: 500;
	color: #1A2744;
}

.stat-row__count {
	font-size: 26rpx;
	color: #5A6B8A;
	font-weight: 500;
}

/* 操作区 */
.action-area {
	padding: 8rpx 24rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.btn-upload {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #6BA8D9, #4A7FB5);
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(91, 155, 224, 0.35);
	border: none;
	transition: opacity 0.2s ease;
}

.btn-upload::after {
	border: none;
}

.btn-upload[disabled] {
	opacity: 0.45;
	box-shadow: none;
}

.btn-upload--loading {
	opacity: 0.7;
}

.upload-result {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 24rpx;
	padding: 20rpx 28rpx;
	border-radius: 24rpx;
	font-size: 26rpx;
	width: 100%;
	box-sizing: border-box;
	justify-content: center;
}

.upload-result--ok {
	background: rgba(52, 199, 89, 0.08);
	color: #34C759;
}

.upload-result--err {
	background: rgba(255, 107, 107, 0.08);
	color: #FF6B6B;
}

.bottom-spacer {
	height: calc(40rpx + env(safe-area-inset-bottom));
}
</style>