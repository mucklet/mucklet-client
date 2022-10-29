import indexedDB from 'utils/indexedDB';
import requestToPromise from 'utils/requestToPromise';

const charLogDBPrefix = 'charLog.';
const eventStore = 'event';
const timeIndex = 'time';
const charIdIndex = 'charId';
const logStoragePrefix = 'log.';

function getKey(ctrlId, ev) {
	return logStoragePrefix + ('0' + ev.time).slice(-13) + '.' + ev.id + '.' + ctrlId;
}

/**
 * CharLogStore stores character logs.
 */
class CharLogStore {
	constructor(app, params) {
		this.app = app;

		this.useLocalStorage = params.useLocalStorage || !indexedDB;

		// Bind callbacks
		this._onSettingsChange = this._onSettingsChange.bind(this);

		this.app.require([ 'charLogSettings', 'player', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLogSettings.getSettingsPromise().then(settings => {
			this.settings = settings;
			this._listenSettings(true);
			this._onSettingsChange();
			return settings;
		});

		this.dbPromise = null;
		this.db = null;
	}

	_listenSettings(on) {
		if (this.settings) {
			this.settings[on ? 'on' : 'off']('change', this._onSettingsChange);
		}
	}

	_getDb() {
		if (!this.dbPromise) {
			this.dbPromise = this.module.charLogSettings.getSettingsPromise()
				.then(settings => this._openDB(settings));
		}
		return this.dbPromise;
	}

	/**
	 * Add an event to the store.
	 * @param {string} ctrlId ID of controlled character. May be a combined ID if a puppet.
	 * @param {object} ev Object event. Must have a unique id value.
	 * @returns {Promise.<boolean>} Promise to setting the event object. The boolean flags if the setting was successful.
	 */
	addEvent(ctrlId, ev) {
		return this._getDb()
			.then(db => this._addIndexedDBEvent(db, ctrlId, ev))
			.catch(() => this._addStorageEvent(ctrlId, ev));
	}

	/**
	 * Get a char object as seen last by a controlled character from the store.
	 * @param {string} ctrlId ID of controlled character. May be a combined ID if a puppet.
	 * @param {number} time Timestamp in milliseconds from where to start fetching.
	 * @param {function} onEach Callback that that is called on each found item. If it returns false, the iteration will stop
	 * @returns {Promise.<object>} Promise to char object.
	 */
	getEvents(ctrlId, time, onEach) {
		return this._getDb()
			.then(db => this._getIndexedDBEvents(db, ctrlId, time, onEach))
			.catch(() => this._getStorageEvents(ctrlId, time, onEach));
	}

	_addIndexedDBEvent(db, ctrlId, ev) {
		return requestToPromise(
			db.transaction(eventStore, 'readwrite')
				.objectStore(eventStore)
				.put({ ctrlId, ev }),
			(req, ev) => true,
			(req, ev) => console.error("Failed to store event: ", ctrlId, ev)
		);
	}

	_addStorageEvent(ctrlId, ev) {
		this._loadSessionStore();
		if (!this.keys) return;

		let store = window.sessionStorage;
		let key = getKey(ctrlId, ev);
		let data = JSON.stringify(ev);
		let retry = 100;
		while (retry) {
			try {
				store.setItem(key, data);
				this.keys.push(key);
				return;
			} catch (e) {
				console.error("Error writing char log: ", key, e);
				// Probably out of space. Try to remove oldest key
				if (!this.keys.length) {
					return;
				}
				retry--;
				if (!retry) throw e;
				store.removeItem(this.keys.shift());
			}
		}
	}

	_getIndexedDBEvents(db, ctrlId, time, onEach, mode) {
		return new Promise((resolve, reject) => {
			let req = db.transaction(eventStore, mode || 'readonly')
				.objectStore(eventStore)
				.index(timeIndex)
				.openCursor(IDBKeyRange.upperBound([ ctrlId, time || Number.MAX_SAFE_INTEGER ]), 'prev');
			req.onsuccess = e => {
				let cursor = e.target.result;

				if (cursor) {
					let v = cursor.value;
					if (v.ctrlId == ctrlId && onEach(cursor.value.ev, cursor) !== false) {
						cursor.continue();
						return;
					}
				}

				resolve(req);
			};
			req.onerror = e => {
				reject(e);
			};
		});
	}

	_getStorageEvents(ctrlId, time, onEach) {
		let l = this._getSessionLog(ctrlId);
		if (!l) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			for (let i = l.length - 1; i >= 0; i--) {
				let ev = l[i];
				if (time && time < ev.time) {
					continue;
				}

				if (onEach(ev) === false) {
					break;
				}
			}

			resolve();
		});
	}

	_getSessionLog(ctrlId) {
		this._loadSessionStore();
		return this.charLogs && this.charLogs[ctrlId];
	}

	_loadSessionStore() {
		let store = window.sessionStorage;
		if (!store || this.keys) return;

		let len = store.length;
		let keys = [];
		let charLogs = {};
		for (let i = 0; i < len; i++) {
			let k = store.key(i);
			if (k && k.substring(0, logStoragePrefix.length) == logStoragePrefix) {
				keys.push(k);
			}
		}

		keys.sort();

		for (let k of keys) {
			let idx = k.lastIndexOf('.');
			if (idx < 0) continue;

			try {
				let ev = JSON.parse(store.getItem(k));
				if (ev) {
					let ctrlId = k.slice(idx + 1);
					let l = charLogs[ctrlId];
					if (!l) {
						l = [];
						charLogs[ctrlId] = l;
					}
					l.push(ev);
				}
			} catch (e) {
				console.error("Error loading log key " + k + ": ", e);
			}
		}

		this.keys = keys;
		this.charLogs = charLogs;
	}

