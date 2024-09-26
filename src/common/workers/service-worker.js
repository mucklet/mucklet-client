import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

const SW_VERSION = '1';

self.addEventListener('install', (event) => {
	console.log("[Service Worker] Install v" + SW_VERSION);
	skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log("[Service Worker] Activate v" + SW_VERSION);
	skipWaiting();
});

const defaultIcon = '/android-chrome-192x192.png';
const defaultBadge = '/badgemask-96x96.png';

/**
 * Gets a single notification by tag.
 * @param {string} tag Tag.
 * @returns {Promise<Notification|null>} Promise to the notification or null if no notification matches the tag.
 */
function getNotification(tag) {
	return tag
		? self.registration.getNotifications()
			.then(notifications => (notifications.find(notification => notification.tag === tag) || null))
		: Promise.resolve(null);
}

/**
 * Closes the notification matching the tag.
 * @param {string} tag Tag.
 * @returns {Promise<Notification|null>} Promise of the closed notification, or null if no notification was closed.
 */
function closeNotification(tag) {
	return getNotification(tag).then(notification => {
		// Try close, and swallow any error.
		try {
			notification?.close();
		} catch (ex) {
			notification = null;
		}
		return notification;
	});
}

/**
 * Shows a notification. If opt.tag is set, any other notification with the same
 * tag is closed.
 * @param {string} title Notification title
 * @param {object} opt Optional parameters.
 * @param {string} opt.tag Tag identifying the notification.
 * @param {string} opt.body Body text. Defaults to no body.
 * @param {boolean} opt.alwaysNotify Flag to tell to send notification even if client is in focus. Defaults to false.
 * @param {string} opt.icon Icon path. Defaults to realm icon.,
 * @param {string} opt.badge Badge image path. Defaults to mucklet logo.
 * @param {boolean} opt.vibrate Flag to tell phone to vibrate on notification. Defaults to false.
 * @param {string} opt.duration Duration in millseconds to show the notification before removing it. Defaults to no auto removal.
 * @param {{ event?: string, params?: any }} opt.data Data attached to the notification.
 * @returns {Promise<any>}
 */
function showNotification(title, opt) {
	return isClientFocused().then(isFocused => {
		if (isFocused && !opt?.alwaysNotify) {
			return;
		}

		return getNotification(opt?.tag).then(notification => {
			return self.registration.showNotification(title, Object.assign({
				renotify: notification ? true : undefined,
			}, opt)).then(() => {
				if (opt?.duration && opt?.tag) {
					// If we have a duration, set a timeout to close it afterwards.
					self.setTimeout(() => closeNotification(opt.tag), opt.duration);
				}
			});
		});
	});
}

// isClientPath checks if the client url's pathname matches that of path.
function isClientPath(client, path) {
	return (new URL(client.url, 'http://example.com')).pathname == path;
}

function isClientFocused() {
	return self.clients
		.matchAll({
			includeUncontrolled: true,
			type: 'window',
		})
		.then((clientList) => {
			for (const client of clientList) {
				if (isClientPath(client, '/')) {
					if (client.focused) {
						return true;
					}
				}
			}
			return false;
		});
}

// Handle messages
self.addEventListener(
	'message',
	(event) => {
		let data = event.data;
		if (!data || typeof data != 'object') {
			return;
		}
		switch (data?.method) {
			case 'showNotification':
				event.waitUntil(showNotification(data.title, data.opt));
				break;

			case 'closeNotification':
				event.waitUntil(closeNotification(data.tag));
				break;
		}
	},
);

// Handle push events
self.addEventListener(
	'push',
	(event) => {
		try {
			let data = event.data?.json();
			let notification = data?.notification;
			if (!notification) {
				throw "missing notification property";
			}
			if (!notification.title) {
				throw "missing title";
			}

			event.waitUntil(showNotification(notification.title, {
				tag: notification.tag || undefined,
				body: notification.body || undefined,
				alwaysNotify: notification.alwaysNotify,
				icon: notification.icon || defaultIcon,
				badge: notification.badge || defaultBadge,
				vibrate: notification.vibrate,
				duration: notification.duration || undefined,
				data: data.event || data.params
					? { event: data.event || undefined, params: data.params || undefined }
					: undefined,
			}));
		} catch (ex) {
			console.log("error handling push: ", ex);
			self.registration.showNotification('How strange', {
				body: "Something went wrong with this notification. Contact support@mucklet.com to sort it out.",
			});
		}

	},
);

// Handle notification click
self.addEventListener(
	'notificationclick',
	(event) => {
		// Always close on click
		event.notification.close();

		// Get tag and data
		let tag = event.notification.tag || null;
		let data = event.notification.data || null;

		// This looks to see if the client is already open and
		// focuses if it is
		event.waitUntil(self.clients
			.matchAll({
				includeUncontrolled: true,
				type: 'window',
			})
			.then((clientList) => {
				let selectedClient = null;
				for (const client of clientList) {
					if (isClientPath(client, '/')) {
						// Prioritize any client that is already in focus
						if (client.focused) {
							selectedClient = client;
							break;
						}
						if ('focus' in client) {
							selectedClient = selectedClient || client;
						}
					}
				}
				if (selectedClient) {
					selectedClient.postMessage({ event: 'notificationclick', params: { tag, data }});
					return selectedClient.focus();
				}
				if (clients.openWindow) {
					return clients.openWindow('/');
				}
			}),
		);
	},
);
