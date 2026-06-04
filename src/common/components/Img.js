import { anim } from 'modapp-utils';
import { RootElem } from 'modapp-base-component';
import { getRenderingMode } from 'utils/renderingModes';

const cleanupDelay = 5000;

class LoadedImg {
	constructor(src, url, cl, objectUrl) {
		this.src = src;
		this.url = url || '';
		this.cl = cl || null;
		this.objectUrl = objectUrl || null;
	}
}

function errorResult(src, opt) {
	opt?.onError?.(src);
	return new LoadedImg(src, opt?.errorPlaceholder, opt?.errorClassName);
}

// revokeObjectUrl revokes the objectUrl unless it is the expectedObjectUrl.
function revokeObjectUrl(objectUrl, expectedObjectUrl) {
	if (objectUrl && objectUrl != expectedObjectUrl) {
		URL.revokeObjectURL(objectUrl);
	}
}

function preloadImage(src) {
	return new Promise((resolve, reject) => {
		let im = new Image();
		let clear = () => im = im.onerror = im.onabort = im.onload = null;
		let onErr = () => {
			clear();
			reject(new Error('imageLoadFailed'));
		};
		im.onload = () => {
			clear();
			resolve();
		};
		im.onerror = onErr;
		im.onabort = onErr;
		im.src = src;
	});
}

function loadImage(src, opt) {
	if (!src) {
		return Promise.resolve(new LoadedImg(src, opt?.placeholder, opt?.placeholderClassName));
	}

	// If it is a data url, do not fetch.
	if (!opt?.renderingHeader || src.match(/^(?:blob:|data:)/i)) {
		return preloadImage(src).then(
			() => new LoadedImg(src, src),
			() => errorResult(src, opt),
		);
	}

	return fetch(src, {
		mode: 'cors',
		credentials: opt?.crossOrigin != 'anonymous'
			? 'include'
			: 'same-origin',
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('imageResponseError');
			}

			let mode = getRenderingMode(response.headers.get('Image-Rendering')?.trim().toLowerCase() || '');
			return response.blob().then(blob => {
				let objectUrl = URL.createObjectURL(blob);
				return preloadImage(objectUrl).then(
					() => new LoadedImg(src, objectUrl, mode.className, objectUrl),
					(err) => {
						revokeObjectUrl(objectUrl);
						throw err;
					},
				);
			});
		})
		.catch(() => errorResult(src, opt));
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
	 * @param {(src: string) => void} [opt.onError] Callback called when a src fails to load.
	 * @param {object} [opt.placeholder] Placeholder image to use if no src is set.
	 * @param {object} [opt.errorPlaceholder] Placeholder image to use on error.
	 * @param {string} [opt.placeholderClassName] ClassName to add when using placeholder.
	 * @param {string} [opt.errorClassName] ClassName to add on error.
	 * @param {boolean} [opt.renderingHeader] Using header Image-Rendering to set rendering mode. Defaults to false.
	 * @param {"anonymous"|"use-credentials"} [opt.crossOrigin] Cross origin mode. Defaults to "use-credentials" when using renderingHeader.
	 */
	constructor(src, opt) {
		opt = Object.assign({}, opt);
		super('img', opt);

		this.animId = null;
		this.current = null; // Currently rendered result. Null if not rendered.
		this.loadPromise = null;
		this.loaded = null;
		this.cleanupTimeout = null;
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

		this.src = src;
		let el = super.getElement();

		// Same src as currently showing? Fade it to visibility again.
		if (el && this.current?.src === src && this.current?.url) {
			// Release any objectUrl that we might have already loaded.
			this._releaseLoaded();
			this.loaded = this.current;
			this.loadPromise = Promise.resolve(this.current);
			anim.stop(this.animId);
			this.animId = anim.fade(el, 1);
			return this;
		}

		this._clearCleanupTimeout();
		this._loadSrc(src);

		if (!el) return this;

		anim.stop(this.animId);
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
		this._clearCleanupTimeout();

		if (this.loaded && this.loaded?.src === this.src) {
			this._setSrcAttr(this.loaded);
			return;
		}

		if (!this.loadPromise) {
			this._loadSrc(this.src);
		}

		e.style.opacity = 0;
		this._setCurrent();
	}

	unrender() {
		anim.stop(this.animId);
		super.unrender();
		this.current = null;
		if (this.loaded?.objectUrl) {
			this._scheduleCleanup();
		}
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
		revokeObjectUrl(prev?.objectUrl, next?.objectUrl);

		this.current = next;
	}

	_loadSrc(src) {
		this._releaseLoaded();
		this.loaded = null;
		this.loadPromise = loadImage(src, this.opt).then(result => {
			// Make sure the image src is still the one we want to load
			// and that it hasn't been loaded in another process.
			if (src !== this.src || this.loaded?.src === src) {
				// Revoke the objectUrl (unless it equals the loaded one).
				revokeObjectUrl(result.objectUrl, this.loaded?.objectUrl);
				return;
			}
			this.loaded = result;
			// If we are not rendered, schedule a cleanup.
			if (!super.getElement() && result.objectUrl) {
				this._scheduleCleanup();
			}
			return result;
		});
	}

	// Releases the loaded objectUrl, unless it is the current objectUrl.
	_releaseLoaded() {
		if (this.loaded) {
			revokeObjectUrl(this.loaded.objectUrl, this.current?.objectUrl);
		}
	}

	_clearCleanupTimeout() {
		clearTimeout(this.cleanupTimeout);
		this.cleanupTimeout = null;
	}

	_scheduleCleanup() {
		this._clearCleanupTimeout();

		let timeout = setTimeout(() => {
			if (!this.cleanupTimeout || this.cleanupTimeout !== timeout) {
				return;
			}
			revokeObjectUrl(this.loaded.objectUrl);
			this.loaded = null;
			this.loadPromise = null;
			this.cleanupTimeout = null;
		}, cleanupDelay);

		this.cleanupTimeout = timeout;
	}
}

export default Img;
