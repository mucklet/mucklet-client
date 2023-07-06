import l10n from 'modapp-l10n';

const txtRoles = {
	user: l10n.l('roles.user', "User"),
	helper: l10n.l('roles.helper', "Helper"),
	moderator: l10n.l('roles.moderator', "Moderator"),
	builder: l10n.l('roles.builder', "Builder"),
	admin: l10n.l('roles.admin', "Administrator"),
};

/**
 * Returns the locale string of a role
 * @param {string} role Role.
 * @returns {LocaleString} Role as locale string.
 */
export function toLocaleString(role) {
	return txtRoles[role] || role;
};

/**
 * Check if the user has all of the provided roles.
 * @param {Model} user User model.
 * @param {string|Array.<string>} roles Role(s).
 * @returns {boolean} True if the player has all roles, otherwise false.
 */
export function hasRoles(user, roles) {
	if (!roles) {
		return true;
	}
	roles = Array.isArray(roles) ? roles : [].slice.call(arguments, 1);
	let rs = user?.roles || [];
	for (let r of roles) {
		if (rs.indexOf(r) < 0) {
			return false;
		}
	}
	return true;
};

/**
 * Check if the user has any of the provided roles.
 * @param {Model} user User model.
 * @param {string|Array.<string>} roles Role(s).
 * @returns {boolean} True if the player has any of the roles, otherwise false.
 */
export function hasAnyRole(user, roles) {
	if (!roles) {
		return false;
	}
	roles = Array.isArray(roles) ? roles : [].slice.call(arguments, 1);
	let rs = user?.roles || [];
	for (let r of roles) {
		if (rs.indexOf(r) >= 0) {
			return true;
		}
	}
	return false;
}
