/**
 * Encodes an ArrayBuffer into a base64 encoded string.
 * @param {ArrayBuffer} buffer Array buffer.
 * @param {boolean} urlSafe Optional flag to use URL safe encoding.
 * @returns {string} Base64 encoded string.
 */
export function fromArrayBuffer(buffer, urlSafe) {
	let str = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	return urlSafe
		? str.replace(/\//g, '_').replace(/\+/g, '-')
		: str;
}
