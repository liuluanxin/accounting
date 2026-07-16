/**
 * 宇宙记账 · 本地存储层
 * 基于 uni.setStorage / uni.getStorage 封装
 * 所有数据持久化统一走此模块
 */

const KEYS = {
  ACCOUNTS: 'cosmic_accounts',
  BILLS: 'cosmic_bills',
  BUDGET_TOTAL: 'cosmic_budget_total',
  BUDGET_CATS: 'cosmic_budget_cats',
  LEDGERS: 'cosmic_ledgers',
  SELECTED_LEDGER: 'cosmic_selected_ledger',
  USER: 'cosmic_user',
  THEME: 'cosmic_theme'
}

/** 通用：读取 */
function get(key, fallback = null) {
  try {
    const raw = uni.getStorageSync(key)
    return raw !== '' && raw !== undefined && raw !== null ? raw : fallback
  } catch {
    return fallback
  }
}

/** 通用：写入 */
function set(key, val) {
  try {
    uni.setStorageSync(key, val)
    return true
  } catch {
    return false
  }
}

// ───── 账户 ─────

export function getAccounts() {
  return get(KEYS.ACCOUNTS, [])
}

export function saveAccounts(list) {
  return set(KEYS.ACCOUNTS, list)
}

export function addAccount(acc) {
  const list = getAccounts()
  list.push({ ...acc, bal: Number(acc.bal) || 0 })
  saveAccounts(list)
  return list
}

// ───── 账单 ─────

export function getBills() {
  return get(KEYS.BILLS, [])
}

export function saveBills(list) {
  return set(KEYS.BILLS, list)
}

/**
 * 添加一条账单记录
 * @param {Object} bill  { ic, name, acc, amt, cat, subcat, ts, note }
 */
export function addBill(bill) {
  const list = getBills()
  list.push({
    ...bill,
    ts: bill.ts || Date.now(),
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  })
  saveBills(list)
  return list
}

export function getBillsByDateRange(startTs, endTs) {
  return getBills().filter(b => b.ts >= startTs && b.ts < endTs)
}

export function getRecentBills(limit = 7) {
  const all = getBills().sort((a, b) => b.ts - a.ts)
  return all.slice(0, limit)
}

// ───── 预算 ─────

export function getBudgetTotal() {
  return get(KEYS.BUDGET_TOTAL, 5000)
}

export function saveBudgetTotal(val) {
  return set(KEYS.BUDGET_TOTAL, Number(val) || 0)
}

export function getBudgetCats() {
  return get(KEYS.BUDGET_CATS, [])
}

export function saveBudgetCats(list) {
  return set(KEYS.BUDGET_CATS, list)
}

// ───── 账本 ─────

export function getLedgers() {
  return get(KEYS.LEDGERS, [{ id: 'general', name: '总账本' }])
}

export function saveLedgers(list) {
  return set(KEYS.LEDGERS, list)
}

export function addLedger(ledger) {
  const list = getLedgers()
  list.push({ ...ledger, id: ledger.id || Date.now().toString(36) })
  saveLedgers(list)
  return list
}

// ───── 当前选中账本 ─────

export function getSelectedLedgerId() {
  return get(KEYS.SELECTED_LEDGER, 'general')
}

export function setSelectedLedgerId(id) {
  return set(KEYS.SELECTED_LEDGER, id)
}

// ───── 用户 ─────

export function getUser() {
  return get(KEYS.USER, { name: '用户', email: '' })
}

export function saveUser(user) {
  return set(KEYS.USER, user)
}

// ───── 主题 ─────

export function getSavedTheme() {
  return get(KEYS.THEME, 'cosmic')
}

export function saveTheme(name) {
  return set(KEYS.THEME, name)
}

// ───── 工具 ─────

/** 清除所有数据（重置） */
export function clearAll() {
  Object.values(KEYS).forEach(k => {
    try { uni.removeStorageSync(k) } catch {}
  })
}

export { KEYS }