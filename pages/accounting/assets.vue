<template>
	<view class="cosmic-page assets-page">
		<top-bar title="资产" />

		<scroll-view scroll-y class="screen screen--pb">
			<!-- 净资产卡片 -->
			<view class="card net-card">
				<text class="muted">净资产</text>
				<text class="net">{{ fmt(netAssets) }}</text>
				<view class="acc-list">
					<view
						v-for="(acc, i) in accounts"
						:key="i"
						class="acc-row"
						@click="editAccount(i)"
						@longpress="deleteAccount(i)"
					>
						<view class="acc-row-left">
							<lucide-icon :name="acc.ic" :brand="isBrand(acc.ic)" size="72rpx" />
							<text class="acc-name">{{ acc.name }}</text>
						</view>
						<text class="acc-bal">{{ fmt(acc.bal) }}</text>
					</view>
				</view>
			</view>

			<view class="add-link" @click="goAddAccount">
				<lucide-icon name="plus" size="28rpx" />
				<text>添加账户</text>
			</view>

			<view style="height:40rpx" />
		</scroll-view>

		<tab-bar current-tab="assets" />
	</view>
</template>

<script>
import { fmt } from '@/common/constants.js'
import { applyThemeToPage } from '@/common/theme-manager.js'
import { getNetAssets, getAccounts, saveAccounts } from '@/common/app-data.js'
import { isBrandIcon } from '@/common/lucide-icons.js'
import TabBar from '@/components/TabBar.vue'

export default {
	components: { TabBar },
	data() {
		return {
			accounts: []
		}
	},
	computed: {
		netAssets() {
			return getNetAssets()
		}
	},
	onShow() {
		applyThemeToPage(this)
		this.accounts = getAccounts()
	},
	methods: {
		fmt,
		isBrand(ic) {
			return isBrandIcon(ic)
		},
		editAccount(index) {
			const acc = this.accounts[index]
			if (!acc) return
			uni.showModal({
				title: '编辑账户',
				content: `账户：${acc.name}\n当前余额：¥${fmt(acc.bal)}`,
				editable: true,
				placeholderText: '输入新余额',
				success: (res) => {
					if (res.confirm && res.content) {
						const newBal = Number(res.content)
						if (isNaN(newBal)) {
							uni.showToast({ title: '请输入有效金额', icon: 'none' })
							return
						}
						const list = getAccounts()
						if (list[index]) {
							list[index].bal = newBal
							saveAccounts(list)
							this.accounts = getAccounts()
							uni.showToast({ title: '余额已更新', icon: 'success' })
						}
					}
				}
			})
		},
		deleteAccount(index) {
			const acc = this.accounts[index]
			if (!acc) return
			uni.showModal({
				title: '删除账户',
				content: `确定要删除「${acc.name}」吗？余额 ¥${fmt(acc.bal)} 将一同移除。`,
				success: (res) => {
					if (res.confirm) {
						const list = getAccounts()
						list.splice(index, 1)
						saveAccounts(list)
						this.accounts = getAccounts()
						uni.showToast({ title: '已删除：' + acc.name, icon: 'success' })
					}
				}
			})
		},
		goAddAccount() {
			uni.navigateTo({ url: '/pages/accounting/add-account' })
		}
	}
}
</script>

<style lang="scss" scoped>
.assets-page {
	height: 100vh;
	overflow: hidden;
}

.net-card {
	padding-bottom: 8rpx;
}

.net {
	display: block;
	font-size: 60rpx;
	font-weight: 800;
	color: var(--text-primary);
	margin: 8rpx 0 24rpx;
	letter-spacing: -2rpx;
}

.acc-list {
	border-top: 1rpx solid var(--divider);
	padding-top: 8rpx;
}

.acc-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
	border-bottom: 1rpx solid var(--divider);
}
.acc-row:last-child {
	border-bottom: none;
}
.acc-row:active {
	background: rgba(91, 155, 224, 0.04);
	border-radius: 12rpx;
	padding: 18rpx 16rpx;
	margin: 0 -16rpx;
}

.acc-row-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.acc-name {
	font-size: 28rpx;
	color: var(--text-primary);
}

.acc-bal {
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
}

.add-link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	margin: 0 28rpx;
	padding: 24rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: var(--primary);
}
</style>