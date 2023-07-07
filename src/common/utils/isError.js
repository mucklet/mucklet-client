/**
 * Tests if an object is a RES error with a code and message property, and
 * optionally that the error has a specific code..
 * @param {*} err Object to test.
 * @param {string} [code] Optional code that must match if provided.
 * @returns {boolean} True if it is an error, otherwise false.
 */
export default function isError(err, code) {
	if (typeof err != 'object' || err === null || !(err.code && err.message)) {
		return false;
	}
	return code ? err.code === code : true;
}
