import { Html } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import * as base64 from 'utils/base64.js';

const notifyStoragePrefix = 'notify.user.';

const notifySettingKeys = [ 'notifyOnWakeup', 'notifyOnWatched', 'notifyOnMatched', 'notifyOnEvent', 'notifyOnMention', 'notifyOnRequests' ];

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

		// Bind callbacks
		this._onModelChange = this._onModelChange.bind(this);

		this.app.require([
			'api',
			'confirm',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			enabled: false,
			usePush: false,
			notifyOnWakeup: true,
			notifyOnWatched: true,
			notifyOnMatched: true,
			notifyOnEvent: true,
			notifyOnMention: true,
			notifyOnRequests: true,
		}, eventBus: this.app.eventBus });
		this.tags = {};
		this.player = null;
		this.endpoint = null;
		this.module.player.getPlayerPromise().then(player => {
			this.player = player;
			this._loadSettings();
			this.model.on('change', this._onModelChange);
		});
	}

	getModel() {
		return this.model;
	}

	/**
	 * Send a local notification.
	 * @param {string|LocaleString} title Title of the notification.
	 * @param {object} [opt] Optional parameters. Same as the Notification API with some additions.
	 * @param {string} [opt.tag] Tag to set on the notification.
	 * @param {number} [opt.duration] Duration the notification will be open in milliseconds. Defaults to 5000.
	 * @param {function} [opt.onClick] Callback called when notifications is clicked.
	 * @param {boolean} [opt.skipOnPush] Flag to skip sending the notification if push is enabled.
	 */
	send(title, opt) {
		if (!this.player || !this.model.enabled || (opt?.skipOnPush && this.model.usePush)) return;

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
			this.permissionPromise = null;
			return this._setEnabled(false, false);
		}

		let promise = this._requestPermission(noRequest)
			.then(() => {
				if (this.permissionPromise == promise) {
					if (this._usePush()) {
						return this._subscribeToPush()
							.then(pushSubscription => {
								// On successful subscribe to push, make sure
								// the promise hasn't changed. If not, set as
								// enabled and store the endpoint. Else,
								// unregister the endpoint again.
								if (this.permissionPromise == promise) {
									this._setEnabled(true, true, pushSubscription.endpoint);
								} else {
									this._unregisterPushSub(pushSubscription.endpoint);
								}
							})
							.catch(err => {
								console.error("Error subscribing to push: ", err);
								this.mode = 'local';
								this._setEnabled(true, false);
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
				}
				this._setEnabled(false, false);
				return Promise.reject(err);
			})
			.finally(() => {
				if (this.permissionPromise == promise) {
					this.permissionPromise = null;
				}
			});

		this.permissionPromise = promise;
		return promise;
	}

	_loadSettings() {
		if (localStorage && this.player) {
			let data = localStorage.getItem(notifyStoragePrefix + this.player.id);
			if (data) {
				let o = JSON.parse(data);
				// Set notify settings with the priority order; localStorage, player settings, model default
				this.model.set(notifySettingKeys
					.reduce((a, k) => ({
						...a,
						[k]: !!(o.hasOwnProperty(k)
							? o[k]
							// [TODO] Delete once player.props no longer contains notify preferences.
							: this.player.props.hasOwnProperty(k)
								? this.player.props[k]
								: this.model.props[k]
						),
					}), {}),
				);
				if (o.hasOwnProperty('enabled')) {
					this.toggle(o.enabled, true);
				}
			}
		}
	}

	_onModelChange(change) {
		this._saveSettings();

		// If notify settings are change, as we use push, updating push settings
		if (this.model.usePush && notifySettingKeys.filter(k => change.hasOwnProperty(k)).length) {
			this._getServiceWorker()
				.then(registration => registration.pushManager.getSubscription())
				.then(pushSubscription => {
					// Assert we still use push
					if (this.model.usePush) {
						// Re-register to update notification settings
						return this._registerPushSub(pushSubscription);
					}
				})
				.catch(err => console.error("Error updating pushSub settings: ", err));

		}
	}

	_saveSettings() {
		if (localStorage && this.player) {
			localStorage.setItem(notifyStoragePrefix + this.player.id, JSON.stringify(this.model.props));
		}
	}

	_setEnabled(enabled, usePush, endpoint) {
		this._setEndpoint(endpoint);
		return this.model.set({ enabled, usePush });
	}

	// Stores the endpoint in the local storage. If another endpoint exists
	// there, it unregisters it.
	_setEndpoint(endpoint) {
		if (localStorage && this.player) {
			endpoint = endpoint || null;
			let key = notifyStoragePrefix + this.player.id + '.endpoint';
			let oldEndpoint = localStorage.getItem(key) || null;
			if (endpoint === oldEndpoint) {
				return;
			}

			this._unregisterPushSub(oldEndpoint);
			if (endpoint) {
				localStorage.setItem(key, endpoint);
			} else {
				localStorage.removeItem(key);
			}
		}
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

	_getServiceWorker() {
		return (this.app.getModule('serviceWorker')?.getPromise() || Promise.reject());
	}

	_subscribeToPush() {
		return this._getServiceWorker()
			.then(registration => {
				return this.module.api.get('core.info').then(coreInfo => {
					return registration.pushManager.getSubscription()
						.then(pushSubscription => {
							// If we have a pushSubscription using a different public key, we first need to unsubscribe it.
							if (pushSubscription && base64.fromArrayBuffer(pushSubscription.options.applicationServerKey, true, true) != coreInfo.vapidPublicKey) {
								return this._unsubscribeToPush(pushSubscription);
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
				return this._registerPushSub(pushSubscription)
					.then(() => pushSubscription);
			});
	}

	_registerPushSub(pushSubscription) {
		return this.player.call('registerPushSub', {
			endpoint: pushSubscription.endpoint,
			p256dh: base64.fromArrayBuffer(pushSubscription.getKey("p256dh")),
			auth: base64.fromArrayBuffer(pushSubscription.getKey("auth")),
			...this._getNotifySettings(),
		});
	}

	_getNotifySettings() {
		return notifySettingKeys.reduce((a, k) => ({ ...a, [k]: this.model.props[k] }), {});
	}

	_unsubscribeToPush(pushSubscription) {
		let endpoint = pushSubscription.endpoint;
		return pushSubscription.unsubscribe()
			.catch(err => console.error("Error unsubscribing to pushSubscription " + endpoint, err))
			.then(() => this._unregisterPushSub(endpoint));
	}

	/**
	 * Unregister the pushSub from the core service for the specific
	 * pushSubscription endpoint. It does not attempt to unsubscribe to the
	 * pushSubscription. Any error is caught.
	 * @param {string} endpoint Endpoint string.
	 */
	_unregisterPushSub(endpoint) {
		return this.player.call('unregisterPushSub', { endpoint })
			.catch(err => console.error("Error unregistering pushSub " + endpoint + ": ", err));
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
		this.model.off('change', this._onModelChange);
	}
}

export default Notify;
