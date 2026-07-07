/**
 * 宇宙记账 - 错误处理模块
 * 提供自定义错误类、全局异常捕获、async 包装器
 */
import Logger from './logger.js'

const MODULE = 'ErrorHandler'

/**
 * 业务异常基类
 */
export class BusinessError extends Error {
  constructor(code, message, details = null) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

/**
 * 参数校验错误
 */
export class ValidationError extends BusinessError {
  constructor(message, fields = []) {
    super('VALIDATION_ERROR', message, { fields })
    this.name = 'ValidationError'
  }
}

/**
 * 存储操作错误
 */
export class StorageError extends BusinessError {
  constructor(operation, originalError) {
    super('STORAGE_ERROR', `存储操作失败: ${operation}`, {
      originalMessage: originalError ? originalError.message : ''
    })
    this.name = 'StorageError'
  }
}

/**
 * 数据一致性错误
 */
export class DataConsistencyError extends BusinessError {
  constructor(message, data) {
    super('DATA_CONSISTENCY_ERROR', message, data)
    this.name = 'DataConsistencyError'
  }
}

/**
 * 安全执行异步函数 - 统一错误处理
 * @param {Function} fn - 要执行的异步函数
 * @param {Object} options - 可选配置
 * @param {string} options.module - 日志模块名
 * @param {*} options.defaultValue - 失败时的默认返回值
 * @param {boolean} options.rethrow - 是否重新抛出错误
 * @returns {Promise<{success: boolean, data: *, error: BusinessError|null}>}
 */
export async function safeAsync(fn, options = {}) {
  const { module = 'safeAsync', defaultValue = null, rethrow = false } = options
  try {
    const result = await fn()
    return { success: true, data: result, error: null }
  } catch (err) {
    Logger.errorWithException(module, '异步操作失败', err)

    const businessErr = err instanceof BusinessError
      ? err
      : new BusinessError('UNKNOWN_ERROR', err.message || '未知错误')

    if (rethrow) throw businessErr
    return { success: false, data: defaultValue, error: businessErr }
  }
}

/**
 * 安全执行同步函数
 */
export function safeSync(fn, options = {}) {
  const { module = 'safeSync', defaultValue = null, rethrow = false } = options
  try {
    const result = fn()
    return { success: true, data: result, error: null }
  } catch (err) {
    Logger.errorWithException(module, '同步操作失败', err)

    const businessErr = err instanceof BusinessError
      ? err
      : new BusinessError('UNKNOWN_ERROR', err.message || '未知错误')

    if (rethrow) throw businessErr
    return { success: false, data: defaultValue, error: businessErr }
  }
}

/**
 * 全局错误监听器（需在 App.vue onLaunch 中调用）
 */
export function setupGlobalErrorHandler() {
  // 捕获未处理的 Promise 异常
  const originalOnError = uni.onError
  uni.onError = function(err) {
    Logger.errorWithException(MODULE, '全局未捕获异常', err)
    if (originalOnError) originalOnError(err)
  }

  // uni-app 的全局错误
  try {
    uni.onAppError = function(err) {
      Logger.errorWithException(MODULE, 'App 全局错误', err)
    }
  } catch (e) { /* 部分平台不支持 */ }

  Logger.info(MODULE, '全局错误处理器已初始化')
}

/**
 * Vue 错误处理器（在 main.js / App.vue 中配置）
 */
export function vueErrorHandler(err, vm, info) {
  Logger.errorWithException(MODULE, `Vue 错误 [${info}]`, err)
}
