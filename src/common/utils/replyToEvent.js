import fullname from 'utils/fullname';

/**
 * Helper functions to handle replying to events.
 */

/**
 * Get a list of all characters in the event, putting the acting character
 * first, and excluding characters with id charId unless it is the only
 * character.
 * @param {string} charId Character to exclude (usually the controlled character).
 * @param {object} ev Event object.
 * @returns
 */
export function getTargets(charId, ev) {
	let ts = ev.target ? [ ev.target ] : [];
	if (ev.targets) {
		ts = ts.concat(ev.targets);
	}
	ts = ts.filter(t => t.id != ev.char.id);
	ts.unshift(ev.char);
	ts = ts.filter(t => t.id != charId);
	if (!ts.length) {
		ts = [ ev.char ];
	}
	return ts;
}

/**
 * Checks if an event targets a specific character-
 * @param {string} charId Character ID.
 * @param {object} ev Event object.
 * @returns {boolean}
 */
export function containsTarget(charId, ev) {
	return ev.target?.id == charId || ev.targets?.find(t => t.id == charId) || false;
}

/**
 * Get a list of all characters in the event as a comma-separated string. See
 * getTargets for more details.
 * @param {string} charId Controlled character ID.
 * @param {object} ev Event object.
 * @returns
 */
function getTargetList(charId, ev) {
	return getTargets(charId, ev).map(t => fullname(t)).join(", ");
};

/**
 * Get the full name of the acting character of an event, unless it is charId.
 * @param {string} charId Controlled character ID.
 * @param {object} ev Event object.
 * @returns
 */
function getTarget(charId, ev) {
	let t = ev.char;
	if (t.id == charId) {
		t = ev.target || ev.targets[0] || t;
	}
	return fullname(t);
}

function addOoc(ev) {
	return ev.ooc ? '>' : '';
}

export const replyCmds = {
	address: (charId, ev) => 'address ' + getTarget(charId, ev) + ' =' + addOoc(ev),
	whisper: (charId, ev) => 'whisper ' + getTarget(charId, ev) + ' =' + addOoc(ev),
	message: (charId, ev) => 'message ' + getTarget(charId, ev) + ' =' + addOoc(ev),
};

export const replyAllCmds = {
	address: (charId, ev) => 'address ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
	whisper: (charId, ev) => 'whisper ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
	message: (charId, ev) => 'message ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
};

/**
 * Counts all targets in an event.
 * @param {object} ev Event object.
 * @returns {number} Target count.
 */
export function countTargets(ev) {
	return (ev.target ? 1 : 0) + (ev.targets?.length || 0);
}
