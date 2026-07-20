/**
 * 宇宙记账 · 应用数据层
 * 所有数据从 db.js（本地存储）读取，无硬编码 mock 数据
 */
import { catEmoji } from '@/common/lucide-icons.js'
import { fmt, f2 } from '@/common/constants.js'
import * as db from '@/common/db.js'

export { fmt, f2 }

/** 当前选中账本 ID（'general' = 全部） */
export function getActiveLedgerId() {
  return db.getSelectedLedgerId()
}

export function setActiveLedgerId(id) {
  db.setSelectedLedgerId(id)
}

/** 按账本过滤账单：'general' 或未传时不过滤（显示全部） */
function filterByLedger(bills, ledgerId) {
  if (!ledgerId || ledgerId === 'general') return bills
  return bills.filter(b => b.ledger === ledgerId)
}

/** 分类定义（固定配置，非用户数据） */
export const CAT_GROUPS = {
	expense: [
		{ ic: 'cloche', name: '餐饮', subs: [{ ic: 'utensils', name: '三餐' }, { ic: 'coffee', name: '早餐' }, { ic: 'utensils', name: '午餐' }, { ic: 'utensils', name: '晚餐' }] },
		{ ic: 'car', name: '交通', subs: [{ ic: 'subway', name: '地铁' }, { ic: 'car', name: '打车' }] },
		{ ic: 'shopping-bag', name: '购物', subs: [{ ic: 'shopping-bag', name: '淘宝' }] },
		{ ic: 'handshake', name: '社交', subs: [{ ic: 'gift', name: '红包' }] },
		{ ic: 'home', name: '日常', subs: [{ ic: 'home', name: '房贷' }, { ic: 'home', name: '水电' }] },
		{ ic: 'gamepad-2', name: '娱乐', subs: [{ ic: 'gamepad-2', name: '游戏' }, { ic: 'film', name: '电影' }] },
		{ ic: 'cookie', name: '零食', subs: [{ ic: 'cookie', name: '零食' }] },
		{ ic: 'shirt', name: '服饰', subs: [{ ic: 'shirt', name: '衣服' }] }
	],
	income: [
		{ ic: 'banknote', name: '工资', subs: [{ ic: 'banknote', name: '月薪' }] },
		{ ic: 'gift', name: '红包', subs: [{ ic: 'gift', name: '生日' }] },
		{ ic: 'trending-up', name: '理财', subs: [{ ic: 'trending-up', name: '基金' }] }
	],
	transfer: [
		{ ic: 'credit-card', name: '银行卡', subs: [{ ic: 'banknote', name: '转入' }, { ic: 'banknote', name: '转出' }] }
	]
}

// ───── 账户 ─────

export function getAccounts() {
  return db.getAccounts()
}

export function saveAccounts(list) {
  db.saveAccounts(list)
}

export function addAccount(acc) {
  return db.addAccount(acc)
}

export function getNetAssets() {
  return db.getAccounts().reduce((s, a) => s + a.bal, 0)
}

// ───── 账单 ─────

export function getBills() {
  return db.getBills()
}

export function addBill(bill) {
  return db.addBill(bill)
}

export function updateBill(id, updates) {
  return db.updateBill(id, updates)
}

export function deleteBill(id) {
  return db.deleteBill(id)
}

export function getBillById(id) {
  return db.getBills().find(b => b.id === id) || null
}

/** 获取当年账单（按日期分组） */
export function getYearBills(ledgerId) {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const all = filterByLedger(db.getBills(), ledgerId)
    .filter(b => b.ts >= yearStart.getTime())
    .sort((a, b) => b.ts - a.ts)
  return groupBillsByDate(all)
}

