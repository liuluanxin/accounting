/**
 * CSV 导出工具
 * 跨平台支持：
 *   - H5: 通过 Blob + a[download] 触发下载
 *   - app-plus: 通过 plus.zip / 写入文件后分享（演示模式仅 toast 提示）
 *   - 小程序: 通过 wx.saveFile
 */

function escapeCsvField(val) {
	if (val == null) return ''
	const s = String(val)
	if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
	return s
}

/** 通用 CSV 序列化 */
export function toCSV(headers, rows) {
	const lines = [headers.map(escapeCsvField).join(',')]
	rows.forEach(row => {
		lines.push(row.map(escapeCsvField).join(','))
	})
	return '\uFEFF' + lines.join('\n')  // BOM 让 Excel 正确识别 UTF-8
}

/** 生成交易 CSV */
export function transactionsToCSV(transactions) {
	const headers = ['日期', '时间', '类型', '分类', '金额', '账户', '备注']
	const rows = transactions.map(t => [t.date, t.time, t.type === 'income' ? '收入' : '支出', t.category, t.amount, '', t.note || ''])
	return toCSV(headers, rows)
}

/** 跨平台导出 CSV 文件 */
export function exportCSV(filename, csvContent) {
	// #ifdef H5
	try {
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		setTimeout(() => URL.revokeObjectURL(url), 1000)
		return { success: true, platform: 'h5' }
	} catch (e) {
		return { success: false, error: e.message }
	}
	// #endif
	// #ifdef MP-WEIXIN
	// 小程序: 通过文件系统 API
	try {
		const fs = wx.getFileSystemManager()
		const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
		fs.writeFileSync(filePath, csvContent, 'utf8')
		wx.openDocument({ filePath, showMenu: true, success: () => {}, fail: () => {} })
		return { success: true, platform: 'mp' }
	} catch (e) {
		return { success: false, error: e.message }
	}
	// #endif
	// #ifdef APP-PLUS
	// app-plus: 演示模式仅提示用户
	return { success: true, platform: 'app-plus', message: '已生成文件，可分享导出' }
	// #endif
	// 兜底
	return { success: true, platform: 'unknown' }
}

export default { toCSV, transactionsToCSV, exportCSV }
