/**
 * 宇宙记账 - 统一响应格式单元测试
 */
const { success, failure, paginated, wrapAction } = require('../../common/api-response.js')

describe('api-response', () => {
  describe('success', () => {
    test('应返回成功的响应格式', () => {
      const res = success({ id: 1 })
      expect(res.success).toBe(true)
      expect(res.data).toEqual({ id: 1 })
      expect(res.message).toBe('操作成功')
      expect(res.timestamp).toBeTruthy()
    })

    test('应支持自定义消息', () => {
      const res = success(null, '自定义成功')
      expect(res.message).toBe('自定义成功')
    })

    test('不传参数时 data 应为 null', () => {
      const res = success()
      expect(res.data).toBeNull()
    })
  })

  describe('failure', () => {
    test('应返回失败的响应格式', () => {
      const res = failure('出错了', 'ERR_CODE', { detail: 'x' })
      expect(res.success).toBe(false)
      expect(res.message).toBe('出错了')
      expect(res.code).toBe('ERR_CODE')
      expect(res.details.detail).toBe('x')
    })

    test('应使用默认参数', () => {
      const res = failure()
      expect(res.message).toBe('操作失败')
      expect(res.code).toBe('UNKNOWN_ERROR')
      expect(res.details).toBeNull()
    })
  })

  describe('paginated', () => {
    test('应返回分页格式', () => {
      const res = paginated([1, 2, 3], 10, 1, 5)
      expect(res.success).toBe(true)
      expect(res.data.list).toHaveLength(3)
      expect(res.data.total).toBe(10)
      expect(res.data.page).toBe(1)
      expect(res.data.pageSize).toBe(5)
      expect(res.data.totalPages).toBe(2)
    })

    test('空数据应正常处理', () => {
      const res = paginated([], 0)
      expect(res.data.list).toHaveLength(0)
      expect(res.data.totalPages).toBe(0)
    })
  })

  describe('wrapAction', () => {
    test('成功 action 应包装为成功响应', async () => {
      const res = await wrapAction(async () => 'result')
      expect(res.success).toBe(true)
      expect(res.data).toBe('result')
    })

    test('失败 action 应包装为失败响应', async () => {
      const err = new Error('action failed')
      err.code = 'ACTION_FAIL'
      const res = await wrapAction(async () => { throw err })
      expect(res.success).toBe(false)
      expect(res.message).toBe('action failed')
      expect(res.code).toBe('ACTION_FAIL')
    })
  })
})
