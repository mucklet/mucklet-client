import ErrorStep from './ErrorStep';
import Err from './Err';

/**
 * TextStep consumes a string of text.
 */
class TextStep {

	/**
	 * Creates an instance of TextStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {RegExp} [opt.regex] Regex used for matching. Defaults to /^.*$/
	 * @param {number|Function} [opt.maxLength] Max length of matched characters, or a function that returns max length. Null means no length requirements.
	 * @param {string|function} [opt.token] Token name. Defaults to 'text'. Functions should have the signature: (state, TextStep) => {string}
	 * @param {Step} [opt.next] Next step after a matched string.
	 * @param {boolean} [opt.trimSpace] Flag indicating if initial space should be trimmed. Defaults to true.
	 * @param {boolean} [opt.spellcheck] Flag indicating if text should be spell checked. Defaults to true.
	 * @param {bool} [opt.spanLines] Flag to tell if the text can be spanned across multiple lines. Defaults to false.
	 * @param {Completer} [opt.completer] List that implements a complete function: { complete: function(str, pos, ctx, inline) -> ?{ list, to, from } }
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match or the match is empty. Null means it is not required.: function(this)
	 * @param {?function} [opt.errTooLong] Callback function that returns an error when max length is exceeded: function(this, maxLength)
	 * @param {object} [opt.formatText] Options for formatted text.
	 */
	constructor(id, opt) {
		opt = opt || {};
		this.id = id;
		this.name = opt.name || id;
		this.regex = opt.regex || /^.*/;
		let maxLength = opt.hasOwnProperty('maxLength') ? opt.maxLength : null;
		this.maxLengthCallback = typeof maxLength == 'function' ? maxLength : () => maxLength;
		this.token = opt.token || 'text';
		this.next = opt.next || null;
		this.trimSpace = opt.hasOwnProperty('trimSpace') ? !!opt.trimSpace : true;
		this.spanLines = opt.hasOwnProperty('spanLines') ? !!opt.spanLines : false;
		this.useSpellcheck = opt.hasOwnProperty('spellcheck') ? !!opt.spellcheck : true;
		this.completer = opt.completer || null;
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('textStep.required', 'There is no {name}.', { name: self.name });
		this.errTooLong = opt.errTooLong || ((self, maxLength) => (new Err('textStep.exceedsMaxLength', 'Exceeds max length of {maxLength} characters.', { maxLength })));
		this._formatText = opt.formatText ? Object.assign({ id }, typeof opt.formatText == 'object' ? opt.formatText : null) : null;
	}

	get spellcheck() {
		return this.useSpellcheck;
	}

	blank(state) {
		state.setParam(this.id, (state.getParam(this.id) || "") + "\n");
	}

	parse(stream, state) {
		if (!stream) {
			return this._setRequired(state);
		}

		if (this.trimSpace && stream.eatSpace()) {
			state.addStep(this);
			return null;
		}

		let m = stream.match(this.regex);

		if (!m || !m[0].length) {
			state.backUp(stream);
			return this._setRequired(state);
		}

		let hasMatched = state.getState(this.id);
		let full = (hasMatched ? (state.getParam(this.id) || "") + "\n" : "") + m[0];

		// Validate max length
		let maxLength = this.maxLengthCallback();
		if (maxLength !== null && full.length > maxLength) {
			stream.backUp(full.length - maxLength);
			if (this.errTooLong) {
				state.addStep(new ErrorStep(this.regex, this.errTooLong(this, maxLength)));
				return this._token(state);
			}
			full = full.slice(0, maxLength);
		}

		if (!hasMatched && this.next) {
			state.addStep(this.next);
		}

		if (this.spanLines && stream.eol()) {
			state.setParam(this.id, full);
			state.setState(this.id, true); // True means the first line is set
			state.addStep(this);
		} else {
			state.setParam(this.id, full);
		}

		return this._token(state);
	}

	_token(state) {
		return typeof this.token == 'function' ? this.token(state, this) : this.token;
	}

	/**
	 * Complete returns a completion list for tab completion using the
	 * completer.
	 * @param {string} str The matched text string
	 * @param {number} pos The cursor position within the string
	 * @returns {?object} Completion list in the format: { list, from, to }
	 */
	complete(str, pos) {
		if (!this.completer) return null;

		let trimmed = this.trimSpace ? str.trimStart() : str;
		let diff = str.length - trimmed.length;
		let range = this.completer.complete(trimmed, pos - diff, null, true);
		return range
			? { list: range.list, from: range.from + diff, to: range.to + diff }
			: null;
	}

	formatText() {
		return this._formatText;
	}

	_setRequired(state) {
		if (!state.getState(this.id) && this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
	}
}

export default TextStep;
