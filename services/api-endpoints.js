/**
 * 宇宙记账 - API 端点定义
 * 集中管理所有接口路径，支持 RESTful 风格
 * 未来接入真实后端时仅需修改此文件
 */

const BASE = '/api'

export const ENDPOINTS = {
  // 交易
  transactions: {
    list: `${BASE}/transactions`,           // GET   查询交易列表
    create: `${BASE}/transactions`,          // POST  创建交易
    delete: `${BASE}/transactions`,          // DELETE 删除交易 { id }
  },

  // 账户
  accounts: {
    list: `${BASE}/accounts`,                // GET   账户列表
    create: `${BASE}/accounts`,              // POST  创建账户
    update: `${BASE}/accounts`,              // PUT   更新账户 { id, ...data }
    delete: `${BASE}/accounts`,              // DELETE 删除账户 { id }
  },

  // 预算
  budgets: {
    get: `${BASE}/budgets`,                  // GET   获取预算 { key }
    save: `${BASE}/budgets`,                 // POST  保存预算 { key, total }
  },

  // 分类
  categories: {
    list: `${BASE}/categories`,              // GET   分类列表
  },

  // 账本
  ledgers: {
    list: `${BASE}/ledgers`,                 // GET   账本列表
    create: `${BASE}/ledgers`,               // POST  创建账本
    switch: `${BASE}/ledgers/switch`,        // POST  切换账本 { id }
    delete: `${BASE}/ledgers/delete`,        // POST  删除账本 { id }
  },

  // 仪表盘
  dashboard: {
    summary: `${BASE}/dashboard`,            // GET   月度汇总
  },

  // 认证
  auth: {
    sendEmailCode: `${BASE}/auth/send-email-code`,   // POST 发送邮箱验证码 { email, scene }
    register: `${BASE}/auth/register`,               // POST 邮箱注册 { email, code, password, username }
    login: `${BASE}/auth/login`,                     // POST 邮箱登录 { email, password }
    resetPassword: `${BASE}/auth/reset-password`,     // POST 重置密码 { email, code, password }
    logout: `${BASE}/auth/logout`,
  }
}

export default ENDPOINTS
