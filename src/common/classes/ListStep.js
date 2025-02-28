import Err from './Err';

/**
 * ListStep is a generic list of tokens for commands.
 */
class ListStep {

	/**
	 * Creates an instance of ListStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {TokenList} list Token list.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.textId] Id used as key for the matched text even when no match is found. Sets errNotFound to null.
	 * @param {boolean} [opt.textIdOnMatch] Sets textId only if a match is made. Ignored if textId is not set. Defaults to false.
	 * @param {string} [opt.token] Token name. Defaults to 'listitem'.
	 * @param {string} [opt.delimToken] Token name for delimiters. Defaults to 'delim'.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 * @param {Step} [opt.next] Next step after matching any item (and after doing any item steps).
	 * @param {Step} [opt.else] Step after if the not matching any item. Will disabled any errRequired set.
	 * @param {?function} [opt.errNotFound] Callback function that returns an error when items is not found. Null means mismatch is not an error: function(this, match)
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required: function(this)
	 * @param {function} [opt.onExec] Callback function called on execution of the command. function(state, char)
	 */
	constructor(id, list, opt) {
		opt = opt || {};
		this.id = id;
		this.list = list;
		this.name = opt.name || id;
		this.textId = opt.textId || null;
		this.textIdOnMatch = !!opt.textIdOnMatch;
		this.token = opt.hasOwnProperty('token') ? opt.token : 'listitem';
		this.delimToken = opt.delimToken || 'delim';
		this.trimSpace = opt.hasOwnProperty('trimSpace') ? !!opt.trimSpace : true;
		this.next = opt.next || null;
		this.else = opt.else || null;
		this.errNotFound = opt.hasOwnProperty('errNotFound')
			? opt.errNotFound
			: this.textId
				? null
				: list.errNotFound || ((self, m) => new Err('listStep.itemNotFound', 'There is no {name} named "{match}".', { name: self.name, match: m }));
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('listStep.required', 'There is no {name}.', { name: self.name });
		this.onExec = opt.onExec || null;

	}

	/**
	 * Sets the next step.
	 * @param {Step | null} step Step.
	 * @returns {this}
	 */
	setNext(step) {
		this.next = step || null;
	}

	/**
	 * Sets the else step.
	 * @param {Step | null} step Step.
	 * @returns {this}
	 */
	setElse(step) {
		this.else = step || null;
	}

	/**
	 * Parses the stream input stream.
	 * @param {import('@codemirror/language').StringStream | null} stream String stream.
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {null | string | false} Null if no token, string on token, false if no match
	 */
	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		if (this.trimSpace && stream.eatSpace()) {
			state.addStep(this);
			return null;
		}

		let match = this.list.consume(stream, state.getCtx());

		if (typeof match != 'string') {
			state.backUp(stream);
			return this._setRequired(state);
		}

		let item = this.list.getItem(match, state.getCtx());

		let useTextId = this.textId && (item || !this.textIdOnMatch);
		if (useTextId) {
			state.setParam(this.textId, match);
		}

		if (!item) {
			if (this.errNotFound) {
				state.setError(this.errNotFound(this, match, state));
				return 'error';
			}

			// No item but with textId is still considered a successful match
			if (useTextId) {
				// Add follow-up steps.
				if (this.next) {
					state.addStep(this.next);
				}
				return this.token;
			}

			// Backup and return error base on if it is required or not
			state.backUp(stream);
			return this._setRequired(state);
		}

		if (item.error) {
			state.setError(item.error);
			return 'error';
		}

		state.setParam(this.id, item.value);
		if (this.onExec) {
			state.addOnExec((state) => this.onExec(state, item));
		}

		// Add follow-up steps.
		if (this.next) {
			state.addStep(this.next);
		}
		// Item steps to be handled before follow-up steps.
		if (item.next) {
			state.addStep(item.next);
		}
		return item.symbol ? this.delimToken : this.token;
	}

	/**
	 * Complete returns a completion list for the tab completion.
	 * @param {string} str The matched text string
	 * @param {number} pos The cursor position within the string
	 * @param {import('classes/CmdState').default} state State object
	 * @returns {?object} Completion list in the format: { list, from, to }
	 */
	complete(str, pos, state) {
		if (typeof this.list.complete != 'function') return null;

		let trimmed = this.trimSpace ? str.trimStart() : str;
		let diff = str.length - trimmed.length;
		if (diff > pos) {
			trimmed = str.slice(pos);
			diff = pos;
		}
		let range = this.list.complete(trimmed, pos - diff, state.getCtx());
		return range
			? { list: range.list, from: range.from + diff, to: range.to + diff }
			: null;
	}

	_setRequired(state) {
		if (this.else) {
			state.addStep(this.else);
		} else if (this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
	}
}

export default ListStep;
