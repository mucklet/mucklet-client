import { Model } from 'modapp-resource';
import TokenList from 'classes/TokenList';
import objectKeyDiff from 'utils/objectKeyDiff';
import {
	keyTokenRegex,
	keyExpandRegex,
} from 'utils/regex';

/**
 * RoomAccess listens to controlled character models and their rooms, fetching a
 * list of available room profiles and room scripts.
 *
 * The overly complex code of this module is because the access to room profiles
 * and scripts is based on controlled character, current room owner, and player
 * role. So in order to access available profiles and scripts, we need to listen
 * to all of that, and update accordingly.
 */
class RoomAccess {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlChange = this._onCtrlChange.bind(this);
		this._onCharChange = this._onCharChange.bind(this);
		this._onRoomChange = this._onRoomChange.bind(this);

		this.app.require([
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.chars = {};
		this.rooms = {};
		this.roomsProfiles = new Model({ eventBus: this.app.eventBus });
		this.roomsScripts = new Model({ eventBus: this.app.eventBus });
		this.ctrlModel = this.module.player.getControlledModel();

		this.inRoomProfiles = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && this.roomsProfiles.props[c.inRoom.id]?.toArray()) || [];
		}, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null,
		});

		this.inRoomScripts = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			return (c && this.roomsScripts.props[c.inRoom.id]?.toArray()) || [];
		}, {
			regex: keyTokenRegex,
			expandRegex: keyExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null,
		});

		this._listenCtrl(true);
	}

	/**
	 * Returns a TokenList of available room profiles for the active characters
	 * current room.
	 * @returns {TokenList} Token list.
	 */
	getInRoomProfileTokens() {
		return this.inRoomProfiles;
	}


	/**
	 * Returns a TokenList of available room scripts for the active characters
	 * current room.
	 * @returns {TokenList} Token list.
	 */
	getInRoomScriptTokens() {
		return this.inRoomScripts;
	}

	_listenCtrl(on) {
		let cb = on ? 'on' : 'off';
		this.ctrlModel[cb]('change', this._onCtrlChange);
		if (on) {
			this._onCtrlChange();
		}
	}

	_onCtrlChange(ev) {
		if (!this.rooms) return;
		this._listenChars(objectKeyDiff(this.chars, this.ctrlModel?.props));
	}

	_listenChars(change) {
		for (let charId in change) {
			let char = change[charId];
			let prev = this.chars[charId];
			if (char) {
				if (!prev) {
					char.on('change', this._onCharChange);
					this.chars[charId] = char;
				}
			} else if (prev) {
				prev.off('change', this._onCharChange);
				delete this.chars[charId];
			}
		}
		this._onCharChange();
	}

	_onCharChange() {
		if (!this.rooms) return;

		let rooms = {};
		for (let charId in this.chars) {
			let room = this.chars[charId].inRoom;
			rooms[room.id] = room;
		}
		this._listenRooms(objectKeyDiff(this.rooms, rooms));
	}

	_listenRooms(change) {
		for (let roomId in change) {
			let room = change[roomId];
			let prev = this.rooms[roomId];
			if (room) {
				if (!prev) {
					room.on('change', this._onRoomChange);
					this.rooms[roomId] = room;
				}
			} else if (prev) {
				prev.off('change', this._onRoomChange);
				delete this.rooms[roomId];
			}
		}
		this._onRoomChange();
	}

	_onRoomChange() {
		if (!this.rooms) return;

		let editableRooms = {};
		let scriptableRooms = {};
		for (let roomId in this.rooms) {
			let room = this.rooms[roomId];
			for (let charId in this.chars) {
				if (this.canSetRoomProfile(this.chars[charId], room)) {
					editableRooms[roomId] = true;
				}
				if (this.canSetRoomScript(this.chars[charId], room)) {
					scriptableRooms[roomId] = true;
				}
			}
		}

		// Editable rooms
		let editableRoomsChange = objectKeyDiff(this.roomsProfiles, editableRooms);
		if (!Object.keys(editableRoomsChange)) {
			return;
		}
		let editableRoomsUpdate = {};
		for (let roomId in editableRoomsChange) {
			// On new roomProfiles
			if (editableRoomsChange[roomId]) {
				editableRoomsUpdate[roomId] = null;
				this.module.api.get('core.room.' + roomId + '.profiles').then(profiles => {
					if (this.roomsProfiles?.props[roomId] === null) {
						profiles.on();
						this.roomsProfiles.set({ [roomId]: profiles });
					}
				});
			// On removed roomProfiles
			} else {
				editableRoomsUpdate[roomId] = undefined;
				this.roomsProfiles.props[roomId]?.off();
			}
		}
		this.roomsProfiles.set(editableRoomsUpdate);

		// Scriptable rooms
		let scriptableRoomsChange = objectKeyDiff(this.roomsScripts, scriptableRooms);
		if (!Object.keys(scriptableRoomsChange)) {
			return;
		}
		let scriptableRoomsUpdate = {};
		for (let roomId in scriptableRoomsChange) {
			// On new roomScripts
			if (scriptableRoomsChange[roomId]) {
				scriptableRoomsUpdate[roomId] = null;
				this.module.api.get('core.room.' + roomId + '.scripts').then(scripts => {
					if (this.roomsScripts?.props[roomId] === null) {
						scripts.on();
						this.roomsScripts.set({ [roomId]: scripts });
					}
				});
			// On removed roomScripts
			} else {
				scriptableRoomsUpdate[roomId] = undefined;
				this.roomsScripts.props[roomId]?.off();
			}
		}
		this.roomsScripts.set(scriptableRoomsUpdate);
	}

	/**
	 * Checks if a controlled character can set room profile.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} room Room model.
	 * @returns {boolean} True if allowed to set room profile, otherwise false.
	 */
	canSetRoomProfile(ctrl, room) {
		return !ctrl.puppeteer && (this.module.player.isBuilder() || (room.owner && room.owner.id == ctrl.id));
	}

	/**
	 * Checks if a controlled character can set room script.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} room Room model.
	 * @returns {boolean} True if allowed to set room script, otherwise false.
	 */
	canSetRoomScript(ctrl, room) {
		return !ctrl.puppeteer && (this.module.player.isBuilder() || (room.owner && room.owner.id == ctrl.id));
	}

	dispose() {
		for (let roomId in this.roomsProfiles) {
			this.roomsProfiles[roomId].off();
		}
		for (let roomId in this.roomsScripts) {
			this.roomsScripts[roomId].off();
		}
		for (let roomId in this.rooms) {
			this.rooms[roomId].off('change', this._onRoomChange);
		}
		for (let charId in this.chars) {
			this.chars[charId].off('change', this._onCharChange);
		}
		this.roomsProfiles = null;
		this.roomsScripts = null;
		this.rooms = null;
		this.chars = null;
		this._listenPlayer(false);
	}
}

export default RoomAccess;
