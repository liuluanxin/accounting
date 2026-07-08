/**
 * 宇宙记账 - API 客户端
 * 核心 HTTP 请求封装，支持拦截器、超时、认证
 * 可通过配置切换为真实后端或本地适配器
 */
import Logger from '@/common/logger.js'
import { BusinessError } from '@/common/error-handler.js'

const MODULE = 'ApiClient'

/**
 * API 配置（通过环境变量或全局配置注入）
 */
let apiConfig = {
  baseURL: '',
  timeout: 15000,
  tokenKey: 'auth_token',
  /** 请求适配器: 'http' | 'local' */
  adapter: 'local'
}

/** 设置 API 配置（应用启动时调用） */
export function configureApi(config) {
  apiConfig = { ...apiConfig, ...config }
  Logger.info(MODULE, 'API 配置已更新', { baseURL: apiConfig.baseURL, adapter: apiConfig.adapter })
}

/** 获取当前 API 配置 */
export function getApiConfig() {
  return { ...apiConfig }
}

/**
 * 获取认证令牌
 */
function getToken() {
  try { return uni.getStorageSync(apiConfig.tokenKey) } catch (e) { return null }
}

/**
 * HTTP 请求适配器（真实网络请求）
 */
async function httpAdapter(options) {
  const { url, method = 'GET', data = null, params = null, headers = {}, timeout = apiConfig.timeout } = options

  const requestHeaders = { 'Content-Type': 'application/json', ...headers }
  const token = getToken()
  if (token) requestHeaders['Authorization'] = `Bearer ${token}`

  Logger.debug(MODULE, `[${method}] ${url}`, { params, dataSize: data ? JSON.stringify(data).length : 0 })

  return new Promise((resolve, reject) => {
    uni.request({
      url: apiConfig.baseURL + url,
      method,
      data,
      dataType: 'json',
      header: requestHeaders,
      timeout,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new BusinessError(
            `HTTP_${res.statusCode}`,
            res.data?.message || `请求失败 (${res.statusCode})`,
            res.data
          ))
        }
      },
      fail: (err) => {
        const msg = err.errMsg || '网络请求失败'
        Logger.warn(MODULE, `请求失败: ${url}`, msg)
        reject(new BusinessError('NETWORK_ERROR', msg, err))
      }
    })
  })
}

/**
 * 本地存储适配器（开发/演示模式，通过 localStorage 模拟 API）
 * 当 apiConfig.adapter === 'local' 时使用
 */
import { genId, todayStr } from '@/common/accounting-utils.js'
import { rules, validateOrThrow, validate, parseAmount } from '@/common/validator.js'
import { success, failure } from '@/common/api-response.js'

const LOCAL_STORAGE_KEY = 'cosmic_accounting_local_db'

