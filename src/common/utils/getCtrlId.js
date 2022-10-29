/**
 * Creates a ID string of a controlled character including any existing puppeteer.
 * @param {Model} ctrl Controlled character.
 * @returns {string} ID string of the controlled character.
 */
export default function getCtrlId(ctrl) {
	let p = ctrl.puppeteer;
	return p ? ctrl.id + '_' + p.id : ctrl.id;
}