/** 按日期分组账单 */
function groupBillsByDate(bills) {
  const map = {}
  bills.forEach(b => {
    const d = new Date(b.ts)
    const label = `${d.getMonth() + 1}月${d.getDate()}日`
    if (!map[label]) {
      map[label] = { date: label, ts: b.ts, sum: 0, expense: 0, income: 0, items: [] }
    }
    map[label].sum += b.amt
    if (b.amt < 0) map[label].expense += Math.abs(b.amt)
    else map[label].income += b.amt
    // 添加图标 emoji
    map[label].items.push({
      ...b,
      iconEmoji: catEmoji(b.ic)
    })
  })
  return Object.values(map)
}

/** 筛选全部账单 */
export function filterBills(bookFilter = '全部账本', dateFilter = '全部') {
  let bills = db.getBills()
  // 按账本筛选
  if (bookFilter === '全部账本' || bookFilter === '总账本') {
    // 显示全部
  } else {
    bills = bills.filter(b => b.ledger === bookFilter)
  }
  // 按日期筛选
  const now = new Date()
  if (dateFilter === '今天') {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    bills = bills.filter(b => b.ts >= s)
  } else if (dateFilter === '本月') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    bills = bills.filter(b => b.ts >= s)
  }
  const groups = groupBillsByDate(bills.sort((a, b) => b.ts - a.ts))
  const vis = bills
  const totalExp = vis.filter(i => i.amt < 0).reduce((s, i) => s + Math.abs(i.amt), 0)
  const totalInc = vis.filter(i => i.amt > 0).reduce((s, i) => s + i.amt, 0)
  return { groups, totalExp, totalInc, totalBalance: totalInc - totalExp, count: vis.length }
}

// ───── 首页汇总 ─────

export function getHomeSummary(ledgerId) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
  const monthBills = filterByLedger(
    db.getBills().filter(b => b.ts >= monthStart && b.ts < monthEnd),
    ledgerId
  )
  const monthExpense = monthBills.filter(b => b.amt < 0).reduce((s, b) => s + Math.abs(b.amt), 0)
  const monthIncome = monthBills.filter(b => b.amt > 0).reduce((s, b) => s + b.amt, 0)
  const budgetTotal = db.getBudgetTotal()
  const budgetUsed = monthExpense
  const budgetRemain = Math.max(0, budgetTotal - budgetUsed)
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const remainDays = Math.max(1, daysInMonth - dayOfMonth + 1)
  return {
    month: now.getMonth() + 1,
    monthExpense,
    monthIncome,
    monthBalance: monthIncome - monthExpense,
    budgetTotal,
    budgetUsed,
    budgetRemain,
    budgetPercent: budgetTotal > 0 ? Math.min(100, budgetUsed / budgetTotal * 100) : 0,
    dailyBudget: budgetTotal > 0 ? budgetTotal / daysInMonth : 0,
    todayAvailable: budgetRemain / remainDays
  }
}

// ───── 统计 ─────

export function getStatBills(range, type, cursor = {}, ledgerId) {
  const now = new Date()
  const y = cursor.statYear ?? now.getFullYear()
  const m = cursor.statMonth ?? (now.getMonth() + 1)
  const ws = cursor.statWeekStart ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })()
  let s, e
  if (range === 'year') {
    s = new Date(y, 0, 1).getTime()
    e = new Date(y + 1, 0, 1).getTime()
  } else if (range === 'month') {
    s = new Date(y, m - 1, 1).getTime()
    e = new Date(y, m, 1).getTime()
  } else if (range === 'week') {
    s = ws
    e = ws + 7 * 86400000
  } else {
    s = 0
    e = Infinity
  }
  const bills = filterByLedger(db.getBills().filter(b => b.ts >= s && b.ts < e), ledgerId)
  return bills
}

