import l10n from 'modapp-l10n';

const txtIdRoles = {
	overseer: l10n.l('idroles.overseer', "Overseer"),
	pioneer: l10n.l('idroles.pioneer', "Pioneer"),
	supporter: l10n.l('idroles.supporter', "Supporter"),
};

/**
 * Returns the locale string of an ID role
 * @param {string} idRole ID role.
 * @returns {LocaleString} ID role as locale string.
 */
export function toLocaleString(idRole) {
	return txtIdRoles[idRole] || idRole;
};
