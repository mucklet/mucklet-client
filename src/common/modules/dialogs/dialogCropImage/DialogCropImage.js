import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import Croppie from 'components/Croppie';
import renderingModes from 'utils/renderingModes';
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
	 * @param {boolean} [opt.withRenderingMode] Show option for selecting rendering mode (pixelated). Defaults to false.
	 * @param {string|LocaleString} [opt.title] Title of the dialog. Defaults to "Crop image".
	 * @param {string|LocaleString} [opt.submit] Submit button text. Defaults to "Upload image".
	 * @param {object} [opt.viewport] Viewport.
	 * @param {number} [opt.viewport.width] Viewport width. Defaults to 200.
	 * @param {number} [opt.viewport.height] Viewport height. Defaults to 200.
	 * @param {number} [opt.viewport.type] Viewport type. Defaults to "square".
	 * @param {object} [opt.boundary] Boundary.
	 * @param {number} [opt.boundary.width] Boundary width. Defaults to 400.
	 * @param {number} [opt.boundary.height] Boundary height. Defaults to 400.
	 * @param {Component} [opt.footer] Footer component to render under the cropper.
	 */
	open(dataUrl, onCrop, opt) {
		if (this.dialog) return;

		opt = opt || {};

		let croppie = new Croppie(Object.assign({
			viewport: Object.assign({ width: 200, height: 200, type: 'square' }, opt.viewport),
			boundary: Object.assign({ width: 400, height: 400 }, opt.boundary),
		}, opt));

		let model = new Model({ data: {
			mode: '',
		}});
		this.dialog = new Dialog({
			title: opt.title || l10n.l('dialogCropImage.dialogCropImage', "Crop image"),
			className: 'dialogcropimage' + (opt.className ? ' ' + opt.className : ''),
			animated: false, // Animation messes with Croppie's transform
			content: new Elem(n => n.elem('div', { className: 'dialogcropimage--content' }, [
				n.elem('div', { className: 'dialogcropimage--container' }, [
					n.component(croppie),
				]),
				...(opt.withRenderingMode
					? [
						n.elem('div', { className: 'dialogcropimage--modes flex-row sm gap8' }, renderingModes.map(mode => n.component(new ModelComponent(
							model,
							new Elem(n => n.elem('button', {
								className: 'dialogcropimage--mode btn tiny',
								events: {
									click: (c, ev) => {
										ev.stopPropagation();
										model.set({ mode: mode.key });
										let elem = this.dialog.getContent();
										for (let m of renderingModes) {
											if (m.key) {
												elem?.[m.key == mode.key ? 'addClass' : 'removeClass']('dialogcropimage--mode-' + m.key);
											}
										}
									},
								},
							}, [
								n.component(new Txt(mode.text)),
							])),
							(m, c) => {
								c[m.mode == mode.key ? 'addClass' : 'removeClass']('primary');
								c[m.mode != mode.key ? 'addClass' : 'removeClass']('darken');
							},
						)))),
						// n.component(new LabelToggleBox(l10n.l('dialogCropImage.pixelated', "Pixelated"), false, {
						// 	className: 'common--formmargin',
						// 	onChange: (v, c) => {
						// 		pixelated = v;
						// 		this.dialog.getContent()?.[v ? 'addClass' : 'removeClass']('dialogcropimage--pixelated');
						// 	},
						// })),
					]
					: []
				),
				...(opt.footer
					? [
						n.elem('div', { className: 'common--sectionpadding' }, [
							n.component(opt.footer),
						]),
					]
					: []
				),
				n.component('message', new Collapser()),
				n.elem('div', { className: 'dialogcropimage--footer' }, [
					n.elem('button', { events: {
						click: () => Promise.resolve(onCrop(dataUrl, croppie.croppie.get().points, model.mode))
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
