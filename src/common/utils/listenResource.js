/**
 * Listens or unlistens to a resource. If a callback is provided, it will
 * listen/unlisten to change on the resource, using the callback.
 * @param {Model|Collection} resource Resource object.
 * @param {boolean} [on] Listens if true, otherwise unlistens. Defaults to true.
 * @param {function} [onEvent] Callback function to call on evennt.
 * @param {function} [event] Event to listen to. Ignored if no callback is given. Defaults to 'change'.
 * @returns {Model|Collection} Resource being listened to.
 */
export default function listenResource(resource, on, onEvent, event) {
	if (resource) {
		let method = on || typeof on == 'undefined' ? 'on' : 'off';
		if (typeof resource[method] == 'function') {
			if (onEvent) {
				resource[method](event || 'change', onEvent);
			} else {
				resource[method]();
			}
		}
	}
	return resource;
}

/**
 * Unlistens to one resource and starts listening to a second. If a callback is
 * provided, it will listen/unlisten to change on the resource, using the
 * callback.
 * @param {Model|Collection} oldResource Resource object to stop listening to.
 * @param {Model|Collection} newResource Resource object to start listening to.
 * @param {function} [onEvent] Callback function to call on change.
 * @param {function} [event] Event to listen to. Ignored if no callback is given. Defaults to 'change'.
 * @returns {Model|Collection?} Resource being listened to, or null if no resource was provided;
 */
export function relistenResource(oldResource, newResource, onEvent, event) {
	newResource = newResource || null;
	listenResource(oldResource, false, onEvent, event);
	listenResource(newResource, true, onEvent, event);
	return newResource;
}
