import { RootElem } from 'modapp-base-component';
import croppie from 'croppie';
import './croppie.scss';

/**
 * Croppie is a wrapper around https://foliotek.github.io/Croppie/.
 *
 * The options may contain any option from {@link https://github.com/jirenius/modapp-base-component/blob/master/src/RootElem.js|RootElem}
 * and options of {@link https://foliotek.github.io/Croppie/|croppie}.
 * @param {object} [opt] Options.
 */
class Croppie extends RootElem {
	constructor(opt) {
		opt = Object.assign({}, opt);
		super('div', opt);
		this._croppie = null;
		this.opt = opt;
	}

	get croppie() {
		return this._croppie;
	}

	/**
	 * Bind an image to the croppie. Returns a promise to be resolved when the image has been loaded and the croppie has been initialized.
	 * @param {*} opt Options as defined by {@link https://foliotek.github.io/Croppie/#bind|croppie.bind}
	 * @returns {Promise} Promise when croppie has been initialized.
	 */
	bind(opt) {
		if (!this._croppie) {
			return Promise.reject(new Error("Croppie component must be rendered before calling bind"));
		}
		return this._croppie.bind(opt);
	}

	render(el) {
		let rel = super.render(el);
		this._croppie = new croppie(rel, this.opt);
		return rel;
	}

	unrender() {
		if (this._croppie) {
			this._croppie.destroy();
			this._croppie = null;
		}
		super.unrender();
	}
}

export default Croppie;
