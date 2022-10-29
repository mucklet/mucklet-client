import { ModelWrapper, ModelToCollection } from 'modapp-resource';
import TokenList from 'classes/TokenList';
import ItemList from 'classes/ItemList';
import {
	keyTokenRegex,
	keyExpandRegex
} from 'utils/regex';
import l10n from 'modapp-l10n';

const preferences = [
	{ id: "like", name: l10n.l('tags.like', "Like") },
	{ id: "dislike", name: l10n.l('tags.dislike', "Dislike") }
];

/**
 * Tags holds a list of available global tags.
 */
class Tags {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onPlayerChange = this._onPlayerChange.bind(this);

		this.app.require([ 'login', 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.tags = new ModelWrapper(null, {
			eventBus: this.app.eventBus
		});
		this.collection = new ModelToCollection(this.tags, {
			compare: (a, b) => {
				try {
					return a.value.key.localeCompare(b.value.key) || a.key.localeCompare(b.key);
				} catch (e) {
					console.log("Error: ", e, a, b);
				}
			},
			filter: (k, v) => (!v.role || this.module.player.hasAnyRole(v.role, 'admin'))
				&& (!v.idRole || this.module.player.hasAnyIdRole(v.idRole, 'overseer')),
			eventBus: this.app.eventBus
		});
		this.tagsList = new TokenList(() => this.collection, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null
		});
		this.preferenceList = new ItemList({
			items: [
				{
					key: "like",
					value: "like",
					alias: [ "yes" ]
				},
				{
					key: "dislike",
					value: "dislike",
					alias: [ "no" ]
				}
			]
		});
		this.groups = new ModelWrapper(null, {
			eventBus: this.app.eventBus
		});
		this.groupsCollection = new ModelToCollection(this.groups, {
			compare: (a, b) => a.value.order - b.value.order || a.key.localeCompare(b.key),
			eventBus: this.app.eventBus
		});
		this.groupsList = new TokenList(() => this.groupsCollection, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.key } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null
		});

		this.module.login.getLoginPromise()
			.then(() => Promise.all([
				this.module.api.get('tag.tags'),
				this.module.api.get('tag.groups')
			]))
			.then(result => {
				if (this.tags) {
					this.tags.setModel(result[0]);
				}
				if (this.groups) {
					this.groups.setModel(result[1]);
				}
			});

		this._listenPlayer(true);
	}

	getTags() {
		return this.tags;
	}

	/**
	 * Returns a collection of eligible tags.
	 * @returns {Collection}
	 */
	getTagsCollection() {
		return this.collection;
	}

	getTagsList() {
		return this.tagsList;
	}

	getPreferenceList() {
		return this.preferenceList;
	}

	getPreferences() {
		return preferences;
	}

	getTag(key) {
		key = key.trim().toLowerCase();
		let tags = this.tags.props;
		for (let id in tags) {
			let t = tags[id];
			if (t.key == key) {
				return t;
			}
		}
		return null;
	}

	getGroups() {
		return this.groups;
	}

	getGroupsCollection() {
		return this.groupsCollection;
	}

	getGroupsList() {
		return this.groupsList;
	}

	_listenPlayer(on) {
		let m = this.module.player.getModel();
		m[on ? 'on' : 'off']('change', this._onPlayerChange);
	}

	_onPlayerChange(change) {
		if (!change || change.hasOwnProperty('roles') || change.hasOwnProperty('idRoles')) {
			// Yield before refreshing the collection.
			// This is because this.tags model wrapper is triggered
			// on the same event, causing a racing issue.
			setTimeout(() => {
				if (this.collection) {
					this.collection.refresh();
				}
			}, 10);
		}
	}

	dispose() {
		this.collection.dispose();
		this.groupsCollection.dispose();
		this.tags.dispose();
		this.groups.dispose();
		this.collection = null;
		this.groupsCollection = null;
		this.tags = null;
		this.groups = null;
		this._listenPlayer(false);
	}
}

export default Tags;
