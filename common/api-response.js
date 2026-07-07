/**
 * 宇宙记账 - 统一响应格式
 * 用于 Vuex actions 和数据操作层的标准化返回
 */

/**
 * 创建成功的响应
 * @param {*} data - 返回数据
 * @param {string} message - 成功消息
 * @returns {{ success: true, data: *, message: string, timestamp: string }}
 */
export function success(data = null, message = '操作成功') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * 创建失败的响应
 * @param {string} message - 错误消息
 * @param {string} code - 错误码
 * @param {*} details - 详细信息
 * @returns {{ success: false, message: string, code: string, details: *, timestamp: string }}
 */
export function failure(message = '操作失败', code = 'UNKNOWN_ERROR', details = null) {
  return {
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }
}

/**
 * 分页响应
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {{ success: true, data: { list, total, page, pageSize, totalPages }, message: string, timestamp: string }}
 */
export function paginated(list = [], total = 0, page = 1, pageSize = 20) {
  return {
    success: true,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0
    },
    message: '查询成功',
    timestamp: new Date().toISOString()
  }
}

/**
 * 包装 Vuex action 为统一响应格式
 * @param {Function} actionFn - 实际的 action 执行函数
 * @returns {Promise<{success: boolean, data?: *, message?: string, code?: string}>}
 */
export async function wrapAction(actionFn) {
  try {
    const result = await actionFn()
    return success(result)
  } catch (err) {
    return failure(
      err.message || '操作失败',
      err.code || 'ACTION_ERROR',
      err.details || null
    )
  }
}
