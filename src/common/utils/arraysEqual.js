
/**
 * Checks if two arrays are equal.
 * @param {Array} a Array to compare.
 * @param {Array} b Array to compare.
 * @returns {boolean} True if arrays are equal, otherwise false.
 */
export default function arraysEqual(a, b) {
	if (a === b) return true;
	if (!a || !b || a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
