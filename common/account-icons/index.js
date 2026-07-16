/**
 * 账户图标库 - 统一导出
 * 整合支付平台图标和银行图标
 */
import { ACCOUNT_ICONS_MAP as PAY_ICONS } from '@/common/account-icons.js'
import { BANK_ICONS_MAP } from '@/common/account-icons-bank.js'

// 合并所有图标
export const ALL_ACCOUNT_ICONS = {
  ...PAY_ICONS,
  ...BANK_ICONS_MAP
}

export const ALL_ICONS_LIST = Object.values(ALL_ACCOUNT_ICONS)

export { ACCOUNT_ICONS_MAP } from '@/common/account-icons.js'
export { BANK_ICONS_MAP } from '@/common/account-icons-bank.js'

export * from '@/common/account-icons.js'
export * from '@/common/account-icons-bank.js'