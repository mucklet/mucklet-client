import escapeHtml from 'utils/escapeHtml';

/**
 * Creates a help description with an attribute table;
 * @param {Array<{ text?:string, html?:string, thClassName?:string, tdClassName }>} columns Columns
 * @param {Array<Array<{ text?:string, html?:string }>>} rows Table rows
 * @param {object} [opt] Optional parameters
 * @param {object} [opt.className] Table class name.
 * @returns {string} Table html
 */
export default function charLogTable(columns, rows, opt) {
	let classes = new Array(columns.length);
	let cols = columns.map((col, i) => {
		classes[i] = col.tdClassName ? ' class="' + escapeHtml(col.tdClassName) : '';
		return `<th${col.thClassName ? ' class="' + escapeHtml(col.thClassName) + '"' : ''}>${col.text ? escapeHtml(col.text) : col.html || ''}</th>`;
	});
	return `<table class="tbl-small${opt?.className ? ' ' + opt.className : ''}">` +
		'<thead><tr>' +
			cols.join('') +
		'</tr></thead>' +
		'<tbody>' +
			rows.map(row => '<tr>' + columns.map((col, i) => {
				let cell = row[i];
				return `<td${classes[i]}>${cell?.text ? escapeHtml(cell?.text) : cell?.html || ''}</td>`;
			}).join('') + '</tr>').join('') +
		'</tbody></table>';
}
