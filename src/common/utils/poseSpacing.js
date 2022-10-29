

/**
 * Returns a space to put between a character name and a pose message, unless the message starts with apostrophy (') or comma (,).
 * @param {string} msg Post message.
 * @returns {string} Spacing string.
 */
export default function(msg) {
	let c = msg[0];
	return !c || c == "'" || c == ',' ? '' : ' ';
}
