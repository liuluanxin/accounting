/** 构建品牌 SVG 字符串（viewBox 100×100，满铺圆形） */
export function brandCircle(bg, inner, clip = true) {
	const clipDef = clip
		? '<defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#c)">'
		: ''
	const clipEnd = clip ? '</g>' : ''
	return (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		clipDef +
		`<circle cx="50" cy="50" r="50" fill="${bg}"/>` +
		inner +
		clipEnd +
		'</svg>'
	)
}

export function brandRoundRect(bg, inner) {
	return (
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
		`<rect width="100" height="100" rx="18" fill="${bg}"/>` +
		inner +
		'</svg>'
	)
}
