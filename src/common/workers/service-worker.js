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
 * Closes all existing notifications that matches the tag or the tag's prefix
 * (which is the first part of the tag, separated from the rest by a colon (:)),
 * and returns a promise to the eventCount that the closed notifications
 * represent.
 * @param {string} tag Tag to match either by whole tag name or tag prefix.
 * @returns {Promise<number>} EventCount that the closed notifications
 * represent.
 */
function closeNotifications(tag) {
	let idx = tag.indexOf(':');
	let prefix = idx < 0 ? '' : tag.slice(0, idx + 1);

	return self.registration.getNotifications().then((notifications) => {
		// Create copy to ensure the notifications list does not change during
		// iteration when closing them. Just a precaution.
		notifications = Array.from(notifications);
		let count = 0;
		for (let n of notifications || []) {
			// If the tag has the tag prefix, we close it and increase the count.
			if ((prefix && n.tag?.startsWith(prefix)) || n.tag === tag) {
				count += (parseCompositeTag(n.tag).data?.eventCount || 0) + 1;
				n.close();
			}
		}
		return count;
	});
}

/**
 * Splits a composite tag (tag + "#" + JSON.stringify(data)) and returns the tag
 * and the data part as a string, or null if no separator existed.
 * @param {string} tag Composite tag.
 * @returns {{ tag: string, data: string | null }} Tag and data.
 */
function splitCompositeTag(tag) {
	let data = undefined;
	if (tag) {
		let separator = tag.indexOf('#');
		if (separator >= 0) {
			data = tag.slice(separator + 1);
			tag = tag.slice(0, separator);
		}
	}
	return { tag, data };
}


/**
 * Parses a composite tag (tag + "#" + JSON.stringify(data)) and returns the tag
 * and any parsed data.
 * @param {string} compositeTag Composite tag.
 * @returns {{ tag: string, data: any }} Tag and data.
 */
function parseCompositeTag(compositeTag) {
	let { tag, data } = splitCompositeTag(compositeTag);
	if (data) {
		// Try parse data as json
		try { data = JSON.parse(data); } catch (ex) {
			console.error(`error parsing composite notification tag: ${compositeTag}`, ex);
		}
	}
	return { tag, data };
}

/**
 * Shows a notification. If opt.tag is set, any other notification with the same
 * tag is closed, and opt.data.eventCount will be increased to show an
 * additional text in the body: "+X other events"
 * @param {string} title Notification title
 * @param {object} opt Optional parameters.
 * @param {string} opt.tag Tag identifying the notification.
 * @param {string} opt.body Body text. Defaults to no body.
 * @param {boolean} opt.alwaysNotify Flag to tell to send notification even if client is in focus. Defaults to false.
 * @param {string} opt.icon Icon path. Defaults to realm icon.,
 * @param {string} opt.badge Badge image path. Defaults to mucklet logo.
 * @param {boolean} opt.vibrate Flag to tell phone to vibrate on notification. Defaults to false.
 * @param {string} opt.duration Duration in millseconds to show the notification before removing it. Defaults to no auto removal.
 * @param {{ event?: string, params?: any, eventCount?: number }} opt.data Data attached to the notification.
 * @returns {Promise<any>}
 */
function showNotification(title, opt) {
	return isClientFocused().then(isFocused => {
		if (isFocused && !opt?.alwaysNotify) {
			return;
		}
		let tag = opt?.tag;
		return closeNotifications(tag).then(eventCount => {
			let data = opt?.data || null;
			// If existing notifications matched the by tag prefix, increase the eventCount.
			if (eventCount) {
				data = Object.assign({ eventCount: 0 }, data);
				data.eventCount += eventCount;
			}
			// Extend tag with data to make it a composite tag.
			tag += data ? '#' + JSON.stringify(data) : '';
			let body = opt?.body;
			let count = data?.eventCount;
			if (count) {
				// Append "+X other event(s)" to event body.
				body = (body ? body + "\n" : '') +
					(count == 1
						? "+1 other event."
						: `+${count} other events.`
					);
			}
			return self.registration.showNotification(title, Object.assign({}, opt, { tag, body }))
				.then(() => {
					if (opt?.duration) {
						// If we have a duration, set a timeout to close it afterwards.
						self.setTimeout(() => {
							self.registration.getNotifications()
								.then(notifications => {
									let notification = notifications.find(notification => notification.tag === tag);
									if (notification) {
										notification.close();
									}
								});

						}, opt.duration);
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
				event.waitUntil(closeNotifications(data.tag));
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

		// Split tag and data
		let { tag, data } = parseCompositeTag(event.notification.tag);

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
