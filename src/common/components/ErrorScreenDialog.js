import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ConfirmScreenDialog from './ConfirmScreenDialog';
import { redirect } from 'utils/reload';
import './errorScreenDialog.scss';

/**
 * Draws an error screen dialog with a button that redirects to a given URL.
 */
class ErrorScreen {

	/**
	 * Creates a new ErrorScreen instance.
	 * @param {object} err Error object
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.redirectUrl] Redirect URL for the back button. Defaults to the same page without queries.
	 * @param {LocaleString} [opt.titleTxt] Dialog title. Defaults to "Something went wrong".
	 * @param {LocaleString} [opt.infoTxt] Dialog into text. Defaults to "We got this error message:".
	 * @param {LocaleString} [opt.buttonTxt] Button text. Defaults to "Go back".
	 */
	constructor(err, opt) {
		this.err = err;
		this.opt = opt || {};
	}

	render(el) {
		let opt = this.opt;
		this.elem = new ConfirmScreenDialog({
			title: opt.titleTxt || l10n.l('errorScreenDialog.title', "Something went wrong"),
			confirm: opt.buttonTxt || l10n.l('errorScreenDialog.goback', "Go back"),
			body: new Elem(n => n.elem('div', { className: 'errorscreendialog' }, [
				n.component(new Txt(opt.infoTxt || l10n.l('errorScreenDialog.errorOccured', "We got this error message:"), { tagName: 'p' })),
				n.component(this.err
					? new Txt(l10n.l(this.err.code, this.err.message, this.err.data), { tagName: 'p', className: 'errorscreendialog--message' })
					: null
				),
			])),
			onConfirm: () => this._redirect(),
			onClose: () => this._redirect()
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_redirect() {
		redirect(this.opt.url || window.location.href.split('?')[0]);
	}
}

export default ErrorScreen;
