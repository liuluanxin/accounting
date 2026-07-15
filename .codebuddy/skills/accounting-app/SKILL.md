---
name: accounting-app
description: 宇宙记账 UniApp+uniCloud 项目专属技能。处理 uni-id 认证、SMTP 邮件发送、云函数直连替代 uni-id-co、输入框 UI 垂直居中、按钮布局、API 超时等已踩过坑的问题。当用户询问宇宙记账项目的认证、邮件、UI 或云函数相关 Bug 时自动加载。
---

# 宇宙记账 App 维护技能

## 项目背景

宇宙记账是基于 **UniApp + uniCloud（阿里云）** 的跨平台记账应用。使用 uni-id-pages 做用户认证，uni-id-common 做 token 校验。

## 已踩过的坑及标准修复方案

### 1. uni-id-common 模块找不到

**错误：** `MODULE_NOT_FOUND:Cannot find module 'uni-id-common'`

**文件：** `uniCloud-aliyun/cloudfunctions/api/package.json`

**修复：** 在 `api` 云函数的 `package.json` 的 `dependencies` 中添加：
```json
"uni-id-common": "file:../../uni_modules/uni-id-common/uniCloud/cloudfunctions/common/uni-id-common"
```
同时添加 `uni-config-center` 依赖：
```json
"uni-config-center": "file:../../uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center"
```

### 2. clientInfo.uniPlatform is required

**错误：** `'clientInfo.uniPlatform' is required`

**根因：** `api` 云函数通过 `uniCloud.importObject('uni-id-co')` 调用 uni-id-co 云对象时，`uniPlatform` 字段缺失。这是云函数间调用的特性——`importObject` 的 `clientInfo` 参数不一定会被 uni-id-co 正确接收。

**修复方案：** 将所有认证相关操作（sendEmailCode、register、login、resetPassword）**直接实现在 `api/index.js` 中**，不再经过 uni-id-co。直接实现包括：
- 读取 `uni-config-center/uni-id/config.json` 配置
- 直接操作 `uni-id-users` 和 `opendb-verify-codes` 集合
- 使用 `crypto.createHmac('sha1', secret)` 做密码哈希
- 使用 `uniID.createToken({ uid })` 生成 token

**关键代码示例：**
```javascript
// 密码哈希
const config = require('uni-config-center/uni-id/config.json');
const secret = config.passwordSecret;
const hmac = crypto.createHmac('sha1', secret.toString('ascii'));
hmac.update(password);
const passwordHash = hmac.digest('hex');

// 验证码查询
const verifyRes = await verifyCollection.where({
    email: email.toLowerCase().trim(),
    code, state: 0,
    scene: 'reset',
    expired_date: dbCmd.gt(Date.now())
}).limit(1).get();
```

### 3. SMTP 邮件发送（无 nodemailer）

**文件：** `uniCloud-aliyun/cloudfunctions/api/index.js`

**实现：** 直接在云函数中使用 Node.js 内置 `tls` 模块实现 SSL SMTP 协议（QQ邮箱 465 端口），无需安装 `nodemailer`。

