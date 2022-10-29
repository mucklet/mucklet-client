/**
 * Turns an indexedDB request into a promise.
 * @param {*} req IndexedDB request.
 * @param {function} [onSuccess] Optional callback that handles a success and returns the resolved value. Defaults to: function(req, ev) -> ev
 * @param {function} [onError] Optional callback that handles an error and returns the rejected value. Defaults to: function(req, ev) -> ev
 * @returns {Promise} Promise of the request.
 */
export default function requestToPromise(req, onSuccess, onError) {
	return new Promise((resolve, reject) => {
		req.onsuccess = ev => {
			resolve(onSuccess ? onSuccess(req, ev) : ev);
		};
		req.onerror = ev => {
			reject(onError ? onError(req, ev) : ev);
		};
	});
}
