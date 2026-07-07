<template>
	<view class="tab-bar-container">
		<view class="fab-wrapper" v-if="showFab">
			<view class="fab-btn" @click="handleFabClick">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 5v14M5 12h14" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</view>
		</view>
		<nav class="tab-bar" role="tablist">
			<view v-for="tab in tabs" :key="tab.id" 
				class="tab-item" 
				:class="{ active: currentTab === tab.id }"
				@click="handleTabClick(tab.id)"
				role="tab">
				<svg class="tab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<template v-if="tab.id === 'home'">
						<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z" fill="currentColor"/>
					</template>
					<template v-else-if="tab.id === 'calendar'">
						<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
						<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
						<rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor"/>
						<rect x="14" y="13" width="3" height="3" rx="0.5" fill="currentColor"/>
					</template>
					<template v-else-if="tab.id === 'all-transactions'">
						<path d="M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v14h14V6H5zm3 3h8v2H8V9zm0 4h5v2H8v-2z" fill="currentColor"/>
					</template>
					<template v-else-if="tab.id === 'stats'">
						<path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<rect x="6" y="12" width="3" height="6" rx="0.5" fill="currentColor"/>
						<rect x="10.5" y="8" width="3" height="10" rx="0.5" fill="currentColor"/>
						<rect x="15" y="5" width="3" height="13" rx="0.5" fill="currentColor"/>
					</template>
					<template v-else-if="tab.id === 'profile'">
						<circle cx="12" cy="8" r="4" fill="currentColor"/>
						<path d="M4 20c0-4.418 3.582-7 8-7s8 2.582 8 7" fill="currentColor"/>
					</template>
					<template v-else-if="tab.id === 'assets'">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
						<path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</template>
					<template v-else-if="tab.id === 'ledgers'">
						<path d="M3 4h18v16H3V4zm2 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" fill="currentColor"/>
					</template>
					<template v-else>
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					</template>
				</svg>
				<text class="tab-label">{{ tab.label }}</text>
			</view>
		</nav>
	</view>
</template>

<script>
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
		methods: {
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
		z-index: 30;
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
		background: #E8734A;
		box-shadow: 0 8px 24px rgba(61, 35, 22, 0.08);
		border: 3px solid #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.fab-btn:active {
		transform: scale(0.95);
	}

	.tab-bar {
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 64px;
		background: #FFFFFF;
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
		color: #A98B78;
		transition: color 0.2s;
	}

	.tab-item.active {
		color: #E8734A;
	}

	.tab-item.active .tab-label {
		font-weight: 500;
	}

	.tab-icon {
		width: 24px;
		height: 24px;
	}

	.tab-label {
		font-size: 10px;
		font-weight: 400;
		line-height: 1;
	}
</style>
