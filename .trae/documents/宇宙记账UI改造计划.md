# 宇宙记账 UI 改造计划

## 一、概览

### 1.1 当前状态 vs 目标状态

| 维度 | 当前（暖色调） | 目标（宇宙梦幻风） |
|------|---------------|-------------------|
| 背景色 `--bg` | `#FFF9F5` | `#EFF5FF` |
| 主色 `--primary` | `#E8734A` (橙) | `#5B9BE0` (宇宙蓝) |
| 收入色 `--income` | `#4CAF50` / `#E89B9B` | `#34C759` (翠绿) |
| 支出色 `--expense` | `#E8734A` / `#7BC4A8` | `#FF6B6B` (珊瑚红) |
| 全局渐变 | 无 | `170deg #EAF4FF -> #F1ECFF -> #FFFFFF` |
| 卡片样式 | 纯白/透明 | 玻璃拟态渐变+22px圆角+1px白色高光描边 |
| 底部Tab | 4个（首页/日历/统计/我的） | 5个（首页/统计/日历/资产/我的），日历居中 |
| 导航栏 | 自定义 | 固定状态栏+固定顶部导航栏 |
| 图标体系 | 混合 | Lucide线性描边（操作）+ Twemoji彩色（分类） |

### 1.2 涉及文件清单 (30+个文件)

**核心配置层 (7个文件)**
- `d:\HBuilderProjects\accounting\common\theme-manager.js`
- `d:\HBuilderProjects\accounting\uni.scss`
- `d:\HBuilderProjects\accounting\App.vue`
- `d:\HBuilderProjects\accounting\pages.json`
- `d:\HBuilderProjects\accounting\common\icon-base64.js`
- `d:\HBuilderProjects\accounting\common\accounting-utils.js`
- `d:\HBuilderProjects\accounting\common\theme-mixin.js`

**公共组件 (3个文件)**
- `d:\HBuilderProjects\accounting\components\TabBar.vue`
- `d:\HBuilderProjects\accounting\components\accounting\AccCard.vue`
- `d:\HBuilderProjects\accounting\components\accounting\AccCustomKeyboard.vue`

**核心业务页面 (15个文件)**
- 登录/注册/忘记密码: `login.vue`, `register.vue`, `forgot-pwd.vue`
- 首页: `home.vue`
- 统计: `stats.vue`
- 资产: `assets.vue`
- 日历: `calendar.vue`
- 我的: `profile.vue`
- 预算: `budget.vue`
- 记账: `record.vue`
- 分类管理: `category-manage.vue`
- 全部账单: `all-transactions.vue`
- 创建账户: `add-account.vue`
- 账户详情: `account-detail.vue`
- 数据导入: `import-data.vue`
- 主题设置: `theme-settings.vue`

---

## 二、改造计划

### 第一阶段：核心主题系统（基石，所有页面依赖）

#### 任务 1.1：更新主题色值定义

**文件**: `common/theme-manager.js`

**具体修改**:
1. 将 `THEMES.cosmic.colors` 中的所有色值按PRD更新：

```js
// 修改前（当前cosmic主题暖色调）
'--primary': '#6BA8D9',
'--primary-dark': '#5A8FB8',
'--expense': '#7BC4A8',
'--income': '#E89B9B',
'--bg': '#F4F6FB',
'--text-primary': '#1F2A47',
'--text-secondary': '#5A6788',
'--text-tertiary': '#9098B0',
'--border': '#F4F0FA',
'--input-bg': '#EEF1F8',
'--hero-from': '#B5E8D5',
'--hero-via': '#A8D4E8',
'--hero-to': '#C5B5E8',

// 修改后（PRD宇宙梦幻风冷色调）
'--primary': '#5B9BE0',
'--primary-dark': '#4A7FC0',
'--primary-light': '#8BB8EA',
'--primary-shadow': 'rgba(91, 155, 224, 0.3)',
'--income': '#34C759',
'--expense': '#FF6B6B',
'--bg': '#EFF5FF',
'--card-bg-start': '#FFFFFF',
'--card-bg-via': '#F0F7FF',
'--card-bg-end': '#F5F0FF',
'--text-primary': '#1A2744',
'--text-secondary': '#5A6B8A',
'--text-tertiary': '#8A9BB8',
'--border': '#E8F0FE',
'--input-bg': '#F2F7FF',
'--hero-from': '#EAF4FF',
'--hero-via': '#F1ECFF',
'--hero-to': '#FFFFFF',
'--glass-border': 'rgba(255, 255, 255, 0.8)',
'--glass-shadow': 'rgba(91, 155, 224, 0.08)',
```

