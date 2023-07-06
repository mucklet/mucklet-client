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

/**
 * Check if the user has all of the provided ID roles.
 * @param {Model} user User model.
 * @param {string|Array.<string>} idRoles ID role(s).
 * @returns {boolean} True if the user has all ID roles, otherwise false.
 */
export function hasIdRoles(user, idRoles) {
	if (!idRoles) {
		return true;
	}
	idRoles = Array.isArray(idRoles) ? idRoles : [].slice.call(arguments, 1);
	let rs = user?.idRoles || [];
	for (let r of idRoles) {
		if (rs.indexOf(r) < 0) {
			return false;
		}
	}
	return true;
};

/**
 * Check if the user has any of the provided ID roles.
 * @param {Model} user User model.
 * @param {string|Array.<string>} idRoles ID role(s).
 * @returns {boolean} True if the user has any of the roles, otherwise false.
 */
export function hasAnyIdRole(user, idRoles) {
	if (!idRoles) {
		return false;
	}
	idRoles = Array.isArray(idRoles) ? idRoles : [].slice.call(arguments, 1);
	let rs = user?.idRoles || [];
	for (let r of idRoles) {
		if (rs.indexOf(r) >= 0) {
			return true;
		}
	}
	return false;
};
