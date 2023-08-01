import l10n from 'modapp-l10n';

const txtTo = l10n.l('charEvent.targetTooltipText.to', "To ");

/**
 * Extracts the main target character for an event, by either selecting the one
 * matching the character, or the first mentioned target.
 * @param {string} charId ID of character receiving the event
 * @param {object} ev Event with targets
 * @returns {object} Main target character.
 */
export function extractTarget(charId, ev) {
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

/**
 * Returns true if the character is targeted by the event.
 * @param {string} charId ID of character receiving the event
 * @param {object} ev Event with targets
 * @returns {boolean} True if targeted.
 */
export function isTargeted(charId, ev) {
	return !!(ev.target?.id == charId || ev.targets?.find(t => t.id == charId));
}

/**
 * Generates a tooltip text consisting of all targets for an event.
 * @param {object} ev Event with targets
 * @returns {string} Tooltip text.
 */
export function targetTooltipText(ev) {
	let ts = ev.target ? [ ev.target ] : [];
	if (ev.targets) {
		ts = ts.concat(ev.targets);
	}

	return ts.length
		? l10n.t(txtTo) + ts.map(t => t.name + " " + t.surname).join(", ")
		: null;
}
