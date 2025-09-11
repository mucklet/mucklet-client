import l10n from 'modapp-l10n';

const types = {
	manual: { key: 'manual', text: l10n.l('apiTypes.manual', "Manual") },
	node: { key: 'node', text: l10n.l('apiTypes.node', "Node") },
	unknown: { key: '', text: l10n.l('apiTypes.unknown', "Unknown") },
};

const apiTypes = [
	types.manual,
	types.node,
];

export default apiTypes;

/**
 * Returns an object with localization for visualizing a realm's type. If the
 * type is unknown, the unknown type object is returned.
 * @param {{ apiType?: "manual" | "node" }} realm Realm object with API type.
 * @param {string} [prop] Property name. Defaults to "apiType".
 * @returns {{ text: LocaleString }} Type object.
 */
export function getApiType(realm, prop = "apiType") {
	return types[realm?.[prop]] || types.unknown;
}
