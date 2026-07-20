/**
 * 宇宙记账 · 数据备份接收服务器
 * 
 * 使用方法：
 *   1. 确保电脑和手机在同一局域网
 *   2. 在电脑上运行：node backup-server.js
 *   3. 在手机 App「我的 → 数据备份与恢复」页面输入电脑 IP 和端口
 *   4. 点击「上传数据到电脑」，数据将保存到 data.csv
 * 
 * 默认监听端口：5800
 * 固定输出文件：D:\HBuilderProjects\phone_data\data.csv
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')

const PORT = process.argv[2] || 5800
const OUTPUT_FILE = 'D:\\HBuilderProjects\\phone_data\\data.csv'

// 确保输出目录存在
const outputDir = path.dirname(OUTPUT_FILE)
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true })
}

// 获取本机局域网 IP
function getLocalIP() {
	const interfaces = os.networkInterfaces()
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address
			}
		}
	}
	return '127.0.0.1'
}

// 解析请求体 JSON
function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = ''
		req.on('data', chunk => { body += chunk })
		req.on('end', () => {
			try {
				resolve(JSON.parse(body))
			} catch {
				reject(new Error('无效的 JSON 数据'))
			}
		})
		req.on('error', reject)
	})
}

// 发送 JSON 响应
function sendJSON(res, code, data) {
	res.writeHead(code, {
		'Content-Type': 'application/json; charset=utf-8',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type'
	})
	res.end(JSON.stringify(data))
}

// CSV 转义（含逗号或引号的字段用双引号包裹）
function esc(val) {
	const s = String(val ?? '')
	if (s.includes(',') || s.includes('"') || s.includes('\n')) {
		return '"' + s.replace(/"/g, '""') + '"'
	}
	return s
}

// 将备份数据转换为 CSV 格式
function toCSV(data) {
	const lines = []
	const now = new Date().toLocaleString('zh-CN')

	// ── 文件头 ──
	lines.push('宇宙记账数据备份,,' + now)
	lines.push('备份版本,,' + (data.version || '1.0'))
	lines.push('备份时间,,' + (data.backupTime || ''))
	lines.push('')

	// ── 用户信息 ──
	lines.push('=== 用户信息 ===')
	lines.push('字段,值')
	const u = data.user || {}
	lines.push('姓名,' + esc(u.name))
	lines.push('邮箱,' + esc(u.email))
	lines.push('')

	// ── 账户 ──
	lines.push('=== 账户列表 ===')
	lines.push('名称,图标,余额')
	const accounts = data.accounts || []
	if (accounts.length === 0) {
		lines.push('（无数据）,,')
	} else {
		accounts.forEach(a => {
			lines.push([esc(a.name), esc(a.ic), esc(a.bal)].join(','))
		})
	}
	lines.push('')

	// ── 账单 ──
	lines.push('=== 账单列表 ===')
	lines.push('ID,类型,金额,分类,子分类,账户,备注,时间')
	const bills = data.bills || []
	if (bills.length === 0) {
		lines.push('（无数据）,,,,,,,')
	} else {
		bills.forEach(b => {
			const ts = b.ts ? new Date(b.ts).toLocaleString('zh-CN') : ''
			lines.push([
				esc(b.id),
				b.amt > 0 ? '收入' : '支出',
				esc(Math.abs(b.amt)),
				esc(b.cat),
				esc(b.subcat || ''),
				esc(b.acc || b.name || ''),
				esc(b.note || ''),
				esc(ts)
			].join(','))
		})
	}
	lines.push('')

	// ── 预算 ──
	lines.push('=== 预算设置 ===')
	lines.push('总预算,' + esc(data.budgetTotal))
	lines.push('')
	lines.push('分类预算')
	lines.push('分类,限额')
	const cats = data.budgetCats || []
	if (cats.length === 0) {
		lines.push('（无数据）,')
	} else {
		cats.forEach(c => {
			lines.push([esc(c.name), esc(c.limit)].join(','))
		})
	}
	lines.push('')

	// ── 账本 ──
	lines.push('=== 账本列表 ===')
	lines.push('ID,名称')
	const ledgers = data.ledgers || []
	if (ledgers.length === 0) {
		lines.push('（无数据）,')
	} else {
		ledgers.forEach(l => {
			lines.push([esc(l.id), esc(l.name)].join(','))
		})
	}

	return lines.join('\r\n')
}

const server = http.createServer(async (req, res) => {
	// 处理 CORS 预检请求
	if (req.method === 'OPTIONS') {
		res.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		})
		res.end()
		return
	}

	const url = new URL(req.url, `http://${req.headers.host}`)

	// GET /health — 健康检查
	if (req.method === 'GET' && url.pathname === '/health') {
		sendJSON(res, 200, {
			status: 'ok',
			message: '宇宙记账备份服务器运行中',
			time: new Date().toISOString()
		})
		return
	}

	// POST /backup — 接收备份数据
	if (req.method === 'POST' && url.pathname === '/backup') {
		try {
			const data = await parseBody(req)

			// 转换为 CSV 并写入文件（带 BOM 的 UTF-8，确保记事本可读）
			const csv = toCSV(data)
			const bom = Buffer.from([0xEF, 0xBB, 0xBF])
			fs.writeFileSync(OUTPUT_FILE, Buffer.concat([bom, Buffer.from(csv, 'utf-8')]))

			const stats = {
				accounts: (data.accounts || []).length,
				bills: (data.bills || []).length,
				budgetCats: (data.budgetCats || []).length,
				ledgers: (data.ledgers || []).length,
				user: data.user ? 1 : 0
			}

			console.log(`[${new Date().toLocaleString()}] ✓ 备份成功`)
			console.log(`   账户: ${stats.accounts} 个, 账单: ${stats.bills} 条, 预算: ${stats.budgetCats} 项, 账本: ${stats.ledgers} 个, 用户: ${stats.user ? '1' : '0'}`)
			console.log(`   文件: ${OUTPUT_FILE}`)

			sendJSON(res, 200, {
				success: true,
				message: '备份成功',
				file: OUTPUT_FILE,
				stats
			})
		} catch (err) {
			console.error(`[${new Date().toLocaleString()}] ✗ 备份失败: ${err.message}`)
			sendJSON(res, 400, {
				success: false,
				message: err.message
			})
		}
		return
	}

	// 404
	sendJSON(res, 404, { success: false, message: '接口不存在，请使用 POST /backup' })
})

server.listen(PORT, () => {
	const ip = getLocalIP()
	console.log('')
	console.log('╔══════════════════════════════════════════════════╗')
	console.log('║       宇宙记账 · 数据备份接收服务器              ║')
	console.log('╠══════════════════════════════════════════════════╣')
	console.log(`║  监听地址: http://0.0.0.0:${PORT}                    `)
	console.log(`║  局域网IP: http://${ip}:${PORT}                       `)
	console.log('║                                                  ║')
	console.log('║  在手机 App 中输入以上 IP 和端口上传数据         ║')
	console.log(`║  数据保存到: ${OUTPUT_FILE}  `)
	console.log('║                                                  ║')
	console.log('║  Ctrl+C 停止服务器                                ║')
	console.log('╚══════════════════════════════════════════════════╝')
	console.log('')
})