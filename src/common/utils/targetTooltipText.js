import l10n from 'modapp-l10n';

const txtTo = l10n.l('targetTooltipText.to', "To ");

/**
 * Generates a tooltip text consisting of all targets for an event.
 * @param {object} ev Event with targets
 * @returns {string} Tooltip text.
 */
export default function targetTooltipText(ev) {
	let ts = ev.target ? [ ev.target ] : [];
	if (ev.targets) {
		ts = ts.concat(ev.targets);
	}

	return ts.length
		? l10n.t(txtTo) + ts.map(t => t.name + " " + t.surname).join(", ")
		: null;
}
