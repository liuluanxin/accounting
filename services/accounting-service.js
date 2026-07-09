/**
 * 宇宙记账 - 业务服务层
 * 封装所有业务操作，统一通过 API 客户端请求
 * 页面和 Store 仅调用此服务，不直接操作数据
 */
import { apiRequest } from './api-client.js'
import ENDPOINTS from './api-endpoints.js'
import Logger from '@/common/logger.js'

const MODULE = 'AccountingService'

export default {
  // ==================== 交易 ====================

  /** 查询交易列表 */
  async getTransactions(params = {}) {
    Logger.debug(MODULE, 'getTransactions', params)
    return apiRequest({ url: ENDPOINTS.transactions.list, method: 'GET', data: params })
  },

  /** 创建交易 */
  async createTransaction(txData) {
    Logger.info(MODULE, 'createTransaction', { type: txData.type, amount: txData.amount })
    return apiRequest({ url: ENDPOINTS.transactions.create, method: 'POST', data: txData })
  },

  /** 删除交易 */
  async deleteTransaction(id) {
    Logger.info(MODULE, 'deleteTransaction', { id })
    return apiRequest({ url: ENDPOINTS.transactions.delete, method: 'DELETE', data: { id } })
  },

  // ==================== 账户 ====================

  /** 获取账户列表 */
  async getAccounts() {
    return apiRequest({ url: ENDPOINTS.accounts.list, method: 'GET' })
  },

  /** 创建账户 */
  async createAccount(accountData) {
    Logger.info(MODULE, 'createAccount', { name: accountData.name })
    return apiRequest({ url: ENDPOINTS.accounts.create, method: 'POST', data: accountData })
  },

  /** 更新账户 */
  async updateAccount(id, updates) {
    Logger.info(MODULE, 'updateAccount', { id, keys: Object.keys(updates) })
    return apiRequest({ url: ENDPOINTS.accounts.update, method: 'PUT', data: { id, ...updates } })
  },

  /** 删除账户 */
  async deleteAccount(id) {
    Logger.info(MODULE, 'deleteAccount', { id })
    return apiRequest({ url: ENDPOINTS.accounts.delete, method: 'DELETE', data: { id } })
  },

  // ==================== 预算 ====================

  /** 获取预算 */
  async getBudget(year, month) {
    return apiRequest({ url: ENDPOINTS.budgets.get, method: 'GET', data: { key: `${year}-${String(month).padStart(2, '0')}` } })
  },

  /** 保存预算 */
  async saveBudget(year, month, total) {
    Logger.info(MODULE, 'saveBudget', { year, month, total })
    return apiRequest({ url: ENDPOINTS.budgets.save, method: 'POST', data: { key: `${year}-${String(month).padStart(2, '0')}`, total } })
  },

  // ==================== 分类 ====================

  /** 获取分类列表 */
  async getCategories() {
    return apiRequest({ url: ENDPOINTS.categories.list, method: 'GET' })
  },

  /** 添加分类 */
  async addCategory({ type, category }) {
    Logger.info(MODULE, 'addCategory', { type, category })
    return apiRequest({ url: ENDPOINTS.categories.create, method: 'POST', data: { type, category } })
  },

  /** 更新分类 */
  async updateCategory({ type, oldName, category }) {
    Logger.info(MODULE, 'updateCategory', { type, oldName, category })
    return apiRequest({ url: ENDPOINTS.categories.update, method: 'PUT', data: { type, oldName, category } })
  },

  /** 删除分类 */
  async deleteCategory({ type, name }) {
    Logger.info(MODULE, 'deleteCategory', { type, name })
    return apiRequest({ url: ENDPOINTS.categories.delete, method: 'DELETE', data: { type, name } })
  },

  // ==================== 账本 ====================

  /** 获取账本列表 */
  async getLedgers() {
    return apiRequest({ url: ENDPOINTS.ledgers.list, method: 'GET' })
  },

  /** 切换账本 */
  async switchLedger(id) {
    Logger.info(MODULE, 'switchLedger', { id })
    return apiRequest({ url: ENDPOINTS.ledgers.switch, method: 'POST', data: { id } })
  },

	/** 创建账本 */
	async createLedger(ledgerData) {
		return apiRequest({ url: ENDPOINTS.ledgers.create, method: 'POST', data: ledgerData })
	},

	/** 删除账本 */
	async deleteLedger(id) {
		Logger.info(MODULE, 'deleteLedger', { id })
		return apiRequest({ url: ENDPOINTS.ledgers.delete, method: 'POST', data: { id } })
	},

  // ==================== 仪表盘 ====================

  /** 获取月度总览 */
  async getDashboardSummary(year, month) {
    return apiRequest({ url: ENDPOINTS.dashboard.summary, method: 'GET', data: { year, month } })
  },

  // ==================== 图片识别 ====================

  /** 识别小票/账单图片 */
  async recognizeReceipt(imagePath) {
    Logger.info(MODULE, 'recognizeReceipt', { imagePath })
    return apiRequest({ url: ENDPOINTS.ocr.recognize, method: 'POST', data: { imagePath } })
  }
}
