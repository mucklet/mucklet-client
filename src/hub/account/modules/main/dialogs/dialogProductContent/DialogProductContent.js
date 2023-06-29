import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import * as txtProduct from 'utils/txtProduct';
import './dialogProductContent.scss';

class DialogProductContent {
	constructor(app, params) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to make a card payment.
	 * @param {string} product Product such as 'supporter'.
	 * @returns {Promise} Promise to the opened dialog object.
	 */
	open(product) {
		let features = txtProduct.features(product);

		if (!this.dialog) {
			this.dialog = new Dialog({
				title: l10n.l('dialogProductContent.supporterFeatures', "Supporter features"),
				className: 'dialogproductcontent',
				content: new Elem(n => n.elem('div', [
					n.component(new Txt(txtProduct.description(product), { tagName: 'p' })),
					n.elem('div', features.map(o => n.elem('div', { className: 'common--sectionpadding' }, [
						n.component(new Txt(o.title, { tagName: 'h4' })),
						n.component(new Txt(o.longDesc, { className: 'dialogproductcontent--featuredesc' })),
					]))),
				])),
				onClose: () => { this.dialog = null; },
			});
			this.dialog.open();
		}

		return this.dialog;
	}
}

export default DialogProductContent;
