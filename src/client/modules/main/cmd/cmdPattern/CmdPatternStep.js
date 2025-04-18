import { mergeCompleteResults, expandCompleteResult } from 'utils/codemirrorTabCompletion';

/**
 * CmdPatternStep is a step that uses command pattern objects.
 */
class CmdPatternStep {

	/**
	 * Creates an instance of CmdPatternStep.
	 * @param {CmdPatternModules} module CmdPattern modules.
	 * @param {() => Array<import('./CmdPatternParsedCmd').default>} getPatterns Function that returns a sorted list of parsed command patterns.
	 * @param {object} [opt] Optional params.
	 * @param {Step} [opt.else] Step after if the not matching any item. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required: function(this)
	 * @param {string} [opt.prefix] Prefix already consumed by another step.
	 * @param {booleab} [opt.doPrefixed] Flag telling if the pattern are do-prefixed, allow all commands.
	 */
	constructor(module, getPatterns, opt) {
		opt = opt || {};
		this.module = module;
		this.getPatterns = getPatterns;
		this.else = opt.else || null;
		this.prefix = opt.prefix || null;
		this.doPrefixed = !!opt.doPrefixed;
		this.parseCache = {};
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: null;

	}

	blank(state) {
		let o = state.getState("cmdPattern");
		if (o) {
			// Try to handle this empty line with continueWith.
			return this._handleContinueWith(null, state, o.cmd, o.continueWith, o.values);
		}
	}


	/**
	 * Parses the stream input stream.
	 * @param {import('@codemirror/language').StringStream | null} stream String stream.
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {null | string | false} Null if no token, string on token, false if no match
	 */
	parse(stream, state) {
		// Get any state left by previous call to parse.
		let o = state.getState("cmdPattern");

		// No more input
		if (!stream) {
			return !o ? this._setRequired(state) : false;
		}

		// See if the initial parsing is complete. If so, handle next tag.
		if (o) {
			// If we have no more tags, the line is consumed and we are on a new line
			if (!o.tags || o.tags.length <= (o.idx + 1)) {
				// Try to handle this new line with continueWith.
				return this._handleContinueWith(stream, state, o.cmd, o.continueWith, o.values);
			}
			// Handle next tag
			return this._handleTag(stream, state, o.cmd, o.tags, o.continueWith, o.values, o.idx + 1);
		}

		let list = this._getParsedList(this.doPrefixed);

		let m = stream.match(/^.+/, false);
		if (!m || !m[0]) {
			return this._setRequired(state);
		}

		let str = m[0];

		let maxMatch = 0;
		let bestCmd = null;
		let bestMatch = null;
		let bestValues = null;
		for (let cmd of list) {
			// Values populated by fields
			let values = {};
			// If the command matches, add its step and exit.
			let m = cmd.matches(state.getCtx(), str, this.prefix ? 1 : 0, values);
			// If all was matched (not partial), select this command by adding its step.
			if (!m.partial) {
				return this._setMatchAndHandle(stream, state, cmd, m, values);
			}

			let matched = str.length - m.remaining.length;
			if (maxMatch < matched) {
				maxMatch = matched;
				bestCmd = cmd;
				bestMatch = m;
				bestValues = values;
			}
		}

		// While not a perfect match, we select this command by adding its step.
		if (bestCmd) {
			return this._setMatchAndHandle(stream, state, bestCmd, bestMatch, bestValues);
		}

		// No match
		state.backUp(stream);
		return this._setRequired(state);
	}

	/**
	 * Get results for tab completion.
	 * Will return null unless state.params has 'cmdPattern' set.
	 * @param {string} doc Full document text.
	 * @param {number} pos Cursor position
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {import('types/interfaces/Completer').CompleteResult' | null} Complete results or null.
	 */
	completeCmd(doc, pos, state) {
		// Check if prefixed with "do".
		let prefixLen = 0;
		let m = doc.match(/^\s*([\p{L}\p{N}]+)/u);
		let str = doc;
		// Only consider it doPrefixed if we tab-complete after the prefix
		if (m && m[1].toLowerCase() == "do" && pos > m[0].length) {
			prefixLen = m[0].length;
			str = str.slice(prefixLen);
		}

		let list = this._getParsedList(prefixLen > 0);
		let result = null;

		for (let i = 0; i < list.length; i++) {
			let cmd = list[i];
			// Get complete results from the cmd
			let cmdResult = cmd.complete(state.getCtx(), str, prefixLen, pos);
			if (cmdResult) {
				// Filter if any previous command might overshadow this command's complete result.
				if (i > 0 && cmdResult.list.length) {
					if (result) {
						cmdResult = expandCompleteResult(cmdResult, doc, result.from, result.to);
						result = expandCompleteResult(result, doc, cmdResult.from, cmdResult.to);
					}
					cmdResult.list = cmdResult.list.filter(txt => {
						return !(result?.list.includes(txt)) && // Filter out duplicates.
							!this._isOvershadowed(doc.slice(0, cmdResult.from) + txt + doc.slice(cmdResult.to), cmd, list, state);
					});
				}
				result = mergeCompleteResults(doc, result, cmdResult);
			}
		}

		return result;
	}

