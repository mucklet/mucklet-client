import { RootElem } from 'modapp-base-component';
import * as noUiSlider from 'nouislider';
// import 'nouislider/dist/nouislider.css';
import './noUiSlider.scss';

/**
 * NoUiSlider is a wrapper around noUiSlider.
 *
 * The options may also contain any option {@link https://refreshless.com/nouislider/}.
 * @param {object} [opt] Options.
 * @param {function} [opt.onUpdate] Callback called on change.
 */
class NoUiSlider extends RootElem {
	constructor(opt) {
		opt = Object.assign({ tagName: 'div' }, opt);
		opt.className = 'comp-nouislider' + (opt.className ? ' ' + opt.className : '');
		super(opt.tagName, opt);
		this._slider = null;

		opt.onUpdate = this._includeThis(opt.onUpdate);
		this._opt = opt;
	}

	render(el) {
		let e = super.render(el);
		this._slider = noUiSlider.create(e, this._opt);
		if (this._opt.onUpdate) {
			this._slider.on('update', this._opt.onUpdate);
		}
		return e;
	}

	unrender() {
		if (this._slider) {
			if (this._opt.onUpdate) {
				this._slider.off('update');
			}
			this._slider.destroy();
			this._slider = null;
			super.unrender();
		}
	}

	_includeThis(cb) {
		if (!cb) return cb;
		let self = this;
		return function() {
			let args = [].slice.call(arguments);
			args.unshift(self);
			cb.apply(this, args);
		};
	}
}

export default NoUiSlider;
