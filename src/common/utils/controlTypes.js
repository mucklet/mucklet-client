import l10n from 'modapp-l10n';

const types = {
	manual: { key: 'manual', text: l10n.l('controlTypes.manual', "Manual") },
	node: { key: 'node', text: l10n.l('controlTypes.node', "Node") },
	unknown: { key: '', text: l10n.l('controlTypes.unknown', "Unknown") },
};

const controlTypes = [
	types.manual,
	types.node,
];

export default controlTypes;

/**
 * Returns an object with localization for visualizing a project's type. If the
 * type is unknown, the unknown type object is returned.
 * @param {{ type?: "manual" | "node" }} project Project object with type (such as a realm model).
 * @param {string} [prop] Property name. Defaults to "type".
 * @returns {{ text: LocaleString }} Type object.
 */
export function getControlType(project, prop = "type") {
	return types[project?.[prop]] || types.unknown;
}
