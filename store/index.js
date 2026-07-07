// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import accounting from './accounting.js'

const store = new Vuex.Store({
// #endif

// #ifdef VUE3
import { createStore } from 'vuex'
import accounting from './accounting.js'

const store = createStore({
// #endif
	state: {
		hasLogin: false
	},
	mutations: {
		login(state) {
			state.hasLogin = true
		},
		logout(state) {
			state.hasLogin = false
		}
	},
	modules: {
		accounting
	}
})

export default store