**配置位置：** `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 中的 `email` 字段：
```json
"email": {
    "sendEmail": "1075091813@qq.com",
    "smtp": { "host": "smtp.qq.com", "port": 465, "secure": true, "auth": { "user": "...", "pass": "..." } },
    "template": { "register": { "subject": "...", "text": "..." }, "resetPwd": { "subject": "...", "text": "..." } },
    "codeExpiresIn": 300
}
```

**发件人名称：** 修改 `sendMail` 调用时的 `from` 参数：
```javascript
from: '宇宙记账 <' + emailConfig.sendEmail + '>',
```

### 4. 前端 scene 值与后端不匹配

**前端发送的 scene:**
- 注册：`scene: 'register'`
- 重置密码：`scene: 'reset'`

**后端查询时要匹配对应的 scene 值。** 例如前端发 `scene: 'reset'`，`resetPasswordDirect` 中要查 `scene: 'reset'` 而不是 `scene: 'reset-pwd-by-email'`。

### 5. 输入框文本垂直居中（H5 input 光标偏上/偏小）

**问题：** `<input>` 元素的 `line-height` 在不同浏览器中渲染不一致，导致文字/光标偏上。

**标准修复方案（所有页面统一）：**
- `.input-wrapper`（父容器）：`display: flex; align-items: center; padding: 16rpx 24rpx; height: 88rpx; box-sizing: border-box;`
- `.input-field`（input 本身）：`flex: 1; padding: 0 0 0 12rpx; margin: 0; line-height: 56rpx; font-size: 30rpx;`
- `.input-icon`：`margin-right: 24rpx;`
- 密码框 toggle 按钮（`.toggle-pwd`）：`font-size: 30rpx; padding: 0;`（移除 padding 避免撑高容器）

核心原则：**input 不做固定高度**，高度由父容器的 padding + input 的 line-height 决定。

需要统一修改的文件：
- `pages/accounting/login.vue`
- `pages/accounting/register.vue`
- `pages/accounting/forgot-pwd.vue`
- `pages/accounting/add-account.vue`
- `pages/accounting/add-ledger.vue`

### 6. CTA 按钮居中（86% 宽度）

**问题：** 登录/注册/提交等主按钮铺满卡片，左右无呼吸空间。

**标准修复（参照 `login.vue` 的 `.btn-primary`）：**
- `width: 86%; max-width: 520rpx; min-width: 200rpx; margin: 0 auto;`
- `height: 96rpx; min-height: 44px; font-size: 40rpx;`
- 添加 `cursor: pointer; user-select: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent;`

需要在表单页面中添加 wrapper 或覆盖样式来应用此规则。

### 7. API 请求超时（APK 卡死）

**问题：** `uniCloudAdapter` 没有超时机制，云函数挂住时前端 Promise 永不返回，`logining` 状态卡死。

**文件：** `services/api-client.js`

**修复：** 在 `uniCloudAdapter` 的 Promise 中添加 `setTimeout` 超时处理：
```javascript
const timer = setTimeout(() => {
    resolve({ success: false, message: '请求超时，请检查网络', code: 'TIMEOUT', data: null })
}, apiConfig.timeout)
```
并在 `.then` 和 `.catch` 中 `clearTimeout(timer)`。

### 8. 登录/注册后不跳转首页

**问题：** `setTimeout(() => uni.redirectTo(...), 300/1500)` 在某些 uni-app 环境（特别是 APK）中不执行。

**修复：** 去掉 `setTimeout` 包裹，直接调用 `uni.redirectTo({ url: '/pages/accounting/home' })`。

涉及的页面：
- `pages/accounting/login.vue`
- `pages/accounting/register.vue`

### 9. 输入框高度统一

**问题：** 密码框有右侧 toggle 按钮（带 padding），导致内容区域高度不同，两个输入框视觉上不一致。

**修复：** 所有输入框统一 `min-height: 80rpx` 或 `height: 88rpx`，并让 `toggle-pwd` 去掉额外 padding 以匹配 line-height。

## 项目文件结构

- `uniCloud-aliyun/cloudfunctions/api/` — API 网关云函数（处理所有认证+业务逻辑）
- `uniCloud-aliyun/cloudfunctions/common/` — 公共模块目录（部署时自动上传）
- `services/api-client.js` — 前端 API 客户端（local / http / unicloud 三适配器）
- `pages/accounting/` — 所有页面组件
- `uni_modules/uni-id-pages/` — uni-id 认证模块
- `uni_modules/uni-config-center/` — 配置中心

### 10. APK 打包后 FAB 按钮重影

**问题：** 首页悬浮 "+" 按钮出现重影，视觉上像两个按钮叠加。

**根因：** `home.vue` 自身渲染了一个 FAB 按钮（`position: fixed; bottom: 180rpx`），同时 `TabBar` 组件也渲染了一个 FAB（通过 `showFab="true"`），两个 `+` 按钮位置相近叠加形成重影。

**文件：** `pages/accounting/home.vue`

**修复：** 删除 `home.vue` 中独立的 FAB 元素（`<view class="fab-btn"...>` 及其包裹元素）及对应的 `.fab-btn`、`.fab-icon` CSS，仅保留 `TabBar` 组件中的 FAB。

### 11. APK 打包后图标不显示

**问题：** 记账页面等所有 SVG 图标在 APK 中完全不显示。

**根因：**
1. `common/icon-base64.js` 中所有 SVG data URI 包含 `%0D%0A`（CRLF 换行符），部分 Android WebView（系统浏览器内核）解析 SVG 时遇到 CRLF 直接失败
2. 使用 `mask-image` CSS 属性渲染矢量图标，但 Android WebView 对 `mask-image` + `data:image/svg+xml` 的支持不稳定

**文件：** `common/icon-base64.js`、`components/TabBar.vue`、各页面

**修复：**
- 重构 `common/icon-base64.js`，新增 `getIconStyle(name, color)` 导出函数：
  - 使用 `background-image` 替代 `mask-image` 渲染图标，兼容性更广
  - 自动将 SVG 中的 `%23000000`（黑色）替换为目标颜色，实现动态着色
  - 通过 `decodeURIComponent` → 字符串替换 `%23000000` → `encodeURIComponent` 重新编码，生成带颜色的 data URI
- 所有页面（`home.vue`、`record.vue`、`TabBar.vue` 等）的 `getIconStyle` 方法改为调用此新函数
- TabBar 图标颜色直接硬编码为对应的十六进制色值（未选中 `#A98B78`、选中 `#E8734A`、FAB 图标 `#FFFFFF`）

