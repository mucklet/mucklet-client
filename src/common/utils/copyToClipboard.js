/**
 * Copies a text to clipboard.
 * @param {string} str Text to copy to clipboard.
 * @returns {Promise} Promise of copying to clipboard.
 */
export default function(str) {
	// Check if Clipboard API is available. If not, use legacy method.
	if (!navigator.clipboard) {
		return new Promise((resolve, reject) => {
			try {
				let el = document.createElement('textarea');
				el.value = str;
				el.setAttribute('readonly', '');
				el.style = { position: 'absolute', left: '-9999px' };
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				document.body.removeChild(el);
				resolve();
			} catch (ex) {
				reject(ex);
			}
		});
	}

	return navigator.clipboard.writeText(str);
}
