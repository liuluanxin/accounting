'use strict';
/**
 * 宇宙记账 - 云函数 API 网关
 * 处理所有记账数据和用户认证请求
 */
const tls = require('tls');
const crypto = require('crypto');
const db = uniCloud.database();
const dbCmd = db.command;
const uniID = require('uni-id-common');
const verifyCollection = db.collection('opendb-verify-codes');

/**
 * uni-id-co 响应转标准格式
 */
function normalize(result) {
  if (!result) return { success: false, message: '操作失败', code: 'ERROR', data: null };
  // uni-id-co 返回 { code: 0, message: '成功', ... }
  if (result.code === 0) {
    return { success: true, message: result.message || '操作成功', data: result.data || null };
  }
  // 纯成功响应
  if (result.errCode === 0 || result.code === undefined) {
    return { success: true, message: result.message || '操作成功', data: result.data || result };
  }
  return { success: false, message: result.message || result.errMsg || '操作失败', code: result.code || 'ERROR', data: null };
}

/**
 * 成功响应
 */
function success(data = null, message = '操作成功') {
  return { success: true, message, data };
}

/**
 * 失败响应
 */
function failure(message = '操作失败', code = 'ERROR') {
  return { success: false, message, code, data: null };
}

/**
 * 从 token 解析用户ID
 */
async function getUserId(context) {
  try {
    const token = context.uniIdToken;
    if (!token) return null;
    const payload = await uniID.checkToken(token);
    if (payload.errCode) return null;
    return payload.uid;
  } catch (e) {
    return null;
  }
}

/**
 * 获取随机验证码
 */
function getVerifyCode(len = 6) {
  let code = '';
  for (let i = 0; i < len; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * 通过 SMTP 发送邮件
 */
function sendMail({ host, port, secure, auth, from, to, subject, text }) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let step = 0;
    const b64 = (s) => Buffer.from(s).toString('base64');
    const cmds = [];

    cmds.push(() => { client.write('EHLO localhost\r\n'); });
    cmds.push(() => { client.write('AUTH LOGIN\r\n'); });
    cmds.push(() => { client.write(b64(auth.user) + '\r\n'); });
    cmds.push(() => { client.write(b64(auth.pass) + '\r\n'); });
    cmds.push(() => { client.write('MAIL FROM:<' + from + '>\r\n'); });
    cmds.push(() => { client.write('RCPT TO:<' + to + '>\r\n'); });
    cmds.push(() => { client.write('DATA\r\n'); });
    cmds.push(() => {
      const body = [
        'From: ' + from,
        'To: ' + to,
        'Subject: =?UTF-8?B?' + b64(subject) + '?=',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        b64(text),
        '.'
      ].join('\r\n');
      client.write(body + '\r\n');
    });
    cmds.push(() => { client.write('QUIT\r\n'); });

    const client = tls.connect({ host: host || 'smtp.qq.com', port: port || 465, rejectUnauthorized: false });

    client.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\r\n').filter(l => l);
      const last = lines[0] || '';
      const check = (prefixes) => prefixes.some(p => last.startsWith(p));

      if (step === 0 && check(['220'])) { buffer = ''; step++; cmds[0](); }
      else if (step === 1 && check(['250', '220'])) { buffer = ''; step++; cmds[1](); }
      else if (step === 2 && check(['334'])) { buffer = ''; step++; cmds[2](); }
      else if (step === 3 && check(['334'])) { buffer = ''; step++; cmds[3](); }
      else if (step === 4 && check(['235', '334'])) { buffer = ''; step++; cmds[4](); }
      else if (step === 5 && check(['250'])) { buffer = ''; step++; cmds[5](); }
      else if (step === 6 && check(['250'])) { buffer = ''; step++; cmds[6](); }
      else if (step === 7 && check(['354'])) { buffer = ''; step++; cmds[7](); }
      else if (step === 8 && check(['250'])) { step = 99; client.end(); resolve(true); }
      else if (step >= 9) { client.end(); resolve(true); }
    });

    client.on('error', (err) => { reject(err); });
    client.setTimeout(15000, () => { client.destroy(); reject(new Error('SMTP 超时')); });
  });
}

/**
 * 直接发送邮箱验证码（不通过 uni-id-co）
 */
