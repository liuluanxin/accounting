<template>
	<view class="statusbar">
		<text class="statusbar-time">{{ time }}</text>
		<view class="statusbar-right">
			<view class="signal-bars" aria-hidden="true">
				<view
					v-for="(h, i) in barHeights"
					:key="i"
					class="signal-bar"
					:style="{ height: h }"
				/>
			</view>
			<view class="battery" aria-hidden="true">
				<view class="battery-level" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'StatusBar',
	props: {
		time: { type: String, default: '9:41' }
	},
	data() {
		return {
			barHeights: ['40%', '55%', '70%', '85%']
		}
	}
}
</script>
