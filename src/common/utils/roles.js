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