async function sendEmailCodeDirect(email, scene) {
  // 读取邮箱配置
  let emailConfig;
  try {
    emailConfig = require('uni-config-center/uni-id/config.json').email;
  } catch (e) {
    throw new Error('邮箱配置读取失败');
  }
  if (!emailConfig || !emailConfig.smtp) {
    throw new Error('邮箱未配置');
  }

  // 生成验证码
  const code = getVerifyCode(6);
  const expiresIn = emailConfig.codeExpiresIn || 300;
  const now = Date.now();

  // 获取模板
  const sceneMap = { register: 'register', 'reset-pwd-by-email': 'resetPwd', reset: 'resetPwd' };
  const tplKey = sceneMap[scene] || 'register';
  const template = (emailConfig.template && emailConfig.template[tplKey]) || emailConfig.template.register;
  const subject = template.subject.replace('${code}', code);
  const text = template.text.replace('${code}', code);

  // 存储验证码到数据库
  await verifyCollection.add({
    email: email.toLowerCase().trim(),
    scene,
    code,
    state: 0,
    created_date: now,
    expired_date: now + expiresIn * 1000
  });

  // 发送邮件
  await sendMail({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    auth: emailConfig.smtp.auth,
    from: '宇宙记账 <' + emailConfig.sendEmail + '>',
    to: email,
    subject,
    text
  });
}

/**
 * 直接通过邮箱重置密码（不通过 uni-id-co）
 */
async function resetPasswordDirect(email, code, password) {
  // 1. 验证邮箱验证码
  const verifyRes = await verifyCollection.where({
    email: email.toLowerCase().trim(),
    code,
    state: 0,
    scene: 'reset',
    expired_date: dbCmd.gt(Date.now())
  }).limit(1).get();

  if (verifyRes.data.length === 0) {
    throw new Error('验证码无效或已过期');
  }

  // 标记验证码已使用
  await verifyCollection.doc(verifyRes.data[0]._id).update({ state: 1 });

  // 2. 查找用户
  const userRes = await db.collection('uni-id-users').where({ email: email.toLowerCase().trim() }).limit(1).get();
  if (userRes.data.length === 0) {
    throw new Error('该邮箱未注册');
  }
  const user = userRes.data[0];

  // 3. 生成密码哈希（HMAC-SHA1，使用配置中的 passwordSecret）
  const config = require('uni-config-center/uni-id/config.json');
  const secret = config.passwordSecret;
  if (!secret) {
    throw new Error('密码加密配置缺失');
  }
  const hmac = crypto.createHmac('sha1', secret.toString('ascii'));
  hmac.update(password);
  const passwordHash = hmac.digest('hex');

  // 4. 更新密码，并使旧 token 失效
  await db.collection('uni-id-users').doc(user._id).update({
    password: passwordHash,
    password_secret_version: 0,
    valid_token_date: Date.now()
  });
}

/**
 * 通过邮箱注册
 */
async function registerDirect(email, password, code, nickname) {
  // 1. 验证邮箱验证码
  const verifyRes = await verifyCollection.where({
    email: email.toLowerCase().trim(),
    code,
    state: 0,
    scene: 'register',
    expired_date: dbCmd.gt(Date.now())
  }).limit(1).get();

  if (verifyRes.data.length === 0) {
    throw new Error('验证码无效或已过期');
  }
  await verifyCollection.doc(verifyRes.data[0]._id).update({ state: 1 });

  // 2. 检查邮箱是否已注册
  const existRes = await db.collection('uni-id-users').where({ email: email.toLowerCase().trim() }).limit(1).get();
  if (existRes.data.length > 0) {
    throw new Error('该邮箱已注册');
  }

  // 3. 生成密码哈希
  const config = require('uni-config-center/uni-id/config.json');
  const secret = config.passwordSecret;
  if (!secret) throw new Error('密码加密配置缺失');
  const hmac = crypto.createHmac('sha1', secret.toString('ascii'));
  hmac.update(password);
  const passwordHash = hmac.digest('hex');

  // 4. 创建用户
  const now = Date.now();
  const userRecord = {
    email: email.toLowerCase().trim(),
    nickname: nickname || email.split('@')[0],
    username: nickname || email.split('@')[0],
    password: passwordHash,
    password_secret_version: 0,
    register_date: now,
    register_ip: '',
    last_login_date: now,
    valid_token_date: now,
    status: 0
  };
  const addRes = await db.collection('uni-id-users').add(userRecord);
  const uid = addRes.id;

  // 5. 生成 token
  let token = '';
  try {
    const result = await uniID.createToken({ uid });
    token = result.token;
  } catch (e) {
    // token 生成失败不影响注册
  }

  return { uid, email, token, nickname: userRecord.nickname };
}

/**
 * 通过邮箱登录
 */
