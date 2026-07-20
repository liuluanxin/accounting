/**
 * 宇宙记账 - 常量配置
 * 分类定义、图标映射、工具函数
 * 非模拟数据，属于应用基础配置
 */

/* ===== 分类图标 Emoji 映射 ===== */
export const CAT_EMOJI = {
  food: '🍜', drink: '🥤', snack: '🍪', fruit: '🍎',
  traffic: '🚌', taxi: '🚕', fuel: '⛽', parking: '🅿️',
  shopping: '🛍️', clothes: '👗', digital: '📱', home: '🏠',
  fun: '🎮', movie: '🎬', travel: '✈️', sport: '🏀',
  daily: '🧴', pet: '🐱', book: '📚', gift: '🎁',
  education: '📖', medical: '💊', communication: '📞',
  housing: '🏡', salary: '💰', bonus: '🧧', invest: '📈',
  parttime: '💼', redpack: '🧧', finance: '📊', rent: '🏘️',
  other: '📦', default: '📦'
}

/* ===== 品牌图标 ===== */
export const BRAND_ICONS = {
  wallet: '👛', cash: '💵', alipay: '💳', wechat: '💚',
  bank: '🏦', icbc: '🏦', ccb: '🏦', abc: '🏦',
  boc: '🏦', cmb: '🏦', citic: '🏦', spdb: '🏦',
  card: '💳', credit: '💳', invest: '📈', fund: '📊'
}

/* ===== 支出分类 ===== */
export const EXPENSE_CATS = [
  { name: '餐饮', emoji: '🍜', subs: ['早餐', '午餐', '晚餐', '外卖', '零食'] },
  { name: '交通', emoji: '🚌', subs: ['公交', '地铁', '打车', '加油', '停车'] },
  { name: '购物', emoji: '🛍️', subs: ['服装', '数码', '家居', '美妆'] },
  { name: '娱乐', emoji: '🎮', subs: ['游戏', '电影', '旅游', '运动'] },
  { name: '日用', emoji: '🧴', subs: ['洗护', '清洁', '宠物'] },
  { name: '学习', emoji: '📚', subs: ['书籍', '课程', '文具'] },
  { name: '通讯', emoji: '📞', subs: ['话费', '流量', '会员'] },
  { name: '医疗', emoji: '💊', subs: ['药品', '检查', '住院'] },
  { name: '住房', emoji: '🏡', subs: ['房租', '水电', '物业', '维修'] },
  { name: '其他', emoji: '📦', subs: ['其他'] }
]

/* ===== 收入分类 ===== */
export const INCOME_CATS = [
  { name: '工资', emoji: '💰', subs: ['月薪', '奖金', '补贴'] },
  { name: '奖金', emoji: '🧧', subs: ['年终', '绩效', '项目'] },
  { name: '投资', emoji: '📈', subs: ['股票', '基金', '理财'] },
  { name: '兼职', emoji: '💼', subs: ['接单', '咨询', '其他'] },
  { name: '红包', emoji: '🧧', subs: ['微信', '支付宝', '其他'] },
  { name: '理财', emoji: '📊', subs: ['利息', '分红', '收益'] },
  { name: '租金', emoji: '🏘️', subs: ['房屋', '设备', '其他'] },
  { name: '其他', emoji: '📦', subs: ['其他'] }
]

/* ===== 工具函数 ===== */
export function fmt(n) {
  const num = Number(n)
  if (isNaN(num)) return '¥0.00'
  return '¥' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function f2(n) {
  return fmt(n)
}

export function getCatEmoji(name) {
  const all = [...EXPENSE_CATS, ...INCOME_CATS]
  const found = all.find(c => c.name === name)
  return found ? found.emoji : '📦'
}

export default { CAT_EMOJI, BRAND_ICONS, EXPENSE_CATS, INCOME_CATS, fmt, getCatEmoji }