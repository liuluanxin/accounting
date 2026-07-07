<template>
	<view class="tab-bar-container">
		<view class="fab-wrapper" v-if="showFab">
			<view class="fab-btn" @click="handleFabClick">
				<view class="fab-icon" :style="{ 'mask-image': 'url(' + fabIcon + ')', '-webkit-mask-image': 'url(' + fabIcon + ')' }"></view>
			</view>
		</view>
		<nav class="tab-bar" role="tablist">
			<view v-for="tab in tabs" :key="tab.id"
				class="tab-item"
				:class="{ active: currentTab === tab.id }"
				@click="handleTabClick(tab.id)"
				role="tab">
				<view class="tab-icon-wrapper" :style="getIconStyle(tab.id)"></view>
				<text class="tab-label">{{ tab.label }}</text>
			</view>
		</nav>
	</view>
</template>

<script>
	import ICONS from '@/common/icon-base64.js'
	export default {
		name: 'TabBar',
		props: {
			currentTab: {
				type: String,
				required: true
			},
			showFab: {
				type: Boolean,
				default: false
			},
			tabs: {
				type: Array,
				default: () => [
					{ id: 'home', label: '首页' },
					{ id: 'calendar', label: '日历' },
					{ id: 'stats', label: '统计' },
					{ id: 'profile', label: '我的' }
				]
			}
		},
		data() {
			return {
				fabIcon: ICONS['fab-add'] || ''
			}
		},
		methods: {
			getIconStyle(tabId) {
				const iconKey = 'tab-' + tabId
				const iconUri = ICONS[iconKey] || ''
				return {
					'mask-image': 'url(' + iconUri + ')',
					'-webkit-mask-image': 'url(' + iconUri + ')'
				}
			},
			handleTabClick(tabId) {
				if (tabId !== this.currentTab) {
					uni.redirectTo({ url: '/pages/accounting/' + tabId })
				}
			},
			handleFabClick() {
				uni.navigateTo({ url: '/pages/accounting/record' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab-bar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: 430px;
		margin: 0 auto;
		z-index: 999;
		pointer-events: none;
		padding: 0 16px 12px 16px;
		padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
	}

	.fab-wrapper {
		pointer-events: auto;
		display: flex;
		justify-content: flex-end;
		margin-bottom: -20px;
		position: relative;
		z-index: 32;
	}

	.fab-btn {
		width: 48px;
		height: 48px;
		border-radius: 9999px;
		background: var(--primary, #E8734A);
		box-shadow: 0 8px 24px var(--primary-shadow, rgba(61, 35, 22, 0.08));
		border: 3px solid #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.fab-btn:active {
		transform: scale(0.95);
	}

	.fab-icon {
		width: 22px;
		height: 22px;
		background-color: #FFFFFF;
		mask-size: contain;
		-webkit-mask-size: contain;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-position: center;
	}

	.tab-bar {
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 64px;
		background: var(--card-bg, #FFFFFF);
		border-radius: 20px;
		box-shadow: 0 8px 24px rgba(61, 35, 22, 0.08);
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		text-decoration: none;
		flex: 1;
		height: 100%;
		color: var(--text-tertiary, #A98B78);
		transition: color 0.2s;
	}

	.tab-item.active {
		color: var(--primary, #E8734A);
	}

	.tab-item.active .tab-label {
		font-weight: 500;
	}

	.tab-icon-wrapper {
		width: 24px;
		height: 24px;
		background-color: var(--text-tertiary, #A98B78);
		mask-size: contain;
		-webkit-mask-size: contain;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-position: center;
	}

	.tab-item.active .tab-icon-wrapper {
		background-color: var(--primary, #E8734A);
	}

	.tab-label {
		font-size: 10px;
		font-weight: 400;
		line-height: 1;
	}
</style>