import { Elem } from 'modapp-base-component';
import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import Croppie from 'components/Croppie';
import './dialogCropImage.scss';

class DialogCropImage {
	constructor(app, params) {
		this.app = app;
	}

	/**
	 * Opens a crop image dialog.
	 * @param {string} dataUrl Data URL string with image information.
	 * @param {function} onCrop Callback called on crop: function(dataUrl, croppiePoints)
	 * @param {object} [opt] Optional parameters.
	 * @param {string|LocaleString} [opt.title] Title of the dialog. Defaults to "Crop image".
	 * @param {string|LocaleString} [opt.submit] Submit button text. Defaults to "Upload image".
	 * @param {Component} [opt.footer] Footer component to render under the cropper.
	 */
	open(dataUrl, onCrop, opt) {
		if (this.dialog) return;

		opt = opt || {};

		let croppie = new Croppie(Object.assign({
			viewport: { width: 200, height: 200, type: 'square' },
			boundary: { width: 400, height: 400 },
		}, opt));
		this.dialog = new Dialog({
			title: opt.title || l10n.l('dialogCropImage.dialogCropImage', "Crop image"),
			className: 'dialogcropimage',
			animated: false, // Animation messes with Croppie's transform
			content: new Elem(n => n.elem('div', { className: 'dialogcropimage--content' }, [
				n.elem('div', { className: 'dialogcropimage--container' }, [
					n.component(croppie),
				]),
				n.component(opt.footer
					? new Elem(n => n.elem('div', { className: 'common--sectionpadding' }, [
						n.component(opt.footer),
			 		]))
					: null,
				),
				n.component('message', new Collapser()),
				n.elem('div', { className: 'dialogcropimage--footer' }, [
					n.elem('button', { events: {
						click: () => Promise.resolve(onCrop(dataUrl, croppie.croppie.get().points))
							.then(() => {
								if (this.dialog) {
									this.dialog.close();
								}
							})
							.catch(err => this._setMessage(err)),
					}, className: 'btn primary form' }, [
						n.component(new Txt(opt.submit || l10n.l('dialogCropImage.uploadImage', "Upload image"))),
					]),
				]),
			])),
			onClose: () => this._onClose(),
		});

		this.dialog.open();
		croppie.bind({ url: dataUrl })
			.catch(err => {
				if (this.dialog) {
					this.dialog.close();
				}
				this._showMessage([ l10n.l('dialogCropImage.errorLoadingImage', "Filen kunde inte laddas."), l10n.l('dialogCropImage.errorLoadingImageDesc', "Är du säker på att det är en bild?") ]);
			});
	}

	_onClose() {
		this.dialog = null;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		msg = typeof msg == 'object' && msg !== null && msg.code ?
			l10n.l(msg.code, msg.message || "", msg.data)
			: msg;
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogCropImage;
