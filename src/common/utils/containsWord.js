let regex = {};

/**
 * Checks if a haystack string contains a needle word surrounded by word boundaries.
 * @param {string} text Haystack text string.
 * @param {string} word Needle word.
 * @returns {boolean} True if the text contains the word.
 */
export default function containsWord(text, word) {
	let re = regex[word];
	if (!re) {
		re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'iu');
		regex[word] = re;
	}

	return text.match(re);
}
