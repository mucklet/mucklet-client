/**
 * Selects a part (from -> to) of a string
 * @param {string} str String.
 * @param {?RegExp} fromRegex Single character regex for "from" matching. Null means no match.
 * @param {?RegExp} toRegex Single character regex for "to" matching. Null means no match.
 * @param {Number} from Initial "from" position.
 * @param {Number} to Initial "to" position.
 * @returns {object} Returns an object { from, to } with number values.
 */
export default function(str, fromRegex, toRegex, from, to) {
	if (fromRegex) {
		while (from && fromRegex.test(str.charAt(from - 1))) {
			--from;
		}
	}
	if (toRegex) {
		while (to < str.length && toRegex.test(str.charAt(to))) {
			++to;
		}
	}
	return { from, to };
}
