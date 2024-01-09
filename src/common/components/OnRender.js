/**
 * OnRender is a transparent wrapper around a component, allowing to call
 * callbacks before or after render or unrender.
 *
 * @param {Component} component Component to wrap.
 * @param {object} [opt] Options.
 * @param {(component: Component) => void} [opt.beforeRender] Callback called on before render.
 * @param {(component: Component) => void} [opt.afterRender] Callback called on after render.
 * @param {(component: Component) => void} [opt.beforeUnrender] Callback called on before unrender.
 * @param {(component: Component) => void} [opt.afterUnrender] Callback called on after unrender.
 */
class OnRender {
	constructor(component, opt) {
		this._c = component;
		this._opt = opt;
	}

	render(el) {
		this._opt?.beforeRender?.(this._c);
		let e = this._c.render(el);
		this._opt?.afterRender?.(this._c);
		return e;
	}

	unrender() {
		this._opt?.beforeUnrender?.(this._c);
		this._c.unrender();
		this._opt?.afterUnrender?.(this._c);
	}

	getComponent() {
		return this.component;
	}
}

export default OnRender;
