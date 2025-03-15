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

// Token tags. See cmdParser.js for list of available tags.
const styleTokenWord = 'cmd';
const styleTokenWordIncomplete = 'error';
const styleTokenSymbol = 'delim';

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
		// this.step = this._createStep();
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
	 * @param {Record<string, any> | null} values Values object where field values are stored under each field key. If null, no values are collected.
	 * @returns {{
	 * 	remaining: string;
	 * 	partial: boolean;
	 * 	continueWith: number | null;
	 * 	error?: Err | null;
	 *  tokens?: Array<{ token: string, from: number, to: number}>
	 * } | null}  and a flag to tell if it is a partial match. If continueWith is a number, it is the token idx to continue with in case of new line.
	 */
	matches(s, idx = 0, values = null) {
		let tokens = [];
		let result = this._matches(s, idx, 0, tokens, values);
		return { ...result, tokens };
	}

	/**
	 * Get results for tab completion.
	 * @param {text} doc Full document text.
	 * @param {number} pos Cursor position
	 * @returns {import('types/interfaces/Completer').CompleteResult' | null} Complete results or null.
	 */
	complete(doc, pos) {
		let result = null;
		this._matches(doc, 0, 0, null, null, (idx, from, to) => {
			// Assert the cursor is within the token.
			if (pos < from || pos > to) {
				// If we've passed the cursor, we return true to indicate that
				// no more matching is needed.
				return pos < from;
			}

			let str = doc.slice(from, to);
			let strpos = pos - from;
			let t = this.tokens[idx];

			switch (t.token) {
				case tokenWord:
					let sel = expandSelection(str, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, strpos, strpos);
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
					result = fieldType.complete?.(str, strpos, field.opts) || null;
					if (result) {
						return true;
					}
					break;
			}

		});
		return result;
	}

	/**
	 * Returns options for formatting of text.
	 * @param {number} idx Index of token.
	 * @returns {{ id: string } | null} Returns an object with a unique ID for
	 * the token being formatted, and other optional parameters as passed to
	 * formatText. Null means no formatting.
	 */
	formatText(idx) {
		let t = this.tokens[idx];
		// Only fields may be formatted
		if (t.token != tokenField) {
			return null;
		}
		let field = this.cmd.fields[t.value];
		let fieldType = this.module.self.getFieldType(field.type);
		return fieldType?.formatText?.(field.opts) || null;
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
	 * @param {Array<{token: string, n: number}> | null} tokens Ordered array of output tokens.
	 * @param {Record<string, any> | null} values Values object where field values are stored under each field key. If null, no values are collected.
	 * @param {((tokenIdx: number, from: number, to: number) => boolean) | null} [cb] Token callback. If it returns true, the matching stops and "" is returned.
	 * @returns {{remaining: string, partial: boolean, error: Err | null, continueWith: number | null} | null} Remaining string and a flag to tell if it is a partial match, or null if stopped by the callback.
	 */
	_matches(s, idx = 0, pos = 0, tokens = null, values = null, cb = null) {
		const eatSpace = (tokenize = false) => {
			let ns = s.trimStart();
			let space = s.length - ns.length;
			if (tokenize && tokens && space) {
				tokens.push({ token: null, n: space });
			}
			pos += space;
			s = ns;
		};
		const callback = (styleToken, idx, start, end) => {
			if (styleToken && tokens && start < end) {
				tokens.push({ token: styleToken, n: end - start });
			}
			return cb?.(idx, start, end);
		};
		let continueWith = null;
		let error = null;

		for (; idx < this.tokens.length; idx++) {
			let tokenStart = pos;
			let tokenStr = s;
			let t = this.tokens[idx];

			switch (t.token) {
				case tokenWord:
					eatSpace(true);
					let m = s.match(/^[a-zA-Z0-9]+/);
					// Check if we have a prefix match
					if (!m || !t.value.startsWith(m[0].toLowerCase())) {
						// No match should still be sent to the callback as it
						// may be use by the completer.
						if (callback(null, idx, tokenStart, pos + (m ? m[0].length : 0))) {
							return null;
						}
						// No match
						return { remaining: s, partial: true, continueWith, error };
					}

					// Check if we have a partial match
					let len = t.value.length;
					let remaining = len - m[0].length;
					if (remaining > 0) {
						// Partial match and stop traversing.
						if (callback(styleTokenWordIncomplete, idx, tokenStart, pos + m[0].length)) {
							return null;
						}
						return { remaining: s.slice(m[0].length), partial: true, continueWith, error };
					}
					// Slice away the matching word
					if (callback(styleTokenWord, idx, tokenStart, pos + len)) {
						return null;
					}
					s = s.slice(len);
					pos += len;

					break;

				case tokenSymbol:
					eatSpace();
					// Check if the symbol matches.
					if (!s || s.charAt(0) != t.value) {
						return { remaining: s, partial: true, continueWith, error };
					}
					if (callback(styleTokenSymbol, idx, tokenStart, pos + 1)) {
						return null;
					}
					s = s.slice(1);
					pos++;
					break;

				case tokenOptStart:
					eatSpace();
					let optResult = this._matches(tokenStr, idx + 1, tokenStart, cb);
					// If the optional path matches more than space, we select it.
					if (!optResult || (optResult.remaining.length >= s.length)) {
						optResult = this._matches(tokenStr, this._findOptEnd(idx + 1) + 1, tokenStart, cb);
					}
					// Set any already existing error.
					if (error) {
						optResult.error = error;
					}
					return optResult;

				case tokenOptEnd:
					break;

				case tokenField:
					let field = this.cmd.fields[t.value];
					let fieldType = this.module.self.getFieldType(field.type);
					if (!fieldType) {
						console.error("missing handler for fieldType: " + field.type);
						return { remaining: tokenStr, partial: true, continueWith, error };
					}

					// If we are collecting tokens, create a new array for field
					// tokens. After matching against the field, we append those
					// tokens to our existing tokens array.
					let fieldTokens = tokens ? [] : null;
					let fieldMatch = fieldType.match(t.value, tokenStr, field.opts, fieldTokens, values ? values[t.value] : null);
					// Null is a non-match
					if (!fieldMatch) {
						if (callback(null, idx, tokenStart, tokenStart)) {
							return null;
						}
						return { remaining: tokenStr, partial: true, continueWith, error };
					}

					// If possibnle, add field tyle tokens to our tokens array.
					tokens?.push.apply(tokens, fieldTokens);

					// Set any returned value (if we have a values object)
					if (values) {
						values[t.value] = fieldMatch.value;
					}

					if (callback(null, idx, pos + fieldMatch.from, pos + fieldMatch.to)) {
						return null;
					}
					pos = tokenStart + fieldMatch.to;
					s = tokenStr.slice(fieldMatch.to);

					// Set any error
					error = error || fieldMatch.error || null;
					// If the field consumes multiple lines, set continueWith:
					continueWith = (fieldMatch.more && !s) ? idx : null;

					// If only partial match, we end here
					if (fieldMatch.partial) {
						return { remaining: s, partial: true, error, continueWith };
					}
					break;
			}
		}
		// End by eating remaining space
		eatSpace(true);

		return { remaining: s, partial: !!s, error, continueWith };
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

	// getStep() {
	// 	return this.step;
	// }

	async getValues(params) {
		let values = null;
		if (this.cmd.fields) {
			values = {};
			for (let fieldKey in this.cmd.fields) {
				let field = this.cmd.fields[fieldKey];
				let fieldType = this.module.self.getFieldType(field.type);
				values[fieldKey] = await Promise.resolve(fieldType.inputValue(fieldKey, field.opts, params));
			}
		}
		return values;
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

}

export default CmdPatternParsedCmd;
