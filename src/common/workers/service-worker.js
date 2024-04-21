import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

// {
// 	event: "asleep",
// 	params: {
// 		tag: "event_1234567"
// 		title: "Accipiter fell asleep",
// 		body: null,
// 		params: {
//			charId: 12312,
// 		}
// 	}
// }

const defaultIcon = '/android-chrome-192x192.png';

function getNotificationWithTag(tag) {
	if (!tag) {
		return Promise.resolve(null);
	}
	return self.registration.getNotifications().then((notifications) => {
		for (let n of notifications || []) {
			let ntag = n.tag;
			if (ntag) {
				let separatorIdx = ntag.indexOf('#');
				if (separatorIdx >= 0) {
					ntag = ntag.slice(0, separatorIdx);
				}
				if (tag === ntag) {
					return n;
				}
			}
		}
		return null;
	});
}

function showNotification(title, opt) {
	return isClientFocused().then(isFocused => {
		if (isFocused && !opt?.alwaysNotify) {
			return;
		}
		let dataStr = '';
		if (typeof opt?.data != 'undefined') {
			dataStr = '#' + JSON.stringify(opt.data);
		}
		let compositeTag = (opt?.tag || '') + dataStr;
		return getNotificationWithTag(opt?.tag).then(notification => {
			// If an existing notification matches the by tag prefix, use its tag as composite tag.
			if (notification) {
				compositeTag = notification.tag;
			}
			self.registration.showNotification(title, Object.assign({}, opt, { tag: compositeTag }));
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
				vibrate: notification.vibrate,
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
		let tag = event.notification.tag;
		event.notification.close();

		// Split tag and data
		let data = null;
		if (tag) {
			let separator = tag.indexOf('#');
			if (separator >= 0) {
				data = tag.slice(separator + 1);
				tag = tag.slice(0, separator);
				// Try parse data as json
				try { data = JSON.parse(data); } catch (ex) {}
			}
		}

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
