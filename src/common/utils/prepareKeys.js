/**
 * Prepares a comma-separated string of keys, and returns an array of
 * trimmed and lowerCase formatted keys.
 * @param {string} strKeys Comma-separated key strings.
 * @returns {Array.<string>} Array of key strings.
 */
export default function(strKeys) {
	return strKeys.split(",").map(v => v.trim().toLowerCase()).filter(v => !!v);
}
