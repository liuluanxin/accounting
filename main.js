import App from './App'
import store from './store'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.prototype.$store = store
App.mpType = 'app'
const app = new Vue({
	store,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import * as Pinia from 'pinia'
import { registerGlobalComponents } from '@/common/register-components.js'

export function createApp() {
	const app = createSSRApp(App)
	app.use(store)
	app.use(Pinia.createPinia())
	registerGlobalComponents(app)
	return {
		app,
		Pinia
	}
}
// #endif
