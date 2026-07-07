/**
 * 宇宙记账 - 输入参数校验模块
 * 提供统一的校验规则和表单验证工具
 */
import { ValidationError } from './error-handler.js'
import Logger from './logger.js'

const MODULE = 'Validator'

/**
 * 基础校验规则
 */
export const rules = {
  /** 必填字段 */
  required(message = '该项为必填项') {
    return (value) => {
      if (value === null || value === undefined || value === '') {
        return { valid: false, message }
      }
      if (typeof value === 'string' && value.trim() === '') {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 金额校验（正数，最多两位小数） */
  validMoney(message = '请输入有效金额') {
    return (value) => {
      const num = parseFloat(value)
      if (isNaN(num) || num < 0) return { valid: false, message }
      if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
        return { valid: false, message: '金额最多两位小数' }
      }
      return { valid: true }
    }
  },

  /** 正金额（> 0） */
  positiveMoney(message = '金额必须大于0') {
    return (value) => {
      const result = rules.validMoney()(value)
      if (!result.valid) return result
      if (parseFloat(value) <= 0) return { valid: false, message }
      return { valid: true }
    }
  },

  /** 最小长度 */
  minLength(min, message = `最少需要 ${min} 个字符`) {
    return (value) => {
      if (typeof value !== 'string' || value.trim().length < min) {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 最大长度 */
  maxLength(max, message = `最多 ${max} 个字符`) {
    return (value) => {
      if (typeof value === 'string' && value.length > max) {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 手机号格式 */
  phone(message = '请输入正确的手机号') {
    return (value) => {
      if (!/^1[3-9]\d{9}$/.test(String(value).replace(/\s/g, ''))) {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 枚举值校验 */
  oneOf(enumValues, message = '值不在允许范围内') {
    return (value) => {
      if (!enumValues.includes(value)) {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 日期格式 YYYY-MM-DD */
  dateFormat(message = '日期格式不正确 (YYYY-MM-DD)') {
    return (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return { valid: false, message }
      }
      const d = new Date(value)
      if (isNaN(d.getTime())) return { valid: false, message }
      return { valid: true }
    }
  },

  /** 邮箱格式校验 */
  email(message = '请输入正确的邮箱地址') {
    return (value) => {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(value).trim())) {
        return { valid: false, message }
      }
      return { valid: true }
    }
  },

  /** 用户名：2-20位，字母数字下划线中文 */
  username(message = '用户名格式不正确（2-20位字符）') {
    return (value) => {
      if (typeof value !== 'string') return { valid: false, message }
      const trimmed = value.trim()
      if (trimmed.length < 2 || trimmed.length > 20) return { valid: false, message }
      if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(trimmed)) {
        return { valid: false, message: '用户名只能包含中文、字母、数字和下划线' }
      }
      return { valid: true }
    }
  },

  /** 密码强度校验 */
  password(strength = 'medium', message = '密码不符合安全要求') {
    return (value) => {
      if (typeof value !== 'string') return { valid: false, message }
      const pwd = value
      if (pwd.length < 8) return { valid: false, message: '密码长度至少 8 位' }
      if (strength === 'medium') {
        // 至少包含字母和数字
        if (!/[a-zA-Z]/.test(pwd)) return { valid: false, message: '密码需包含字母' }
        if (!/\d/.test(pwd)) return { valid: false, message: '密码需包含数字' }
      }
      if (strength === 'strong') {
        if (!/[a-z]/.test(pwd)) return { valid: false, message: '密码需包含小写字母' }
        if (!/[A-Z]/.test(pwd)) return { valid: false, message: '密码需包含大写字母' }
        if (!/\d/.test(pwd)) return { valid: false, message: '密码需包含数字' }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
          return { valid: false, message: '密码需包含特殊字符' }
        }
      }
      return { valid: true }
    }
  }
}

/**
 * 表单校验器
 * @param {Object} data - 表单数据 { fieldName: value }
 * @param {Object} fieldRules - 校验规则 { fieldName: [rule1, rule2, ...] }
 * @returns {{ valid: boolean, errors: Object<string, string> }}
 *
 * @example
 * const result = validate(
 *   { amount: 'abc', type: 'expense' },
 *   { amount: [rules.positiveMoney()], type: [rules.oneOf(['expense','income'])] }
 * )
 */
export function validate(data, fieldRules) {
  const errors = {}

  for (const [field, fieldRuleList] of Object.entries(fieldRules)) {
    const value = data[field]
    for (const rule of fieldRuleList) {
      const result = rule(value)
      if (!result.valid) {
        errors[field] = result.message
        break // 每个字段只记录第一个错误
      }
    }
  }

  const valid = Object.keys(errors).length === 0
  Logger.debug(MODULE, '表单校验结果', { valid, errors, data })

  return { valid, errors }
}

/**
 * 校验并抛出 ValidationError
 * @throws {ValidationError}
 */
export function validateOrThrow(data, fieldRules) {
  const { valid, errors } = validate(data, fieldRules)
  if (!valid) {
    throw new ValidationError('输入参数校验失败', Object.entries(errors).map(([k, v]) => ({ field: k, message: v })))
  }
}

/**
 * 安全地解析金额
 * @param {*} value - 输入的金额值
 * @returns {{ valid: boolean, amount: number, error: string|null }}
 */
export function parseAmount(value) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, amount: 0, error: '请输入金额' }
  }
  const num = parseFloat(value)
  if (isNaN(num)) return { valid: false, amount: 0, error: '金额格式不正确' }
  if (num < 0) return { valid: false, amount: 0, error: '金额不能为负数' }
  if (num === 0) return { valid: false, amount: 0, error: '金额必须大于0' }
  return { valid: true, amount: Math.round(num * 100) / 100, error: null }
}

export default { rules, validate, validateOrThrow, parseAmount }