async function loginDirect(email, password) {
  // 1. 查找用户
  const userRes = await db.collection('uni-id-users').where({ email: email.toLowerCase().trim() }).limit(1).get();
  if (userRes.data.length === 0) {
    throw new Error('该邮箱未注册');
  }
  const user = userRes.data[0];

  // 2. 验证密码
  const config = require('uni-config-center/uni-id/config.json');
  const secret = config.passwordSecret;
  if (!secret) throw new Error('密码加密配置缺失');
  const hmac = crypto.createHmac('sha1', secret.toString('ascii'));
  hmac.update(password);
  const passwordHash = hmac.digest('hex');
  if (user.password !== passwordHash) {
    throw new Error('密码错误');
  }

  // 3. 生成 token
  let token = '';
  try {
    const result = await uniID.createToken({ uid: user._id });
    token = result.token;
  } catch (e) {
    // token 生成失败不影响登录
  }

  // 4. 更新最后登录时间
  await db.collection('uni-id-users').doc(user._id).update({
    last_login_date: Date.now()
  });

  return {
    uid: user._id,
    email: user.email,
    nickname: user.nickname || user.email.split('@')[0],
    token
  };
}

/**
 * 调用 uni-id-co 云对象
 */
async function callUniIdCo(action, params, context) {
  try {
    // 获取原始客户端信息，并确保 uniPlatform 始终有值
    let rawClientInfo = {};
    if (context && context.getUniversalClientInfo) {
      try {
        rawClientInfo = context.getUniversalClientInfo();
      } catch (e) {
        // ignore
      }
    }
    const clientInfo = {
      ...rawClientInfo,
      uniPlatform: rawClientInfo.uniPlatform || 'web'
    };
    const uniIDCo = uniCloud.importObject('uni-id-co', {
      clientInfo
    });
    const result = await uniIDCo[action](params);
    return normalize(result);
  } catch (e) {
    return failure(e.message || '认证服务异常', 'AUTH_ERROR');
  }
}

/**
 * 根据用户ID获取或初始化用户数据集合
 */
function getUserCollection(userId, collectionName) {
  return db.collection(collectionName).where({ userId });
}

