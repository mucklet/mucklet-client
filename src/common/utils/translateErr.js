import Err from 'classes/Err';

/**
 * Translates a core.exitNotFound error into a more human friendly error.
 * @param {ResError} err Error.
 * @param {string} key Exit key used.
 * @returns {Err | ResError} Translated error if the code was core.exitNotFound, otherwise the original ResError.
 */
export function exitNotFound(err, key) {
	if (err?.code == 'core.exitNotFound') {
		return key
			? new Err('translateErr.exitNotFoundByKey', "Cannot find the exit '{key}'.", { key })
			: new Err('translateErr.exitNotFound', "Cannot find that exit.");
	}
	return err;
}
