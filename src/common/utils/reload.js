let cbs = [];
let forced = false;

function locationReload(clearQuery, force) {
	forced = true;
	setTimeout(() => forced = false, 100);

	let href = window.location.href;
	let url = clearQuery ? href.split('?')[0] : href;
	if (url == href) {
		window.location.reload();
	} else {
		window.location.replace(url);
	}
}

export function addBeforeUnload(f) {
	let cb = e => {
		if (forced) return;
		return f(e);
	};
	window.addEventListener('beforeunload', cb);
	cbs.push({ cb, f });
}

export function removeBeforeUnload(f) {
	cbs = cbs.filter(o => {
		let found = o.f == f;
		if (found) {
			window.addEventListener('beforeunload', o.cb);
		}
		return !found;
	});
}

/**
 * Reloads the client.
 * @param {boolean} [clearCache] Flag if the cache should be cleared. Defaults to false.
 * @param {boolean} [clearQuery] Flag if the query should be cleared. Defaults to false.
 */
export default function reload(clearCache, clearQuery) {
	if (clearCache) {
		// Try to evict old version from cache
		fetch(window.location.href, {
			headers: {
				"Pragma": "no-cache",
				"Expires": -1,
				"Cache-Control": "no-cache",
			},
		}).then(() => locationReload(clearQuery));
	} else {
		locationReload(clearQuery);
	}
};

export function redirect(url, includeQuery) {
	forced = true;
	setTimeout(() => forced = false, 100);

	let href = window.location.href;
	if (includeQuery) {
		let idx = href.indexOf('?');
		if (idx >= 0) {
			url = url + (url.indexOf('?') >= 0 ? '&' : '?') + href.slice(idx + 1).split('#')[0];
		}
	}
	if (url == href) {
		window.location.reload();
	} else {
		window.location.replace(url);
	}
};
