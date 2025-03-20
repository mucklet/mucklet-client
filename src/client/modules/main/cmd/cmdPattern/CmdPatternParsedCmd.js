import { Html } from 'modapp-base-component';
import Err from 'classes/Err';
import expandSelection from 'utils/expandSelection';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatText from 'utils/formatText';
import firstLetterUppercase from 'utils/firstLetterUppercase';

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

// Style tags (used with CodeMirror tokens). See cmdParser.js for list of available tags.
const tagWord = 'cmd';
const tagWordIncomplete = 'error';
const tagSymbol = 'delim';

const errIncompleteCommand = new Err('cmdPattern.incompleteCommand', "Command is incomplete.");

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
		/** @type {Array<{ token: string, value: string, delims?: string}>} */
		this.tokens = this._setFieldTokenDelims(this._parse(cmd));
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
	 * 	remaining: string,
	 * 	partial: boolean,
	 * 	lastIdx: number,
	 * 	continueWith: number | null,
	 * 	error?: Err | null,
	 *  tags?: Array<{ tokenIdx: number, tag: string, n: number}>,
	 * } | null}  and a flag to tell if it is a partial match. If continueWith is a number, it is the token idx to continue with in case of new line.
	 */
	matches(s, idx = 0, values = null) {
		let tags = [];
		let result = this._matches(s, idx, 0, tags, values);
		return { ...result, tags };
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

	/**
	 * Returns an error for the command being partially matched.
	 * @param {number} lastIdx The last token index that was successfully matched.
	 * @param {string} remaining The remaining string that wasn't matched.
	 * @returns {Err} Error.
	 */
	getPartialError(lastIdx, remaining) {
		if (remaining) {
			return new Html(
				l10n.t('cmdPattern.commandMissingWord', `I don't understand "<span class="cmd">{remaining}</span>".`, { remaining: escapeHtml(remaining) }),
				{ className: 'common--formattext' },
			);
		}

		let opts = 0;
		for (let i = lastIdx + 1; i < this.tokens.length; i++) {
			let t = this.tokens[i];
			if (t.token == tokenOptStart) {
				opts++;
			} else if (t.token == tokenOptEnd) {
				opts = Math.max(opts - 1, 0);
			} else if (!opts) {
				switch (t.token) {
					case tokenWord:
						return new Html(
							l10n.t('cmdPattern.commandMissingWord', 'Command misses the word <span class="cmd">{word}</span>.', { word: escapeHtml(t.value) }),
							{ className: 'common--formattext' },
						);

					case tokenSymbol:
						return new Html(
							l10n.t('cmdPattern.commandMissingWord', 'Command misses the "<span class="cmd">{delim}</span>" delimiter.', { delim: escapeHtml(t.value) }),
							{ className: 'common--formattext' },
						);

					case tokenField:
						return new Html(
							l10n.t('cmdPattern.commandMissingWord', '<i>{fieldKey}</i> is missing.', { fieldKey: escapeHtml(t.value) }),
							{ className: 'common--formattext' },
						);
				}
				// Token not handled. Lets stop and return the standard error.
				break;
			}
		}
		return errIncompleteCommand;
	}

	/**
	 * Checks if the command matches the requested help command, and if it does,
	 * returns the full help pattern.
	 * @param {Array<string>} helpWords The command that the user want help with split into words. "help <helpWprds>"
	 * @param {boolean} exactMatch Flag to return null unless it is an exact match of all words.
	 * @returns {string|null} All the command's word tokens concatenated with space on match, otherwise null.
	 */
	matchesHelp(helpWords, exactMatch) {
		let wordTokens = [];
		let opts = 0;
		let idx = 0;
		// Loop through the tokens and match words against the helpWords.
		// But only match non-optional words.
		for (let t of this.tokens) {
			if (t.token == tokenOptStart) {
				opts++;
			} else if (t.token == tokenOptEnd) {
				opts = Math.max(opts - 1, 0);
			} else if (!opts && t.token == tokenWord) {
				wordTokens.push(t.value);
				if (helpWords.length > idx && t.value == helpWords[idx]) {
					idx++;
				} else if (exactMatch) {
					return null;
				}
			}
		}

		// Return the Did we match all words
		return helpWords.length == idx ? wordTokens.join(' ') : null;
	}

	/**
	 * Creates a new Help topic object that can be used with the Help module's newHelpTopic.
	 * @returns {{usage: string, desc: string}} Help topic component.
	 */
	helpTopic() {
		let fieldDescs = [];
		let fieldKeys = {};
		let s = "";
		let noSpace = true;
		let addSpace = (noSpaceAfter) => {
			s = noSpace ? s : s + " ";
			noSpace = noSpaceAfter;
		};
		for (let t of this.tokens) {
			switch (t.token) {
				case tokenWord:
					addSpace();
					s += escapeHtml(t.value);
					break;

				case tokenSymbol:
					addSpace();
					s += `<span class="delim">${escapeHtml(t.value)}</span>`;
					break;

				case tokenOptStart:
					addSpace(true);
					s += `<span class="optdelim">${escapeHtml(t.value)}</span>`;
					break;

				case tokenOptEnd:
					s += `<span class="optdelim">${escapeHtml(t.value)}</span>`;
					break;

				case tokenField:
					addSpace();
					s += `<span class="field">&lt;${escapeHtml(firstLetterUppercase(t.value))}&gt;</span>`;
					// Add field description if available.
					if (!fieldKeys[t.value]) {
						// Set it as visited
						fieldKeys[t.value] = true;
						// Get field description
						let field = this.cmd.fields[t.value];
						let fieldDesc = field.desc;
						if (fieldDesc) {
							// Add full stop if ending with character or letter.
							let lastChar = fieldDesc.slice(-1);
							if (lastChar.match(/[\p{L}\p{N}]/u)) {
								fieldDesc += '.';
							}
						}
						let fieldType = this.module.self.getFieldType(field.type);
						// Get any additional info that the field itself may add.
						let info = fieldType?.getDescInfo?.(field.opts);
						if (info) {
							fieldDesc = fieldDesc ? fieldDesc + ' ' + info : info;
						}
						if (fieldDesc) {
							fieldDescs.push(`<tr><td><span class="field">&lt;${escapeHtml(firstLetterUppercase(t.value))}&gt;</span></td><td><span class="common--formattext">${formatText(fieldDesc)}</span></td></tr>`);
						}
					}
					break;
			}
		}

		// `<p>Create a profile based on your character's current appearance. This stores the <em>gender</em>, <em>species</em>, <em>description</em>, and <em>image</em>.</p>
		// <p><code class="param">Keyword</code> is the keyword to use for the profile.</p>
		// <p><code class="param">Name</code> is a descriptive name for the profile.</p>`;
		let desc = this.cmd.desc ? `<div class="common--formattext">${formatText(this.cmd.desc)}</div>` : null;
		if (fieldDescs.length) {

			desc = (desc || '') + `<table class="tbl-small tbl-nomargin">` +
				`<tbody>` +
					fieldDescs.join('') +
				`</tbody>` +
			`</table>`;
		}

		return { usage: s, desc, examples: null };
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
	 * @param {Array<{tokenIdx: number, tag: string, n: number}> | null} tags Ordered array of output tags.
	 * @param {Record<string, any> | null} values Values object where field values are stored under each field key. If null, no values are collected.
	 * @param {((tokenIdx: number, from: number, to: number) => boolean) | null} [cb] Token callback. If it returns true, the matching stops and "" is returned.
	 * @returns {{
	 * 	remaining: string,
	 * 	partial: boolean,
	 * 	lastIdx: number | null,
	 * 	error: Err | null,
	 * 	continueWith: number | null
	 * } | null} Remaining string and a flag to tell if it is a partial match, or null if stopped by the callback.
	 */
	_matches(s, idx = 0, pos = 0, tags = null, values = null, cb = null) {
		let lastIdx = null;
		let continueWith = null;
		let error = null;

		const eatSpace = (addTag = false) => {
			let ns = s.trimStart();
			let space = s.length - ns.length;
			if (addTag && tags && space) {
				tags.push({ tokenIdx: null, tag: null, n: space });
			}
			pos += space;
			s = ns;
		};
		const callback = (tag, idx, start, end) => {
			if (tag && tags && start < end) {
				tags.push({ tokenIdx: idx, tag, n: end - pos });
			}
			return cb?.(idx, start, end);
		};
		// Creates a result object to return.
		const result = (remaining, partial) => ({
			remaining,
			partial,
			lastIdx,
			continueWith,
			error,
		});

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
						return result(s, true);
					}

					// Check if we have a partial match
					let len = t.value.length;
					let remaining = len - m[0].length;
					if (remaining > 0) {
						// Partial match and stop traversing.
						if (callback(tagWordIncomplete, idx, tokenStart, pos + m[0].length)) {
							return null;
						}
						return result(s.slice(m[0].length), true);
					}
					// Slice away the matching word
					if (callback(tagWord, idx, tokenStart, pos + len)) {
						return null;
					}
					s = s.slice(len);
					pos += len;

					break;

				case tokenSymbol:
					eatSpace(true);
					// Check if the symbol matches.
					if (!s || s.charAt(0) != t.value) {
						return result(s, true);
					}
					if (callback(tagSymbol, idx, tokenStart, pos + 1)) {
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
					// Set last matched idx
					if (typeof optResult.lastIdx != 'number') {
						optResult.lastIdx = lastIdx;
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
						return result(tokenStr, true);
					}

					// If we are collecting tags, create a new array for field
					// tags. After matching against the field, we append those
					// tags to our existing tags array.
					let fieldTags = tags ? [] : null;
					let fieldMatch = fieldType.match(t.value, tokenStr, field.opts, t.delims || null, fieldTags, values ? values[t.value] : null);
					// Null is a non-match
					if (!fieldMatch) {
						if (callback(null, idx, tokenStart, tokenStart)) {
							return null;
						}
						return result(tokenStr, true);
					}

					// If possible, add field tag to our tags array, and include token index.
					tags?.push.apply(tags, fieldTags.map(tag => ({ tokenIdx: idx, ...tag })));

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
						return result(s, true);
					}
					break;
			}

			// Set lastIdx to the last matching token idx.
			lastIdx = idx;
		}
		// End by eating remaining space
		eatSpace(true);

		return result(s, !!s);
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

		const setState = (newState) => {
			if (state != tokenNone) {
				if (state == tokenWord) {
					str = str.toLowerCase();
				}
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
						setState(tokenWord);
					}
					str += char;
					break;
				case charTypeSymbol:
					if (state != tokenField) {
						setState(tokenSymbol);
					}
					str += char;
					break;
				case charTypeSpace:
					if (state != tokenField) {
						setState(tokenNone);
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
							setState(tokenField);
							break;
						case '>':
							setState(tokenNone);
							break;
						case '[':
							setState(tokenOptStart);
							break;
						case ']':
							setState(tokenOptEnd);
							break;
					}
					break;

			}
		}
		setState();

		return tokens;
	}

	/**
	 * Checks the field tokens and which other tokens may be adjecent, to
	 * determine what type of delimiters are needed.
	 * @param {Array<{ token: string, value: string}>} tokens Tokens without delims.
	 * @returns {Array<{ token: string, value: string, delims?: string}>} Tokens with delims for field tokens.
	 */
	_setFieldTokenDelims(tokens) {
		var fields = [];

		const tryAddDelim = (delim) => {
			// Add delim to all affected fields
			fields.forEach(f => {
				if (!f.token.delims?.includes(delim)) {
					f.token.delims = (f.token.delims || "") + delim;
				}
				f.count--;
			});
			// Filter away fields with no more adjecent
			fields = fields.filter(f => f.count);
		};

		for (let t of tokens) {
			switch (t.token) {
				case tokenOptStart:
					// Increase possible count of adjecent tokens
					fields.forEach(f => f.count++);
					break;
				case tokenWord:
					tryAddDelim(' '); // Space delim
					break;
				case tokenField:
					tryAddDelim(' '); // Space delim
					fields.push({ token: t, count: 1 });
					break;

				case tokenSymbol:
					tryAddDelim(t.value);
					break;
			}
		}
		return tokens;
	}

}

export default CmdPatternParsedCmd;
