import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ScreenDialog from './ScreenDialog';
import isComponent from 'utils/isComponent';
import './confirmScreenDialog.scss';

/**
 * Draws an error screen dialog with a button that redirects to a given URL.
 */
class ConfirmScreenDialog {

	/**
	 * Creates a new ConfirmScreenDialog instance.
	 * @param {function} [opt] Optional parameters
	 * @param {string} [opt.className] Class name to use instead of 'confirm'.
	 * @param {string|LocaleString} [opt.title] Title text or component.
	 * @param {string|LocaleString|Component} [opt.body] Body text or component.
	 * @param {string|LocaleString} [opt.confirm] Confirm button text or component.
	 * @param {boolean} [opt.onClose] Callback function called when the confirmed is closed.
	 * @param {boolean} [opt.onConfirm] Callback function called when the confirmed is closed.
	 */
	constructor(opt) {
		this.opt = opt || {};
	}

	render(el) {
		let opt = this.opt;
		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'confirmscreendialog' }, [
			n.elem('div', { className: 'confirmscreendialog--body' }, [
				n.component(isComponent(opt.body)
					? opt.body
					: new Txt(opt.body || l10n.l('confirm.body', "Are you sure?"), { className: 'confirmscreendialog--content' }),
				),
			]),
			n.elem('button', {
				events: { click: () => this._confirm() },
				className: 'btn large primary confirmscreendialog--btn pad-top-xl',
			}, [
				n.component(new Txt(opt.confirm || l10n.l('confirmScreenDialog.okay', "Okay"))),
			]),
		])), {
			title: opt.title || l10n.l('confirmScreenDialog.confirm', "Confirm"),
			close: opt.onClose || null,
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_confirm() {
		if (this.opt.onConfirm) {
			this.opt.onConfirm();
		}
	}
}

export default ConfirmScreenDialog;
