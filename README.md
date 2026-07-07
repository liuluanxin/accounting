# 🪐 宇宙记账

> 跨平台记账 App，兼容 **Android、iOS、鸿蒙系统**。宇宙星空主题设计，沉浸式记账体验。

![Version](https://img.shields.io/badge/version-1.0.0-blueviolet) ![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Harmony-brightgreen) ![Framework](https://img.shields.io/badge/framework-UniApp%20Vue3-6C63FF)

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| **收支记录** | 支出/收入类型切换，选择分类、账户、日期、备注，保存后自动更新余额 |
| **分类管理** | 10 种支出分类 + 6 种收入分类，支持自定义管理 |
| **数据统计** | 月度收支总览、分类占比环形图、支出/收入/资产排名 |
| **日历账单** | 月视图日历，标记有交易日期，查看每日账单明细 |
| **资产账户** | 总资产统计，多账户管理（银行卡/支付宝/微信/现金） |
| **预算管理** | 月度预算设置，实时进度条显示使用比例 |
| **数据导出** | 一键导出 CSV 格式账单数据 |
| **本地存储** | 完全离线可用，数据持久化到设备本地存储 |
| **登录系统** | 模拟登录/注册，社交登录入口 |

## 📱 页面概览

- **登录页** — 星球Logo + 星空闪烁动画 + 账号密码登录
- **首页** — 月结余Hero卡片 + 预算进度条 + 按日期分组的交易流 + FAB快速记账
- **日历页** — 月视图日历网格 + 选中日的收支汇总 + 交易明细
- **资产页** — 总资产大数字 + 账户列表（含余额）
- **统计页** — 支出/收入/资产视图切换 + 环形图 + 分类排名
- **记账页** — 类型切换 + 金额输入 + 分类网格 + 日期/账户/备注
- **个人中心** — 用户信息 + 功能菜单（分类管理/设置/备份/导出/关于）

## 🎨 设计主题

采用**宇宙星空**深色主题：

- **背景**: 深空蓝黑 (#0B0E2A) → 靛紫 (#1A1040) 渐变
- **主色**: 星云紫 (#6C63FF) → 星云蓝 (#4A7CF7)
- **收入绿**: #4ADE80 | **支出红**: #FF6B6B
- **卡片**: 毛玻璃效果（backdrop-filter blur）+ 发光边框
- **特效**: 闪烁星星粒子动画、星球浮动动效、按压回弹

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| UniApp | ^4.03 | 跨平台框架 |
| Vue 3 | ^3.0 | 前端框架 |
| Vuex | ^4.x | 状态管理 |
| SCSS | — | 样式预处理 |
| Jest | ^29.x | 单元测试 |
| uCharts | 1.8.5 | 图表渲染（预留） |

## 📂 项目结构

```
d:\HBuilderProjects\accounting\
├── App.vue                  # 根组件（全局样式 + 启动逻辑）
├── main.js                  # 入口文件（Vue3 + Vuex）
├── manifest.json            # 应用配置（名称/权限/跨平台）
├── pages.json               # 页面路由配置
├── uni.scss                 # 宇宙星空主题变量
├── .env.example             # 环境变量模板
├── package.json             # 依赖管理 + 脚本
├── jest.config.js           # Jest 测试配置
├── common/                  # 公共模块
│   ├── accounting-utils.js  # 工具函数（ID/日期/图标/数据生成）
│   ├── api-response.js      # 统一响应格式
│   ├── error-handler.js     # 错误处理（自定义异常/全局捕获）
│   ├── logger.js            # 分级日志系统
│   └── validator.js         # 输入校验（规则/表单验证）
├── store/
│   ├── index.js             # Vuex 入口
│   └── accounting.js        # 记账数据模块（CRUD + 持久化）
├── components/
│   └── accounting/          # 通用组件
│       ├── AccCard.vue      # 毛玻璃卡片
│       ├── AccTxItem.vue    # 交易记录行
│       └── AccCatGrid.vue   # 分类选择网格
├── pages/
│   └── accounting/          # 7 个业务页面
│       ├── login.vue        # 登录
│       ├── home.vue         # 首页
│       ├── calendar.vue     # 日历
│       ├── assets.vue       # 资产
│       ├── stats.vue        # 统计
│       ├── record.vue       # 记账
│       └── profile.vue      # 个人中心
└── test/
    └── unit/                # 单元测试
        ├── accounting-utils.test.js  # 工具函数测试
        ├── validator.test.js         # 校验模块测试
        ├── error-handler.test.js     # 错误处理测试
        └── api-response.test.js      # 响应格式测试
```

## 🚀 快速开始

### 前置要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html)（App 开发版）
- Node.js >= 16

### 启动开发

```bash
# 1. 使用 HBuilderX 打开项目
# 2. 选择运行目标：
#    - 浏览器（H5）: 工具栏 → 运行 → 运行到浏览器
#    - Android: USB 连接或模拟器 → 运行到手机或模拟器
#    - iOS: 连接 iPhone → 运行到 iOS App 基座

# 或使用 CLI 运行
npm run dev:h5      # 运行到浏览器
npm run dev:app     # 运行到 App
```

> **首次启动**：应用会自动跳转到登录页，随便输入账号密码即可登录体验。

### 构建发布

```bash
npm run build:h5    # 构建 H5 版本
npm run build:app   # 构建 App 版本（需 HBuilderX）
```

### 运行测试

```bash
npm test                  # 运行所有测试
npm run test:watch        # 监听模式
npm run test:coverage     # 覆盖率报告
```

## ⚙️ 配置说明

### 环境变量

复制 `.env.example` 为 `.env`（如需自定义配置）：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NODE_ENV` | `development` | 开发/生产环境 |
| `LOG_LEVEL` | `DEBUG` | 日志级别：DEBUG / INFO / WARN / ERROR / SILENT |
| `APP_TITLE` | `宇宙记账` | 应用标题 |

### 日志控制

运行时可通过控制台切换日志级别：

```javascript
import Logger from '@/common/logger.js'
Logger.setLevel('WARN')  // 生产环境建议 WARN
Logger.setLevel('DEBUG') // 开发调试使用
```

## 🔒 数据安全

- 所有数据存储在设备本地（`uni.setStorageSync`）
- iOS 隐私模式下自动降级内存存储
- 无网络请求，完全离线可用
- 导出 CSV 文件时不包含敏感信息

## 🔧 错误处理

应用内置多层错误处理机制：

1. **全局异常捕获** — `App.vue` 中初始化 `setupGlobalErrorHandler()`
2. **Vue 错误处理器** — 捕获组件渲染/生命周期错误
3. **业务异常类** — `BusinessError` / `ValidationError` / `StorageError`
4. **安全执行包装** — `safeAsync()` / `safeSync()` 统一处理
5. **输入校验** — `validator.js` 在数据进入 Store 前拦截

所有错误都会通过 `Logger` 模块分级记录。

## 🧪 测试覆盖

| 模块 | 覆盖内容 |
|------|----------|
| `accounting-utils` | genId、日期函数、格式化、常量 |
| `validator` | 全部校验规则、表单验证、parseAmount |
| `error-handler` | 自定义异常、safeAsync/safeSync |
| `api-response` | 成功/失败/分页响应格式 |

## 📄 许可

MIT License © 2026 Cosmic Studio