**关键代码：**
```javascript
export function getIconStyle(name, color) {
  const rawUri = ICONS[name]
  if (!rawUri) return {}
  try {
    const svg = decodeURIComponent(rawUri.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''))
    const colorEncoded = encodeURIComponent(color)
    const coloredSvg = svg.replace(/%23000000/g, colorEncoded)
    const newUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(coloredSvg)
    return {
      'background-image': `url(${newUri})`,
      'background-size': 'contain',
      'background-repeat': 'no-repeat',
      'background-position': 'center'
    }
  } catch (e) { return {} }
}
```

### 12. APK 打包后主题切换不生效

**问题：** 在主题设置页面切换主题后，页面颜色无任何变化。

**根因：**
1. App 端每个页面运行在独立 WebView 中，`document.documentElement` 上的 CSS 变量仅对当前 WebView 有效
2. `themeMixin` 的 `onLoad` 中调用 `applyThemeToPage(this)` 时，`this.$el` 尚未挂载为 `null`，CSS 变量设置被跳过
3. `applyTheme` 中的 `createSelectorQuery().select('page').context()` 方案用了错误的 API（`context` 非有效方法），实际从未执行

**文件：** `common/theme-manager.js`、`common/theme-mixin.js`

**修复：**
- `common/theme-manager.js`：
  - 移除无效的 `createSelectorQuery` 方案
  - `applyThemeToPage` 增加 `$el` 为 null 时的延迟重试（`setTimeout(100ms)`），确保 DOM 挂载后再设置 CSS 变量
- `common/theme-mixin.js`：
  - `onShow` 中用 `setTimeout(50ms)` 延迟执行，确保切换回来时 `$el` 已就绪

**关键逻辑：**
```javascript
export function applyThemeToPage(pageInstance) {
  // 设置到 document.documentElement（当前 WebView 全局生效）
  setCSSVars(document.documentElement, colors)
  // 设置到页面实例根元素
  if (pageInstance) {
    if (pageInstance.$el) {
      setCSSVars(pageInstance.$el, colors)
    } else {
      setTimeout(() => {  // $el 未就绪时延迟重试
        if (pageInstance.$el) setCSSVars(pageInstance.$el, colors)
      }, 100)
    }
  }
}
```

### 10. request:fail — 后端未运行导致 HTTP 请求失败

**错误：** `BusinessError: request:fail` 且堆栈为 `xhr.onerror`，`POST /api/auth/send-email-code` 请求失败。

**根因：** `App.vue` 配置了 `adapter: 'http'` + `baseURL: 'http://localhost:3000'`，但 Express 后端未启动。`uni.request()` 的 `fail` 回调触发。

**修复：** 两种方案：
- **方案 A（快速开发）**：将 `App.vue` 中 `adapter` 改为 `'local'`，使用内置前端本地存储模拟（无需后端）
- **方案 B（生产环境）**：迁移到 uniCloud 云函数（见第 11 条）

