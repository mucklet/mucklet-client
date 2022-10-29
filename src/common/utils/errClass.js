import { isResError } from 'resclient';

/**
 * Tests if the provided model is an error, and then return ' ' + className, otherwise ''.
 * @param {Model} m Model
 * @param {string} [errClass] Optional class name to return on error. Defaults to 'error'.
 * @param {string} [nonErrClass] Optional class name to return on non-error. Defaults to empty.
 * @returns {string}
 */
export default function errClass(m, errClass, nonErrClass) {
	return isResError(m) ? ' ' + (errClass || 'error') : (nonErrClass ? ' ' + nonErrClass : '');
}
