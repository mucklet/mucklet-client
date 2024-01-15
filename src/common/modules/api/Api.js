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
		super(API_HOST_PATH, {
			namespace,
			eventBus: app.eventBus,
			reconnectDelay: 3000,
			subscribeStaleDelay: 2000,
			subscribeRetryDelay: 0,
			unsubscribeDelay: 5000,
			debug: opt.debug,
		 });

		this.app = app;
		this.webResourcePath = this._resolveWebResourcePath(API_WEBRESOURCE_PATH);
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
