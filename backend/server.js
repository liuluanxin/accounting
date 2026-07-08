/**
 * 宇宙记账 - 后端服务
 * 支持邮箱验证码登录/注册/重置密码
 * 同时提供记账数据的 API
 */
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')

const app = express()
const PORT = 3000

// ========== 邮件配置 ==========
const EMAIL_CONFIG = {
  user: '1075091813@qq.com',
  pass: 'ekinyrxhvxyxbaei'  // QQ邮箱授权码
}

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_CONFIG.user,
    pass: EMAIL_CONFIG.pass
  }
})

// ========== 内存数据库 ==========
const db = {
  users: [],      // { id, email, username, password, createdAt }
  emailCodes: {}, // key: `${scene}:${email}` -> { code, expireAt }
  rateLimits: {}, // key: `send:${email}` -> timestamp
  ledgers: {},    // key: userId -> { accounts, transactions, categories, budgets, ledgers, currentLedger, settings }
}

// 生成ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 今天日期
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 初始化用户的默认账本数据
function createUserData() {
  return {
    accounts: [
      { id: 'acc_default', name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#4ADE80', desc: '', cardNumber: '', cardNumberHidden: true },
      { id: 'acc_bank', name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#6C63FF', desc: '', cardNumber: '', cardNumberHidden: true }
    ],
    transactions: [],
    categories: {
      expense: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '通讯', '服饰', '其他'],
      income: ['薪资', '奖金', '理财', '兼职', '红包', '其他']
    },
    budgets: {},
    ledgers: [{ id: 'l1', name: '个人账本', current: true }],
    currentLedger: 'l1',
    settings: { theme: 'dark', language: 'zh' }
  }
}

// ========== 中间件 ==========
app.use(cors())
app.use(express.json())

// 统一响应格式
function success(data = null, message = '操作成功') {
  return { success: true, message, data }
}

function failure(message = '操作失败', code = 'ERROR') {
  return { success: false, message, code, data: null }
}

// ========== 认证接口 ==========

// 发送邮箱验证码
app.post('/api/auth/send-email-code', async (req, res) => {
  const { email, scene = 'register' } = req.body

  if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.json(failure('请输入正确的邮箱地址', 'INVALID_EMAIL'))
  }

  // 防刷检查
  const rateKey = `send:${email}`
  const lastSend = db.rateLimits[rateKey]
  if (lastSend && Date.now() - lastSend < 60000) {
    return res.json(failure('发送太频繁，请60秒后再试', 'RATE_LIMIT'))
  }

  // 生成6位验证码
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const key = `${scene}:${email}`
  db.emailCodes[key] = {
    code,
    expireAt: Date.now() + 5 * 60 * 1000  // 5分钟过期
  }
  db.rateLimits[rateKey] = Date.now()

  // 发送邮件
  try {
    await transporter.sendMail({
      from: `"记账助手" <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: '记账助手 - 验证码',
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 24px; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; background: #FFF9F5;">
          <div style="background: #fff; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 16px rgba(61,35,22,0.06);">
            <h2 style="color: #E8734A; margin: 0 0 24px 0; font-size: 24px;">记账助手</h2>
            <p style="color: #7A5C4A; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              您好，您的验证码为：
            </p>
            <div style="font-size: 36px; font-weight: 700; color: #E8734A; padding: 20px; background: linear-gradient(135deg, rgba(232,115,74,0.08), rgba(232,115,74,0.02)); border-radius: 16px; text-align: center; letter-spacing: 8px; margin-bottom: 24px;">
              ${code}
            </div>
            <p style="color: #A98B78; font-size: 13px; line-height: 1.6; margin: 0;">
              验证码5分钟内有效，请勿泄露给他人。<br>
              如非本人操作，请忽略此邮件。
            </p>
          </div>
        </div>
      `
    })
    console.log(`[邮件已发送] ${email} 场景: ${scene} 验证码: ${code}`)
    res.json(success(null, '验证码已发送，请查看邮箱'))
  } catch (err) {
    console.error('[邮件发送失败]', err.message)
    res.json(failure('邮件发送失败，请稍后重试', 'EMAIL_ERROR'))
  }
})

