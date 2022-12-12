const viewport = window.visualViewport || null;

/**
 * Viewport tries to keep the body inside the visible viewport.
 */
class Viewport {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		if (!viewport) {
			console.log("[Viewport] Visual Viewport is not available in this browser.");
			return;
		}

		// Bind callbacks
		this._calculate = this._calculate.bind(this, "resize");

		viewport.addEventListener('resize', this._calculate);
		viewport.addEventListener('scroll', this._calculate);

		this.vvp = { w: 0, h: 0 };
		this.vp = { w: 0, h: 0 };

		this.bodyStyle = document.createElement('style');
		this.bodyStyle.innerHTML = `body, .viewport {
	height: var(--100vvh, 100vh);
	width: var(--100vvw, 100vw);
}
.viewport {	top: var(--offset-top, 0); }`;
		this.varStyle = document.createElement('style');
    	document.head.appendChild(this.bodyStyle);
    	document.head.appendChild(this.varStyle);
		this.module.screen.getFader().addClass('viewport');

		this._calculate();
	}

	_calculate() {
		let doc = document.documentElement;
		this.vp.w = Math.max(doc.clientWidth || 0, window.innerWidth || 0);
		this.vp.h = Math.max(doc.clientHeight || 0, window.innerHeight || 0);

		if (viewport) {
			this.vvp.w = viewport.width;
			this.vvp.h = viewport.height;
			this.vvp.t = viewport.offsetTop;
			this.vvp.l = viewport.offsetLeft;
		} else {
			this.vvp.w = this.vp.w;
			this.vvp.h = this.vp.h;
			this.vvp.t = 0;
			this.vvp.l = 0;
		}

		this.varStyle.innerHTML = `:root {
	--100vvw: ${this.vvp.w}px;
	--100vvh: ${this.vvp.h}px;
	--offset-top: ${this.vvp.t}px;
	--offset-left: ${this.vvp.l}px;
	--offset-w: ${this.vp.w - this.vvp.w}px;
	--offset-h: ${this.vp.h - this.vvp.h}px;
}`;
	}

	dispose() {
		if (!viewport) return;

		this.module.screen.getFader().removeClass('viewport');
		viewport.removeEventListener('resize', this._calculate);
		viewport.removeEventListener('scroll', this._calculate);
		this.varStyle.parentNode.removeChild(this.varStyle);
		this.bodyStyle.parentNode.removeChild(this.bodyStyle);
	}
}

export default Viewport;
