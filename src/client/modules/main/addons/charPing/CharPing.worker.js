let chars = {};

let cfg = {
	serviceUri: '/api/core',
	authenticateUrl: AUTH_AUTHENTICATE_URL,
	crossOrigin: API_CROSS_ORIGIN,
	duration: 1000 * 60 * 15,
	threshold: 1000 * 60 * 60,
	retry: 1000 * 60 * 1,
};

/**
 * Sends a ping POST for the controlled char
 * @param {*} charId ID of character to ping.
 * @param {*} puppeteerId ID of the character puppeteer.
 * @param {*} since Time since last successful ping when called
 *
 */
function pingChar(charId, puppeteerId, since) {
	since = since || 0;

	// Clear any previous ping timer
	let t = chars[charId];
	if (t) {
		clearTimeout(t);
	}

	let url = cfg.serviceUri + '/char/' + (puppeteerId ? puppeteerId + '/puppet/' : '') + charId + '/ctrl/ping';
	fetch(url, {
		method: 'POST',
		mode: 'cors',
		credentials: cfg.crossOrigin ? 'include' : 'same-origin',
	}).then(resp => {
		if (resp.status < 200 || resp.status >= 300) {
			// Access denied likely means the token cookie wasn't included
			// We try to refresh the token by calling authenticate endpoint.
			if (resp.status == 401) {
				return fetch(cfg.authenticateUrl, {
					method: 'POST',
					mode: 'cors',
					credentials: cfg.crossOrigin ? 'include' : 'same-origin',
				}).then(resp => {
					return resp.text().then(text => {
						let result = JSON.parse(text);
						if (result?.error) {
							// A proper error messages means we are not logged in.
							postMessage({
								cmd: 'notLoggedIn',
							});
							return Promise.reject(result.error);
						}
					});
				}).then(() => {
					throw resp;
				});
			}
			return Promise.reject(resp);
		}
		// On successful ping
		t = setTimeout(() => {
			if (chars[charId] === t) {
				pingChar(charId, puppeteerId);
			}
		}, cfg.duration);
		chars[charId] = t;
	}).catch(resp => {
		// On failed ping
		let d = since < cfg.threshold ? cfg.retry : cfg.duration;
		console.error("[CharPing worker] Error pinging " + charId + ". Retrying in " + (d / 1000) + " seconds:", resp);
		t = setTimeout(() => {
			if (chars[charId] === t) {
				pingChar(charId, puppeteerId, since + d);
			}
		}, d);
		chars[charId] = t;
	});
}

let cmds = {
	config: p => cfg = Object.assign(cfg, p),
	addCtrl: p => {
		pingChar(p.charId, p.puppeteerId, 0);
	},
	removeCtrl: p => {
		let t = chars[p.charId];
		if (t) {
			clearTimeout(t);
			delete chars[p.charId];
		}
	},
};

onmessage = function (event) {
	let dta = event.data;
	if (!dta || typeof dta != 'object') {
		console.error("[CharPing worker] Invalid message: ", dta);
		return;
	}

	let cmd = cmds[dta.cmd];
	if (!cmd) {
		console.error("[CharPing worker] Unknown command: ", dta);
		return;
	}

	cmd(dta.params);
};
