/**
 * 宇宙记账 - 错误处理模块单元测试
 */
const {
  BusinessError,
  ValidationError,
  StorageError,
  DataConsistencyError,
  safeAsync,
  safeSync
} = require('../../common/error-handler.js')

describe('Error Classes', () => {
  describe('BusinessError', () => {
    test('应正确初始化', () => {
      const err = new BusinessError('TEST_ERROR', '测试错误')
      expect(err.name).toBe('BusinessError')
      expect(err.code).toBe('TEST_ERROR')
      expect(err.message).toBe('测试错误')
      expect(err.timestamp).toBeTruthy()
    })

    test('toJSON 应返回序列化对象', () => {
      const err = new BusinessError('ERR', 'msg', { key: 'val' })
      const json = err.toJSON()
      expect(json.code).toBe('ERR')
      expect(json.message).toBe('msg')
      expect(json.details.key).toBe('val')
      expect(json.name).toBe('BusinessError')
    })
  })

  describe('ValidationError', () => {
    test('应继承 BusinessError', () => {
      const err = new ValidationError('参数错误', [{ field: 'name', message: '必填' }])
      expect(err).toBeInstanceOf(BusinessError)
      expect(err.name).toBe('ValidationError')
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.details.fields).toHaveLength(1)
    })
  })

  describe('StorageError', () => {
    test('应记录原始错误信息', () => {
      const original = new Error('磁盘空间不足')
      const err = new StorageError('save', original)
      expect(err.name).toBe('StorageError')
      expect(err.code).toBe('STORAGE_ERROR')
      expect(err.message).toContain('save')
      expect(err.details.originalMessage).toBe('磁盘空间不足')
    })
  })

  describe('DataConsistencyError', () => {
    test('应携带上下文数据', () => {
      const err = new DataConsistencyError('数据不一致', { id: 'tx_123' })
      expect(err.code).toBe('DATA_CONSISTENCY_ERROR')
      expect(err.details.id).toBe('tx_123')
    })
  })
})

describe('safeAsync', () => {
  test('成功时应返回 { success: true, data }', async () => {
    const result = await safeAsync(async () => 'result')
    expect(result.success).toBe(true)
    expect(result.data).toBe('result')
    expect(result.error).toBeNull()
  })

  test('失败时应返回 { success: false, error } 并包装错误', async () => {
    const result = await safeAsync(async () => { throw new Error('fail') })
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(BusinessError)
    expect(result.error.code).toBe('UNKNOWN_ERROR')
  })

  test('BusinessError 应保持原类型', async () => {
    const result = await safeAsync(async () => { throw new ValidationError('校验失败') })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ValidationError)
    expect(result.error.code).toBe('VALIDATION_ERROR')
  })

  test('应支持 defaultValue', async () => {
    const result = await safeAsync(async () => { throw new Error('fail') }, { defaultValue: [] })
    expect(result.success).toBe(false)
    expect(result.data).toEqual([])
  })
})

describe('safeSync', () => {
  test('成功时应返回 { success: true, data }', () => {
    const result = safeSync(() => 42)
    expect(result.success).toBe(true)
    expect(result.data).toBe(42)
  })

  test('失败时应返回 { success: false, error }', () => {
    const result = safeSync(() => { throw new Error('sync fail') })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(BusinessError)
  })
})
