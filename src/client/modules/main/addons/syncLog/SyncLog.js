import getCtrlId from 'utils/getCtrlId';

/**
 * SyncLog is attempts to fetch missing char log entries on connect and
 * reconnects.
 */
class SyncLog {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlAdd = this._onCtrlAdd.bind(this);
		this._onCtrlRemove = this._onCtrlRemove.bind(this);
		this._onDisconnect = this._onDisconnect.bind(this);
		this._onConnect = this._onConnect.bind(this);

		this.app.require([
			'charLog',
			'charLogStore',
			'player',
			'api'
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.checkedChars = {};
		this.chars = {};

		this._setListeners(true);
	}

	_setListeners(on) {
		let p = this.module.player;
		let cb = on ? 'on' : 'off';
		this.module.api[cb]('connect', this._onConnect);
		this.module.api[cb]('disconnect', this._onDisconnect);
		p[cb]('ctrlAdd', this._onCtrlAdd);
		p[cb]('ctrlRemove', this._onCtrlRemove);
	}

	_onConnect() {
		// On connect
		for (let ctrlId in this.chars) {
			if (!this.checkedChars[ctrlId]) {
				this._checkChar(ctrlId, this.chars[ctrlId]);
			}
		}
	}

	_onDisconnect() {
		// We are disconnected. All characters need to be resynced.
		this.checkedChars = {};
	}

	_onCtrlAdd(ev) {
		let char = ev.char;
		let ctrlId = getCtrlId(char);
		this.chars[ctrlId] = char;
		if (!this.checkedChars[ctrlId]) {
			this._checkChar(ctrlId, char);
		}
	}

	_onCtrlRemove(ev) {
		delete this.chars[getCtrlId(ev.char)];
	}

	_checkChar(ctrlId, char) {
		this.checkedChars[ctrlId] = true;
		this._getLastEvents(ctrlId)
			.then(evs => this.module.api.call('log.events', 'get', {
				charId: char.id,
				puppeteerId: char.puppeteer ? char.puppeteer.id : undefined,
				startTime: evs.length ? evs[0].time : 0
			}).then(result => {
				for (let ev of result.events) {
					// If we don't have the event already, add it to charLog
					if (evs.findIndex(v => v.id == ev.id) == -1) {
						this.module.charLog.addEvent(ev, char);
					}
				}
			}))
			.catch(err => {
				console.error("[SyncLog] Error synchronizing char " + ctrlId + ": ", err);
			});
	}

	_getLastEvents(ctrlId) {
		let lastEvents = [];
		return this.module.charLogStore.getEvents(ctrlId, null, ev => {
			if (lastEvents.length) {
				if (lastEvents[0].time != ev.time) {
					return false;
				}
			}
			lastEvents.push(ev);
		}).then(() => lastEvents);
	}


	dispose() {
		this._setListeners(false);
		this.module = null;
	}

}

export default SyncLog;