// 注册
app.post('/api/auth/register', (req, res) => {
  const { email, code, password, username } = req.body

  if (!email) return res.json(failure('邮箱不能为空', 'INVALID_EMAIL'))
  if (!code) return res.json(failure('验证码不能为空', 'INVALID_CODE'))
  if (!password || password.length < 6) return res.json(failure('密码至少6位', 'INVALID_PASSWORD'))
  if (!username || username.length < 2) return res.json(failure('用户名至少2位', 'INVALID_USERNAME'))

  // 校验验证码
  const codeKey = `register:${email}`
  const savedCode = db.emailCodes[codeKey]
  if (!savedCode || savedCode.code !== code) {
    return res.json(failure('验证码错误', 'CODE_MISMATCH'))
  }
  if (savedCode.expireAt < Date.now()) {
    return res.json(failure('验证码已过期', 'CODE_EXPIRED'))
  }

  // 检查邮箱是否已注册
  const exists = db.users.find(u => u.email === email)
  if (exists) return res.json(failure('该邮箱已注册', 'EMAIL_EXISTS'))

  // 创建用户
  const user = {
    id: 'user_' + genId(),
    email,
    username,
    password,  // 生产环境应加密
    createdAt: Date.now()
  }
  db.users.push(user)
  delete db.emailCodes[codeKey]

  // 初始化用户账本数据
  db.ledgers[user.id] = createUserData()

  const token = 'token_' + genId() + '_' + genId()
  res.json(success({ token, user: { id: user.id, email, username } }, '注册成功'))
})

// 登录
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email) return res.json(failure('邮箱不能为空', 'INVALID_EMAIL'))
  if (!password) return res.json(failure('密码不能为空', 'INVALID_PASSWORD'))

  const user = db.users.find(u => u.email === email)
  if (!user) return res.json(failure('该邮箱未注册', 'EMAIL_NOT_FOUND'))
  if (user.password !== password) return res.json(failure('密码错误', 'PASSWORD_MISMATCH'))

  const token = 'token_' + genId() + '_' + genId()
  res.json(success({ token, user: { id: user.id, email: user.email, username: user.username } }, '登录成功'))
})

// 重置密码
app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, password } = req.body

  if (!email) return res.json(failure('邮箱不能为空', 'INVALID_EMAIL'))
  if (!code) return res.json(failure('验证码不能为空', 'INVALID_CODE'))
  if (!password || password.length < 6) return res.json(failure('密码至少6位', 'INVALID_PASSWORD'))

  const codeKey = `reset:${email}`
  const savedCode = db.emailCodes[codeKey]
  if (!savedCode || savedCode.code !== code) {
    return res.json(failure('验证码错误', 'CODE_MISMATCH'))
  }
  if (savedCode.expireAt < Date.now()) {
    return res.json(failure('验证码已过期', 'CODE_EXPIRED'))
  }

  const user = db.users.find(u => u.email === email)
  if (!user) return res.json(failure('该邮箱未注册', 'EMAIL_NOT_FOUND'))

  user.password = password
  delete db.emailCodes[codeKey]

  res.json(success(null, '密码重置成功'))
})

// ========== 记账数据接口（需要认证） ==========

// 简单的 token 认证中间件
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json(failure('请先登录', 'UNAUTHORIZED'))
  }
  // 简化处理：所有 token 都通过（生产环境应校验 token 有效性）
  next()
}

// 获取当前用户的账本数据
function getUserData(req) {
  // 简化处理：通过 email 查找用户数据
  // 生产环境应通过 token 解析 userId
  const email = req.body?.email || req.query?.email || 'default'
  const user = db.users.find(u => u.email === email)
  if (!user) return createUserData()
  return db.ledgers[user.id] || createUserData()
}

