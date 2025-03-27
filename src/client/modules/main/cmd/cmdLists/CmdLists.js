import CharList from 'classes/CharList';
import ItemList from 'classes/ItemList';
import TokenList from 'classes/TokenList';
import Err from 'classes/Err';
import isNormalizedPrefix from 'utils/isNormalizedPrefix';
import mergeCharLists from 'utils/mergeCharLists';
import {
	keyTokenRegex,
	keyExpandRegex,
	colonDelimTokenRegex,
	colonDelimExpandRegex,
	anyTokenRegex,
	anyExpandRegex,
} from 'utils/regex';

const defaultSortOrder = [ 'watch', 'room', 'awake' ];

/**
 * CmdLists holds different types of lists for cmds.
 */
class CmdLists {
	constructor(app, params) {
		this.app = app;

		// Size of the prioritized characters per controlled character.
		this.prioSize = parseInt(params?.prioSize) || 20;

		this.app.require([
			'player',
			'auth',
			'charsAwake',
			'globalTeleports',
			'mute',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.prioChars = {};

		this.ownedChars = new CharList(() => this.module.player.getChars() || null);
		this.inRoomPuppets = new CharList((ctx) => {
			let c = this.module.player.getActiveChar();
			return (c && c.inRoom.chars) || null;
		}, {
			validation: (key, char) => char.type != 'puppet'
				? new Err('cmdLists.charNotAPuppet', "Character is not a puppet.")
				: null,
		});
		this.watchedChars = new CharList(() => {
			let m = this.module.charsAwake.getWatches();
			if (!m) return [];
			return Object.keys(m.props).map(k => m[k].char);
		});
		this.teleportNodes = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			let gn = this.module.globalTeleports.getGlobalTeleports();
			return ((c && c.nodes.toArray()) || []).concat((gn && gn.toArray()) || []);
		}, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => isNormalizedPrefix(prefix, t.key),
		});
		this.inRoomExits = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.inRoom.exits) || [];
		}, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => {
				for (let k of t.keys) {
					if (k === key) {
						return { key: k, value: t.id };
					}
				}
				return false;
			},
			isPrefix: (t, prefix) => {
				if (!prefix) return t.keys[0] || null;
				for (let k of t.keys) {
					if (isNormalizedPrefix(prefix, k)) {
						return k;
					}
				}
				return null;
			},
		});
		this.charProfiles = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.profiles.toArray()) || [];
		}, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => isNormalizedPrefix(prefix, t.key),
		});
		this.charOwnedAreas = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.ownedAreas && c.ownedAreas.toArray()) || [];
		}, {
			regex: colonDelimTokenRegex,
			expandRegex: colonDelimExpandRegex,
			isMatch: (t, key) => key === t.name.toLowerCase().replace(/\s+/g, ' ') ? { key: t.name, value: t.id } : false,
			isPrefix: (t, prefix) => isNormalizedPrefix(prefix, t.name.toLowerCase().replace(/\s+/g, ' '), t.name),
		});
		this.charOwnedAreasOrNone = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			let arr = (c && c.ownedAreas && c.ownedAreas.toArray()) || [];
			arr.unshift({ id: '', name: 'none' });
			return arr;
		}, {
			regex: colonDelimTokenRegex,
			expandRegex: colonDelimExpandRegex,
			isMatch: (t, key) => key === t.name.toLowerCase().replace(/\s+/g, ' ') ? { key: t.name, value: t.id } : false,
			isPrefix: (t, prefix) => isNormalizedPrefix(prefix, t.name.toLowerCase().replace(/\s+/g, ' '), t.name),
		});
		this.charOwnedRooms = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.ownedRooms && c.ownedRooms.toArray()) || [];
		}, {
			regex: anyTokenRegex,
			expandRegex: anyExpandRegex,
			isMatch: (t, key) => key === t.name.toLowerCase().replace(/\s+/g, ' ') ? { key: t.name, value: t.id } : false,
			isPrefix: (t, prefix) => isNormalizedPrefix(prefix, t.name.toLowerCase().replace(/\s+/g, ' '), t.name),
		});
		this.bool = new ItemList({
			items: [
				{
					key: "true",
					value: true,
					alias: [ "yes" ],
				},
				{
					key: "false",
					value: false,
					alias: [ "no" ],
				},
			],
		});
	}

	/**
	 * Prioritizes a character when using tab completion for a controlled character.
	 * @param {string} ctrlId ID of controlled character
	 * @param {string} charId ID of character to prioritize
	 */
	prioritizeChar(ctrlId, charId) {
		if (!ctrlId || ! charId) {
			return;
		}

		let prioList = this.prioChars[ctrlId];
		if (!prioList) {
			this.prioChars[ctrlId] = prioList = [];
		}

		let idx = prioList.indexOf(charId);
		if (idx < 0) {
			prioList.unshift(charId);
			if (idx.length > this.prioSize) {
				prioList.pop();
			}
		} else if (idx > 0) {
			prioList.splice(idx, 1);
			prioList.unshift(charId);
		}
	}

	/**
	 * Get a CharList of owned characters.
	 * @returns {CharList} List of characters.
	 */
	getOwnedChars() {
		return this.ownedChars;
	}

	/**
	 * Get a CharList of characters in the room.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.charId] ID of character getting the list. Defaults to active char.
	 * @param {bool} [opt.filterMuted] Flag to filter out muted characters.
	 * @param {string[]} [opt.sortOrder] Sort order to use described as an array of values 'room', 'watch', 'awake'.
	 * @param {(key: string, char: CharModel) => Err | null} [opt.validation] Validation callback returning an error if the character is not to be included.
	 * @returns {CharList} List of characters.
	 */
	getInRoomChars(opt) {
		return new CharList(() => {
			let c = opt?.charId
				? this.module.player.getControlledChar(opt.charId)
				: this.module.player.getActiveChar();
			return c?.inRoom.chars;
		}, {
			errNotFound: (l, m) => new Err('cmdList.charNotFoundInRoom', 'There is no character in this room named {match}.', { match: m }),
			getCompletionChars: (ctx, getChars) => this._getCompletedChars(ctx, getChars, opt),
			validation: opt?.validation,
		});
	}

	/**
	 * Get a CharList of awake characters in the room.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.charId] ID of character getting the list. Defaults to active char.
	 * @param {bool} [opt.filterMuted] Flag to filter out muted characters.
	 * @param {string[]} [opt.sortOrder] Sort order to use described as an array of values 'room', 'watch', 'awake'.
	 * @returns {CharList} List of characters.
	 */
	getInRoomCharsAwake(opt) {
		return this.getInRoomChars({ ...opt, validation: (key, char) => char.state != 'awake'
			? new Err('cmdLists.charNotAwake', "Character is not awake.")
			: null,
		});
	}

	/**
	 * Get a CharList of puppets in the room.
	 * @returns {CharList} List of characters.
	 */
	getInRoomPuppets() {
		return this.inRoomPuppets;
	}

	/**
	 * Get a CharList of awake characters.
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.filterMuted] Flag to filter out muted characters.
	 * @param {string[]} [opt.sortOrder] Sort order to use described as an array of values 'room', 'watch', 'awake'.
	 * @param {(key: string, char: CharModel) => Err | null} [opt.validation] Validation callback returning an error if the character is not to be included.
	 * @returns {CharList} List of characters.
	 */
	getCharsAwake(opt) {
		return new CharList(() => this.module.charsAwake.getCollection(), {
			errNotFound: (l, m) => new Err('cmdList.awakeCharNotFound', 'There is no character awake named {match}.', { match: m }),
			getCompletionChars: (ctx, getChars) => this._getCompletedChars(ctx, getChars, opt),
			validation: opt?.validation,
		});
	}

	/**
	 * Get a CharList of watched characters.
	 * @returns {CharList} List of characters.
	 */
	getWatchedChars() {
		return this.watchedChars;
	}

	/**
	 * Get a CharList of all available characters.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.charId] ID of character getting the list. Defaults to active char.
	 * @param {bool} [opt.filterMuted] Flag to filter out muted characters.
	 * @param {string[]} [opt.sortOrder] Sort order to use described as an array of values 'room', 'watch', 'awake'.
	 * @param {(key: string, char: CharModel) => Err | null} [opt.validation] Validation callback returning an error if the character is not to be included.
	 * @returns {CharList} List of characters.
	 */
	getAllChars(opt) {
		return new CharList(() => {
			let c = opt?.charId
				? this.module.player.getControlledChar(opt.charId)
				: this.module.player.getActiveChar();
			let watches = this.module.charsAwake.getWatches();
			return mergeCharLists([
				this.module.player.getChars(),
				c && c.inRoom.chars,
				this.module.charsAwake.getCollection(),
				watches && Object.keys(watches.props).map(k => watches[k].char),
			]);
		}, {
			getCompletionChars: (ctx, getChars) => this._getCompletedChars(ctx, getChars, opt),
			validation: opt?.validation,
		});
	}

	getInRoomExits() {
		return this.inRoomExits;
	}

	getTeleportNodes() {
		return this.teleportNodes;
	}

	getCharProfiles() {
		return this.charProfiles;
	}

	getCharOwnedAreas(includeNone) {
		return includeNone ? this.charOwnedAreasOrNone : this.charOwnedAreas;
	}

	getCharOwnedRooms() {
		return this.charOwnedRooms;
	}

	getBool() {
		return this.bool;
	}

	/**
	 * Gets a list of chars to use for autocompletion.
	 * @param {object} ctx Cmd state object.
	 * @param {(ctx: object) => object[] | null} getChars Callback function that returns available of characters.
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.filterMuted] Flag to filter out muted characters.
	 * @param {string[]} [opt.sortOrder] Sort order to use described as an array of values 'room', 'watch', 'awake'.
	 * @returns
	 */
	_getCompletedChars(ctx, getChars, opt) {
		let chars = getChars(ctx);
		if (!chars) {
			return chars;
		}

		chars = chars.toArray?.() || chars;
		if (opt?.filterMuted) {
			chars = chars.filter(c => c?.id && !this.module.mute.isMutedChar(c?.id));
		}

		// Quick exit if no sorting is required
		if (chars.length <= 1) {
			return chars;
		}

		let charId = ctx.charId;

		let prioMap = this.prioChars[ctx.charId]?.reduce((map, charId, i) => (map[charId] = i + 1, map), {}) || {};
		let orderMaps = [];

		let sortOrder = opt?.sortOrder || defaultSortOrder;

		for (let s of sortOrder) {
			switch (s) {
				case 'watch':
					orderMaps.push(this.module.charsAwake.getWatches().props);
					break;
				case 'room':
					let inRoomChars = this.module.player.getControlledChar(charId)?.inRoom.chars;
					if (inRoomChars) {
						let roomMap = {};
						for (let inRoomChar of inRoomChars) {
							let id = inRoomChar?.id;
							if (id) {
								roomMap[id] = true;
							}
						}
						orderMaps.push(roomMap);
					}
					break;
				case 'awake':
					orderMaps.push(this.module.charsAwake.getCharsAwake().props);
					break;
			}
		}

		let prioMiss = Number.MAX_SAFE_INTEGER;

		return chars.sort((a, b) => {
			let aid = a?.id;
			let bid = b?.id;

			// Prio sorting
			let va = prioMap[aid] || prioMiss;
			let vb = prioMap[bid] || prioMiss;
			if (va != vb) {
				return va - vb;
			}

			// Order map sorting
			for (let map of orderMaps) {
				va = !map[aid];
				vb = !map[bid];
				if (va != vb) {
					return va ? 1 : -1;
				}
			}

			// Name sorting
			return a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname) || aid.localeCompare(b.id);
		});
	}
}

export default CmdLists;