function getLocalDB() {
  try {
    const raw = uni.getStorageSync(LOCAL_STORAGE_KEY)
    let db = raw ? JSON.parse(raw) : createEmptyDB()
    // 数据迁移：确保有默认账户
    if (!db.accounts || db.accounts.length === 0) {
      db.accounts = [
        { id: 'acc_default', name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#4ADE80', desc: '', cardNumber: '', cardNumberHidden: true },
        { id: 'acc_bank', name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#6C63FF', desc: '', cardNumber: '', cardNumberHidden: true }
      ]
      saveLocalDB(db)
    }
    // 数据迁移：确保有默认账本
    if (!db.ledgers || db.ledgers.length === 0) {
      db.ledgers = [{ id: 'l1', name: '个人账本', current: true }]
      db.currentLedger = 'l1'
      saveLocalDB(db)
    }
    // 数据迁移：确保交易都有 ledgerId
    if (db.transactions && db.transactions.length > 0) {
      let needSave = false
      db.transactions.forEach(tx => {
        if (!tx.ledgerId) {
          tx.ledgerId = db.currentLedger
          needSave = true
        }
      })
      if (needSave) saveLocalDB(db)
    }
    return db
  } catch (e) {
    return createEmptyDB()
  }
}

function saveLocalDB(db) {
  try { uni.setStorageSync(LOCAL_STORAGE_KEY, JSON.stringify(db)) } catch (e) { /* ignore */ }
}

function createEmptyDB() {
  return {
    accounts: [
      { id: 'acc_default', name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#4ADE80', desc: '', cardNumber: '', cardNumberHidden: true },
      { id: 'acc_bank', name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#6C63FF', desc: '', cardNumber: '', cardNumberHidden: true }
    ],
    transactions: [],
    categories: { expense: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '通讯', '服饰', '其他'], income: ['薪资', '奖金', '理财', '兼职', '红包', '其他'] },
    budgets: {},
    ledgers: [{ id: 'l1', name: '个人账本', current: true }],
    currentLedger: 'l1',
    settings: { theme: 'dark', language: 'zh' }
  }
}

/**
 * 本地适配器：模拟 API 路由
 */
async function localAdapter(options) {
  const { url, method, data } = options
  const db = getLocalDB()

  // 模拟网络延迟（开发体验）
  await new Promise(r => setTimeout(r, 50 + Math.random() * 100))

  try {
    Logger.debug(MODULE, `[Local] ${method} ${url}`)

    switch (`${method}:${url}`) {
      // === 交易相关 ===
      case 'GET:/api/transactions': {
        const { year, month, date, ledgerId } = data || {}
        let list = [...db.transactions]
        if (ledgerId) list = list.filter(t => t.ledgerId === ledgerId)
        if (date) list = list.filter(t => t.date === date)
        else if (year && month) {
          const p = `${year}-${String(month).padStart(2, '0')}`
          list = list.filter(t => t.date && t.date.startsWith(p))
        }
        list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
        return success({ list })
      }

      case 'POST:/api/transactions': {
        const parsed = parseAmount(data.amount)
        if (!parsed.valid) return failure(parsed.error, 'INVALID_AMOUNT')
        const { valid, errors } = validate(
          { type: data.type, category: data.category, accountId: data.accountId },
          { type: [rules.oneOf(['expense', 'income'])], category: [rules.required('请选择分类')], accountId: [rules.required('请选择账户')] }
        )
        if (!valid) {
          const firstError = Object.values(errors)[0] || '参数校验失败'
          return failure(firstError, 'VALIDATION_ERROR')
        }
        Logger.debug(MODULE, '创建交易', { receivedDate: data.date })
        const now = new Date()
        const tx = {
          id: 'tx_' + genId(),
          type: data.type,
          amount: parsed.amount,
          category: data.category,
          accountId: data.accountId,
          ledgerId: data.ledgerId || db.currentLedger,
          date: data.date || todayStr(),
          time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
          note: (data.note || '').trim() || data.category,
          tags: []
        }
        db.transactions.unshift(tx)
        const acct = db.accounts.find(a => a.id === tx.accountId)
        if (acct) {
          acct.balance = Math.round((acct.balance + (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
        }
        saveLocalDB(db)
        return success(tx, '账单已保存')
      }

      case 'DELETE:/api/transactions': {
        const idx = db.transactions.findIndex(t => t.id === data.id)
        if (idx === -1) return failure('交易不存在', 'NOT_FOUND')
        const tx = db.transactions[idx]
        const acct = db.accounts.find(a => a.id === tx.accountId)
        if (acct) {
          acct.balance = Math.round((acct.balance - (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
        }
        db.transactions.splice(idx, 1)
        saveLocalDB(db)
        return success(null, '交易已删除')
      }

      // === 账户相关 ===
      case 'GET:/api/accounts':
        return success({ list: db.accounts })

      case 'POST:/api/accounts': {
        if (!data.name) return failure('账户名称不能为空', 'INVALID_NAME')
        const account = {
          id: 'acc_' + genId(),
          name: data.name,
          type: data.type || 'bank',
          balance: data.balance || 0,
          icon: data.icon || '💳',
          color: data.color || '#6C63FF',
          desc: data.desc || '',
          cardNumber: data.cardNumber || '',
          cardNumberHidden: data.cardNumberHidden !== undefined ? data.cardNumberHidden : true
        }
        db.accounts.push(account)
        saveLocalDB(db)
        return success(account, '账户已添加')
      }

      case 'PUT:/api/accounts': {
        const idx = db.accounts.findIndex(a => a.id === data.id)
        if (idx === -1) return failure('账户不存在', 'NOT_FOUND')
        // 允许修改除 id 外的所有字段
        const { id, ...updates } = data
        Object.assign(db.accounts[idx], updates)
        saveLocalDB(db)
        return success(db.accounts[idx], '账户已更新')
      }

      case 'DELETE:/api/accounts': {
        const idx = db.accounts.findIndex(a => a.id === data.id)
        if (idx === -1) return failure('账户不存在', 'NOT_FOUND')
        // 同步删除该账户下所有交易
        db.transactions = db.transactions.filter(t => t.accountId !== data.id)
        db.accounts.splice(idx, 1)
        saveLocalDB(db)
        return success(null, '账户已删除')
      }

      // === 预算 ===
      case 'GET:/api/budgets': {
        const key = data?.key || ''
        return success(db.budgets[key] || null)
      }

      case 'POST:/api/budgets': {
        if (!data.key || typeof data.total !== 'number' || data.total < 0) return failure('预算参数无效', 'INVALID_BUDGET')
        if (!db.budgets[data.key]) db.budgets[data.key] = {}
        db.budgets[data.key].total = data.total
        saveLocalDB(db)
        return success(null, '预算已更新')
      }

      // === 分类 ===
      case 'GET:/api/categories':
        return success(db.categories)

      // === 账本 ===
      case 'GET:/api/ledgers':
        return success({ list: db.ledgers, currentId: db.currentLedger })

      case 'POST:/api/ledgers/switch': {
        if (!db.ledgers.some(l => l.id === data.id)) return failure('账本不存在', 'NOT_FOUND')
        db.ledgers.forEach(l => { l.current = l.id === data.id })
        db.currentLedger = data.id
        saveLocalDB(db)
        return success(null, '账本已切换')
      }

      case 'POST:/api/ledgers': {
        const newLedger = { id: 'l' + genId(), name: data.name || '新账本', cover: data.cover || '📒', category: data.category || 'personal', color: data.color || '', current: false }
        db.ledgers.push(newLedger)
        saveLocalDB(db)
        return success(newLedger, '新账本已创建')
      }

      case 'POST:/api/ledgers/delete': {
        db.ledgers = db.ledgers.filter(l => l.id !== data.id)
        saveLocalDB(db)
        return success(null, '账本已删除')
      }

      // === 仪表盘 ===
      case 'GET:/api/dashboard': {
        const { year, month } = data || {}
        const p = year ? `${year}-${String(month).padStart(2, '0')}` : ''
        const monthTxs = p ? db.transactions.filter(t => t.date && t.date.startsWith(p)) : db.transactions
        let income = 0, expense = 0
        monthTxs.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount })
        const budgetKey = p
        const budget = db.budgets[budgetKey]
        return success({
          income: Math.round(income * 100) / 100,
          expense: Math.round(expense * 100) / 100,
          balance: Math.round((income - expense) * 100) / 100,
          budgetTotal: budget ? budget.total : 0,
          totalAssets: Math.round(db.accounts.reduce((s, a) => s + (a.balance || 0), 0) * 100) / 100,
          txCount: monthTxs.length
        })
      }

      default:
        return failure(`未知的本地 API: ${method} ${url}`, 'ENDPOINT_NOT_FOUND')
    }
  } catch (err) {
    Logger.errorWithException(MODULE, `本地适配器错误: ${method} ${url}`, err)
    return failure(err.message || '本地操作失败', 'LOCAL_ERROR')
  }
}

/**
 * 统一 API 请求入口
 * 根据配置自动选择 HTTP 或本地适配器
 */
export async function apiRequest(options) {
  const { url, method = 'GET', data = null, params = null } = options

  Logger.debug(MODULE, `API 请求: ${method} ${url}`)

  try {
    const adapter = apiConfig.adapter === 'http' ? httpAdapter : localAdapter
    const result = await adapter({ url, method, data, params })
    return result
  } catch (err) {
    Logger.errorWithException(MODULE, `API 异常: ${method} ${url}`, err)
    return {
      success: false,
      message: err.message || '请求失败',
      code: err.code || 'REQUEST_FAILED',
      data: null
    }
  }
}

export default { apiRequest, configureApi, getApiConfig }
