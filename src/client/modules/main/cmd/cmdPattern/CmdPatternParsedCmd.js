import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import ItemList from 'classes/ItemList';
import expandSelection from 'utils/expandSelection';

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
	 * @param {string} id Command ID.
	 * @param {CmdPattern} cmd Command pattern object.
	 */
	constructor(module, id, cmd) {
		this.module = module;
		this.id = id;
		this.cmd = cmd;
		this.tokens = this._parse(cmd);
		this.step = this._createStep();
	}

	/**
	 * Tests if the token at index idx is a word-token matching the given word.
	 * @param {number} idx Index of token.
	 * @param {string} word Word string.
	 * @returns {boolean} True on match.
	 */
	isWordToken(idx, word) {
		return this.tokens.length > idx && this.tokens[idx].token == tokenWord && this.tokens[idx].value == word.toLowerCase();
	}

	/**
	 * Matches against a string and returns the length matched.
	 * @param {string} s String to match against.
	 * @param {number} idx Token index to start from. Defaults to 0.
	 * @returns {{remaining: string, complete: boolean} | null} Remaining string and a flag to tell if it is a complete match.
	 */
	matches(s, idx = 0) {
		return this._matches(s, idx);
	}

	/**
	 * Get results for tab completion.
	 * @param {text} doc Full document text.
	 * @param {number} pos Cursor position
	 * @returns {import('types/interfaces/Completer').CompleteResult' | null} Complete results or null.
	 */
	complete(doc, pos) {
		let result = null;
		this._matches(doc, 0, 0, (idx, from, to) => {
			// Assert the cursor is within the token.
			if (pos < from || pos > to) {
				// If we've passed the cursor, we return true to indicate that
				// no more matching is needed.
				return pos < from;
			}

			let str = doc.slice(from, to);
			pos -= from;
			let t = this.tokens[idx];

			switch (t.token) {
				case tokenWord:
					let sel = expandSelection(str, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, pos, pos);
				 	// Check if we have a prefix match
				 	if (t.value.startsWith(str.slice(sel.from, sel.to).toLowerCase())) {
						// We have a match. Set the result and return true to
						// stop matching.
						result = {
							list: [ t.value ],
							from: sel.from + from,
							to: sel.to + from,
						};
						return true;
				 	}
					break;

				case tokenField:
					let field = this.cmd.fields[t.value];
					let fieldType = this.module.self.getFieldType(field.type);
					if (!fieldType) {
						console.error("missing handler for fieldType: " + field.type);
						return true;
					}

					// Try to get complete results.
					result = fieldType.complete?.(str, offset) || null;
					if (result) {
						return true;
					}
					break;
			}

		});
		return result;
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

	/**
	 * Matches against a string. Pos is the position in the complete document
	 * where the string starts.
	 * @param {string} s String to match against.
	 * @param {number} idx Token index matching against
	 * @param {number} pos Position in the complete document where the string starts.
	 * @param {{tokenIdx: number, from: number, to: number} => boolean} [cb] Token callback. If it returns true, the matching stops and "" is returned.
	 * @returns {{remaining: string, complete: boolean} | null} Remaining string and a flag to tell if it is complete, or null if stopped by the callback.
	 */
	_matches(s, idx = 0, pos = 0, cb = null) {
		const eatSpace = () => {
			let ns = s.trimStart();
			pos += s.length - ns.length;
			s = ns;
		};

		for (; idx < this.tokens.length; idx++) {
			let tokenStart = pos;
			let tokenStr = s;
			let t = this.tokens[idx];

			switch (t.token) {
				case tokenWord:
					eatSpace();
					let m = s.match(/^[a-zA-Z0-9]+/);
					// Check if we have a prefix match
					if (!m || !t.value.startsWith(m[0].toLowerCase())) {
						// No match should still be sent to the callback as it
						// may be use by the completer.
						if (cb?.(idx, tokenStart, pos + (m ? m[0].length : 0))) {
							return null;
						}
						// No match
						return { remaining: s, complete: false };
					}

					// Check if we have a partial match
					let len = t.value.length;
					let remaining = len - m[0].length;
					if (remaining > 0) {
						// Partial match and stop traversing.
						if (cb?.(idx, tokenStart, pos + m[0].length)) {
							return null;
						}
						return { remaining: s.slice(m[0].length), complete: false };
					}
					// Slice away the matching word
					if (cb?.(idx, tokenStart, pos + len)) {
						return null;
					}
					s = s.slice(len);
					pos += len;

					break;

				case tokenSymbol:
					eatSpace();
					// Check if the symbol matches.
					if (!s || s.charAt(0) != t.value) {
						return { remaining: s, complete: false };
					}
					if (cb?.(idx, tokenStart, pos + 1)) {
						return null;
					}
					s = s.slice(1);
					pos++;
					break;

				case tokenOptStart:
					eatSpace();
					// Match against the optional path.
					let optResult = this._matches(tokenStr, idx + 1, tokenStart, cb);
					// If the optional path matches more than space, we select it.
					if (optResult && len(optResult.remaining) < len(s)) {
						return optResult;
					}
					return this._matches(tokenStr, this._findOptEnd(idx + 1) + 1, tokenStart, cb);

				case tokenOptEnd:
					break;

				case tokenField:
					let field = this.cmd.fields[t.value];
					let fieldType = this.module.self.getFieldType(field.type);
					if (!fieldType) {
						console.error("missing handler for fieldType: " + field.type);
						return { remaining: tokenStr, complete: false };
					}

					let fieldMatch = fieldType.match(tokenStr, field.opts);
					// Null is a non-match
					if (!fieldMatch) {
						if (cb?.(idx, tokenStart, tokenStart)) {
							return null;
						}
						return { remaining: tokenStr, complete: false };
					}

					if (cb?.(idx, pos + fieldMatch.from, pos + fieldMatch.to)) {
						return null;
					}
					pos = tokenStart + fieldMatch.to;
					s = tokenStr.slice(fieldMatch.to);
					// If only partial match, we end here
					if (fieldMatch.partial) {
						return { remaining: s, complete: false };
					}
					break;
			}
		}

		return { remaining: s, complete: !s };
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

	/**
	 * Parses a command into tokens.
	 * @param {import('types/modules/cmdPattern').CmdPattern} cmd Command object.
	 * @returns {Array<{token: "word"|"symbol"|"field"|"optStart"|"optEnd", value: string}>} Array of parsed tokens objects.
	 */
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

		let last = new ValueStep('cmd', async (ctx, params) => {
			let values = null;
			if (this.cmd.fields) {
				values = {};
				for (let fieldKey in this.cmd.fields) {
					let field = this.cmd.fields[fieldKey];
					let fieldType = this.module.self.getFieldType(field.type);
					values[fieldKey] = await Promise.resolve(fieldType.inputValue(fieldKey, field.opts, params));
				}
			}
			return ctx.char.call('execRoomCmd', {
				cmdId: this.id,
				values,
			});
		});
		step?.setNext(last);

		return first || last;
	}

}

export default CmdPatternParsedCmd;
