/**
 * Converts a hex color string to RGB values.
 * @param {string} color Hex color.
 * @returns {{ r: number, g: number, b: number } | null} RGB values, or null.
 */
export function toRgb(color) {
	var hex = typeof color == 'string' ? color.trim() : '';
	var match = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (!match) {
		return null;
	}
	hex = match[1];
	if (hex.length == 3) {
		hex = hex.replace(/./g, function(c) { return c + c; });
	}
	return {
		r: parseInt(hex.slice(0, 2), 16),
		g: parseInt(hex.slice(2, 4), 16),
		b: parseInt(hex.slice(4, 6), 16),
	};
}

/**
 * Converts a number to a two-character hex color part.
 * @param {number} n Color part value.
 * @returns {string} Hex color part.
 */
function toHexPart(n) {
	return ('0' + Math.round(Math.max(0, Math.min(255, n))).toString(16)).slice(-2);
}

/**
 * Converts RGB values to a hex color string.
 * @param {{ r: number, g: number, b: number }} rgb RGB values.
 * @returns {string} Hex color.
 */
export function toHex(rgb) {
	return '#' + toHexPart(rgb.r) + toHexPart(rgb.g) + toHexPart(rgb.b);
}

/**
 * Converts RGB values to HSL values.
 * @param {{ r: number, g: number, b: number }} rgb RGB values.
 * @returns {{ h: number, s: number, l: number }} HSL values.
 */
export function rgbToHsl(rgb) {
	var r = rgb.r / 255;
	var g = rgb.g / 255;
	var b = rgb.b / 255;
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h = 0;
	var s = 0;
	var l = (max + min) / 2;
	var d = max - min;

	if (d) {
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		h = max == r
			? (g - b) / d + (g < b ? 6 : 0)
			: max == g
				? (b - r) / d + 2
				: (r - g) / d + 4;
		h /= 6;
	}
	return { h: h, s: s, l: l };
}

/**
 * Converts a hue offset to an RGB channel value.
 * @param {number} p Lower bound.
 * @param {number} q Upper bound.
 * @param {number} t Hue offset.
 * @returns {number} RGB channel value.
 */
function hueToRgb(p, q, t) {
	if (t < 0) { t += 1; }
	if (t > 1) { t -= 1; }
	if (t < 1 / 6) { return p + (q - p) * 6 * t; }
	if (t < 1 / 2) { return q; }
	if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
	return p;
}

/**
 * Converts HSL values to RGB values.
 * @param {{ h: number, s: number, l: number }} hsl HSL values.
 * @returns {{ r: number, g: number, b: number }} RGB values.
 */
export function hslToRgb(hsl) {
	if (!hsl.s) {
		return { r: hsl.l * 255, g: hsl.l * 255, b: hsl.l * 255 };
	}
	var q = hsl.l < 0.5
		? hsl.l * (1 + hsl.s)
		: hsl.l + hsl.s - hsl.l * hsl.s;
	var p = 2 * hsl.l - q;
	return {
		r: hueToRgb(p, q, hsl.h + 1 / 3) * 255,
		g: hueToRgb(p, q, hsl.h) * 255,
		b: hueToRgb(p, q, hsl.h - 1 / 3) * 255,
	};
}

/**
 * Adjusts lightness and saturation on a hex color.
 * @param {string} color Hex color.
 * @param {number} lightness Lightness percentage delta.
 * @param {number} [saturation] Saturation percentage delta.
 * @returns {string | null} Adjusted hex color, or null.
 */
export function adjust(color, lightness, saturation) {
	var rgb = toRgb(color);
	if (!rgb) {
		return null;
	}
	var hsl = rgbToHsl(rgb);
	hsl.l = Math.max(0, Math.min(1, hsl.l + lightness / 100));
	hsl.s = Math.max(0, Math.min(1, hsl.s + (saturation || 0) / 100));
	return toHex(hslToRgb(hsl));
}

/**
 * Converts a hex color to an rgba color string.
 * @param {string} color Hex color.
 * @param {number} opacity Alpha opacity.
 * @returns {string | null} RGBA color, or null.
 */
export function alpha(color, opacity) {
	var rgb = toRgb(color);
	return rgb
		? 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + opacity + ')'
		: null;
}

/**
 * Mixes two hex colors by weight.
 * @param {string} color1 First hex color.
 * @param {string} color2 Second hex color.
 * @param {number} weight Percentage weight for the first color.
 * @returns {string | null} Mixed hex color, or null.
 */
export function mix(color1, color2, weight) {
	var c1 = toRgb(color1);
	var c2 = toRgb(color2);
	var w = weight / 100;
	if (!c1 || !c2) {
		return null;
	}
	return toHex({
		r: c1.r * w + c2.r * (1 - w),
		g: c1.g * w + c2.g * (1 - w),
		b: c1.b * w + c2.b * (1 - w),
	});
}
