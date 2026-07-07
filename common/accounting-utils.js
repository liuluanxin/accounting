/**
 * 宇宙记账 - 工具函数模块
 * 提供ID生成、日期格式化、分类图标映射等通用功能
 */

// 分类图标映射
export const CAT_ICONS = {
  '餐饮': '🍜', '交通': '🚗', '购物': '🛒', '娱乐': '🎬',
  '医疗': '💊', '教育': '📚', '居住': '🏠', '薪资': '💰',
  '奖金': '🎁', '理财': '📈', '其他': '📦', '通讯': '📱',
  '兼职': '💼', '服饰': '👔', '红包': '🧧'
}

export const CAT_ICONS_COLOR = {
  '餐饮': '#FF6B6B', '交通': '#4A7CF7', '购物': '#FF9F43', '娱乐': '#A55EEA',
  '居住': '#F368E0', '医疗': '#1DD1A1', '教育': '#54A0FF', '通讯': '#5F27CD',
  '服饰': '#FF9FF3', '其他': '#8395A7', '薪资': '#4ADE80', '奖金': '#FFD700',
  '理财': '#48DBFB', '兼职': '#FF9F43', '红包': '#FF6B6B'
}

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
export const MONTHS = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

/** 生成唯一ID */
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** 获取今日日期字符串 */
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 获取当前年月Key */
export function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 格式化金额 */
export function formatMoney(amount) {
  return Number(amount).toFixed(2)
}

/** 创建空数据初始状态（包含默认账户） */
export function createEmptyData() {
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
