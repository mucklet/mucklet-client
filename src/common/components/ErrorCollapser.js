import Collapser from './Collapser';
import { Txt } from 'modapp-base-component';
import errToL10n from 'utils/errToL10n';
/** Component styles. */
import './errorCollapser.scss';

/**
 * Container that may show or hide error messages.
 */
class ErrorCollapser extends Collapser {
	/**
	 * Creates an instance of ErrorCollapser
	 * @param {string|object|null} [err] Error text to set.
	 * @param {object} [opt] Optional parameters inherited by the root element.
	 * @param {string} [opt.txtClassName] Class name for the wrapped text. Defaults to an error-colored class.
	 * @param {number} [opt.duration] Collapser transition duration, in milliseconds.
	 */
	constructor(err, opt) {
		super(null, opt);

		this.txt = new Txt('', { className: opt && 'txtClassName' in opt ? opt.txtClassName : 'errorcollapser--txt' });
		this.setError(err || null);
	}

	/**
	 * Sets the error text or clears it.
	 *
	 * @param {string|object|null} [err] Error to set. If omitted, empty, or null, the message is cleared.
	 * @returns {void}
	 */
	setError(err) {
		if (!err) {
			super.setComponent(null);
		} else {
			if (typeof err == 'string') {
				this.txt.setText(err);
			} else {
				this.txt.setText(errToL10n(err));
			}
			super.setComponent(this.txt);
		}
	}
}

export default ErrorCollapser;
