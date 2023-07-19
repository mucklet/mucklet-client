import CharList from 'classes/CharList';
import ItemList from 'classes/ItemList';
import TokenList from 'classes/TokenList';
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


/**
 * CmdLists holds different types of lists for cmds.
 */
class CmdLists {
	constructor(app) {
		this.app = app;

		this.app.require([ 'player', 'login', 'charsAwake', 'globalTeleports' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.ownedChars = new CharList(() => this.module.player.getChars() || null);
		this.inRoomChars = new CharList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.inRoom.chars) || null;
		});
		this.inRoomCharsAwake = new CharList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.inRoom.chars) || null;
		}, {
			validation: (key, char) => char.state != 'awake'
				? { code: 'cmdLists.charNotAwake', message: "Character is not awake." }
				: null,
		});
		this.inRoomPuppets = new CharList(() => {
			let c = this.module.player.getActiveChar();
			return (c && c.inRoom.chars) || null;
		}, {
			validation: (key, char) => char.type != 'puppet'
				? { code: 'cmdLists.charNotAPuppet', message: "Character is not a puppet." }
				: null,
		});
		this.charsAwake = new CharList(() => this.module.charsAwake.getCollection(), {
			errNotFound: (l, m) => ({ code: 'cmdList.awakeCharNotFound', message: 'There is no character awake named {match}.', data: { match: m }}),
		});
		this.watchedChars = new CharList(() => {
			let m = this.module.charsAwake.getWatches();
			if (!m) return [];
			return Object.keys(m.props).map(k => m[k].char);
		});
		this.allChars = new CharList(() => {
			let c = this.module.player.getActiveChar();
			let watches = this.module.charsAwake.getWatches();
			return mergeCharLists([
				this.module.player.getChars(),
				c && c.inRoom.chars,
				this.module.charsAwake.getCollection(),
				watches && Object.keys(watches.props).map(k => watches[k].char),
			]);
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

	getOwnedChars() {
		return this.ownedChars;
	}

	getInRoomChars() {
		return this.inRoomChars;
	}

	getInRoomCharsAwake() {
		return this.inRoomCharsAwake;
	}

	getInRoomPuppets() {
		return this.inRoomPuppets;
	}

	getCharsAwake() {
		return this.charsAwake;
	}

	getWatchedChars() {
		return this.watchedChars;
	}

	getAllChars() {
		return this.allChars;
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
}

export default CmdLists;