2. 更新 `preview` 为渐变背景值：
```js
preview: 'linear-gradient(170deg, #EAF4FF 0%, #F1ECFF 50%, #FFFFFF 100%)',
```

3. 更新 `sunshine` 和 `forest` 主题的 `--income` / `--expense` 色值，使它们也使用标准语义（绿色=收入，红色=支出）。

---

#### 任务 1.2：更新全局SCSS变量

**文件**: `uni.scss`

**具体修改**:
```scss
// 修改前
$html-bg: #F4F6FB;
$html-primary: #6BA8D9;
$html-primary-dark: #4A7FB5;
$html-primary-light: #A8D4E8;
$html-income: #E89B9B;     // 错误：粉色被用作收入
$html-expense: #7BC4A8;    // 错误：绿色被用作支出

// 修改后
$html-bg: #EFF5FF;
$html-primary: #5B9BE0;
$html-primary-dark: #4A7FC0;
$html-primary-light: #8BB8EA;
$html-income: #34C759;
$html-expense: #FF6B6B;
```

同时更新渐变和玻璃拟态变量：
```scss
$primary-gradient: linear-gradient(135deg, #5B9BE0, #4A7FC0);
$income-gradient: linear-gradient(135deg, #34C759, #28A745);
$expense-gradient: linear-gradient(135deg, #FF6B6B, #E05555);
$budget-bar-gradient: linear-gradient(90deg, #FF6B6B, #5B9BE0);
$glass-bg: linear-gradient(170deg, #FFFFFF, #F0F7FF, #F5F0FF);
$glass-border: 1px solid rgba(255, 255, 255, 0.8);
$glass-shadow: 0 8rpx 32rpx rgba(91, 155, 224, 0.08);
$card-radius: 44rpx;
```

---

#### 任务 1.3：更新全局样式（App.vue）

**文件**: `App.vue`

**具体修改**:
1. 更新 `page` 背景色为渐变
2. 更新 `.glass-card` 样式为PRD玻璃拟态规范
3. 更新 `.btn-primary` 渐变色
4. 更新 `.btn-secondary` 边框和文字色值
5. 更新 `.input-field` 和 `.segment-control` 所有fallback值
6. 更新 `.fab-btn` 和 `.amount-input` 样式

---

#### 任务 1.4：更新 pages.json 全局背景色

**文件**: `pages.json`

**具体修改**:
```json
"globalStyle": {
  "navigationBarBackgroundColor": "#EFF5FF",
  "backgroundColor": "#EFF5FF",
  "backgroundColorTop": "#EAF4FF",
  "backgroundColorBottom": "#F1ECFF"
}
```

---

### 第二阶段：TabBar 底部导航改造

#### 任务 2.1：更新 TabBar 组件

**文件**: `components/TabBar.vue`

**具体修改**:
1. Tab 从 4 个改为 5 个：首页/统计/日历/资产/我的
2. 日历Tab添加 `center` 标记，居中突出
3. 更新颜色值为宇宙蓝系
4. 更新TabBar容器背景为玻璃拟态渐变
5. 更新Tab图标颜色为 `#8A9BB8` (未选中) / `#5B9BE0` (选中)

---

### 第三阶段：各页面修改（15个页面）

**通用修改模式**：将所有CSS变量fallback从暖色替换为冷色系。

