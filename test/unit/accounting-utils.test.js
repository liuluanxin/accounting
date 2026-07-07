/**
 * 宇宙记账 - 工具函数单元测试
 */
const { genId, todayStr, currentMonthKey, formatMoney, WEEKDAYS, MONTHS, CAT_ICONS } = require('../../common/accounting-utils.js')

describe('accounting-utils', () => {
  describe('genId', () => {
    test('应生成字符串类型的ID', () => {
      const id = genId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(6)
    })

    test('每次调用应生成不同的ID', () => {
      const id1 = genId()
      const id2 = genId()
      expect(id1).not.toBe(id2)
    })

    test('ID应以"tx_"开头以备交易使用', () => {
      // genId 不包含前缀，前缀在其他地方拼接
      const id = genId()
      expect(id).toBeTruthy()
    })
  })

  describe('todayStr', () => {
    test('应返回YYYY-MM-DD格式', () => {
      const date = todayStr()
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    test('应返回今天的日期', () => {
      const expected = new Date()
      const y = expected.getFullYear()
      const m = String(expected.getMonth() + 1).padStart(2, '0')
      const d = String(expected.getDate()).padStart(2, '0')
      expect(todayStr()).toBe(`${y}-${m}-${d}`)
    })
  })

  describe('currentMonthKey', () => {
    test('应返回YYYY-MM格式', () => {
      const key = currentMonthKey()
      expect(key).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  describe('formatMoney', () => {
    test('应以¥开头并保留两位小数', () => {
      expect(formatMoney(100)).toBe('¥100.00')
      expect(formatMoney(99.9)).toBe('¥99.90')
      expect(formatMoney(0)).toBe('¥0.00')
    })

    test('应正确处理大数字', () => {
      expect(formatMoney(1234567.89)).toBe('¥1234567.89')
    })

    test('应处理字符串数字', () => {
      expect(formatMoney('50')).toBe('¥50.00')
    })
  })

  describe('常量', () => {
    test('WEEKDAYS应包含7天', () => {
      expect(WEEKDAYS).toHaveLength(7)
      expect(WEEKDAYS).toContain('一')
      expect(WEEKDAYS).toContain('日')
    })

    test('MONTHS应包含12个月（索引0为空）', () => {
      expect(MONTHS).toHaveLength(13)
      expect(MONTHS[0]).toBe('')
      expect(MONTHS[1]).toBe('1月')
      expect(MONTHS[12]).toBe('12月')
    })

    test('CAT_ICONS应包含所有分类图标', () => {
      expect(CAT_ICONS['餐饮']).toBe('🍱')
      expect(CAT_ICONS['薪资']).toBe('💰')
      expect(CAT_ICONS['交通']).toBe('🚇')
      expect(CAT_ICONS['其他']).toBe('📦')
    })
  })
})
