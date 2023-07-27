/**
 * Extracts the main target character for an event, but either selecting the one
 * matching the character, or the first mentioned target.
 * @param {string} charId ID of character receiving the event
 * @param {object} ev Event with targets
 * @returns {object} Main target character.
 */
export default function extractEventTarget(charId, ev) {
	let c = ev.char;
	let ts = ev.targets;
	if (ts && c?.id != charId) {
		for (let t of ts) {
			if (t.id == charId) {
				return t;
			}
		}
	}
	return ev.target || (ts && ts[0]);
}