	_openDB(settings) {
		if (settings && !settings.useLocalStorage) return Promise.reject();

		return this.module.login.getLoginPromise().then(user => {
			let dbName = charLogDBPrefix + user.id;
			let req = indexedDB.open(dbName, 1);
			req.onupgradeneeded = (ev) => {
				let db = ev.target.result;
				let store = db.createObjectStore(eventStore, { keyPath: [ "ctrlId", "ev.id" ] });
				store.createIndex(timeIndex, [ "ctrlId", "ev.time" ]);
				store.createIndex(charIdIndex, [ "ctrlId", "ev.char.id" ]);
			};

			return requestToPromise(
				req,
				(r, ev) => {
					this.db = r.result;
					return this.db;
				},
				(r, ev) => {
					console.error("Error opening " + dbName + ": ", ev);
					this.useLocalStorage = true;
				}
			);
		});
	}

	_onSettingsChange(change) {
		let useLocal = this.settings.useLocalStorage;

		if (!change) {
			if (useLocal) {
				this._migrateToIndexedDB();
			}
			return;
		}

		if (change.hasOwnProperty('useLocalStorage')) {
			this._getPlayerCtrlIds().then(ctrlIds => {
				if (useLocal) {
					this._moveToIndexedDB(ctrlIds);
				} else {
					this._moveToSessionStorage(ctrlIds);
				}
			});
		}
	}

	_getPlayerCtrlIds() {
		return this.module.player.getPlayerPromise().then(player => {
			let ctrlIds = player.chars.toArray().map(c => c.id);
			return ctrlIds.concat(player.puppets.toArray().map(p => p.puppet.id + '_' + p.char.id));
		});
	}

	// [Legacy] Migrates events from localStorage to IndexedDB
	_migrateToIndexedDB() {
		let store = window.localStorage;
		if (!store) return;

		this._getDb().then(db => {
			let keys = [];
			let len = store.length;
			for (let i = 0; i < len; i++) {
				let k = store.key(i);
				if (k && k.substring(0, logStoragePrefix.length) == logStoragePrefix) {
					keys.push(k);
				}
			}

			if (!keys.length) return;

			let objstore = db.transaction(eventStore, 'readwrite')
				.objectStore(eventStore);

			for (let k of keys) {
				let idx = k.lastIndexOf('.');
				if (idx < 0) continue;

				try {
					let ev = JSON.parse(store.getItem(k));
					let req = objstore.put({ ctrlId: k.slice(idx + 1), ev });
					req.onerror = ev => console.error("Failed to store migrated log key " + k + ": ", ev);
					req.onsuccess = () => store.removeItem(k);
				} catch (e) {
					console.error("Error migrating log key: " + k);
				}
			}
		}).catch(err => {
			console.error("Error migrating: ", err);
		});
	}

	_moveToIndexedDB(ctrlIds) {
		this.dbPromise = null;
		this._getDb().then(db => {
			this._loadSessionStore();
			if (!this.keys) return;

			let objstore = db.transaction(eventStore, 'readwrite')
				.objectStore(eventStore);

			let ctrlIdMap = {};
			for (let ctrlId of ctrlIds) {
				ctrlIdMap[ctrlId] = true;
				let l = this.charLogs[ctrlId];
				if (l) {
					for (let ev of l) {
						let req = objstore.put({ ctrlId, ev });
						req.onerror = ev => console.error("Failed to move log event " + ctrlId + ": ", ev);
					}
				}
			}

			// Clear all log entries for owned characters and puppets from sessionStorage
			let store = window.sessionStorage;
			for (let k of this.keys) {
				let idx = k.lastIndexOf('.');
				if (idx < 0) continue;
				if (ctrlIdMap[k.slice(idx + 1)]) {
					store.removeItem(k);
				}
			}
			this.keys = null;
			this.charLogs = null;
		}).catch(err => {
			console.error("Error moving logs to indexedDB: ", err);
		});
	}

	_moveToSessionStorage(ctrlIds) {
		(this.db
			? Promise.resolve(this.db)
			: this._openDB()
		).then(db => {
			let store = window.sessionStorage;
			if (!store) return;

			let hasError = false;
			for (let ctrlId of ctrlIds) {
				this._getIndexedDBEvents(db, ctrlId, null, (ev, cur) => {
					let key = getKey(ctrlId, ev);
					let data = JSON.stringify(ev);
					try {
						store.setItem(key, data);
					} catch (e) {
						if (!hasError) {
							console.error("Error moving logs to sessionStorage: ", e);
							hasError = true;
						}
					}
					cur.delete();
				}, 'readwrite');
			}
			this._closeDb();
		});
	}

	_closeDb() {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
		this.dbPromise = null;
		this.keys = null;
		this.charLogs = null;
	}

	dispose() {
		this._closeDb();
	}
}

export default CharLogStore;
