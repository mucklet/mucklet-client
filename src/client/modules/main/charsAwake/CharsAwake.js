import { Model, ModelToCollection, ModelWrapper, ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { isResError } from 'resclient';
import CharFilter from 'classes/CharFilter';

const charsAwakeStoragePrefix = 'charsAwake.user.';

/**
 * CharsAwake holds a list of awake characters.
 */
class CharsAwake {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onChange = this._onChange.bind(this);
		this._onWatchesChange = this._onWatchesChange.bind(this);
		this._onTagChange = this._onTagChange.bind(this);
		this._onCharTagsChange = this._onCharTagsChange.bind(this);
		this._onCharEvent = this._onCharEvent.bind(this);

		this.app.require([
			'auth',
			'api',
			'notify',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = new Model({ data: { charsAwake: null, watches: null, notes: null, showLfrp: false, filter: '', showAll: true }, eventBus: this.app.eventBus });
		this.filter = new CharFilter('');
		this.charsAwake = new ModelWrapper(null, {
			map: (k, v) => new ModifyModel(v, {
				props: { match: this.filter.match(v), watch: this._isWatched(k) },
				isModifiedProperty: null,
				onChange: m => m.set({ match: this.filter.match(m.getModel()) }),
			}),
			dispose: (k, m) => m.dispose(),
		});
		this.collection = new ModelToCollection(this.charsAwake, {
			compare: (a, b) => (b.value.match - a.value.match) || (b.value.lastAwake - a.value.lastAwake) || a.key.localeCompare(b.key),
			filter: (k, v) => v.awake == true,
			eventBus: this.app.eventBus,
		});
		this.watchedAwake = new ModelToCollection(this.charsAwake, {
			compare: (a, b) => (b.value.match - a.value.match) || (b.value.lastAwake - a.value.lastAwake) || a.key.localeCompare(b.key),
			filter: (k, v) => v.watch && v.awake,
			eventBus: this.app.eventBus,
		});
		this.unwatchedAwake = new ModelToCollection(this.charsAwake, {
			compare: (a, b) => (b.value.match - a.value.match) || (b.value.lastAwake - a.value.lastAwake) || a.key.localeCompare(b.key),
			filter: (k, v) => !v.watch && v.awake,
			eventBus: this.app.eventBus,
		});
		this.notes = new ModelWrapper(null, {
			eventBus: this.app.eventBus,
		});

		this.user = null;
		this.module.auth.getUserPromise().then(user => {
			this.user = user;
			this._loadSettings(user);
			this._getCharsAwake(user);
		});
	}

	getModel() {
		return this.model;
	}

	getCharsAwake() {
		return this.model.charsAwake;
	}

	getWatches() {
		return this.model.watches;
	}


	getCollection() {
		return this.collection;
	}

	getWatchedAwake() {
		return this.watchedAwake;
	}

	getNotes() {
		return this.notes;
	}

	getUnwatchedAwake() {
		return this.unwatchedAwake;
	}

	toggleShowAll(showAll) {
		showAll = typeof showAll == 'undefined' ? !this.model.showAll : !!showAll;
		let p = this.model.set({ showAll });
		this._saveSettings();
		return p;
	}

	toggleShowLfrp(showLfrp) {
		showLfrp = typeof showLfrp == 'undefined' ? !this.model.showLfrp : !!showLfrp;
		let p = this.model.set({ showLfrp });
		this._saveSettings();
		this._trySetFilter();
		return p;
	}

	setFilter(filter) {
		filter = filter ? filter.trim() : '';
		if (filter == this.model.filter) {
			return Promise.resolve(null);
		}
		let p = this.model.set({ filter });
		this._saveSettings();
		this._trySetFilter();
		return p;
	}

	_trySetFilter() {
		if (this.filter.setFilter(this.model.filter, { showLfrp: this.model.showLfrp })) {
			this._updateFilter();
		}
	}

	filterIsEmpty() {
		return this.filter.isEmpty();
	}

	_getCharsAwake(user) {
		Promise.all([
			this.module.api.get('core.chars.awake'),
			this.module.api.get('note.player.' + user.id + '.watches'),
			this.module.api.get('note.player.' + user.id + '.notes'),
		]).then(result => {
			let charsAwake = result[0];
			let watches = new ModelWrapper(result[1], {
				// Filter out delete characters
				filter: (k, v) => v.char && !isResError(v.char) && !v.char.deleted,
				eventBus: this.app.eventBus,
			});
			let notes = result[2];
			this.model.set({ charsAwake, watches, notes });
			this.charsAwake.setModel(charsAwake);
			this.notes.setModel(notes);
			this._listen(true);
		});
	}

	_onChange(change, m) {
		let nm = this.module.notify.getModel();

		for (let k in change) {
			// No notification if the character was removed (fell asleep).
			let char = this.charsAwake[k];
			if (!char) {
				continue;
			}
			if (nm.notifyOnWakeup ||
				(nm.notifyOnWatched && char.watch) ||
				(nm.notifyOnMatched && !this.filter.isEmpty() && char.match)
			) {
				this.module.notify.send(
					l10n.l('charsAwake.wakeup', "Character awake"),
					l10n.l('charsAwake.charWokeUp', "{name} woke up", { name: (char.name + ' ' + char.surname).trim() }),
					{
						duration: 1000 * 60 * 15, // Max 15 min
					},
				);
			}
		}
	}

	_onWatchesChange(change) {
		if (!this.charsAwake) return;

		// Update the watch value for the affected charsAwake
		let p = this.charsAwake.props;
		for (let charId in change) {
			let m = p[charId];
			if (m) {
				m.set({ watch: this._isWatched(charId) });
			}
		}
	}

	_onTagChange(change, tag, __, ev) {
		// Ensure it is a change event
		let parts = ev.split('.');
		if (!this.charsAwake || parts.length != 2 || parts[1] != 'change') {
			return;
		}
		// Check it is a key change that might affect the filter
		if (change.hasOwnProperty('key') &&
			(this.filter.containsTag(change.key) || this.filter.containsTag(tag.key))
		) {
			// Update the entire list
			this._updateFilter();
		}
	}

	_onCharTagsChange(change, _, __, ev) {
		// Ensure it is a change event
		let parts = ev.split('.');
		if (!this.charsAwake || parts.length != 3 || parts[1] != 'tags' || parts[2] != 'change') {
			return;
		}

		let m = this.charsAwake[parts[0]];
		if (m) {
			m.set({ match: this.filter.match(m.getModel()) });
		}
	}

	// Called on events on a character. Checks if the deleted flag has been
	// changed, and if so updates the watches model.
	_onCharEvent(change, char, __, ev) {
		let watches = this.model.watches;
		if (watches) {
			// Ensure it is a change event
			let parts = ev.split('.');
			if (parts.length != 2 || parts[1] != 'change' || !change.hasOwnProperty('deleted')) {
				return;
			}
			watches.refresh(parts[0]);
		}
	}

	_loadSettings(user) {
		if (localStorage) {
			let data = localStorage.getItem(charsAwakeStoragePrefix + user.id);
			if (data) {
				let o = JSON.parse(data);
				this.model.set(o);
				this._trySetFilter();
			}
		}
	}

	_saveSettings() {
		if (localStorage && this.user) {
			localStorage.setItem(charsAwakeStoragePrefix + this.user.id, JSON.stringify({
				showLfrp: this.model.showLfrp,
				filter: this.model.filter,
				showAll: this.model.showAll,
			}));
		}
	}

	_isWatched(charId) {
		let w = this.model.watches;
		return w && w.props[charId];
	}

	_updateFilter() {
		if (!this.charsAwake) {
			return;
		}

		let p = this.charsAwake.props;
		for (let charId in p) {
			let m = p[charId];
			if (m) {
				m.set({ match: this.filter.match(m.getModel()) });
			}
		}
	}

	_listen(on) {
		let cb = on ? 'on' : 'off';
		let m = this.model;
		if (this.charsAwake) {
			this.charsAwake[cb]('change', this._onChange);
		}
		if (m.watches) {
			this.model.watches[cb]('change', this._onWatchesChange);
		}
		this.module.api[cb + 'Event']('tag.tag', this._onTagChange);
		this.module.api[cb + 'Event']('tag.char', this._onCharTagsChange);
		this.module.api[cb + 'Event']('core.char', this._onCharEvent);
	}

	dispose() {
		this._listen(false);
		if (this.model.watches) {
			this.model.watches.dispose();
		}
		this.model.set({ charsAwake: null, watches: null, notes: null });
		this.collection.dispose();
		this.watchedAwake.dispose();
		this.unwatchedAwake.dispose();
		this.charsAwake.dispose();
		this.notes.dispose();
	}
}

export default CharsAwake;
