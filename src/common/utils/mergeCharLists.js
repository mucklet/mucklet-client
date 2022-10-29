/**
 * Merges an array of iterable list of character models into a single list. The
 * resulting list of characters are ordered in the same order they appear, but
 * duplicates are removed.
 * @param {Array.<?Collection>} lists Array of collections of characters.
 * @returns {Array.<Model>} An array of character models.
 */
export default function mergeCharLists(lists) {
	let map = {};
	let chars = [];
	for (let list of lists) {
		if (!list) continue;
		for (let char of list) {
			if (map[char.id]) continue;
			map[char.id] = true;
			chars.push(char);
		}
	}
	return chars;
}