function saveUserData(req, data) {
  const email = req.body?.email || req.query?.email || 'default'
  const user = db.users.find(u => u.email === email)
  if (user) {
    db.ledgers[user.id] = data
  }
}

// 交易列表
app.get('/api/transactions', (req, res) => {
  const userData = getUserData(req)
  const { date, year, month, ledgerId } = req.query
  let list = [...userData.transactions]
  if (ledgerId) list = list.filter(t => t.ledgerId === ledgerId)
  if (date) list = list.filter(t => t.date === date)
  else if (year && month) {
    const p = `${year}-${String(month).padStart(2, '0')}`
    list = list.filter(t => t.date && t.date.startsWith(p))
  }
  list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
  res.json(success({ list }))
})

// 创建交易
app.post('/api/transactions', (req, res) => {
  const userData = getUserData(req)
  const { type, amount, category, accountId, ledgerId, date, note } = req.body

  if (!type || !['expense', 'income'].includes(type)) {
    return res.json(failure('类型无效', 'INVALID_TYPE'))
  }
  if (!category) return res.json(failure('请选择分类', 'INVALID_CATEGORY'))
  if (!accountId) return res.json(failure('请选择账户', 'INVALID_ACCOUNT'))

  const num = parseFloat(amount)
  if (isNaN(num) || num <= 0) return res.json(failure('金额无效', 'INVALID_AMOUNT'))

  const now = new Date()
  const tx = {
    id: 'tx_' + genId(),
    type,
    amount: Math.round(num * 100) / 100,
    category,
    accountId,
    ledgerId: ledgerId || userData.currentLedger,
    date: date || todayStr(),
    time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
    note: (note || '').trim() || category,
    tags: []
  }

  userData.transactions.unshift(tx)
  const acct = userData.accounts.find(a => a.id === tx.accountId)
  if (acct) {
    acct.balance = Math.round((acct.balance + (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
  }
  saveUserData(req, userData)
  res.json(success(tx, '账单已保存'))
})

// 删除交易
app.delete('/api/transactions', (req, res) => {
  const userData = getUserData(req)
  const { id } = req.body
  const idx = userData.transactions.findIndex(t => t.id === id)
  if (idx === -1) return res.json(failure('交易不存在', 'NOT_FOUND'))

  const tx = userData.transactions[idx]
  const acct = userData.accounts.find(a => a.id === tx.accountId)
  if (acct) {
    acct.balance = Math.round((acct.balance - (tx.type === 'income' ? tx.amount : -tx.amount)) * 100) / 100
  }
  userData.transactions.splice(idx, 1)
  saveUserData(req, userData)
  res.json(success(null, '交易已删除'))
})

// 账户列表
app.get('/api/accounts', (req, res) => {
  const userData = getUserData(req)
  res.json(success({ list: userData.accounts }))
})

// 创建账户
app.post('/api/accounts', (req, res) => {
  const userData = getUserData(req)
  const { name, type, balance, icon, color, desc, cardNumber, cardNumberHidden } = req.body
  if (!name) return res.json(failure('账户名称不能为空', 'INVALID_NAME'))

  const account = {
    id: 'acc_' + genId(),
    name,
    type: type || 'bank',
    balance: balance || 0,
    icon: icon || '💳',
    color: color || '#6C63FF',
    desc: desc || '',
    cardNumber: cardNumber || '',
    cardNumberHidden: cardNumberHidden !== undefined ? cardNumberHidden : true
  }
  userData.accounts.push(account)
  saveUserData(req, userData)
  res.json(success(account, '账户已添加'))
})

// 更新账户
app.put('/api/accounts', (req, res) => {
  const userData = getUserData(req)
  const { id, ...updates } = req.body
  const idx = userData.accounts.findIndex(a => a.id === id)
  if (idx === -1) return res.json(failure('账户不存在', 'NOT_FOUND'))

  Object.assign(userData.accounts[idx], updates)
  saveUserData(req, userData)
  res.json(success(userData.accounts[idx], '账户已更新'))
})

// 删除账户
app.delete('/api/accounts', (req, res) => {
  const userData = getUserData(req)
  const { id } = req.body
  const idx = userData.accounts.findIndex(a => a.id === id)
  if (idx === -1) return res.json(failure('账户不存在', 'NOT_FOUND'))

  userData.transactions = userData.transactions.filter(t => t.accountId !== id)
  userData.accounts.splice(idx, 1)
  saveUserData(req, userData)
  res.json(success(null, '账户已删除'))
})

// 预算
app.get('/api/budgets', (req, res) => {
  const userData = getUserData(req)
  const key = req.query?.key || ''
  res.json(success(userData.budgets[key] || null))
})

app.post('/api/budgets', (req, res) => {
  const userData = getUserData(req)
  const { key, total } = req.body
  if (!key || typeof total !== 'number' || total < 0) {
    return res.json(failure('预算参数无效', 'INVALID_BUDGET'))
  }
  if (!userData.budgets[key]) userData.budgets[key] = {}
  userData.budgets[key].total = total
  saveUserData(req, userData)
  res.json(success(null, '预算已更新'))
})

// 分类
app.get('/api/categories', (req, res) => {
  const userData = getUserData(req)
  res.json(success(userData.categories))
})

// 账本
app.get('/api/ledgers', (req, res) => {
  const userData = getUserData(req)
  res.json(success({ list: userData.ledgers, currentId: userData.currentLedger }))
})

app.post('/api/ledgers', (req, res) => {
  const userData = getUserData(req)
  const { name, cover, category, color } = req.body
  const newLedger = {
    id: 'l' + genId(),
    name: name || '新账本',
    cover: cover || '📒',
    category: category || 'personal',
    color: color || '',
    current: false
  }
  userData.ledgers.push(newLedger)
  saveUserData(req, userData)
  res.json(success(newLedger, '新账本已创建'))
})

app.post('/api/ledgers/switch', (req, res) => {
  const userData = getUserData(req)
  const { id } = req.body
  if (!userData.ledgers.some(l => l.id === id)) {
    return res.json(failure('账本不存在', 'NOT_FOUND'))
  }
  userData.ledgers.forEach(l => { l.current = l.id === id })
  userData.currentLedger = id
  saveUserData(req, userData)
  res.json(success(null, '账本已切换'))
})

app.post('/api/ledgers/delete', (req, res) => {
  const userData = getUserData(req)
  const { id } = req.body
  userData.ledgers = userData.ledgers.filter(l => l.id !== id)
  saveUserData(req, userData)
  res.json(success(null, '账本已删除'))
})

// 仪表盘
app.get('/api/dashboard', (req, res) => {
  const userData = getUserData(req)
  const { year, month } = req.query || {}
  const p = year ? `${year}-${String(month).padStart(2, '0')}` : ''
  const monthTxs = p ? userData.transactions.filter(t => t.date && t.date.startsWith(p)) : userData.transactions

  let income = 0, expense = 0
  monthTxs.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount })

  const budget = userData.budgets[p]
  res.json(success({
    income: Math.round(income * 100) / 100,
    expense: Math.round(expense * 100) / 100,
    balance: Math.round((income - expense) * 100) / 100,
    budgetTotal: budget ? budget.total : 0,
    totalAssets: Math.round(userData.accounts.reduce((s, a) => s + (a.balance || 0), 0) * 100) / 100,
    txCount: monthTxs.length
  }))
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '宇宙记账后端服务运行中' })
})

// 启动服务
app.listen(PORT, () => {
  console.log(`====================================`)
  console.log(`  宇宙记账后端服务已启动`)
  console.log(`  http://localhost:${PORT}`)
  console.log(`  邮箱服务: ${EMAIL_CONFIG.user}`)
  console.log(`====================================`)
})
