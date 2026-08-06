/**
 * Normalizes a hex color string.
 * @param {string} color Hex color string.
 * @param {boolean} [isRgba] Whether to require an eight-digit RGBA color.
 * @returns {string|null} Normalized string, or null if invalid.
 */
export default function normalizeHexColor(color, isRgba = false) {
	color = String(color || '').trim();
	let match = color.match(isRgba
		? /^#?([0-9a-f]{8})$/i
		: /^#?([0-9a-f]{6})$/i,
	);
	if (!match) {
		return null;
	}
	return '#' + match[1].toLowerCase();
}
