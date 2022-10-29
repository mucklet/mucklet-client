import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

/**
 * Creates a help description with an attribute table;
 * @param {string} str Help description.
 * @param {Array.<object>} defList Attribute object array.
 * @param {LocaleString} keyTitle Title of the parameter key column.
 * @returns {string} Help description.
 */
export default function helpDefList(str, defList, keyTitle) {
	let txt = str + '<table class="tbl-small">' +
		'<thead><tr><th><code class="param">' +
		escapeHtml(l10n.t(keyTitle)) +
		'</code></th><th>' +
		escapeHtml(l10n.t('helpDefList.description', "Description")) +
		'</th></tr></thead>' +
		'<tbody>';
	for (let def of defList) {
		txt += '<tr><td><code>' + escapeHtml(def.key) + '</code></td><td>' + (def.desc ? l10n.t(def.desc) : '') + '</td></tr>';
	}
	return txt + '</tbody></table>';
}
