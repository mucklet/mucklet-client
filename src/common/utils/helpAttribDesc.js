import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const txtAttribute = l10n.t('helpAttribDesc.attribute', `<code class="param">Attribute</code>`);
const txtValue = l10n.t('helpAttribDesc.value', `<code class="param">Value</code>`);

/**
 * Creates a help description with an attribute table;
 * @param {string} str Help description.
 * @param {Array.<object>} attrs Attribute object array.
 * @param {object} [opt] Optional parameters
 * @param {LocaleString} [opt.attribute] Attribute column title.
 * @param {LocaleString} [opt.value] Value column title.
 * @param {string} [opt.attributeClass] Attribute column class.
 * @param {string} [opt.valueClass] Attribute column class.
 * @returns {string} Help description.
 */
export default function helpAttribDesc(str, attrs, opt) {
	opt = opt || {};
	let attrTxt = opt.hasOwnProperty('attribute') ? opt.attribute && l10n.t(opt.attribute) : txtAttribute;
	let valueTxt = opt.hasOwnProperty('value') ? opt.value && l10n.t(opt.value) : txtValue;
	let txt = str + '<table class="tbl-small">' +
		'<thead><tr>' +
			'<th>' + attrTxt + '</th>' +
			'<th>' + valueTxt + '</th>' +
		'</tr></thead>' +
		'<tbody>';
	let attribClass = opt.attributeClass ? ' class="' + escapeHtml(opt.attributeClass) + '"' : '';
	let valueClass = opt.valueClass ? ' class="' + escapeHtml(opt.valueClass) + '"' : '';
	for (let attr of attrs) {
		txt += '<tr><td><code' + attribClass + '>' + escapeHtml(attr.key) + '</code></td><td' + valueClass + '>' + (attr.desc ? l10n.t(attr.desc) : '') + '</td></tr>';
	}
	return txt + '</tbody></table>';
}
