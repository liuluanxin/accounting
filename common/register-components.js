import StatusBar from '@/components/StatusBar.vue'
import TopBar from '@/components/TopBar.vue'
import LucideIcon from '@/components/LucideIcon.vue'
import CosmicSheet from '@/components/CosmicSheet.vue'
import BillKeypad from '@/components/BillKeypad.vue'
import TabBar from '@/components/TabBar.vue'

/** 全局注册布局/业务组件（平铺 components/*.vue 不走 easycom autoscan） */
export function registerGlobalComponents(app) {
	app.component('status-bar', StatusBar)
	app.component('top-bar', TopBar)
	app.component('lucide-icon', LucideIcon)
	app.component('cosmic-sheet', CosmicSheet)
	app.component('bill-keypad', BillKeypad)
	app.component('tab-bar', TabBar)
}
