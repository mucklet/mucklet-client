/**
 * Exports data as a file.
 * @param {string} filename Filename.
 * @param {string|Blob} data File content or a Blob object.
 * @param {string} mime Mime type for string data. Defaults to 'text/plain'
 */
export default function exportFile(filename, data, mime) {
	let blob = data instanceof Blob ? data : new Blob([ data ], { type: mime || 'text/plain' });
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		let elem = window.document.createElement('a');
		let url = window.URL.createObjectURL(blob);
		elem.href = url;
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
		window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
	}
}
