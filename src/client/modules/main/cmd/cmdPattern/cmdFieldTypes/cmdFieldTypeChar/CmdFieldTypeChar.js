import { StringStream } from '@codemirror/language';
import Err from 'classes/Err';

/**
 * CmdFieldTypeChar registers the "char" field type for custom commands.
 */
class CmdFieldTypeChar {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmdPattern',
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default
		 * 	info: import('modules/main/addons/info/Info').default
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'char',
			match: (ctx, fieldKey, str, opts, delims, tags, prevValue) => {
				// Trim space
				let len = str.length;
				str = str.trimStart();
				let from = len - str.length;

				// Get list of characters and match
				let list = this._getList(ctx?.charId, opts);
				let stream = new StringStream(str, 0, 0, 0);
				let match = list.consume(stream, ctx);
				if (typeof match != 'string') {
					return null;
				}

				// Get matched item
				let item = list.getItem(match, ctx);
				let err = null;

				if (!item) {
					err = list.errNotFound
						? list.errNotFound(this, match)
						: null;
				} else {
					if (item.error) {
						err = item.error;
					}
				}

				// Add tags
				if (tags) {
					// Did we consume space. Add a null tag.
					if (from > 0) {
						tags.push({ tag: null, n: from });
					}
					// Add tag for the rest of the match
					tags.push({ tag: err ? 'error' : 'listitem', n: match.length });
				}
				// Create value unless we have an error. If we have no item, it
				// means we couldn't do a local lookup, but will let the server
				// check the name.
				let value = err
					? null
					: item
						? { charId: item.value }
						: { charName: match };
				return {
					from,
					to: from + match.length,
					partial: false,
					value,
					error: err,
				};
			},
		});
	}

	_getList(charId, opts) {
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
