const defaultDuration = 1000 * 60 * 15; // 15 minutes between successful pings
const defaultThreshold = 1000 * 60 * 60; // 60 minutes until character is put to sleep
const defaultRetry = 1000 * 60 * 1; // 1 minute between retries

const authenticateUrl = AUTH_AUTHENTICATE_URL;
const crossOrigin = API_CROSS_ORIGIN;

/**
 * CharPing periodically sends a ping for all controlled characters
 * to ensure they are not released out of inactivity
 */
class CharPing {

	constructor(app, params) {
		this.app = app;
		this.duration = Number(params.duration || defaultDuration);
		this.threshold = Number(params.threshold || defaultThreshold);
		this.retry = Number(params.retry || defaultRetry);
		this.useWs = params.method === "ws";

		// Bind callbacks
		this._onModelChange = this._onModelChange.bind(this);
		this._onAdd = this._onAdd.bind(this);
		this._onRemove = this._onRemove.bind(this);

		this.app.require([
			'auth',
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.controlled = null;
		this.timers = {};
		this.playerModel = this.module.player.getModel();
		this.playerModel.on('change', this._onModelChange);
		this._onModelChange();
	}

	_onModelChange() {
		let c = this.module.player.getControlled();
		if (c === this.controlled) return;

		this._setEventListeners(false);
		this.controlled = c;
		this._setEventListeners(true);
	}

	_setEventListeners(on) {
		let c = this.controlled;
		if (!c) return;
		if (on) {
			c.on('add', this._onAdd);
			c.on('remove', this._onRemove);
			for (let char of c) {
				this._addChar(char);
			}
		} else {
			c.off('add', this._onAdd);
			c.off('remove', this._onRemove);
			for (let char of c) {
				this._removeChar(char);
			}
			this.timers = {};
		}
	}

	/**
	 * Sends a ping POST for the controlled char
	 * @param {*} charId ID of character to ping.
	 * @param {*} puppeteerId ID of the character puppeteer.
	 * @param {*} since Time since last successful ping when called
	 *
	 */
	_pingChar(charId, puppeteerId, since) {
		since = since || 0;

		// Clear any previous ping timer
		let t = this.timers[charId];
		if (t) {
			clearTimeout(t);
		}

		let url = this.module.api.getWebResourceUri('core') + '/char/' + (puppeteerId ? puppeteerId + '/puppet/' : '') + charId + '/ctrl/ping';
		fetch(url, {
			method: 'POST',
			mode: 'cors',
			credentials: crossOrigin ? 'include' : 'same-origin',
		}).then(resp => {
			if (resp.status < 200 || resp.status >= 300) {
				// Access denied likely means the token cookie wasn't included
				// We try to refresh the token by calling authenticate endpoint.
				if (resp.status == 401) {
					return fetch(authenticateUrl, {
						method: 'POST',
						mode: 'cors',
						credentials: crossOrigin ? 'include' : 'same-origin',
					}).then(authResp => {
						return authResp.text().then(text => {
							if (text) {
								try {
									let result = JSON.parse(text);
									if (result?.error) {
										// A proper error messages means we are not logged in.
										this.module.auth.redirectToLogin(true);
										return Promise.reject(result.error);
									}
								} catch (ex) {}
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
				if (this.timers[charId] === t) {
					this._pingChar(charId, puppeteerId);
				}
			}, this.duration);
			this.timers[charId] = t;
		}).catch(resp => {
			// On failed ping
			let d = since < this.threshold ? this.retry : this.duration;
			console.error("[CharPing worker] Error pinging " + charId + ". Retrying in " + (d / 1000) + " seconds:", resp);
			t = setTimeout(() => {
				if (this.timers[charId] === t) {
					this._pingChar(charId, puppeteerId, since + d);
				}
			}, d);
			this.timers[charId] = t;
		});
	}

	_wsPingChar(char, since) {
		since = since || 0;
		char.call('ping').then(() => {
			// On successful ping
			let t = setTimeout(() => {
				if (this.timers[char.id] === t) {
					this._wsPingChar(char);
				}
			}, this.duration);
			this.timers[char.id] = t;
		}).catch(err => {
			// On failed ping
			let d = since < this.threshold ? this.retry : this.duration;
			console.error("Error pinging " + char.id + ". Retrying in " + (d / 1000) + " seconds: ", err);
			let t = setTimeout(() => {
				if (this.timers[char.id] === t) {
					this._wsPingChar(char, since + d);
				}
			}, d);
			this.timers[char.id] = t;
		});
	}

	_addChar(char, forceWs) {
		if (this.useWs || forceWs) {
			this._wsPingChar(char);
		} else {
			this._pingChar(char.id, char.puppeteer ? char.puppeteer.id : null, 0);
		}
	}

	_removeChar(char) {
		let t = this.timers[char.id];
		if (t) {
			clearTimeout(t);
			delete this.timers[char.id];
		}
	}

	_onAdd(ev) {
		this._addChar(ev.item);
	}

	_onRemove(ev) {
		this._removeChar(ev.item);
	}

	dispose() {
		this._setEventListeners(false);
		if (!this.useWs) {
			this.worker.terminate();
			this.worker = null;
		}
		this.controlled = null;
		this.playerModel.off('change', this._onModelChange);
	}
}

export default CharPing;