### 11. APK 打包后无法连接后端（localhost 指向手机自身）

**问题：** 打包成 APK 后，`http://localhost:3000` 指向手机自身而非开发电脑，所有 API 请求均失败。

**文件：** `App.vue`

**根因：** `#ifndef H5` 中仍使用 `http://localhost:3000`，但手机上的 localhost ≠ 开发机。

**生产环境修复：** 迁移到 uniCloud 云函数，使 APK 通过 `uniCloud.callFunction()` 直接调用云端，无需关心服务器地址。

### 12. Express 后端 → uniCloud 云函数迁移

**背景：** 项目原有 `backend/server.js`（Express + nodemailer）作为后端，但部署到生产环境需要云服务器。项目已安装 `uni-id-pages`（含 `uni-id-co` 云对象）和 `uni-config-center`（含 QQ 邮箱 SMTP 配置），可直接迁移到 uniCloud。

**迁移步骤（代码部分）：**

**① 创建云函数 `uniCloud-aliyun/cloudfunctions/api/`**
- `package.json`：只需 `{ "name": "api", "version": "1.0.0" }`
- `index.js`：使用 `uniCloud.importObject('uni-id-co')` 代理认证请求，`uniCloud.database()` 处理数据 CRUD

**② 创建数据库 Schema（`uniCloud-aliyun/database/`）**
- 需要创建的集合：`transactions`、`accounts`、`budgets`、`ledgers`

**③ 添加 unicloud 适配器（`services/api-client.js`）**
- URL → Action 映射表（`URL_TO_ACTION`），将 HTTP 方法+路径转为云函数 action 名
- `uniCloudAdapter` 函数：调用 `uniCloud.callFunction({ name: 'api', data: { action, data } })`
- 在 `apiRequest` 中增加 `case 'unicloud': adapter = uniCloudAdapter`

**④ 更新 `App.vue`**
```javascript
configureApi({ baseURL: 'https://unicloud', adapter: 'unicloud', timeout: 15000 })
```
移除所有 `#ifdef H5`/`#ifndef H5` 条件判断。

**⑤ 后端部署（在 HBuilderX 中操作）**
1. 右键 `uniCloud-aliyun` → 创建云服务空间（阿里云免费版）
2. 右键 `uniCloud-aliyun` → 关联云服务空间
3. 分别上传部署以下云函数：
   - `uniCloud-aliyun/cloudfunctions/api`
   - `uni_modules/uni-id-pages/uniCloud/cloudfunctions/uni-id-co`
   - `uni_modules/uni-upgrade-center-app/uniCloud/cloudfunctions/check-version`
   - `uni_modules/uni-captcha/uniCloud/cloudfunctions/uni-captcha-co`

### 13. uni-id-co 返回格式与前端期望不匹配

**问题：** uni-id-co 的 `login()` 返回 `{ code: 0, data: { token, uid, ... } }`，但前端登录/注册页期望 `res.data.token` 和 `res.data.user`（含 `id, email, username`）。

**文件：** `uniCloud-aliyun/cloudfunctions/api/index.js`

**修复：** 在云函数的 `login` 和 `register` 分支中手动映射字段：
```javascript
// login 分支
return success({
  token: logResult.data?.token,
  user: {
    id: logResult.data?.uid,
    email: data.email,
    username: logResult.data?.nickname || data.email.split('@')[0]
  }
}, '登录成功');

// register 分支
return success({
  token: regResult.data?.token,
  user: {
    id: regResult.data?.uid,
    email: data.email,
    username: data.username
  }
}, regResult.message || '注册成功');
```

### 14. 多个加载状态变量逻辑混乱

**问题：** 登录、注册、重置密码页面有独立的 `logining`、`submitting`、`submitting` 等布尔变量控制加载状态。当 API 请求卡住或未正确 catch 时，按钮卡在"登录中..."/"注册中..."状态无法恢复。

**修复原则：**
- 每个异步操作前设置 `loadingVar = true`，`finally` 中设置回 `false`
- 页面销毁时（`onUnload`）恢复所有 loading 状态
- `api-client.js` 的 `uniCloudAdapter` 必须加入超时机制（见第 7 条）

