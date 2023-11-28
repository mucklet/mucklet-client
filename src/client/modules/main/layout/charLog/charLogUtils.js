import formatText from 'utils/formatText';

/**
 * Appends character name node to element.
 * @param {Elem} el HTML element
 * @param {object} char Character
 */
export function appendCharName(el, char) {
	let span = document.createElement('span');
	span.className = 'charlog--char';
	span.textContent = char && char.name;
	el.appendChild(span);
}

/**
 * Appends a superscripted tagnode to element.
 * @param {Elem} el HTML element
 * @param {string} tag Tag text
 */
export function appendTag(el, tag) {
	let span = document.createElement('span');
	span.className = 'charlog--tag';
	span.textContent = tag;
	el.appendChild(span);
}

/**
 * Appends a formatted text to element.
 * @param {Elem} el HTML element
 * @param {object} msg Formatted text
 * @param {object} [mod] Modifiers.
 * @param {Array.<object>} [mod.triggers] Trigger list text
 */
export function appendFormatText(el, msg, mod) {
	let span = document.createElement('span');
	span.className = 'common--formattext';
	span.innerHTML = formatText(msg, mod || null);
	el.appendChild(span);
}

/**
 * Appends a space unless the message starts with apostrophy (') or comma (,).
 * @param {Elem} el HTML element
 * @param {string} msg Pose message.
 */
export function appendPoseSpacing(el, msg) {
	let c = msg[0];
	if (c && c != "'" && c != ',') {
		el.appendChild(document.createTextNode(' '));
	}
}

/**
 * Adds the render and unrender methods to an element, to make it implement the
 * Component interface.Formats a duration in milliseconds to the format 1d 2h 3m
 * 4s 5ms.
 * @param {Elem} el HTML element
 * @param {boolean} isComm If the component should be marked as communication.
 * @returns {Elem} The same element.
 */
export function toComponent(el, isComm) {
	el.render = e => e.appendChild(el);
	el.unrender = () => el.parentElement.removeChild(el);
	if (isComm) {
		el.canHighlight = true;
	}
	return el;
}
