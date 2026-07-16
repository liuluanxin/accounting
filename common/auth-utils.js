/** QQ 邮箱与密码校验（PRD §5.1–5.3） */
export function isQqEmail(email) {
	const e = (email || '').trim().toLowerCase()
	return /^[^\s@]+@qq\.com$/i.test(e) && e.length <= 64
}

export function validatePassword(pwd) {
	if (!pwd || pwd.length < 8 || pwd.length > 20) return { ok: false, level: 0, msg: '密码需 8–20 位' }
	const hasLetter = /[A-Za-z]/.test(pwd)
	const hasDigit = /\d/.test(pwd)
	const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
	if (!hasLetter || !hasDigit) return { ok: false, level: 1, msg: '密码需包含字母和数字' }
	let level = 2
	if (hasSpecial) level = 3
	return { ok: level >= 2, level, msg: level >= 2 ? '' : '密码强度过低' }
}

export function loginSuccess(email, rememberMe) {
	uni.setStorageSync('isLoggedIn', 'true')
	uni.setStorageSync('loginTime', Date.now())
	uni.setStorageSync('login_phone', email.trim())
	if (rememberMe) uni.setStorageSync('rememberMe', 'true')
}
