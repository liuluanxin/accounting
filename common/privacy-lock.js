/**
 * 隐私密码管理
 * 4 位数字 PIN 码，用于 app 启动验证
 * 存储在 localStorage，明文存储（仅本地）
 */

const PIN_KEY = 'privacy_pin'
const LAST_VERIFY_KEY = 'privacy_last_verify'
const VERIFY_INTERVAL = 5 * 60 * 1000  // 5 分钟内免验证

/** 是否已设置 PIN */
export function hasPin() {
	try {
		const pin = uni.getStorageSync(PIN_KEY)
		return !!pin && pin.length === 4
	} catch (e) {
		return false
	}
}

/** 设置 PIN */
export function setPin(pin) {
	if (!/^\d{4}$/.test(pin)) return false
	try {
		uni.setStorageSync(PIN_KEY, pin)
		uni.removeStorageSync(LAST_VERIFY_KEY)  // 清除验证状态
		return true
	} catch (e) {
		return false
	}
}

/** 清除 PIN */
export function clearPin() {
	try {
		uni.removeStorageSync(PIN_KEY)
		uni.removeStorageSync(LAST_VERIFY_KEY)
		return true
	} catch (e) {
		return false
	}
}

/** 验证 PIN */
export function verifyPin(pin) {
	try {
		const stored = uni.getStorageSync(PIN_KEY)
		return stored === pin
	} catch (e) {
		return false
	}
}

/** 是否需要验证（PIN 已设置 & 超过间隔时间） */
export function needVerify() {
	if (!hasPin()) return false
	try {
		const last = uni.getStorageSync(LAST_VERIFY_KEY) || 0
		return Date.now() - last > VERIFY_INTERVAL
	} catch (e) {
		return true
	}
}

/** 标记已验证 */
export function markVerified() {
	try {
		uni.setStorageSync(LAST_VERIFY_KEY, Date.now())
	} catch (e) { /* ignore */ }
}

export default { hasPin, setPin, clearPin, verifyPin, needVerify, markVerified }
