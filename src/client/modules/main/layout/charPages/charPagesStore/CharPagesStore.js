import indexedDB from 'utils/indexedDB';

const charPagesDB = 'charPanel';
const charPagesDBPrefix = charPagesDB + '.';
const charStore = 'char';

function toPromise(req, onSuccess, onError) {
	return new Promise((resolve, reject) => {
		req.onsuccess = ev => {
			resolve(onSuccess ? onSuccess(req, ev) : ev);
		};
		req.onerror = ev => {
			reject(onError ? onError(req, ev) : ev);
		};
	});
}

/**
 * CharPagesStore stores characters after being looked at.
 */
class CharPagesStore {
	constructor(app, params) {
		this.app = app;

		this.useLocalStorage = params.useLocalStorage || !indexedDB;

		this._init();
	}

	_init(module) {
		this.dbPromise = this._openDB();
	}

	/**
	 * Set a char in the store as seen by a controlled character.
	 * @param {string} ctrlId Id of controlled character.
	 * @param {Model} char Character model.
	 * @returns {Promise.<boolean>} Promise to setting the char object. The boolean flags if the setting was successful.
	 */
	setChar(ctrlId, char) {
		return this.dbPromise.then(db => toPromise(
			db.transaction(charStore, 'readwrite')
				.objectStore(charStore)
				.put({ ctrlId, charId: char.id, char }),
			(req, ev) => true,
			(req, ev) => console.error("Failed to store char: ", char, ev),
		)).catch(ev => {
			if (localStorage) {
				localStorage.setItem(charPagesDBPrefix + ctrlId + '.' + char.id, JSON.stringify(char));
				return true;
			}
			return false;
		});
	}

	/**
	 * Get a char object as seen last by a controlled character from the store.
	 * @param {string} ctrlId Id of controlled character.
	 * @param {string} charId Id of character.
	 * @returns {Promise.<object>} Promise to char object.
	 */
	getChar(ctrlId, charId) {
		return this.dbPromise.then(db => toPromise(
			db.transaction(charStore)
				.objectStore(charStore)
				.get([ ctrlId, charId ]),
			(r, ev) => r.result ? r.result.char : { id: charId },
			(r, ev) => console.error("Error getting char: ", ev),
		)).catch(() => {
			let data = localStorage ? localStorage.getItem(charPagesDBPrefix + ctrlId + '.' + charId) : null;
			return data ? JSON.parse(data) : { id: charId };
		});
	}

	_openDB() {
		if (this.useLocalStorage) return Promise.reject();

		let req = indexedDB.open(charPagesDB, 1);
		req.onupgradeneeded = (ev) => {
			let db = ev.target.result;
			this.charStore = db.createObjectStore(charStore, { keyPath: [ "ctrlId", "charId" ] });
		};

		return toPromise(
			req,
			(r, ev) => r.result,
			(r, ev) => {
				console.error("Error opening " + charPagesDB + ": ", ev);
				this.useLocalStorage = true;
			},
		);
	}

	dispose() {

	}
}

export default CharPagesStore;
