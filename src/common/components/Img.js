import { anim } from 'modapp-utils';
import { RootElem } from 'modapp-base-component';

function whenImageLoaded(src, opt) {
	return src
		? new Promise((resolve, reject) => {
			let im = new Image();
			let clear = () => im = im.onerror = im.onabort = im.onload = null;
			let onErr = ev => {
				clear();
				resolve({ src, url: opt?.errorPlaceholder || '', cl: opt?.errorClassName || null });
			};
			im.onload = ev => {
				clear();
				resolve({ src, url: src, cl: null });
			};
			im.onerror = onErr;
			im.onabort = onErr;
			im.src = src;
		})
		: Promise.resolve({ src, url: opt?.placeholder || '', cl: opt?.placeholderClassName || null });
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
	 * @param {object} [opt.placeholder] Placeholder image to use if no src is set.
	 * @param {object} [opt.errorPlaceholder] Placeholder image to use on error.
	 * @param {string} [opt.placeholderClassName] ClassName to add when using placeholder.
	 * @param {string} [opt.errorClassName] ClassName to add on error.
	 */
	constructor(src, opt) {
		opt = Object.assign({}, opt);
		super('img', opt);

		this.animId = null;
		this.current = null;
		this.loadPromise = null;
		this.loaded = null;
		this.opt = opt;

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
		this.loaded = null;
		this.loadPromise = whenImageLoaded(src, this.opt).then(result => {
			// Make sure the image src hasn't changed while loading.
			if (src === this.src) {
				this.loaded = result;
			}
		});

		let el = super.getElement();
		if (!el) return this;

		anim.stop(this.animId);

		// Same src as currently showing? Fade it to visibility again.
		if (this.current?.src === src && this.current?.url) {
			this.animId = anim.fade(el, 1);
			return this;
		}

		this.animId = anim.fade(el, 0, {
			callback: () => {
				if (this.src === src) {
					this._setCurrent();
				}
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
		if (this.loaded && this.loaded?.src === this.src) {
			this._setSrcAttr(this.loaded);
		} else {
			e.style.opacity = 0;
			this._setCurrent();
		}
	}

	unrender() {
		anim.stop(this.animId);
		super.unrender();
		this.current = null;
	}

	/**
	 * Sets the current src and fades it in when loaded.
	 * It assumes opacity is 0 when called.
	 */
	_setCurrent() {
		this.loadPromise.then(() => {
			let el = super.getElement();
			// Assert we the element is rendered and that the loaded data is for
			// this source.
			if (!el || this.src !== this.loaded?.src) {
				return;
			}
			this._setSrcAttr(this.loaded);
			// Show if we have something to show
			if (this.loaded?.url) {
				this.animId = anim.fade(el, 1);
			}
		});
	}

	_setSrcAttr(next) {
		let prev = this.current;
		if (next?.url) {
			this._rootElem.setAttribute('src', next.url);
		} else {
			this._rootElem.removeAttribute('src');
		}
		if (prev?.cl != next?.cl) {
			if (prev?.cl) {
				this._rootElem.removeClass(prev.cl);
			}
			if (next?.cl) {
				this._rootElem.addClass(next.cl);
			}
		}
		this.current = next;
	}
}

export default Img;

