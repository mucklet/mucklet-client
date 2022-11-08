import { anim } from 'modapp-utils';
import { RootElem } from 'modapp-base-component';

function whenImageLoaded(src) {
	return src
		? new Promise((resolve, reject) => {
			let im = new Image();
			let clear = () => im = im.onerror = im.onabort = im.onload = null;
			im.onload = ev => {
				clear();
				resolve(ev);
			};
			im.onerror = ev => {
				clear();
				reject(ev);
			};
			im.onabort = ev => {
				clear();
				reject(ev);
			};
			im.src = src;
		})
		: Promise.reject("No image");
}

/**
 * An image component
 */
class Img extends RootElem {

	/**
	 * Creates an instance of Img
	 * @param {string} src Image source
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 */
	constructor(src, opt) {
		opt = Object.assign({}, opt);
		super('img', opt);

		this.animId = null;
		this.current = null;
		this.loadPromise = null;

		this.setSrc(src);
	}

	/**
	 * Sets the display text
	 * @param {string} src Image source
	 * @returns {this}
	 */
	setSrc(src) {
		src = src || "";

		if (this.src === src) return this;

		// Start loading image
		this.src = src;
		this.loaded = false;
		this.loadPromise = whenImageLoaded(src).catch(() => {}).then(() => {
			// Make sure the image src hasn't changed while loading.
			if (src === this.src) {
				this.loaded = true;
			}
		});

		let el = super.getElement();
		if (!el) return this;

		anim.stop(this.animId);

		if (this.current === src && src) {
			this.animId = anim.fade(el, 1);
			return this;
		}

		this.animId = anim.fade(el, 0, {
			callback: () => {
				if (this.src !== src) return;
				this._setCurrent();
			},
		});
		return this;
	}

	/**
	 * Gets the current set image source.
	 * @returns {string} Image source
	 */
	getSrc() {
		return this.src;
	}

	render(el) {
		let e = super.render(el);
		if (this.loaded) {
			this.current = this.src;
			this._setSrcAttr(this.src);
		} else {
			e.style.opacity = 0;
			this._setCurrent();
		}
	}

	unrender() {
		anim.stop(this.animId);
		super.unrender();
	}

	/**
	 * Sets the current src and fades it in when loaded.
	 * It assumes opacity is 0 when called.
	 * @param {string} src Image source.
	 */
	_setCurrent() {
		let src = this.src;
		this._setSrcAttr(src);
		this.current = src;
		if (src) {
			this.loadPromise.then(() => {
				let el = super.getElement();
				if (!el || this.current !== src || this.src !== src) {
					return;
				}
				this.animId = anim.fade(el, 1);
			});
		}
	}

	_setSrcAttr(src) {
		if (src) {
			this._rootElem.setAttribute('src', src);
		} else {
			this._rootElem.removeAttribute('src');
		}
	}
}

export default Img;

