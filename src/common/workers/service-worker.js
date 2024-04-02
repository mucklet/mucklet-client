import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener(
	'pushsubscriptionchange',
	(event) => {
		const conv = (val) => btoa(String.fromCharCode.apply(null, new Uint8Array(val)));
		const getPayload = (subscription) => ({
			endpoint: subscription.endpoint,
			p256dh: conv(subscription.getKey('p256dh')),
			auth: conv(subscription.getKey('auth')),
		});

		const subscription = self.registration.pushManager
			.subscribe(event.oldSubscription.options)
			.then((subscription) =>
				fetch('register', {
					method: 'post',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({
						old: getPayload(event.oldSubscription),
						new: getPayload(subscription),
					}),
				}),
			);
		event.waitUntil(subscription);
	},
	false,
);
