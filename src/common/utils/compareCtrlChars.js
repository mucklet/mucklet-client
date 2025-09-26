/**
 * Compares two controlled chars by ctrlSince.
 * @param {{ ctrlSince: number }} a Controlled char
 * @param {{ ctrlSince: number }} b Controlled char
 * @returns {number}
 */
export default function compareCtrlChars(a, b) {
	return a.ctrlSince - b.ctrlSince;
}