export function statData(range, type, cursor = {}, ledgerId) {
  const bills = getStatBills(range, type, cursor, ledgerId)
  const expense = bills.filter(b => b.amt < 0).reduce((s, b) => s + Math.abs(b.amt), 0)
  const income = bills.filter(b => b.amt > 0).reduce((s, b) => s + b.amt, 0)
  const count = bills.length
  const balance = income - expense
  const sign = type === 'income' ? 1 : -1
  const cmap = {}
  bills.filter(b => b.amt * sign > 0).forEach(b => {
    const cat = b.cat || '其他'
    if (!cmap[cat]) cmap[cat] = { name: cat, sum: 0, cnt: 0, emoji: catEmoji(b.ic) }
    cmap[cat].sum += Math.abs(b.amt)
    cmap[cat].cnt++
  })
  const cats = Object.values(cmap).sort((a, b) => b.sum - a.sum)
  const denom = type === 'income' ? income : expense
  cats.forEach(c => { c.pct = denom > 0 ? +(c.sum / denom * 100).toFixed(2) : 0 })
  return { bills, expense, income, balance, count, cats, range, type }
}

export function statRows(range, bills) {
  const f = {}
  bills.forEach(b => {
    const d = new Date(b.ts)
    let label, key
    if (range === 'week') {
      label = `${d.getMonth() + 1}月${d.getDate()}日`
      key = d.getDate()
    } else if (range === 'month') {
      const w = Math.floor((d.getDate() - 1) / 7) + 1
      label = `第${w}周`
      key = w
    } else if (range === 'year') {
      label = `${d.getMonth() + 1}月`
      key = d.getMonth() + 1
    } else {
      label = `${d.getFullYear()}年`
      key = d.getFullYear()
    }
    if (!f[label]) f[label] = { label, key, income: 0, expense: 0 }
    if (b.amt > 0) f[label].income += b.amt
    else f[label].expense += Math.abs(b.amt)
  })
  return Object.values(f).sort((a, b) => a.key - b.key).map(r => ({
    ...r, balance: r.income - r.expense
  }))
}

// ───── 日历 ─────

export function getCalMonthMap(year, month, ledgerId) {
  const s = new Date(year, month - 1, 1).getTime()
  const e = new Date(year, month, 1).getTime()
  const bills = filterByLedger(db.getBills().filter(b => b.ts >= s && b.ts < e), ledgerId)
  const map = {}
  bills.forEach(b => {
    const d = new Date(b.ts).getDate()
    if (!map[d]) map[d] = { d, income: 0, expense: 0, dot: false }
    if (b.amt > 0) {
      map[d].income += b.amt
    } else {
      map[d].expense += Math.abs(b.amt)
    }
    if (b.amt !== 0) map[d].dot = true
  })
  return map
}

export function getCalDayBills(year, month, day, ledgerId) {
  const s = new Date(year, month - 1, day).getTime()
  const e = new Date(year, month - 1, day + 1).getTime()
  return filterByLedger(db.getBills().filter(b => b.ts >= s && b.ts < e), ledgerId).map(b => ({
    name: b.name || b.cat || '其他',
    account: b.acc || '未分类',
    amount: b.amt,
    emoji: catEmoji(b.ic)
  }))
}

// ───── 预算 ─────

export function getBudgetTotal() {
  return db.getBudgetTotal()
}

export function saveBudgetTotal(val) {
  db.saveBudgetTotal(val)
}

export function getBudgetCats() {
  return db.getBudgetCats()
}

export function saveBudgetCats(list) {
  db.saveBudgetCats(list)
}

// ───── 账本 ─────

export function getLedgers() {
  return db.getLedgers()
}

export function getLedger(id) {
  const list = db.getLedgers()
  return list.find(l => l.id === id) || list[0] || { id: 'general', name: '总账本' }
}

export function addLedger(ledger) {
  return db.addLedger(ledger)
}

// ───── 用户 ─────

export function getUser() {
  return db.getUser()
}

export function saveUser(user) {
  db.saveUser(user)
}

// ───── 常用快捷分类 ─────

export function freqSubs(type) {
  const groups = CAT_GROUPS[type] || CAT_GROUPS.expense
  return groups.slice(0, 4).map(g => ({
    cat: g.name,
    sub: g.subs[0].name,
    ic: g.subs[0].ic
  }))
}

