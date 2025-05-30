import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import charLogTable from 'utils/charLogTable';

/**
 * Creates a help description with an attribute table;
 * @param {string} str Help description.
 * @param {Array.<object>} defList Attribute object array.
 * @param {LocaleString} keyTitle Title of the parameter key column.
 * @returns {string} Help description.
 */
export default function helpDefList(str, defList, keyTitle) {
	return str + charLogTable(
		[
			{
				html: `<code class="param">${escapeHtml(l10n.t(keyTitle))}</code>`,
			},
			{
				text: l10n.t('helpDefList.description', "Description"),
			},
		],
		defList.map(def => ([
			{ html: `<code>${escapeHtml(def.key)}</code>` },
			{ html: (def.desc ? l10n.t(def.desc) : '') },
		])),
	);
}