	/**
	 * Returns options for formatting of text.
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {{ id: string } | null} Returns an object with a unique ID for
	 * the token being formatted, and other optional parameters as passed to
	 * formatText. Null means no formatting.
	 */
	formatText(state) {
		let o = state.getState("cmdPattern");
		let tokenIdx = o?.tags?.[o.idx].tokenIdx;
		if (typeof tokenIdx == 'number') {
			let ret = o.cmd.formatText(tokenIdx);
			if (ret) {
				ret = typeof ret == 'object' ? ret : {};
				ret.id = 'cmdPattern-' + o.cmd.id + '-' + tokenIdx;
			}
			return ret;
		}

		return null;
	}


	/**
	 * Tests if testCmd is overshadowed by other commands.
	 * @param {string} doc Text to test against.
	 * @param {CmdPatternParsedCmd} testCmd Parsed command to test.
	 * @param {Array<CmdPatternParsedCmd>} list List of parsed commands.
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {boolean} True if overshadowed.
	 */
	_isOvershadowed(doc, testCmd, list, state) {
		let maxMatch = 0;
		let bestMatch = null;
		for (let cmd of list) {
			if (cmd == testCmd) {
				return false;
			}
			// If the command matches, add its step and exit.
			let m = cmd.matches(state.getCtx(), doc);
			// If all was matched (not partial), select this command by adding its step.
			if (!m.partial) {
				return cmd != testCmd;
			}

			let matched = doc.length - m.remaining.length;
			if (maxMatch < matched) {
				maxMatch = matched;
				bestMatch = cmd;
			}
		}

		return testCmd != bestMatch;
	}

	_setRequired(state) {
		if (this.else) {
			state.addStep(this.else);
		} else if (this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
	}

	_setMatchAndHandle(stream, state, cmd, match, values) {
		// Handle error
		if (match.error) {
			state.setError((ctx, params) => {
				this._showErrorAndHelp(ctx.char, cmd, match.error);
			});

		// Handle partial match or error
		} else if (match.partial || match.error) {
			// If last matching token idx is null, and we don't have a previous
			// match that we continue, it means we have no matching token at
			// all.
			if (match.lastIdx === null && !match.continueWith) {
				return false;
			}

			// Set the command to execute on no-error
			state.setParam('cmd', (ctx, params) => {
				// this.module.charLog.logComponent(char, 'errorComponent', err);
				let err = match.error || cmd.getPartialError(match.lastIdx || match.continueWith, match.remaining);
				this._showErrorAndHelp(ctx.char, cmd, err);
			});

		// Handle complete match
		} else {
			// Set the command to execute on no-error
			state.setParam('cmd', async (ctx, params) => {
				let v = null;
				if (cmd.cmd.fields) {
					v = {};
					for (let fieldKey in cmd.cmd.fields) {
						let field = cmd.cmd.fields[fieldKey];
						let fieldType = this.module.self.getFieldType(field.type);
						v[fieldKey] = await Promise.resolve(fieldType.inputValue ? fieldType.inputValue(fieldKey, field.opts, values[fieldKey]) : values[fieldKey]);
					}
				}
				return ctx.char.call('execRoomCmd', {
					cmdId: cmd.id,
					values: v,
				});
			});
		}

		return this._handleTag(stream, state, cmd, match.tags, match.continueWith, values, 0);
	}

	_showErrorAndHelp(char, cmd, err) {
		if (typeof err == 'object' && err) {
			if (err.code) {
				this.module.charLog.logError(char, err);
			} else if (err.render) {
				this.module.charLog.logComponent(char, 'errorComponent', err);
			}

			this.module.charLog.logComponent(char, 'cmdPatternHelpTopic', this.module.help.newHelpTopic(cmd.helpTopic()));
		}
	}

	// Progresses the stream and returns the tags (tokens for CodeMirror).
	_handleTag(stream, state, cmd, tags, continueWith, values, idx) {
		let t = null;
		if (stream && tags && tags.length > idx) {
			// Consume the number of characters indicated by the tag.
			t = tags[idx];
			for (let i = 0; i < t.n; i++) {
				stream.next();
			}
		}

		// Set state, and add this step to handle next tag.
		state.setState("cmdPattern", { cmd, tags: (!stream || !tags) ? null : tags, continueWith, values, idx });
		state.addStep(this);
		// Return the tag. A tag in this context is the same as a CodeMirror
		// token. Tag is used to avoid naming conflict with command tokens.
		return t ? t.tag : false;
	}

	_handleContinueWith(stream, state, cmd, continueWith, values) {
		// If we have no token to continue with, we tags it as error.
		if (typeof continueWith != 'number') {
			stream?.match(/^.*/);
			return 'error';
		}

		// Match everything (or nothing if we don't have a stream due to a blank line)
		let str = stream?.match(/^.*/, false)?.[0] || '';

		// Match again, continuing with the given token idx.
		let m = cmd.matches(state.getCtx(), str, continueWith, values);

		return this._setMatchAndHandle(stream, state, cmd, m, values);
	}

	/**
	 * Gets a list of parsed patterns.
	 * @param {boolean} doPrefixed Flag telling if we have a do-prefix. If false, commands requiring do-prefix are filtered out.
	 * @returns {Array<import('./CmdPatternParsedCmd').default>} Parsed commands.
	 */
	_getParsedList(doPrefixed) {
		let cmdPatterns = this.getPatterns();
		if (this.prefix) {
			cmdPatterns = cmdPatterns.filter(p => p.isWordToken(0, this.prefix) && (doPrefixed || !p.requiresDoPrefix()));
		} else if (!doPrefixed) {
			cmdPatterns = cmdPatterns.filter(p => !p.requiresDoPrefix());
		}
		return cmdPatterns;
	}
}

export default CmdPatternStep;
