import l10n from 'modapp-l10n';

const txtBanReasons = {
	abuse: l10n.l('banReasons.abusiveOrDisrespectful', "Abusive or disrespectful"),
	evasion: l10n.l('banReasons.banSuspendEvasion', "Ban/suspend evasion"),
	illegal: l10n.l('banReasons.illegalActivity', "Illegal activity"),
	spam: l10n.l('banReasons.illegalActivity', "Advertising or spamming"),
	underaged: l10n.l('banReasons.playerIsUnderaged', "Player is underaged"),
	other: l10n.l('banReasons.other', "Other reason"),
};
export const reasonNotSet = l10n.l('banReasons.reasonNotSet', "Reason not set");

export default txtBanReasons;


/**
 * Returns the locale string of a ban reason
 * @param {string} reason Ban reason.
 * @returns {LocaleString} Ban reason as locale string.
 */
export function toLocaleString(reason) {
	return reason ? txtBanReasons[reason] || reason : reasonNotSet;
};
