/**
 * Turns a number into a string. If the number is > 9, it will be "9+".
 * @param {number} count Count number.
 * @returns {string} Count string.
 */
export default function counterString(count) {
	return count ? (count > 9 ? '9+' : count) : '0';
}