exports.main = async (event, context) => {
  const { action, data = {} } = event;
  const userId = await getUserId(context);

  try {
    switch (action) {

      // ========== 认证相关（直接实现） ==========

      case 'sendEmailCode': {
        const { email, scene } = data;
        if (!email) return failure('邮箱不能为空', 'INVALID_EMAIL');
        if (!scene) return failure('场景参数缺失', 'INVALID_PARAM');

        // 生成 6 位验证码并存入数据库
        const code = getVerifyCode(6);
        const now = Date.now();
        const expiresIn = 300;
        await verifyCollection.add({
          email: email.toLowerCase().trim(),
          scene,
          code,
          state: 0,
          created_date: now,
          expired_date: now + expiresIn * 1000
        });

        return success({ mockCode: code }, '验证码已发送（开发模式，验证码: ' + code + '）');
      }

      case 'register': {
        try {
          const { email, password, code, username } = data;
          if (!email) return failure('邮箱不能为空', 'INVALID_EMAIL');
          if (!code) return failure('验证码不能为空', 'INVALID_CODE');
          if (!password || password.length < 6) return failure('密码至少6位', 'INVALID_PASSWORD');
          const result = await registerDirect(email, password, code, username);
          return success({
            token: result.token,
            user: {
              id: result.uid,
              email: result.email,
              username: result.nickname
            }
          }, '注册成功');
        } catch (e) {
          console.error('[register] 失败:', e.message);
          const msg = e.message || '注册失败';
          const errCode = msg.includes('验证码') ? 'CODE_ERROR' : 'REGISTER_FAILED';
          return failure(msg, errCode);
        }
      }

      case 'login': {
        try {
          const { email, password } = data;
          if (!email) return failure('邮箱不能为空', 'INVALID_EMAIL');
          if (!password) return failure('密码不能为空', 'INVALID_PASSWORD');
          const result = await loginDirect(email, password);
          return success({
            token: result.token,
            user: {
              id: result.uid,
              email: result.email,
              username: result.nickname
            }
          }, '登录成功');
        } catch (e) {
          console.error('[login] 失败:', e.message);
          return failure(e.message || '登录失败', 'LOGIN_FAILED');
        }
      }

      case 'resetPassword': {
        try {
          const { email, code, password } = data;
          if (!email) return failure('邮箱不能为空', 'INVALID_EMAIL');
          if (!code) return failure('验证码不能为空', 'INVALID_CODE');
          if (!password || password.length < 6) return failure('密码至少6位', 'INVALID_PASSWORD');
          await resetPasswordDirect(email, code, password);
          return success(null, '密码重置成功');
        } catch (e) {
          console.error('[resetPassword] 失败:', e.message);
          const msg = e.message || '密码重置失败';
          const errCode = msg.includes('验证码') ? 'CODE_ERROR' : 'RESET_FAILED';
          return failure(msg, errCode);
        }
      }

      // ========== 交易记录 ==========

      case 'getTransactions': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { year, month, date, ledgerId } = data;
        let query = { userId };
        if (ledgerId) query.ledgerId = ledgerId;
        if (date) query.date = date;
        else if (year && month) {
          const p = `${year}-${String(month).padStart(2, '0')}`;
          query.date = new RegExp('^' + p);
        }
        const res = await db.collection('transactions').where(query).orderBy('date', 'desc').orderBy('time', 'desc').get();
        return success({ list: res.data });
      }

      case 'createTransaction': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { type, amount, category, accountId, ledgerId, date, note } = data;
        if (!type || !['expense', 'income'].includes(type)) return failure('类型无效', 'INVALID_TYPE');
        if (!category) return failure('请选择分类', 'INVALID_CATEGORY');
        if (!accountId) return failure('请选择账户', 'INVALID_ACCOUNT');

        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) return failure('金额无效', 'INVALID_AMOUNT');

        const now = new Date();
        const tx = {
          userId,
          type,
          amount: Math.round(num * 100) / 100,
          category,
          accountId,
          ledgerId: ledgerId || 'default',
          date: date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
          time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
          note: (note || '').trim() || category,
          tags: [],
          createdAt: Date.now()
        };

        const res = await db.collection('transactions').add(tx);

        // 更新账户余额
        const acctRes = await db.collection('accounts').where({ userId, id: accountId }).get();
        if (acctRes.data.length > 0) {
          const acct = acctRes.data[0];
          const balanceChange = type === 'income' ? num : -num;
          await db.collection('accounts').doc(acct._id).update({
            balance: dbCmd.inc(balanceChange)
          });
        }

        return success({ ...tx, _id: res.id }, '账单已保存');
      }

      case 'deleteTransaction': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { id } = data;
        const res = await db.collection('transactions').where({ userId, id }).get();
        if (res.data.length === 0) return failure('交易不存在', 'NOT_FOUND');

        const tx = res.data[0];
        await db.collection('transactions').doc(tx._id).remove();

        // 恢复账户余额
        const acctRes = await db.collection('accounts').where({ userId, id: tx.accountId }).get();
        if (acctRes.data.length > 0) {
          const acct = acctRes.data[0];
          const balanceChange = tx.type === 'income' ? -tx.amount : tx.amount;
          await db.collection('accounts').doc(acct._id).update({
            balance: dbCmd.inc(balanceChange)
          });
        }

        return success(null, '交易已删除');
      }

      // ========== 账户 ==========

      case 'getAccounts': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const res = await db.collection('accounts').where({ userId }).get();
        if (res.data.length === 0) {
          // 首次使用，创建默认账户
          const defaults = [
            { userId, id: 'acc_default', name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#4ADE80', desc: '', cardNumber: '', cardNumberHidden: true },
            { userId, id: 'acc_bank', name: '银行卡', type: 'bank', balance: 0, icon: '💳', color: '#6C63FF', desc: '', cardNumber: '', cardNumberHidden: true }
          ];
          await db.collection('accounts').add(defaults[0]);
          await db.collection('accounts').add(defaults[1]);
          return success({ list: defaults });
        }
        return success({ list: res.data });
      }

      case 'createAccount': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        if (!data.name) return failure('账户名称不能为空', 'INVALID_NAME');
        const account = {
          userId,
          id: 'acc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          name: data.name,
          type: data.type || 'bank',
          balance: data.balance || 0,
          icon: data.icon || '💳',
          color: data.color || '#6C63FF',
          desc: data.desc || '',
          cardNumber: data.cardNumber || '',
          cardNumberHidden: data.cardNumberHidden !== undefined ? data.cardNumberHidden : true,
          createdAt: Date.now()
        };
        const res = await db.collection('accounts').add(account);
        return success({ ...account, _id: res.id }, '账户已添加');
      }

      case 'updateAccount': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { id, ...updates } = data;
        const res = await db.collection('accounts').where({ userId, id }).get();
        if (res.data.length === 0) return failure('账户不存在', 'NOT_FOUND');
        await db.collection('accounts').doc(res.data[0]._id).update(updates);
        return success(null, '账户已更新');
      }

      case 'deleteAccount': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { id } = data;
        const res = await db.collection('accounts').where({ userId, id }).get();
        if (res.data.length === 0) return failure('账户不存在', 'NOT_FOUND');
        await db.collection('accounts').doc(res.data[0]._id).remove();
        // 同步删除该账户下所有交易
        await db.collection('transactions').where({ userId, accountId: id }).remove();
        return success(null, '账户已删除');
      }

      // ========== 预算 ==========

      case 'getBudget': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { key } = data;
        const res = await db.collection('budgets').where({ userId, key: key || '' }).get();
        return success(res.data[0] || null);
      }

      case 'saveBudget': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { key, total } = data;
        if (!key || typeof total !== 'number' || total < 0) return failure('预算参数无效', 'INVALID_BUDGET');
        const existing = await db.collection('budgets').where({ userId, key }).get();
        if (existing.data.length > 0) {
          await db.collection('budgets').doc(existing.data[0]._id).update({ total });
        } else {
          await db.collection('budgets').add({ userId, key, total, createdAt: Date.now() });
        }
        return success(null, '预算已更新');
      }

      // ========== 分类 ==========

      case 'getCategories': {
        const defaultCategories = {
          expense: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '通讯', '服饰', '其他'],
          income: ['薪资', '奖金', '理财', '兼职', '红包', '其他']
        };
        return success(defaultCategories);
      }

      // ========== 账本 ==========

      case 'getLedgers': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const res = await db.collection('ledgers').where({ userId }).get();
        if (res.data.length === 0) {
          const ledger = { userId, id: 'l1', name: '个人账本', current: true, createdAt: Date.now() };
          await db.collection('ledgers').add(ledger);
          return success({ list: [ledger], currentId: 'l1' });
        }
        const current = res.data.find(l => l.current);
        return success({ list: res.data, currentId: current ? current.id : res.data[0].id });
      }

      case 'createLedger': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const newLedger = {
          userId,
          id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          name: data.name || '新账本',
          cover: data.cover || '📒',
          category: data.category || 'personal',
          color: data.color || '',
          current: false,
          createdAt: Date.now()
        };
        const res = await db.collection('ledgers').add(newLedger);
        return success({ ...newLedger, _id: res.id }, '新账本已创建');
      }

      case 'switchLedger': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { id } = data;
        await db.collection('ledgers').where({ userId }).update({ current: false });
        const res = await db.collection('ledgers').where({ userId, id }).get();
        if (res.data.length === 0) return failure('账本不存在', 'NOT_FOUND');
        await db.collection('ledgers').doc(res.data[0]._id).update({ current: true });
        return success(null, '账本已切换');
      }

      case 'deleteLedger': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { id } = data;
        const res = await db.collection('ledgers').where({ userId, id }).get();
        if (res.data.length === 0) return failure('账本不存在', 'NOT_FOUND');
        await db.collection('ledgers').doc(res.data[0]._id).remove();
        return success(null, '账本已删除');
      }

      // ========== 仪表盘 ==========

      case 'getDashboardSummary': {
        if (!userId) return failure('请先登录', 'UNAUTHORIZED');
        const { year, month } = data;
        const p = year ? `${year}-${String(month).padStart(2, '0')}` : '';
        const allTxs = await db.collection('transactions').where({ userId }).get();
        const monthTxs = p
          ? allTxs.data.filter(t => t.date && t.date.startsWith(p))
          : allTxs.data;

        let income = 0, expense = 0;
        monthTxs.forEach(t => {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        });

        // 获取预算
        const budgetKey = p;
        const budgetRes = await db.collection('budgets').where({ userId, key: budgetKey }).get();
        const budget = budgetRes.data[0];

        // 总资产
        const accts = await db.collection('accounts').where({ userId }).get();
        const totalAssets = accts.data.reduce((s, a) => s + (a.balance || 0), 0);

        return success({
          income: Math.round(income * 100) / 100,
          expense: Math.round(expense * 100) / 100,
          balance: Math.round((income - expense) * 100) / 100,
          budgetTotal: budget ? budget.total : 0,
          totalAssets: Math.round(totalAssets * 100) / 100,
          txCount: monthTxs.length
        });
      }

      // ========== 健康检查 ==========

      case 'health': {
        return success({ status: 'ok', message: '宇宙记账云服务运行中' });
      }

      default:
        return failure(`未知操作: ${action}`, 'ENDPOINT_NOT_FOUND');
    }
  } catch (err) {
    console.error('[API Cloud Error]', err);
    return failure(err.message || '服务异常', 'CLOUD_ERROR');
  }
};
