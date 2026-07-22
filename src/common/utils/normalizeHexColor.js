/**
 * Normalizes a hex color string.
 * @param {string} color Hex color string.
 * @returns {string} Normalized string.
 */
export default function normalizeHexColor(color) {
	color = String(color || '').trim();
	let match = color.match(/^#?([0-9a-f]{6})$/i);
	if (!match) {
		return null;
	}
	return '#' + match[1].toLowerCase();
}
