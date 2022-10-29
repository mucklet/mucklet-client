import { isResError } from 'resclient';
import l10n from 'modapp-l10n';

/**
 * Tests if the provided model is an error, and then returns a LocaleString of that error, or errStr.
 * Otherwise it calls the function f with the model, and returns its value.
 * @param {Model} m Model
 * @param {function} f Callback function: function(model) -> string|LocaleString
 * @param {string|LocaleString} [errStr] Optional error string if model is an error.
 * @returns {string|LocaleString}
 */
export default function errString(m, f, errStr) {
	if (isResError(m)) {
		return errStr || l10n.l(m.code, m.message, m.data);
	}
	return f ? f(m) : errStr || '';
}
