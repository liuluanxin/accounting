/**
 * 宇宙记账 - 校验模块单元测试
 */
const validator = require('../../common/validator.js')
const { rules, validate, parseAmount, validateOrThrow } = validator
const { ValidationError } = require('../../common/error-handler.js')

describe('Validator - rules', () => {
  describe('required', () => {
    test('空值应返回无效', () => {
      expect(rules.required()(null).valid).toBe(false)
      expect(rules.required()(undefined).valid).toBe(false)
      expect(rules.required()('').valid).toBe(false)
      expect(rules.required()('  ').valid).toBe(false)
    })

    test('非空值应返回有效', () => {
      expect(rules.required()('test').valid).toBe(true)
      expect(rules.required()(0).valid).toBe(true)
      expect(rules.required()(false).valid).toBe(true)
    })
  })

  describe('positiveMoney', () => {
    test('正金额应通过', () => {
      expect(rules.positiveMoney()('100').valid).toBe(true)
      expect(rules.positiveMoney()('99.99').valid).toBe(true)
      expect(rules.positiveMoney()('0.01').valid).toBe(true)
    })

    test('零或负数应不通过', () => {
      expect(rules.positiveMoney()('0').valid).toBe(false)
      expect(rules.positiveMoney()('-10').valid).toBe(false)
    })

    test('非数字应不通过', () => {
      expect(rules.positiveMoney()('abc').valid).toBe(false)
      expect(rules.positiveMoney()('').valid).toBe(false)
    })

    test('超过两位小数应不通过', () => {
      expect(rules.positiveMoney()('10.999').valid).toBe(false)
    })
  })

  describe('phone', () => {
    test('有效手机号应通过', () => {
      expect(rules.phone()('13800138000').valid).toBe(true)
      expect(rules.phone()('15912345678').valid).toBe(true)
    })

    test('无效手机号应不通过', () => {
      expect(rules.phone()('12345678901').valid).toBe(false)
      expect(rules.phone()('1380013800').valid).toBe(false)
      expect(rules.phone()('abc').valid).toBe(false)
    })
  })

  describe('oneOf', () => {
    test('包含的值应通过', () => {
      expect(rules.oneOf(['a', 'b', 'c'])('a').valid).toBe(true)
      expect(rules.oneOf(['expense', 'income'])('expense').valid).toBe(true)
    })

    test('不包含的值应不通过', () => {
      expect(rules.oneOf(['a', 'b'])('d').valid).toBe(false)
    })
  })

  describe('dateFormat', () => {
    test('有效日期应通过', () => {
      expect(rules.dateFormat()('2026-07-05').valid).toBe(true)
      expect(rules.dateFormat()('2024-02-29').valid).toBe(true)
    })

    test('无效日期应不通过', () => {
      expect(rules.dateFormat()('2026-13-01').valid).toBe(false)
      expect(rules.dateFormat()('2026/07/05').valid).toBe(false)
      expect(rules.dateFormat()('20260705').valid).toBe(false)
    })
  })
})

describe('Validator - validate', () => {
  test('所有字段通过应返回 valid=true', () => {
    const result = validate(
      { amount: '100', type: 'expense' },
      { amount: [rules.positiveMoney()], type: [rules.oneOf(['expense', 'income'])] }
    )
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  test('存在错误字段应返回 valid=false', () => {
    const result = validate(
      { amount: '-10', type: 'invalid' },
      { amount: [rules.positiveMoney()], type: [rules.oneOf(['expense', 'income'])] }
    )
    expect(result.valid).toBe(false)
    expect(result.errors.amount).toBeTruthy()
    expect(result.errors.type).toBeTruthy()
  })

  test('多规则校验：第一个错误生效', () => {
    const result = validate(
      { name: '' },
      { name: [rules.required(), rules.minLength(3)] }
    )
    expect(result.valid).toBe(false)
    // required 先于 minLength 检查
    expect(result.errors.name).toBeTruthy()
  })
})

describe('Validator - parseAmount', () => {
  test('正确解析有效金额', () => {
    expect(parseAmount('100')).toEqual({ valid: true, amount: 100, error: null })
    expect(parseAmount('99.99')).toEqual({ valid: true, amount: 99.99, error: null })
    expect(parseAmount(50)).toEqual({ valid: true, amount: 50, error: null })
  })

  test('空值应返回错误', () => {
    expect(parseAmount('').valid).toBe(false)
    expect(parseAmount(null).valid).toBe(false)
    expect(parseAmount(undefined).valid).toBe(false)
  })

  test('零应返回错误', () => {
    expect(parseAmount('0').valid).toBe(false)
    expect(parseAmount(0).valid).toBe(false)
  })

  test('负数应返回错误', () => {
    expect(parseAmount('-10').valid).toBe(false)
  })
})

describe('Validator - validateOrThrow', () => {
  test('有效数据不应抛出异常', () => {
    expect(() => {
      validateOrThrow(
        { type: 'expense' },
        { type: [rules.oneOf(['expense', 'income'])] }
      )
    }).not.toThrow()
  })

  test('无效数据应抛出 ValidationError', () => {
    expect(() => {
      validateOrThrow(
        { type: 'invalid' },
        { type: [rules.oneOf(['expense', 'income'])] }
      )
    }).toThrow(ValidationError)
  })
})
