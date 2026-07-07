/**
 * 宇宙记账 - Vuex 数据模块
 * 所有数据通过 API 服务层获取，不硬编码任何 Mock 数据
 * 集成 loading/error 状态管理
 */
import Logger from '@/common/logger.js'
import { success, failure } from '@/common/api-response.js'
import { genId } from '@/common/accounting-utils.js'
import AccountingService from '@/services/accounting-service.js'

const MODULE = 'Store'

// 空初始状态
const emptyData = {
  accounts: [
    { id: 'acc_default', name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#4ADE80', desc: '', cardNumber: '', cardNumberHidden: true },
    { id: 'acc_bank', name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#6C63FF', desc: '', cardNumber: '', cardNumberHidden: true }
  ],
  transactions: [],
  categories: { expense: [], income: [] },
  budgets: {},
  ledgers: [],
  currentLedger: null,
  settings: { theme: 'dark', language: 'zh' }
}

export default {
  namespaced: true,
  state: {
    data: { ...emptyData },
    loading: false,
    error: null,
    initialized: false,

    // 页面 UI 状态
    homeYear: new Date().getFullYear(),
    homeMonth: new Date().getMonth() + 1,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth() + 1,
    calDay: new Date().getDate(),
    recordType: 'expense',
    recordCat: '餐饮',
    recordAccountId: null,
    recordDate: '',
    statView: 'expense',
    isLoggedIn: false,

    // 各页面加载状态
    homeLoading: false,
    calLoading: false,
    assetsLoading: false,
    statsLoading: false,
    budgetLoading: false,
  },
  getters: {
    isDataEmpty: (state) => state.data.transactions.length === 0,
    monthTxs: (state) => (year, month) => {
      const p = year + '-' + String(month).padStart(2, '0')
      return state.data.transactions.filter(t => t.date && t.date.indexOf(p) === 0)
    },
    dayTxs: (state) => (dateStr) => state.data.transactions.filter(t => t.date === dateStr),
    monthSummary: (state, getters) => (year, month) => {
      const txs = getters.monthTxs(year, month)
      let inc = 0, exp = 0
      txs.forEach(t => { if (t.type === 'income') inc += t.amount; else exp += t.amount })
      return { income: Math.round(inc * 100) / 100, expense: Math.round(exp * 100) / 100, balance: Math.round((inc - exp) * 100) / 100 }
    },
    categoryRanking: (state, getters) => (year, month, type) => {
      const txs = getters.monthTxs(year, month).filter(t => t.type === type)
      const map = {}
      txs.forEach(t => { if (t.category) map[t.category] = (map[t.category] || 0) + t.amount })
      return Object.entries(map).map(([n, a]) => ({ name: n, amount: Math.round(a * 100) / 100 })).sort((a, b) => b.amount - a.amount)
    },
    currentBudget: (state) => (year, month) => {
      const key = year + '-' + String(month).padStart(2, '0')
      return state.data.budgets[key] || null
    },
    totalAssets: (state) => Math.round(state.data.accounts.reduce((s, a) => s + (a.balance || 0), 0) * 100) / 100,
    currentLedger: (state) => state.data.ledgers.find(l => l.current) || state.data.ledgers[0] || null
  },
  mutations: {
    SET_LOADING(state, val) { state.loading = val },
    SET_ERROR(state, err) { state.error = err },
    SET_INITIALIZED(state) { state.initialized = true },
    SET_HOME_LOADING(state, val) { state.homeLoading = val },
    SET_CAL_LOADING(state, val) { state.calLoading = val },
    SET_ASSETS_LOADING(state, val) { state.assetsLoading = val },
    SET_STATS_LOADING(state, val) { state.statsLoading = val },
    SET_BUDGET_LOADING(state, val) { state.budgetLoading = val },
    SET_LOGGED_IN(state, val) { state.isLoggedIn = val },
    SET_RECORD_TYPE(state, type) { state.recordType = type },
    SET_RECORD_CAT(state, cat) { state.recordCat = cat },
    SET_RECORD_ACCOUNT(state, id) { state.recordAccountId = id },
    SET_RECORD_DATE(state, date) { state.recordDate = date },
    SET_STAT_VIEW(state, view) { state.statView = view },
    SET_HOME_MONTH(state, { year, month }) { state.homeYear = year; state.homeMonth = month },
    SET_CAL_MONTH(state, { year, month }) { state.calYear = year; state.calMonth = month },
    SET_CAL_DAY(state, day) { state.calDay = day },

    /** 从 API 响应更新完整数据 */
    SET_DATA(state, payload) {
      if (payload.transactions !== undefined) state.data.transactions = payload.transactions
      if (payload.accounts !== undefined) state.data.accounts = payload.accounts
      if (payload.categories !== undefined) state.data.categories = payload.categories
      if (payload.budgets !== undefined) state.data.budgets = payload.budgets
      if (payload.ledgers !== undefined) state.data.ledgers = payload.ledgers
      if (payload.currentLedger !== undefined) state.data.currentLedger = payload.currentLedger
      if (payload.settings !== undefined) state.data.settings = payload.settings
    },

    /** 添加交易到本地状态（乐观更新） */
    ADD_TRANSACTION(state, tx) {
      state.data.transactions.unshift(tx)
      const acct = state.data.accounts.find(a => a.id === tx.accountId)
      if (acct) {
        acct.balance = Math.round((acct.balance + (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
      }
    },

    DELETE_TRANSACTION(state, txId) {
      const idx = state.data.transactions.findIndex(t => t.id === txId)
      if (idx === -1) return
      const tx = state.data.transactions[idx]
      const acct = state.data.accounts.find(a => a.id === tx.accountId)
      if (acct) {
        acct.balance = Math.round((acct.balance - (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
      }
      state.data.transactions.splice(idx, 1)
    },

    ADD_ACCOUNT(state, account) { state.data.accounts.push(account) },
    UPDATE_ACCOUNT(state, account) {
      const idx = state.data.accounts.findIndex(a => a.id === account.id)
      if (idx !== -1) Object.assign(state.data.accounts[idx], account)
    },
    DELETE_ACCOUNT(state, id) {
      state.data.accounts = state.data.accounts.filter(a => a.id !== id)
      state.data.transactions = state.data.transactions.filter(t => t.accountId !== id)
    },
		SWITCH_LEDGER(state, id) {
			state.data.ledgers.forEach(l => { l.current = l.id === id })
			state.data.currentLedger = id
		},
		ADD_LEDGER(state, ledger) {
			state.data.ledgers.push(ledger)
		},
    UPDATE_BUDGET(state, { key, total }) {
      if (!state.data.budgets[key]) state.data.budgets[key] = {}
      state.data.budgets[key].total = total
    }
  },
  actions: {
    /** 初始化：拉取所有基础数据 */
    async initialize({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const [txRes, accRes, catRes, budRes, ledRes] = await Promise.all([
          AccountingService.getTransactions(),
          AccountingService.getAccounts(),
          AccountingService.getCategories(),
          AccountingService.getBudget(new Date().getFullYear(), new Date().getMonth() + 1),
          AccountingService.getLedgers()
        ])
        commit('SET_DATA', {
          transactions: txRes.success ? txRes.data.list : [],
          accounts: accRes.success ? accRes.data.list : [],
          categories: catRes.success ? catRes.data : { expense: [], income: [] },
          budgets: budRes.success && budRes.data ? { [currentMonthKey()]: budRes.data } : {},
          ledgers: ledRes.success ? ledRes.data.list : [],
          currentLedger: ledRes.success ? ledRes.data.currentId : null
        })
        commit('SET_INITIALIZED')
        Logger.info(MODULE, '数据初始化完成')
        return success(null, '初始化成功')
      } catch (err) {
        Logger.errorWithException(MODULE, '初始化失败', err)
        commit('SET_ERROR', err.message)
        return failure(err.message, 'INIT_ERROR')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /** 获取月度总览 */
    async fetchDashboard({ commit }, { year, month }) {
      commit('SET_HOME_LOADING', true)
      try {
        const res = await AccountingService.getDashboardSummary(year, month)
        if (res.success) return success(res.data)
        return failure(res.message)
      } catch (err) {
        return failure(err.message)
      } finally {
        commit('SET_HOME_LOADING', false)
      }
    },

    /** 创建交易 */
    async addTransaction({ commit, state }, { amount, type, category, accountId, date, note }) {
      const res = await AccountingService.createTransaction({
        amount, type: type || state.recordType,
        category: category || state.recordCat,
        accountId: accountId || state.recordAccountId,
        date: date || state.recordDate || todayStr(),
        note
      })
      if (res.success) {
        commit('ADD_TRANSACTION', res.data)
        Logger.info(MODULE, '记账成功', { amount, type })
      }
      return res
    },

    /** 删除交易 */
    async deleteTransaction({ commit }, id) {
      const res = await AccountingService.deleteTransaction(id)
      if (res.success) commit('DELETE_TRANSACTION', id)
      return res
    },

    /** 添加账户 */
    async addAccount({ commit }, accountData) {
      const res = await AccountingService.createAccount(accountData)
      if (res.success) commit('ADD_ACCOUNT', res.data)
      return res
    },

    /** 更新账户 */
    async updateAccount({ commit }, accountData) {
      const res = await AccountingService.updateAccount(accountData.id, accountData)
      if (res.success) commit('UPDATE_ACCOUNT', accountData)
      return res
    },

    /** 删除账户 */
    async deleteAccount({ commit }, id) {
      const res = await AccountingService.deleteAccount(id)
      if (res.success) commit('DELETE_ACCOUNT', id)
      return res
    },

    /** 保存预算 */
    async saveBudget({ commit }, { year, month, total }) {
      const res = await AccountingService.saveBudget(year, month, total)
      if (res.success) commit('UPDATE_BUDGET', { key: `${year}-${String(month).padStart(2, '0')}`, total })
      return res
    },

    /** 获取指定月份预算 */
    async fetchBudgetForMonth({ commit, state }, { year, month }) {
      commit('SET_BUDGET_LOADING', true)
      try {
        const key = `${year}-${String(month).padStart(2, '0')}`
        // 如果 store 中已有该月预算，直接返回；否则从服务端拉取
        if (state.data.budgets[key]) return
        const res = await AccountingService.getBudget(year, month)
        if (res.success && res.data) {
          commit('UPDATE_BUDGET', { key, total: res.data.total })
        }
        return res
      } catch (err) {
        Logger.error(MODULE, '获取预算失败', err)
        throw err
      } finally {
        commit('SET_BUDGET_LOADING', false)
      }
    },

    /** 切换账本 */
    async switchLedger({ commit }, id) {
      const res = await AccountingService.switchLedger(id)
      if (res.success) commit('SWITCH_LEDGER', id)
      return res
    },

    /** 获取交易列表 */
    async fetchTransactions({ commit }, params) {
      try {
        const res = await AccountingService.getTransactions(params)
        if (res.success) {
          commit('SET_DATA', { transactions: res.data.list })
          return success(res.data.list)
        }
        return failure(res.message)
      } catch (err) {
        return failure(err.message)
      }
    },

    /** 获取账户列表 */
    async fetchAccounts({ commit }) {
      try {
        const res = await AccountingService.getAccounts()
        if (res.success) {
          commit('SET_DATA', { accounts: res.data.list })
          return success(res.data.list)
        }
        return failure(res.message)
      } catch (err) {
        return failure(err.message)
      }
    }
  }
}

function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