关键替换清单：
- `var(--bg, #FFF9F5)` → `var(--bg, #EFF5FF)`
- `var(--primary, #E8734A)` → `var(--primary, #5B9BE0)`
- `var(--primary-dark, #D65D35)` → `var(--primary-dark, #4A7FC0)`
- `var(--primary-shadow, rgba(232, 115, 74, ...))` → `var(--primary-shadow, rgba(91, 155, 224, ...))`
- `var(--text-primary, #3D2316)` → `var(--text-primary, #1A2744)`
- `var(--text-secondary, #7A5C4A)` → `var(--text-secondary, #5A6B8A)`
- `var(--text-tertiary, #A98B78)` → `var(--text-tertiary, #8A9BB8)`
- `var(--border, #F0E4DA)` → `var(--border, #E8F0FE)`
- `var(--input-bg, #FFF5EE)` → `var(--input-bg, #F2F7FF)`
- `var(--income, #4CAF50)` → `var(--income, #34C759)`
- `var(--expense, #4CAF50)` → `var(--expense, #FF6B6B)`

**特别注意的色值修正**（当前代码中支出色被错误绑定到 `--primary`，需改为 `--expense`）：
- `home.vue` 第566行：支出色
- `stats.vue` 第374行：减少色
- `profile.vue` 第255行：支出边框，第260行：支出值

---

### 第四阶段：公共组件修改

#### 任务 4.1：AccCard.vue

**文件**: `components/accounting/AccCard.vue`

更新 `.glass-card` 样式为宇宙蓝系玻璃拟态。

#### 任务 4.2：AccCustomKeyboard.vue

**文件**: `components/accounting/AccCustomKeyboard.vue`

更新键盘背景色 `#EDEAF2` → `#E8F0FE`，按键颜色为宇宙蓝系。

---

### 第五阶段：图标体系检查

#### 任务 5.1：icon-base64.js 补充图标

**文件**: `common/icon-base64.js`

补充Lucide风格图标：search, filter, edit, trash, more-horizontal, settings, download, upload, camera。

#### 任务 5.2：CAT_ICONS_COLOR 颜色微调

**文件**: `common/accounting-utils.js`

将部分分类图标背景色调整为蓝系以匹配宇宙主题。

---

### 第六阶段：跨页面一致性检查

#### 任务 6.1：确认所有页面使用固定导航栏

- 为 `all-transactions` 添加 `"navigationStyle": "custom"`
- 在所有页面顶部添加固定状态栏占位

#### 任务 6.2：全局渐变背景检查

确保所有页面背景使用 `linear-gradient(170deg, #EAF4FF, #F1ECFF, #FFFFFF)` 而非纯色。

---

## 三、改造顺序

```
第一阶段：核心主题系统（无依赖）→ 1.1 theme-manager, 1.2 uni.scss, 1.3 App.vue, 1.4 pages.json
第二阶段：TabBar（依赖第一阶段）→ 2.1 TabBar.vue, 2.2 icon-base64.js
第三阶段：15个页面（依赖第一阶段，可并行）
第四阶段：公共组件（依赖第一阶段，可并行）
第五阶段：图标体系（独立）
第六阶段：一致性检查（依赖所有，最后做）
```

## 四、关键技术决策

1. **CSS变量策略**：使用 `var(--xxx, fallback)` 模式，fallback值更新为PRD宇宙蓝颜色
2. **玻璃拟态实现**：`linear-gradient(170deg, #FFFFFF, #F0F7FF, #F5F0FF)` + `1px solid rgba(255,255,255,0.8)` + `border-radius: 44rpx`
3. **5Tab布局**：日历Tab通过 `margin-top: -16px` 向上突出居中
4. **收入/支出色值修正**：全局修正，绿色=收入(#34C759)，红色=支出(#FF6B6B)

## 五、验证步骤

1. 确认所有页面背景为宇宙蓝渐变
2. 确认所有卡片为玻璃拟态样式
3. 确认底部导航为5Tab，日历居中
4. 确认收入显示绿色，支出显示红色
5. 确认所有输入框、按钮、分割线颜色统一
6. 确认多主题切换正常（宇宙/暖阳/森林）