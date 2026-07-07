/**
 * 宇宙记账 - 结构化日志模块
 * 提供分级日志输出，支持开发/生产环境切换
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 }

// 从环境变量读取日志级别，默认开发环境 DEBUG，生产环境 WARN
const CURRENT_LEVEL = (function getLevel() {
  try {
    const env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development'
    const levelName = (typeof uni !== 'undefined' && uni.getStorageSync) 
      ? uni.getStorageSync('LOG_LEVEL') || (env === 'production' ? 'WARN' : 'DEBUG')
      : 'DEBUG'
    return LOG_LEVELS[levelName] !== undefined ? LOG_LEVELS[levelName] : LOG_LEVELS.DEBUG
  } catch (e) {
    return LOG_LEVELS.DEBUG
  }
})()

function formatTime() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`
}

function shouldLog(level) {
  return level >= CURRENT_LEVEL
}

const Logger = {
  debug(module, message, ...args) {
    if (!shouldLog(LOG_LEVELS.DEBUG)) return
    console.log(`[${formatTime()}] [DEBUG] [${module}] ${message}`, ...args)
  },

  info(module, message, ...args) {
    if (!shouldLog(LOG_LEVELS.INFO)) return
    console.log(`[${formatTime()}] [INFO]  [${module}] ${message}`, ...args)
  },

  warn(module, message, ...args) {
    if (!shouldLog(LOG_LEVELS.WARN)) return
    console.warn(`[${formatTime()}] [WARN]  [${module}] ${message}`, ...args)
  },

  error(module, message, ...args) {
    if (!shouldLog(LOG_LEVELS.ERROR)) return
    console.error(`[${formatTime()}] [ERROR] [${module}] ${message}`, ...args)
  },

  /**
   * 带错误对象的日志
   */
  errorWithException(module, message, error) {
    if (!shouldLog(LOG_LEVELS.ERROR)) return
    console.error(`[${formatTime()}] [ERROR] [${module}] ${message}`, error)
    if (error && error.stack) {
      console.error(`[${formatTime()}] [ERROR] [${module}] Stack: ${error.stack}`)
    }
  },

  /**
   * 设置运行时的日志级别
   */
  setLevel(levelName) {
    const level = LOG_LEVELS[levelName]
    if (level !== undefined) {
      try { uni.setStorageSync('LOG_LEVEL', levelName) } catch (e) { /* ignore */ }
      Logger.info('Logger', `日志级别已切换为: ${levelName}`)
    }
  }
}

export default Logger
export { LOG_LEVELS }
