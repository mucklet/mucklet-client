const serviceWorkerSupported = 'serviceWorker' in navigator;

/**
 * ServiceWorker register the service worker.
 */
class ServiceWorker {
	constructor(app, params) {
		this.app = app;

		this._register();
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

	dispose() {
		this.registration?.unregister().then(success => {
			if (success) {
				console.log("[ServiceWorker] Unregistered");
				this.registration = null;
			} else {
				console.log("[ServiceWorker] Unregistration failed");
			}
		});
	}
}

export default ServiceWorker;
