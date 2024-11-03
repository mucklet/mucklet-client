function fix(n) {
	return parseFloat(n.toFixed(1));
}

/**
 * Formats a number of bytes into a more easily readable format.
 * @param {Number} bytes Bytes.
 * @returns {string} Formatted string.
 */
export default function formatByteSize(bytes) {
	return bytes < 1024
		? bytes + " bytes"
		: bytes < (1024 * 1024)
			? fix(bytes / 1024) + " KiB"
			: fix(bytes / (1024 * 1024)) + " MiB";
}
