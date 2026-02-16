import l10n from 'modapp-l10n';

const types = {
	genre: { key: 'genre', text: l10n.l('tagTypes.genre', "Genre") },
	theme: { key: 'theme', text: l10n.l('tagTypes.theme', "Theme") },
	warn: { key: 'warn', text: l10n.l('tagTypes.warn', "Warning") },
};

const tagTypes = [
	types.genre,
	types.theme,
	types.warn,
];

export default tagTypes;

/**
 * Returns an object with localization for visualizing a realm tag's type. If the
 * type is unknown, the unknown type object is returned.
 * @param {{ type?: "genre" | "theme" | "warn" }} tag Tag object with type (such as a realm tag).
 * @param {string} [prop] Property name. Defaults to "type".
 * @returns {{ text: LocaleString }} Type object.
 */
export function getControlType(tag, prop = "type") {
	return types[tag?.[prop]] || types.unknown;
}
