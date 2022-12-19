import reload from 'utils/reload';

const serviceWorkerSupported = 'serviceWorker' in navigator;

/**
 * ServiceWorker register the service worker.
 */
class ServiceWorker {
	constructor(app, params) {
		this.app = app;

		this._register();
	}

	/**
	 * Clears the CacheStorage of all keys, and then performs a reload of the
	 * client using no-cache headers.
	 */
	clearCacheAndReload() {
		Promise.resolve(caches?.keys().then(keys => {
			for (let key of keys) {
				caches.delete(key);
			}
		})).then(() => reload(true));
	}

	_register() {
		if (!serviceWorkerSupported) {
			console.log("[ServiceWorker] Not supported");
			return;
		}

		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			this.registration = registration;
			console.log("[ServiceWorker] Registered: ", registration);
		}).catch(registrationError => {
			console.log("[ServiceWorker] Registration failed: ", registrationError);
		});
	}

	_unregister() {
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
