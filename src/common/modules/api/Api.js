import ResClient, { isResError } from 'resclient';

const namespace = 'module.api';

/**
 * Api module connects to the backend api and provides low level
 * methods for service modules to send and receive data.
 */
class Api extends ResClient {

	constructor(app, params) {
		let opt = Object.assign({
			debug: false,
		}, params);
		opt.debug = !!(opt.debug && opt.debug != 'false' && opt.debug != '0' && opt.debug != 'no');
		super(app.props.apiHostPath, {
			namespace,
			eventBus: app.eventBus,
			reconnectDelay: 3000,
			subscribeStaleDelay: 2000,
			subscribeRetryDelay: 0,
			unsubscribeDelay: 5000,
			debug: opt.debug,
		 });

		this.app = app;
		this.webResourcePath = this._resolveWebResourcePath(app.props.apiWebresourcePath);
		this.beforeConnect = null;
		this.beforeConnectPromise = null;
	}

	/**
	 * Sets a callback that is awaited before opening a WebSocket connection.
	 * @param {?function} beforeConnect Callback run before connecting.
	 * @returns {Api} This API instance.
	 */
	setBeforeConnect(beforeConnect) {
		this.beforeConnect = beforeConnect;
		return this;
	}

	connect() {
		if (!this.beforeConnect) {
			return super.connect();
		}
		if (!this.beforeConnectPromise) {
			this.beforeConnectPromise = Promise.resolve()
				.then(() => this.beforeConnect())
				.finally(() => this.beforeConnectPromise = null);
		}
		return this.beforeConnectPromise.then(() => super.connect());
	}

	getWebResourceUri(rid) {
		let idx = rid.indexOf('?');
		let rname = idx >= 0 ? rid.substr(0, idx) : rid;
		let query = idx >= 0 ? rid.substr(idx) : '';

		return this.webResourcePath + rname.replace(/\./g, '/') + query;
	}

	isError(resource) {
		return isResError(resource);
	}

	onEvent(rid, cb) {
		this.app.eventBus.on(null, cb, namespace + '.resource' + (rid ? '.' + rid : ''));
	}

	offEvent(rid, cb) {
		this.app.eventBus.off(null, cb, namespace + '.resource' + (rid ? '.' + rid : ''));
	}

	_resolveWebResourcePath(url) {
		if (!url.match(/^http?:\/\//)) {
			let a = document.createElement('a');
			a.href = url;
			url = a.href;
		}

		return url.replace(/\/$/, '') + '/';
	}

	dispose() {
		this.disconnect();
	}
}

export default Api;
