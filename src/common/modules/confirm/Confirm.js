import { Elem } from 'modapp-base-component';
import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import isComponent from 'utils/isComponent';
import './confirm.scss';

class Confirm {
	constructor(app, params) {
		this.app = app;
	}

	/**
	 * Opens a confirm dialog.
	 * @param {function} onConfirm Callback function called on confirm.
	 * @param {function} [opt] Optional parameters
	 * @param {string} [opt.className] Class name to use instead of 'confirm'.
	 * @param {string|LocaleString|Component} [opt.title] Title text or component.
	 * @param {string|LocaleString|Component} [opt.body] Body text or component.
	 * @param {string|LocaleString|Component} [opt.confirm] Confirm button text or component.
	 * @param {?string|LocaleString|Component} [opt.cancel] Cancel button text or component. Null means no cancel button.
	 * @param {function} [opt.onCancel] Callback function called on cancel or close.
	 * @param {boolean} [opt.focusConfirm] Flag to tell if the confirm button should have initial focus. Default is the cancel button.
	 * @param {boolean} [opt.spinner] Flag telling if a spinner should be used. Defaults to false.
	 * @param {boolean} [opt.confirmStyle] Style to use for the confirm button. May be "primary", "secondary", or "warning". Defaults to "primary".
	 * @param {boolean} [opt.noClose] Flag telling if closing through escape or an "X"-icon should be disabled. Defaults to false.
	 * @param {boolean} [opt.onClose] Callback function called when the confirmed is closed.
	 * @param {string} [opt.size] Size of the dialog. May be "wide".
	 * @returns {Dialog} Dialog object.
	 */
	open(onConfirm, opt) {
		if (this.dialog) {
			throw new Error("Confirm dialog is already open.");
		}

		opt = opt || {};

		let hasConfirmed = false;

		this.dialog = new Dialog({
			title: opt.title || l10n.l('confirm.title', "Confirm"),
			className: opt.className || 'confirm' + (opt.size ? ' ' + opt.size : ''),
			noClose: !!opt.noClose,
			content: new Elem(n => {
				let footer = [
					n.elem('confirm', 'button', {
						className: 'btn ' + (opt.confirmStyle || 'primary') + (opt.spinner ? ' confirm--withspinner' : ''),
						events: {
							click: () => {
								if (opt.spinner) {
									if (hasConfirmed) return;
									hasConfirmed = true;

									let elem = this.dialog.getContent();
									if (elem) {
										elem.getNode('spinner').removeClass('hide');
									}
								}
								if (onConfirm) {
									Promise.resolve(onConfirm()).then(() => {
										this.close();
									}).catch(err => {
										this.close();
										console.error(err);
										this.openError(err);
									});
								} else {
									this.close();
								}
							},
						},
					}, [
						n.component(opt.spinner ? 'spinner' : null, opt.spinner ? new Elem(n => n.elem('div', { className: 'spinner fade hide' })) : null),
						n.component(isComponent(opt.confirm)
							? opt.confirm
							: new Txt(opt.confirm || l10n.l('confirm.confirm', "Okay")),
						),
					]),
				];
				if (opt.cancel !== null) {
					footer.push(n.elem('cancel', 'button', {
						className: 'btn secondary',
						events: {
							click: () => {
								if (opt.onCancel) {
									opt.onCancel();
								}
								this.close();
							},
						},
					}, [
						n.component(isComponent(opt.cancel)
							? opt.cancel
							: new Txt(opt.cancel || l10n.l('confirm.cancel', "Cancel")),
						),
					]));
				}
				return n.elem('div', { className: 'confirm--content' }, [
					n.component(isComponent(opt.body)
						? opt.body
						: Array.isArray(opt.body)
							? new Elem(n => n.elem('div', { className: 'confirm--body' }, opt.body.map(b => n.component(new Txt(b, { tagName: 'p' })))))
							: new Txt(opt.body || l10n.l('confirm.body', "Are you sure?"), { className: 'confirm--body' }),
					),
					n.elem('div', { className: 'confirm--footer' }, footer),
				]);
			}),
			onClose: () => {
				if (opt.onClose) {
					opt.onClose();
				}
				this.dialog = null;
			},
		});

		this.dialog.open();
		this.dialog.getContent().getNode(opt.focusConfirm || opt.cancel === null ? 'confirm' : 'cancel').focus();
		return this.dialog;
	}

	/**
	 * Opens an error confirm dialog.
	 * @param {string|Err|ResError} msg Error message.
	 * @param {function} [opt] Optional parameters
	 * @param {string} [opt.className] Class name to use instead of 'confirm'.
	 * @param {string|LocaleString|Component} [opt.title] Title text or component.
	 * @param {string|LocaleString|Component} [opt.confirm] Confirm button text or component.
	 */
	openError(msg, opt) {
		// Turn error into a LocaleString
		if (typeof msg === 'object' && msg !== null && msg.code && msg.message) {
			msg = l10n.l(msg.code, msg.message, msg.data);
		}
		this.open(null, {
			title: opt?.title || l10n.l('confirm.error', "An error occurred"),
			confirm: opt?.confirm || l10n.l('confirm.ok', "Okay"),
			body: msg || l10n.l('confirm.bodyPlaceholder', "An unexpected error was encountered. That's all I know."),
			cancel: null,
		});
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
		}
	}
}

export default Confirm;
