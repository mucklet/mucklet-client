import sha256, { hmacsha256, publicPepper } from './sha256';

/**
 * Creates a parameter object for the changePassword call method.
 * @param {string} oldPass Old password.
 * @param {string} newPass New password.
 * @returns {object} Change password params.
 */
export default function changePasswordParams(oldPass, newPass) {
	return {
		oldPass: sha256(oldPass.trim()),
		oldHash: hmacsha256(oldPass.trim(), publicPepper),
		newPass: sha256(newPass.trim()),
		newHash: hmacsha256(newPass.trim(), publicPepper),
	};
}
