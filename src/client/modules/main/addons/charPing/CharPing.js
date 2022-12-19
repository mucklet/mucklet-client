const defaultDuration = 1000 * 60 * 15; // 15 minutes between successful pings
const defaultThreshold = 1000 * 60 * 60; // 60 minutes until character is put to sleep
const defaultRetry = 1000 * 60 * 1; // 1 minute between retries

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
		this._onWorkerError = this._onWorkerError.bind(this);
		this._onWorkerMessage = this._onWorkerMessage.bind(this);

		this.app.require([ 'player', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.controlled = null;
		this.timers = {};
		this.playerModel = this.module.player.getModel();
		this.playerModel.on('change', this._onModelChange);
		this._onModelChange();
		if (!this.useWs) {
			this.worker = new Worker(new URL('./CharPing.worker.js', import.meta.url));
			this.worker.onerror = this._onWorkerError;
			this.worker.onmessage = this._onWorkerMessage;
			this.worker.postMessage({
				cmd: 'config',
				params: {
					serviceUri: this.module.api.getWebResourceUri('core'),
					duration: this.duration,
					threshold: this.threshold,
					retry: this.retry,
				},
			});
		}
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

	_ping(char, since) {
		since = since || 0;
		char.call('ping').then(() => {
			// On successful ping
			let t = setTimeout(() => {
				if (this.timers[char.id] === t) {
					this._ping(char);
				}
			}, this.duration);
			this.timers[char.id] = t;
		}).catch(err => {
			// On failed ping
			let d = since < this.threshold ? this.retry : this.duration;
			console.error("Error pinging " + char.id + ". Retrying in " + (d / 1000) + " seconds: ", err);
			let t = setTimeout(() => {
				if (this.timers[char.id] === t) {
					this._ping(char, since + d);
				}
			}, d);
			this.timers[char.id] = t;
		});
	}

	_addChar(char, forceWs) {
		if (this.useWs || forceWs) {
			this._ping(char);
		} else {
			this.worker.postMessage({
				cmd: 'addCtrl',
				params: {
					charId: char.id,
					puppeteerId: char.puppeteer ? char.puppeteer.id : null,
				},
			});
		}
	}

	_removeChar(char) {
		if (this.timers[char.id]) {
			clearTimeout(this.timers[char.id]);
			delete this.timers[char.id];
		}
		if (!this.useWs) {
			this.worker.postMessage({
				cmd: 'removeCtrl',
				params: {
					charId: char.id,
					puppeteerId: char.puppeteer ? char.puppeteer.id : null,
				},
			});
		}
	}

	_onAdd(ev) {
		this._addChar(ev.item);
	}

	_onRemove(ev) {
		this._removeChar(ev.item);
	}

	_onWorkerError(ev) {
		console.error("CharPing worker error: ", ev);
	}

	_onWorkerMessage(event) {
		let dta = event.data;
		if (!dta || typeof dta != 'object') {
			console.error("[CharPing] Invalid worker message: ", dta);
			return;
		}

		let cmd = '_' + dta.cmd + 'WorkerCmd';
		if (typeof this[cmd] != 'function') {
			console.error("[CharPing] Unknown worker command: ", dta);
			return;
		}

		this[cmd](dta.params || {});
	}

	_useWsWorkerCmd(p) {
		let char = this.module.player.getControlledChar(p.charId);
		if (!char) {
			console.error("[CharPing] Char not controlled in useWs worker command: ", p);
			return;
		}
		if (p.puppeteerId && (!char.puppeteer || !char.puppeteer.id != p.puppeteerId)) {
			console.error("[CharPing] Char not controlled by puppeteer in useWs worker command: ", p);
			return;
		}
		console.log("[CharPing] Switch to WebSocket for char: ", p);
		this._addChar(char, true);
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
