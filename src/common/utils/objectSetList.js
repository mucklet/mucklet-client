import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const typesTxt = {
	'exits': l10n.l('objectSetList.exit', "Exit"),
	'rooms': l10n.l('objectSetList.room', "Room"),
	'areas': l10n.l('objectSetList.area', "Area"),
};

/**
 * Creates a table listing objects from an object set.
 * @param {{ exits?: object[], rooms?: object[], areas?: object[]}} set Object set.
 * @returns {string} Html table.
 */
export default function objectSetList(set) {
	let rows = [];
	for (let type in typesTxt) {
		let list = set[type];
		if (list) {
			for (let item of list) {
				rows.push('<tr><td><code>#' + escapeHtml(item.id) + '</code></td><td>' + escapeHtml(l10n.t(typesTxt[type])) + '</td><td>' + escapeHtml(item.name) + '</td></tr>');
			}
		}
	}
	return '<table class="tbl-small tbl-nomargin">' +
		'<thead><tr><th class="charlog--strong">' +
		escapeHtml(l10n.t('objectSetList.id', "ID")) +
		'</th><th class="charlog--strong">' +
		escapeHtml(l10n.t('objectSetList.type', "Type")) +
		'</th><th class="charlog--strong">' +
		escapeHtml(l10n.t('objectSetList.name', "Name")) +
		'</th></tr></thead>' +
		'<tbody>' +
		rows.join('') +
		'</tbody></table>';
}
