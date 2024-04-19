import reload from 'utils/reload';

const serviceWorkerSupported = 'serviceWorker' in navigator;
const namespace = 'module.serviceWorker';

/**
 * ServiceWorker register the service worker.
 */
class ServiceWorker {
	constructor(app, params) {
		this.app = app;

		this.disableWorker = !!params.disableWorker;

		// Bind callbacks
		this._onMessage = this._onMessage.bind(this);

		this.app.require([], this._init.bind(this));
	}

	_init() {
		this._tagOnClick = {};
		this.promise = this.disableWorker
			? Promise.reject("worker disabled")
			: new Promise((resolve, reject) => {
				this._register(resolve, reject);
			});
	}

	/**
	 * Attach an event handler function for one or more serviceworker message events.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.app.eventBus.on(this, events, handler, namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, namespace);
	}

	/**
	 * Gets the promise of the registration.
	 * @returns {Promise.<ServiceWorkerRegistration>} Service worker registration.
	 */
	getPromise() {
		return this.promise;
	}

	/**
	 * Clears the CacheStorage of all keys, and then performs a reload of the
	 * client using no-cache headers.
	 * @param {boolean} [updateServiceWorker] Flag to tell if the service-worker itself should be update. Defaults to false.
	 */
	clearCacheAndReload(updateServiceWorker) {
		Promise.resolve(caches?.keys().then(keys => {
			for (let key of keys) {
				caches.delete(key);
			}
		})).then(() => {
			if (updateServiceWorker && this.registration) {
				return this.registration.update();
			}
		}).then(() => {
			reload(true);
		});
	}

	/**
	 * Shows a notification. Notification permission must be obtained before calling.
	 *
	 * Normally you should use the module Notify and call notify.send(...)
	 * @param {string|LocaleString} title Title of the notification.
	 * @param {object} [opt] Optional parameters. Same as the Notification API with some additions.
	 * @param {number} [opt.duration] Duration the notification will be open in milliseconds. Defaults to 5000.
	 * @param {function} [opt.onClick] Callback called when notifications is clicked. Defaults to: n => { window.focus(); notification.close(); }
	 * @param {number} [opt.data] Data to pass on to the onClick callback.
	 * @param {boolean} [opt.alwaysNotify] Flag to always show notification even if window is in focus.
	 */
	showNotification(title, opt) {
		return this.promise.then(registration => {
			if (registration) {
				opt = Object.assign({}, opt);
				if (opt.onClick) {
					let tag = opt.tag || (Math.random() + 1).toString(36).substring(2) + Date.now();
					opt.tag = tag;
					this._tagOnClick[tag] = opt.onClick;
					delete opt.onClick;
				}
				registration.active.postMessage({ method: 'showNotification', title, opt });
			}
		});
	}

	_onMessage(ev) {
		let event = ev.data?.event;
		if (!event) {
			return;
		}

		if (event === 'notificationclick') {
			this._handleNotificationclick(ev.data);
		}
	}

	_handleNotificationclick(ev) {
		let { tag, data } = ev.params;
		// Check if we have tag onClick callback that comes from calling
		// showNotification direction, rather than getting the notification from
		// push.
		if (tag) {
			let cb = this._tagOnClick[tag];
			if (cb) {
				delete this._tagOnClick[tag];
				cb(data);
				return;
			}
		}

		// If the data contains an 'event' in itself, emit it toether with data.params.
		if (data?.event) {
			this.app.eventBus.emit(this, namespace + '.' + data.event, data.params);
		}
	}

	_register(resolve, reject) {
		if (!serviceWorkerSupported) {
			console.log("[ServiceWorker] Not supported");
			reject("not supported");
			return;
		}

		navigator.serviceWorker.addEventListener('message', this._onMessage);
		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			this.registration = registration;
			console.log("[ServiceWorker] Registered: ", registration);
			resolve(registration);
		}).catch(registrationError => {
			console.log("[ServiceWorker] Registration failed: ", registrationError);
			reject(registrationError);
		});
	}

	_unregister() {
		navigator.serviceWorker.removeEventListener('message', this._onMessage);
		this.registration?.unregister().then(success => {
			if (success) {
				console.log("[ServiceWorker] Unregistered");
				this.registration = null;
			} else {
				console.log("[ServiceWorker] Unregistration failed");
			}
		});
	}

	dispose() {
		this._unregister();
	}
}

export default ServiceWorker;
