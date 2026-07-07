/**
 * 宇宙记账 - Vuex Store 单元测试
 *
 * 注意：因 uni-app 全局 API 在 Node 环境不可用，
 * 此测试使用模拟的 uni 全局对象。完整集成测试建议在 HBuilderX 中运行。
 */

// 模拟 uni 全局 API
global.uni = {
  getStorageSync: jest.fn(() => null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn()
}

// Mock Date.now 用于稳定的 ID 生成
const ORIGINAL_DATE_NOW = Date.now
beforeAll(() => {
  Date.now = jest.fn(() => 1700000000000)
})
afterAll(() => {
  Date.now = ORIGINAL_DATE_NOW
  delete global.uni
})

// 模拟 Vuex
const Vuex = {
  Store: class MockStore {
    constructor(options) {
      this.state = options.state || {}
      this.getters = options.getters || {}
      this.mutations = options.mutations || {}
      this.actions = options.actions || {}
      this.modules = options.modules || {}
      // 扁平化处理模块
      if (this.modules.accounting) {
        const mod = this.modules.accounting
        if (typeof mod === 'function') {
          const resolved = mod()
          Object.assign(this.state, { accounting: resolved.state || {} })
          Object.assign(this.getters, resolved.getters || {})
          Object.assign(this.mutations, resolved.mutations || {})
          Object.assign(this.actions, resolved.actions || {})
        } else {
          Object.assign(this.state, { accounting: mod.state || {} })
          Object.assign(this.getters, mod.getters || {})
          Object.assign(this.mutations, mod.mutations || {})
          Object.assign(this.actions, mod.actions || {})
        }
      }
    }
  }
}

describe('Store - mutations', () => {
  let accountingModule

  beforeAll(() => {
    // 动态导入模块
    accountingModule = require('../../store/accounting.js').default
  })

  test('模块应被正确导出', () => {
    expect(accountingModule).toBeTruthy()
    expect(accountingModule.namespaced).toBe(true)
    expect(accountingModule.state).toBeTruthy()
    expect(accountingModule.mutations).toBeTruthy()
    expect(accountingModule.actions).toBeTruthy()
    expect(accountingModule.getters).toBeTruthy()
  })

  test('初始化状态应包含 data 对象', () => {
    const state = accountingModule.state
    expect(state.data).toBeTruthy()
    expect(state.data.transactions).toBeInstanceOf(Array)
    expect(state.data.accounts).toBeInstanceOf(Array)
    expect(state.data.categories).toBeTruthy()
    expect(state.isLoggedIn).toBe(false)
  })

  test('SET_RECORD_TYPE 应更新类型', () => {
    const state = { recordType: 'expense' }
    accountingModule.mutations.SET_RECORD_TYPE(state, 'income')
    expect(state.recordType).toBe('income')
  })

  test('SET_STAT_VIEW 应更新统计视图', () => {
    const state = { statView: 'expense' }
    accountingModule.mutations.SET_STAT_VIEW(state, 'income')
    expect(state.statView).toBe('income')
  })

  test('SET_CAL_DAY 应更新日历选中日', () => {
    const state = { calDay: 1 }
    accountingModule.mutations.SET_CAL_DAY(state, 15)
    expect(state.calDay).toBe(15)
  })
})

describe('Store - getters (仅测试纯函数)', () => {
  let getters

  beforeAll(() => {
    const mod = require('../../store/accounting.js').default
    getters = mod.getters
  })

  describe('monthSummary', () => {
    test('无交易应返回全零', () => {
      const state = { data: { transactions: [] } }
      // 模拟 getters.monthTxs 返回空
      const localGetters = { monthTxs: () => [] }
      const result = getters.monthSummary(state, localGetters)(2026, 7)
      expect(result).toEqual({ income: 0, expense: 0, balance: 0 })
    })

    test('应正确汇总', () => {
      const state = { data: { transactions: [] } }
      const txs = [
        { type: 'income', amount: 1000 },
        { type: 'expense', amount: 200 },
        { type: 'expense', amount: 50 }
      ]
      const localGetters = { monthTxs: () => txs }
      const result = getters.monthSummary(state, localGetters)(2026, 7)
      expect(result.income).toBe(1000)
      expect(result.expense).toBe(250)
      expect(result.balance).toBe(750)
    })
  })

  describe('totalAssets', () => {
    test('空账户应返回 0', () => {
      const state = { data: { accounts: [] } }
      expect(getters.totalAssets(state)).toBe(0)
    })

    test('应正确汇总', () => {
      const state = {
        data: {
          accounts: [
            { balance: 1000.50 },
            { balance: 2000.30 },
            { balance: 500.20 }
          ]
        }
      }
      expect(getters.totalAssets(state)).toBe(3501)
    })
  })
})

describe('Store - actions (模拟 commit 测试)', () => {
  let actions, commitMock

  beforeAll(() => {
    const mod = require('../../store/accounting.js').default
    actions = mod.actions
  })

  beforeEach(() => {
    commitMock = jest.fn()
  })

  describe('saveBudget', () => {
    test('应调用 UPDATE_BUDGET mutation', () => {
      const result = actions.saveBudget({ commit: commitMock }, { year: 2026, month: 7, total: 2000 })
      expect(commitMock).toHaveBeenCalledWith('UPDATE_BUDGET', { key: '2026-07', total: 2000 })
      expect(result.success).toBe(true)
    })

    test('无效预算应返回错误', () => {
      const result = actions.saveBudget({ commit: commitMock }, { total: -1 })
      expect(result.success).toBe(false)
      expect(commitMock).not.toHaveBeenCalled()
    })
  })

  describe('addTransaction', () => {
    test('无效金额应返回错误响应', () => {
      const result = actions.addTransaction({ commit: commitMock, state: { recordType: 'expense', recordCat: '餐饮', recordAccountId: 'acc1', recordDate: '2026-07-05' } }, { amount: 0 })
      expect(result.success).toBe(false)
      expect(commitMock).not.toHaveBeenCalled()
    })
  })
})
