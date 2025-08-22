import RouteErrorComponent from './RouteErrorComponent';

/**
 * RouteError is a helper module to show route errors.
 */
class RouteError {
	constructor(app, params) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Creates a RouteError component.
	 * @param {LocaleString | string} title Error title.
	 * @param {object} err Error object.
	 * @param {object} [opt] Optional parameters.
	 * @param {LocalString | string} [opt.body] Additional body text to display before the error.
	 * @returns {Component} RouteError component.
	 */
	newError(title, err, opt) {
		return new RouteErrorComponent(title, err, opt);
	}

	dispose() {}
}

export default RouteError;
