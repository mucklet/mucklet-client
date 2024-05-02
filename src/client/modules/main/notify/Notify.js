import { Html } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import * as base64 from 'utils/base64.js';

const notifyStoragePrefix = 'notify.user.';

function defaultOnClick(ev) {
	window.focus();
	ev.target.close();
}

function isVisible() {
	return document.visibilityState == 'visible';
}

/**
 * Notify shows system notifications.
 */
class Notify {

	constructor(app, params) {
		this.app = app;
		this.defaultIcon = params.defaultIcon || '/android-chrome-192x192.png';
		this.alwaysNotify = !!params.alwaysNotify;

		// Notify modes:
		// * push   - Use service worker with Push API
		// * local  - Use service worker without Push API (local notifications)
		// * auto   - Behave like 'push' if app is running in display-mode: standalone, otherwise behave like 'local'. Default.
		// * legacy - Don't use service worker or Push API (uses new Notification instead).
		this.mode = [ 'push', 'local', 'legacy' ].find(v => v == params.mode) || 'auto';

		this.app.require([
			'api',
			'confirm',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { enabled: false, usePush: false }, eventBus: this.app.eventBus });
		this.tags = {};
		this.user = null;
		this.registration = null;
		this.module.auth.getUserPromise().then(user => {
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
		if (!this.user || !this.model.enabled) return;

		let tag = opt?.tag;
		// Prevent new notifications on the same tag
		if (tag) {
			if (this.tags[tag]) {
				return;
			}
			this.tags[tag] = true;
			setTimeout(() => delete this.tags[tag], 200);
		}
		opt = Object.assign({ icon: this.defaultIcon, /*duration: 5000, */onClick: defaultOnClick, alwaysNotify: this.alwaysNotify }, opt);
		title = typeof title == 'string' ? title : l10n.t(title);

		const serviceWorker = this.app.getModule('serviceWorker');
		((this.mode != 'legacy' && serviceWorker?.getPromise()) || Promise.reject()).then((registration) => {
			return registration
				? serviceWorker.showNotification(title, opt)
				: Promise.reject();
		}).catch(() => {
			if (typeof Notification != 'undefined' && (!isVisible() || this.alwaysNotify)) {
				// Fallback using new Notifcation
				let n = new Notification(title, opt);
				if (opt.duration) {
					setTimeout(() => n.close(), opt.duration);
				}
				// Click callback
				n.onclick = (ev) => {
					ev.target.close();
					opt?.onClick?.(ev);
				};
			}
		});
	}

	/**
	 * Toggles notifications between enabled and disabled.
	 * @param {boolean} [enable] State to toggle to.
	 * @param {boolean} [noRequest] Flag that prevents a request to be made or a dialog to be shown if permission isn't granted.
	 * @returns {Promise} Promise that rejects if enabling notifications failed.
	 */
	toggle(enable, noRequest) {
		enable = typeof enable == 'boolean' ? enable : !this.model.enabled;
		if (this.model.enabled == enable) return Promise.resolve();

		if (!enable) {
			return this._setEnabled(false, false);
		}

		let promise = this._requestPermission(noRequest)
			.then(() => {
				if (this.permissionPromise == promise) {
					this.permissionPromise = null;
					if (this._usePush()) {
						return this._subscribeToPush().catch(err => {
							console.error("Error subscriping to push: ", err);
							this.mode = 'local';
							this._setEnabled(true, true);
						});
					}
					return this._setEnabled(true, false);
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
				this._setEnabled(false, false);
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

	_setEnabled(enabled, usePush) {
		let p = this.model.set({ enabled, usePush });
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

	_subscribeToPush() {
		let serviceWorker = this.app.getModule('serviceWorker');
		return (serviceWorker?.getPromise() || Promise.reject())
			.then(registration => {
				return this.module.api.get('core.info').then(coreInfo => {
					return registration.pushManager.getSubscription()
						.then(pushSubscription => {
							// If we have a pushSubscription using a different public key, we first need to unsubscribe it.
							if (pushSubscription && base64.fromArrayBuffer(pushSubscription.options.applicationServerKey, true, true) != coreInfo.vapidPublicKey) {
								return this._unsubscribeToPush(pushSubscription)
									.catch(err => console.error("Error unsubscribing to pushSubscription " + pushSubscription.endpoint, err));
							}
						})
						.then(() => {
							return registration.pushManager.subscribe({
								userVisibleOnly: true,
								applicationServerKey: coreInfo.vapidPublicKey,
							});
						});
				});
			})
			.then((pushSubscription) => {
				return this.module.api.call(`core.player.${this.user.id}`, 'registerPushSub', {
					endpoint: pushSubscription.endpoint,
					p256dh: base64.fromArrayBuffer(pushSubscription.getKey("p256dh")),
					auth: base64.fromArrayBuffer(pushSubscription.getKey("auth")),
				}).then(() => pushSubscription);
			});
	}

	_unsubscribeToPush(pushSubscription) {
		let endpoint = pushSubscription.endpoint;
		return pushSubscription.unsubscribe().then(() => {
			return this.module.api.call(`core.player.${this.user.id}`, 'unregisterPushSub', {
				endpoint,
			});
		});
	}

	/**
	 * Tests if the Push API should be used instead of just using WebSocket
	 * triggered notifications. If this.mode is 'auto', then push will be used
	 * if the app is running in display-mode: standalone.
	 * @returns {Boolean}
	 */
	_usePush() {
		return this.mode == 'push' || (this.mode == 'auto' && window.matchMedia('(display-mode: standalone)').matches);
	}

	dispose() {

	}
}

export default Notify;
