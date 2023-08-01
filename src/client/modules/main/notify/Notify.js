import { Html } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';

const notifyStoragePrefix = 'notify.user.';

function isVisible() {
	return document.visibilityState == 'visible';
}

function defaultOnClick(ev) {
	window.focus();
	ev.target.close();
}

/**
 * Notify shows system notifications.
 */
class Notify {

	constructor(app, params) {
		this.app = app;
		this.defaultIcon = params.defaultIcon || '/paw.png';
		this.alwaysNotify = !!params.alwaysNotify;

		this.app.require([ 'confirm', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { enabled: false }, eventBus: this.app.eventBus });
		this.tags = {};
		this.user = null;
		this.module.login.getLoginPromise().then(user => {
			this.user = user;
			this._loadSettings();
		});
	}

	getModel() {
		return this.model;
	}

	/**
	 * Send a notification.
	 * @param {string|LocaleString} title Title of the notification.
	 * @param {object} [opt] Optional parameters. Same as the Notification API with some additions.
	 * @param {number} [opt.duration] Duration the notification will be open in milliseconds. Defaults to 5000.
	 * @param {function} [opt.onClick] Callback called when notifications is clicked. Defaults to: n => { window.focus(); notification.close(); }
	 */
	send(title, opt) {
		if (!this.model.enabled || (isVisible() && !this.alwaysNotify)) return;

		// Prevent new notifications on the same tag
		if (opt?.tag) {
			let tag = opt.tag;
			if (this.tags[tag]) {
				return;
			}
			this.tags[tag] = true;
			setTimeout(() => delete this.tags[tag], 200);
		}

		opt = Object.assign({ icon: this.defaultIcon, duration: 5000, onClick: defaultOnClick }, opt);
		title = typeof title == 'string' ? title : l10n.t(title);
		let n = new Notification(title, opt);

		if (opt.duration) {
			setTimeout(() => n.close(), opt.duration);
		}

		if (opt.onClick) {
			n.onclick = opt.onClick;
		}
	}

	/**
	 * Toggles notifications between enabled and disabled.
	 * @param {boolean} [enable] State to toggle to.
	 * @param {boolean} [noRequest] Flag that prevents a request to be made or a dialog to be shown if permission isn't granted.
	 * @returns {Promise} Promise that rejects if enabling notifications failed.
	 */
	toggle(enable, noRequest) {
		enable = typeof enable == 'boolean' ? enable : !this.model.enabled;
		if (this.model.enabled == enable) return;

		if (!enable) {
			return this._setEnabled(false);
		}

		let promise = this._requestPermission(noRequest)
			.then(() => {
				if (this.permissionPromise == promise) {
					this.permissionPromise = null;
					return this._setEnabled(true);
				}
			})
			.catch(err => {
				if (this.permissionPromise == promise) {
					if (!noRequest) {
						this.module.confirm.open(null, {
							title: l10n.l('notify.notificationsDisabled', "Notifications disabled"),
							confirm: l10n.l('confirm.ok', "Okay"),
							body: new Html(err),
							cancel: null,
						});
					}
					this.permissionPromise = null;
				}
				return Promise.reject(err);
			});

		this.permissionPromise = promise;
		return promise;
	}

	_loadSettings() {
		if (localStorage && this.user) {
			let data = localStorage.getItem(notifyStoragePrefix + this.user.id);
			if (data) {
				let o = JSON.parse(data);
				if (o.hasOwnProperty('enabled')) {
					this.toggle(o.enabled, true);
				}
			}
		}
	}

	_setEnabled(enabled) {
		let p = this.model.set({ enabled });
		if (localStorage && this.user) {
			localStorage.setItem(notifyStoragePrefix + this.user.id, JSON.stringify(this.model.props));
		}
		return p;
	}

	_requestPermission(noRequest) {
		// Test if browser supports Noticication
		if (!('Notification' in window)) {
			return Promise.reject(l10n.l('notify.notSupported', "<p>Notifications are not supported by this browser.</p>"));
		}

		if (Notification.permission && Notification.permission == 'granted') {
			return Promise.resolve();
		}

		if (noRequest) {
			return Promise.reject(l10n.l('notify.notEnabled', "<p>Notifications are not enabled.</p>"));
		}

		// Safari uses a callback instead of Promises.
		let promise;
		try {
			promise = Notification.requestPermission();
		} catch (e) {
			promise = new Promise(resolve => Notification.requestPermission(resolve));
		}

		return promise.then(result => {
			if (result === 'default') {
				return Promise.reject(l10n.l('notify.mustAllowPermission', "<p>You must grant permission for using system notifications.</p>"));
			}
			if (result === 'denied') {
				return Promise.reject(l10n.l('notify.permissionDenied', "<p>Permission to use notifications was denied.</p><p>To activate it, you must unblock notifications for this site in your browser.</p>"));
			}
		});
	}


	dispose() {

	}
}

export default Notify;
