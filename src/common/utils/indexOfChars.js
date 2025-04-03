/**
* Finds the first occurrence within str of any character in chars, and returns
* its index position, or -1 if none of the chars exists in str.
* @param {string} str String to search.
* @param {string} chars Characters to find in str.
* @returns {number} Index of first matches char, or -1 if not found.
*/
export default function indexOfChars(str, chars) {
	if (chars) {
		for (let i = 0; i < str.length; i++) {
			if (chars.includes(str[i])) {
				return i;
			}
		}
	}
	return -1;
}
