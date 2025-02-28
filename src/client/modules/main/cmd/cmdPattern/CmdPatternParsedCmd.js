import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import ItemList from 'classes/ItemList';

const charTypeNone = 0;
const charTypeLetter = 1;
const charTypeSpace = 2;
const charTypeReserved = 3;
const charTypeSymbol = 4;

const tokenNone = '';
const tokenWord = 'word';
const tokenSymbol = 'symbol';
const tokenField = 'field';
const tokenOptStart = 'optStart';
const tokenOptEnd = 'optEnd';

const reserved = {
	'(': true,
	')': true,
	'{': true,
	'}': true,
	'<': true,
	'>': true,
	'[': true,
	']': true,
	'\\': true,
	'/': true,
	'|': true,
	'&': true,
};

class CmdPatternParsedCmd {

	/**
	 * Initializes a new ParsedCmd instance.
	 * @param {CmdPatternModules} module CmdPattern modules.
	 * @param {CmdPattern} cmd Command pattern object.
	 */
	constructor(module, cmd) {
		this.module = module;
		this.cmd = cmd;
		this.tokens = this._parse(cmd);
		this.step = this._createStep();
	}

	/**
	 * Matches against a string and returns the length matched.
	 * @param {string} s String to match against.
	 * @returns {string} Remaining part that didn't match.
	 */
	matches(s) {
		return this._matches(s, 0);
	}

	_matches(s, idx) {
		let ns;

		for (; idx < this.tokens.length; idx++) {
			let t = this.tokens[idx];
			s = s.trimStart();
			if (s == "") {
				// The full string was matched.
				return s;
			}
			switch (t.token) {
				case tokenWord:
					let m = s.match(/^[a-zA-Z0-9]+/);
					// Check if we have a prefix match
					if (!m || !t.value.startsWith(m[0].toLowerCase())) {
						// No match
						return s;
					}

					// Check if we have a partial match
					let remaining = t.value.length - m[0].length;
					if (remaining > 0) {
						return s.slice(m[0].length);
					}
					// Slice away the matching word
					s = s.slice(t.value.length);
					break;

				case tokenSymbol:
					// Check if the symbol matches.
					if (s.charAt(0) != t.value) {
						return str.length - s.length;
					}
					s = s.slice(1);
					break;

				case tokenOptStart:
					s = s.trimStart();
					// If the optional path has any type of match, we choose it.
					ns = this._matches(s, idx + 1);
					if (ns != s) {
						return ns;
					}
					return this._matches(s, this._findOptEnd(idx + 1) + 1);

				case tokenOptEnd:
					break;

				case tokenField:
					let field = this.cmd.fields[t.value];
					let fieldType = this.module.self.getFieldType(field.type);
					if (!fieldType) {
						console.error("missing handler for fieldType: " + field.type);
						return s;
					}

					ns = fieldType.match(s, field.opts);
					// Null (non-string) is a no-match
					if (typeof ns != 'string') {
						return s;
					}
					s = ns;
					break;
			}
		}

		return s;
	}

	_findOptEnd(idx) {
		let depth = 0;
		for (; idx < this.tokens.length; idx++) {
			let t = this.tokens[idx];
			if (t.token == tokenOptEnd) {
				if (depth == 0) {
					break;
				}
				depth--;
			} else if (t.token == tokenOptStart) {
				depth++;
			}
		}
		return idx;
	}

	getStep() {
		return this.step;
	}

	_parse(cmd) {
		let charType = charTypeNone;
		let state = tokenNone;
		let escape = false;
		let str = "";
		let tokens = [];
		const appendState = (newState) => {
			switch (state) {
				case tokenNone:
					break;
				case tokenWord:
					tokens.push({ token: state, value: str.toLowerCase() });
					break;
				default:
					tokens.push({ token: state, value: str });
			}
			str = "";
			state = newState;
		};

		let len = cmd.pattern.length;
		for (let i = 0; i < len; i++) {
			let char = cmd.pattern.charAt(i);
			let c = char.charCodeAt(0);
			// Check char type
			if ((c >= 65 /*A*/ && c <= 90 /*Z*/) || (c >= 97 /*a*/ && c <= 122 /*z*/) || (c >= 48 /*0*/ && c <= 57 /*9*/)) {
				charType = charTypeLetter;
			} else if (char == ' ') {
				charType = charTypeSpace;
			} else if (reserved[char]) {
				charType = charTypeReserved;
			} else {
				charType = charTypeSymbol;
			}
			// Handle escaped character
			if (escape) {
				if (charType == charTypeReserved) {
					escape = false;
					charType = charTypeSymbol;
				}
			}

			switch (charType) {
				case charTypeLetter:
					if (state != tokenWord && state != tokenField) {
						appendState(tokenWord);
					}
					str += char;
					break;
				case charTypeSymbol:
					if (state != tokenField) {
						appendState(tokenSymbol);
					}
					str += char;
					break;
				case charTypeSpace:
					if (state != tokenField) {
						appendState(tokenNone);
					} else {
						str += char;
					}
					break;
				case charTypeReserved:
					switch (char) {
						case '\\':
							escape = true;
							break;
						case '<':
							appendState(tokenField);
							break;
						case '>':
							appendState(tokenNone);
							break;
						case '[':
							appendState(tokenOptStart);
							break;
						case ']':
							appendState(tokenOptEnd);
							break;
					}
					break;

			}
		}
		appendState();

		return tokens;
	}

	_createStep() {
		let first = null;
		let step = null;

		for (let t of this.tokens) {
			let next = null;
			switch (t.token) {
				case tokenWord:
					next = new ListStep('value', new ItemList({
						items: [{ key: t.value }],
					}), {
						name: t.value,
						token: 'name',
					});
					break;

				case tokenSymbol:
					next = new DelimStep(t.value);
					break;

				case tokenOptStart:
					break;

				case tokenOptEnd:
					break;

				case tokenField:
					let field = this.cmd.fields[t.value];
					let fieldType = this.module.self.getFieldType(field.type);
					next = fieldType?.stepFactory(t.value, field.opts);
					break;
			}

			if (next) {
				first = first || next;
				step?.setNext(next);
				step = next;
			}
		}

		let last = new ValueStep('cmd', (ctx, params) => {
			console.log("YAY! We executed this command!", ctx, params);
		});
		step?.setNext(last);

		return first || last;
	}

}

export default CmdPatternParsedCmd;
