import Err from 'classes/Err';
import { matchFactory, completeFactory } from 'utils/cmdFieldType';

/**
 * CmdFieldTypeChar registers the "char" field type for custom commands.
 */
class CmdFieldTypeChar {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._getList = this._getList.bind(this);

		this.app.require([
			'cmdPattern',
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default,
		* 	cmdLists: import('modules/main/cmd/cmdLists/CmdLists').default,
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'char',
			match: matchFactory(this._getList, (item, match) => item
				? { charId: item.value }
				: { charName: match },
			),
			complete: completeFactory(this._getList),
		});
	}

	_getList(ctx, fieldKey, opts) {
		let charId = ctx?.charId;
		if (opts?.inRoom) {
			return this.module.cmdLists.getInRoomChars({ charId, validation: this._getValidation(opts) });
		}
		if (opts?.state == 'awake') {
			return this.module.cmdLists.getCharsAwake();
		}
		return this.module.cmdLists.getAllChars({ charId, validation: this._getValidation(opts) });
	}

	_getValidation(opts) {
		if (!opts?.state) {
			return null;
		}

		switch (opts?.state) {
			case 'asleep':
				return (key, char) => char.state != 'asleep'
					? new Err('cmdFieldTypeChar.charNotAsleep', "Character is not asleep.")
					: null;
			case 'awake':
				return (key, char) => char.state != 'awake'
					? new Err('cmdFieldTypeChar.charNotAwake', "Character is not awake.")
					: null;
			case 'dazed':
				return (key, char) => char.state != 'dazed'
					? new Err('cmdFieldTypeChar.charNotDazed', "Character is not dazed. What does that even mean?")
					: null;
		}

		let state = opts.state;
		return (key, char) => char.state != state
			? new Err('cmdFieldTypeChar.charInWrongState', "Character is in the wrong state.")
			: null;
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('char');
	}
}

export default CmdFieldTypeChar;
