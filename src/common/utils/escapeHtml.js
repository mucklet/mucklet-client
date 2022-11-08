const escapeMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&#34;',
	"'": '&#39;',
};

const repl = function(c) {
	return escapeMap[c];
};

/**
 * Escapes HTML special char on a string, eg. turning <i> into &lt;i&gt;
 * @param {string} str String to escape.
 * @returns {string} String with special chars escaped.
 */
export default function escapeHtml(str) {
	if (!str) return '';
	return str.replace(/[&<>'"]/g, repl);
}