## 注意事项

- 不要直接修改 `uni_modules/` 下的文件（除非是必须的自定义修改，如 smtp-sender.js 已被删除）
- `api` 云函数和 `uni-id-co` 云对象都需要分别部署
- 默认适配器为 `local`，生产环境通过 `App.vue` 的 `configureApi({ adapter: 'unicloud' })` 切换
- 密码使用 HMAC-SHA1 哈希，配置在 `uni-id/config.json` 的 `passwordSecret` 中
- **Email 配置位置：** `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 的 `email` 字段（SMTP 已配置 QQ 邮箱）
- **首次部署要点：** 阿里云 uniCloud 在首次调用云函数时会有冷启动延迟（约 1-3 秒），之后的调用会更快
- **数据迁移：** 从 local 切换到 unicloud 后，之前存储在本地的用户数据不会自动同步到云端，需要用户重新注册

## 通话记录 — 2026-07-06: 新增"账本"Tab页

### 15. write_to_file 返回 "No result found" 但文件实际已创建

**问题：** 调用 `write_to_file` 创建 `pages/accounting/ledgers.vue` 和 `pages/accounting/add-ledger.vue` 时，两次均返回错误 `Tool execution failed: No result found`，但执行 `ls` 命令确认文件已在目标目录中存在且内容完整。

**修复：** 无需修复，为工具 bug。后续可通过 `execute_command` 创建文件后用 `read_file` 确认内容完整。

### 16. 新增 Tab 页的完整流程

**背景：** 在已有 5 个 Tab（首页/日历/资产/统计/我的）基础上新增"账本"Tab。

**步骤：**

1. **`pages.json` 注册页面路径** — 添加 `ledgers` 和 `add-ledger` 两个页面
   ```json
   { "path": "pages/accounting/ledgers", "style": { "navigationBarTitleText": "账本管理", "navigationStyle": "custom" } },
   { "path": "pages/accounting/add-ledger", "style": { "navigationBarTitleText": "新建账本", "navigationStyle": "custom" } }
   ```

2. **创建 Tab 页面文件** — `pages/accounting/ledgers.vue`
   - 自定义头部：左侧"📗 账本管理"标题，右侧圆形"+"按钮（`background: linear-gradient(135deg, #6BA8D9, #4A7FB5)`）
   - 账本列表卡片：封面预览（渐变背景+emoji图标）、名称、分类标签、记录数、"当前"角标
   - 底部导航 6 项：首页/日历/资产/账本/统计/我的
   - 空状态提示"点击右上角 + 创建你的第一个账本"

3. **创建表单页面** — `pages/accounting/add-ledger.vue`
   - 自定义导航栏（返回按钮+标题）
   - 三个表单域：
     - 账本名称：`<input>` 带非空校验
     - 账本封面：10 种预设封面（图标+渐变背景+名称），可视化网格选择，选中显示 ✓ 角标
     - 账本分类：9 种分类（个人/家庭/旅行/生意/投资/学习/婚礼/宠物/其他），水平可滚动 Chip 选择
   - 底部固定保存按钮（`gradient #6C63FF`），名称非空时 `canSave` 为 true

4. **更新 store** — `store/accounting.js`：
   - `mutations`: 新增 `ADD_LEDGER(state, ledger)` 推入 `state.data.ledgers`
   - `actions`: 新增 `addLedger({ commit }, ledgerData)` 调用 `AccountingService.createLedger`

5. **更新 service** — `services/accounting-service.js`：
   - `createLedger` 参数从 `name` 改为 `ledgerData` 对象，包含 `{ name, cover, category }`

6. **更新所有 Tab 页底部导航** — 在首页/日历/资产/统计/我的 5 个页面的 `.bottom-nav` 中插入"账本"项：
   ```html
   <view class="nav-item" @click="switchTab('ledgers')"><text>📗</text><text>账本</text></view>
   ```
   放置在"资产"和"统计"之间。同时需要微调 `.nav-item` 的 `padding` 和 `min-width` 以适应 6 项布局。

### 17. `replace_in_file` 首次替换失败但文件实际已修改

**问题：** 在修改 `pages.json` 时，`replace_in_file` 返回 `The string to replace was not found in the file` 错误，但重新读取文件后发现内容已正确更新。

**根因：** 可能是并发写入或缓存问题。建议在遇到类似错误时先 `read_file` 确认文件当前状态，再做二次尝试。

## 通话记录 — 2026-07-10: APK 登录卡"登录中..."

### 18. APK 使用 unicloud 适配器但云函数未部署导致请求挂死

**问题：** APK 中点击登录后按钮显示"登录中..."，永不跳转首页，且状态无法恢复。

**根因链路：**
1. `App.vue` 配置 `adapter: 'unicloud'` → 所有请求走 `uniCloud.callFunction({ name: 'api', ... })`
2. 云函数 `api` 实际未上传部署到 uniCloud 服务空间 → 调用挂死
3. 即使部署了，之前通过 `local` 适配器注册的用户数据存在本地存储 `cosmic_accounting_local_db`，而云函数查的是云数据库 `uni-id-users` 集合，用户不存在 → 返回"该邮箱未注册"
4. `logining = true` 卡住原因：`handleLogin` 的 `finally { this.logining = false }` 理论上会执行，但 APK 中 `uniCloud.callFunction` Promise 在某些 Android WebView 环境下可能永不 resolve/reject，超时（15s）也无法触发

**修复方案：**
- **开发/演示阶段**：`App.vue` 中 `adapter: 'local'`（无需部署云函数，数据存本地）
- **生产阶段**：部署云函数后切回 `adapter: 'unicloud'`
  - 在 HBuilderX 中部署 `api` 云函数、`uni-id-common` 和 `uni-config-center` 公共模块
  - **必须重新注册**（本地数据不会自动同步到云端）

**文件：**
- `App.vue` — API 适配器配置
- `uniCloud-aliyun/cloudfunctions/api/index.js` — 云函数逻辑（已含 login/register 处理）
- `uniCloud-aliyun/cloudfunctions/api/package.json` — 依赖声明（指向 uni_modules 中的公共模块）

### 19. 本地注册数据与云端 uni-id-users 不互通

**问题：** `local` 适配器注册的用户保存在 `uni.getStorageSync('cosmic_accounting_local_db').users` 中，云函数 `loginDirect` 查的是 `uni-id-users` 数据库集合，两者完全独立，无法互登录。

**文件：**
- `services/api-client.js` — `localAdapter` 的 `POST:/api/auth/register` 分支（存本地）
- `uniCloud-aliyun/cloudfunctions/api/index.js` — `loginDirect` / `registerDirect`（操作 `uni-id-users` 集合）

**数据迁移方案：** 目前无自动化迁移工具。切换适配器后所有用户需重新注册。

---

## 规则

### 每次通话必须记录的问题类型

所有后续通话中出现的问题，必须记录到此文件的 `## 通话记录` 区域，包括：

1. **编译/构建错误**（APK 打包失败、模块找不到等）
2. **运行时崩溃/卡死**（页面白屏、按钮卡状态、无限加载等）
3. **API/网络问题**（请求失败、超时、数据不匹配等）
4. **平台差异**（H5 正常但 APK 异常的坑）
5. **数据不一致**（local/unicloud 切换导致的数据不互通）
6. **修复方案**（包含具体文件路径、代码片段、操作步骤）

格式参照已有条目，必须包含：`**问题：**` → `**根因：**` → `**修复：**` → `**文件：**`

## 通话记录 — 2026-07-10: APK 首页白屏/ReferenceError: ICONS is not defined

### 20. icon-base64.js 变量名 _ICONS / ICONS 不一致导致 home.vue 崩溃

**问题：** 部署云函数后重新打包 APK，首页白屏，控制台报 `ReferenceError: ICONS is not defined at Proxy.data (pages/accounting/home.vue:38:14)`。

**根因：** `common/icon-base64.js` 中图标数据集定义为 `const _ICONS = { ... }`（下划线前缀），但 `getIconStyle()` 函数内部和 `export default` 引用的却是 `ICONS`（无下划线）—— 三处引用全部为空。`home.vue` 在 `data()` 中又通过 `iconMap: ICONS` 引用了这个不存在的变量，触发 ReferenceError 导致整个组件挂掉。

**修复（两处）：**

1. `common/icon-base64.js` 第7行：`const _ICONS` → `const ICONS`（变量名与引用名统一）
2. `pages/accounting/home.vue` 第221行：移除 `iconMap: ICONS`（该变量在模板中从未被使用，属于死代码）

**文件：**
- `common/icon-base64.js`
- `pages/accounting/home.vue`

## 通话记录 — 2026-07-10: TabBar 组件中 `makeIconStyle` 模板调用报错

### 21. 模块导入函数直接在模板中使用导致 `makeIconStyle is not a function`

**问题：** APK 启动后首页白屏，控制台报 `TypeError: _ctx.makeIconStyle is not a function` at `<TabBar>`。

**根因：** `components/TabBar.vue` 第22行通过 `import { getIconStyle as makeIconStyle } from '@/common/icon-base64.js'` 导入函数，但在模板第5行直接 `:style="makeIconStyle('fab-add', '#FFFFFF')"` 中使用。Vue 模板编译器生成的渲染函数会通过 `_ctx`（组件实例）查找该方法，而模块级导入的函数不在组件实例上，因此找不到。

**修复：** 将模板中的直接调用改为通过计算属性包装：
- 模板：`:style="makeIconStyle(...)"` → `:style="getFabIconStyle"`（计算属性名）
- `computed` 中新增：`getFabIconStyle() { return makeIconStyle('fab-add', '#FFFFFF') }`

**与其他页面的区别：** 其他页面（如 home.vue）也在模板中用了 `getIconStyle()`，但它们在 `methods` 中定义了同名组件方法，因此可以正常访问。

**文件：**
- `components/TabBar.vue`

## 通话记录 — 2026-07-10: 图标显示为黑色、颜色替换不生效

### 22. `getIconStyle` 颜色替换正则匹配错误导致所有图标显示为黑色

**问题：** 首页和 TabBar 的图标全是黑色，选中态和非选中态没有颜色区分，整体视觉效果很丑。

**根因：** `common/icon-base64.js` 中 `getIconStyle` 函数的逻辑错误：
1. `decodeURIComponent(rawUri.replace(...))` 将 URL 编码的 SVG 解码为原始字符串，其中颜色已经是 `#000000`（不再是 URL 编码的 `%23000000`）
2. 但正则 `svg.replace(/%23000000/g, colorEncoded)` 仍然试图匹配 `%23000000`
3. 替换永远匹配不到，最终 SVG 中的颜色仍然是黑色 `#000000`

**修复：**
```javascript
// 错误
const coloredSvg = svg.replace(/%23000000/g, colorEncoded)

// 正确
const coloredSvg = svg.replace(/#000000/g, color)
```
同时移除多余的 `colorEncoded` 变量。

**文件：**
- `common/icon-base64.js`

## 通话记录 — 2026-07-10: SVG 图标显示为黑方框

### 23. background-image 渲染 SVG 时 fill="none" 继承失效导致黑方框

**问题：** TabBar 和页面的 SVG 图标在 H5 浏览器中显示为黑色方块/黑方框，而不是正常的图标形状（如房屋、日历等）。

**根因：** 当 SVG 作为 CSS `background-image` 渲染时，根元素 `<svg fill="none">` 的 `fill` 属性在某些浏览器（Chrome/Edge H5 内核）中不被子元素正确继承。子元素（`<path>`、`<rect>`、`<circle>` 等）的默认 `fill` 值为 `black`，导致整个图标被黑色填充，看起来像黑方框。

**修复：** 在 `getIconStyle` 中，替换颜色后，给所有没有 `fill` 属性的子元素强制添加 `fill="none"`：

```javascript
const coloredSvg = svg.replace(/#000000/g, color)
// 确保所有子元素 fill="none"（避免 background-image 下 fill 继承失效导致黑方框）
const filledSvg = coloredSvg.replace(/<(\w+)(?![^>]*fill=)/g, '<$1 fill="none"')
```

**文件：**
- `common/icon-base64.js`
