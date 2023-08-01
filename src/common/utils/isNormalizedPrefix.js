/**
 * Selects a part (from -> to) of a string
 * @param {string} prefix String prefix. Null means match.
 * @param {string} token Full token string to test against.
 * @param {string} [rawToken] Optional raw token to return on match.
 * @returns {string?} Token string on prefix match, otherwise null.
 */
export default function isNormalizedPrefix(prefix, token, rawToken) {
	if (prefix && token.substring(0, prefix.length) !== prefix) {
		if (
			typeof token.normalize != 'function' ||
			token.normalize('NFKD')
				.replace(/\p{M}/gu, '')
				.normalize('NFKC')
				.substring(0, prefix.length) !== prefix
		) {
			return null;
		}
	}
	return rawToken || token;
}
