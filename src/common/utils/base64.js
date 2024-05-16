/**
 * Encodes an ArrayBuffer into a base64 encoded string.
 * @param {ArrayBuffer} buffer Array buffer.
 * @param {boolean} urlSafe Optional flag to use URL safe encoding.
 * @param {boolean} raw Optional flag to use use the raw encoding without trailing padding (=).
 * @returns {string} Base64 encoded string.
 */
export function fromArrayBuffer(buffer, urlSafe, raw) {
	let str = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	if (raw) {
		str = str.replace(/=+$/, '');
	}
	return urlSafe
		? str.replace(/\//g, '_').replace(/\+/g, '-')
		: str;
}
