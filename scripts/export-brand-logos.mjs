/**
 * 导出 static/brands/ 下全部品牌 Logo 文件
 * 用法：node scripts/export-brand-logos.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import * as si from 'simple-icons'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const brandsDir = join(root, 'static', 'brands')
const scriptsDir = __dirname

const PNG_KEYS = new Set(['wechat', 'alipay', 'qq', 'douyin', 'apple-pay'])

const SIMPLE_ICON_ENHANCE = {
	meituan: ['meituan', '#FFC300']
}

function wrapSimpleIcon(icon, bg) {
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
		`<circle cx="50" cy="50" r="50" fill="${bg}"/>` +
		`<g transform="translate(50 50) scale(2.65) translate(-12 -12)">` +
		`<path d="${icon.path}" fill="#FFFFFF"/>` +
		`</g></svg>`
	)
}

function formatManifest(manifest) {
	const keys = Object.keys(manifest).sort()
	const lines = keys.map(k => {
		const qk = /^[a-z][a-z0-9]*$/i.test(k) && !k.includes('-') ? k : `'${k}'`
		return `\t${qk}: '${manifest[k]}'`
	})
	return `{\n${lines.join(',\n')}\n}`
}

function bundleModules() {
	execSync(
		`npx --yes esbuild common/brand-icons.js --bundle --format=esm --platform=node --outfile=scripts/.tmp-payment.mjs`,
		{ cwd: root, stdio: 'inherit' }
	)
	execSync(
		`npx --yes esbuild common/account-icons-bank.js --bundle --format=esm --platform=node --outfile=scripts/.tmp-bank.mjs`,
		{ cwd: root, stdio: 'inherit' }
	)
}

async function main() {
	bundleModules()
	mkdirSync(brandsDir, { recursive: true })

	const { PAYMENT_BRAND_SVGS } = await import(`./.tmp-payment.mjs?${Date.now()}`)
	const { BANK_BRAND_SVGS } = await import(`./.tmp-bank.mjs?${Date.now()}`)

	let written = 0
	const manifest = {}

	const writeSvg = (key, svg) => {
		if (PNG_KEYS.has(key)) {
			manifest[key] = `/static/brands/${key}.png`
			return
		}
		let content = svg
		if (SIMPLE_ICON_ENHANCE[key]) {
			const [slug, bg] = SIMPLE_ICON_ENHANCE[key]
			const icon = Object.values(si).find(i => i.slug === slug)
			if (icon) content = wrapSimpleIcon(icon, bg)
		}
		writeFileSync(join(brandsDir, `${key}.svg`), content, 'utf8')
		manifest[key] = `/static/brands/${key}.svg`
		written++
	}

	for (const [key, svg] of Object.entries(PAYMENT_BRAND_SVGS)) {
		writeSvg(key, svg)
	}
	for (const [key, svg] of Object.entries(BANK_BRAND_SVGS)) {
		writeSvg(key, svg)
	}

	const assetsPath = join(root, 'common', 'brand-assets.js')
	let assetsSrc = readFileSync(assetsPath, 'utf8')
	assetsSrc = assetsSrc.replace(
		/export const BRAND_ASSETS = \{[\s\S]*?\n\}/,
		`export const BRAND_ASSETS = ${formatManifest(manifest)}`
	)
	writeFileSync(assetsPath, assetsSrc, 'utf8')

	console.log(`Done: ${written} SVG + ${PNG_KEYS.size} PNG = ${Object.keys(manifest).length} brands`)
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
