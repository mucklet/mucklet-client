import Err from 'classes/Err';
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
	 */
	constructor(module, getPatterns, opt) {
		opt = opt || {};
		this.module = module;
		this.getPatterns = getPatterns;
		this.else = opt.else || null;
		this.prefix = opt.prefix || null;
		this.parseCache = {};
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('cmdPatternStep.required', 'There is no matching command.');

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
		// See if the initial parsing is complete. If so, handle next token.
		let o = state.getState("cmdPattern");
		if (o) {
			// If we have no more tokens, the line is consumed and we are on a new line
			if (!o.tokens) {
				// Try to handle this new line with continueWith.
				return this._handleContinueWith(stream, state, o.cmd, o.continueWith, o.values);
			}
			// Handle next token
			return this._handleToken(stream, state, o.cmd, o.tokens, o.continueWith, o.values, o.idx + 1);
		}

		let list = this._getParsedList();

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
			let m = cmd.matches(str, this.prefix ? 1 : 0, values);
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
	 * @param {text} doc Full document text.
	 * @param {number} pos Cursor position
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {import('types/interfaces/Completer').CompleteResult' | null} Complete results or null.
	 */
	complete(doc, pos, state) {
		let list = this._getParsedList();
		let result = null;

		for (let i = 0; i < list.length; i++) {
			let cmd = list[i];
			// Get complete results from the cmd
			let cmdResult = cmd.complete(doc, pos);
			if (cmdResult) {
				// Filter if any previous command might overshadow this command's complete result.
				if (i > 0 && cmdResult.list.length) {
					if (result) {
						cmdResult = expandCompleteResult(cmdResult, doc, result.from, result.to);
						result = expandCompleteResult(result, doc, cmdResult.from, cmdResult.to);
					}
					cmdResult.list = cmdResult.list.filter(txt => {
						return !(result?.list.includes(txt)) && // Filter out duplicates.
							!this._isOvershadowed(doc.slice(0, cmdResult.from) + txt + doc.slice(cmdResult.to), cmd, list);
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
		return o
			? o.cmd.formatText(o.idx)
			: null;
	}


	/**
	 * Tests if testCmd is overshadowed by other commands.
	 * @param {string} doc Text to test against.
	 * @param {CmdPatternParsedCmd} testCmd Parsed command to test.
	 * @param {Array<CmdPatternParsedCmd>} list List of parsed commands.
	 * @returns {boolean} True if overshadowed.
	 */
	_isOvershadowed(doc, testCmd, list) {
		// Check if it is overshadowed by a client command
		if (this.module.cmd.matchesCommand(doc)) {
			return true;
		}

		let maxMatch = 0;
		let bestMatch = null;
		for (let cmd of list) {
			if (cmd == testCmd) {
				return false;
			}
			// If the command matches, add its step and exit.
			let m = cmd.matches(doc);
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
		if (match.error) {
			state.setError(match.error);
		}
		return this._handleToken(stream, state, cmd, match.tokens, match.continueWith, values, 0);
	}

	_handleToken(stream, state, cmd, tokens, continueWith, values, idx) {
		let t = null;
		if (stream && tokens && tokens.length > idx) {
			// Consume the number of characters indicated by the token.
			t = tokens[idx];
			for (let i = 0; i < t.n; i++) {
				stream.next();
			}
		}

		// Set state, and add this step to handle next token.
		state.setState("cmdPattern", { cmd, tokens: !stream || !tokens || tokens.length == (idx + 1) ? null : tokens, continueWith, values, idx });
		state.addStep(this);
		return t ? t.token : false;
	}

	_handleContinueWith(stream, state, cmd, continueWith, values) {
		// Quick exit if we have no token to continue with on multi-line.
		if (typeof continueWith != 'number') {
			return false;
		}

		// Match everything (or nothing if we don't have a stream due to a blank line)
		let str = stream?.match(/^.*/, false)?.[0] || '';
		// Match again, continuing with the given token idx.
		let m = cmd.matches(str, continueWith, values);

		return this._setMatchAndHandle(stream, state, cmd, m, values);
	}

	/**
	 * Gets a list of parsed patterns.
	 * @returns {Array<import('./CmdPatternParsedCmd').default>} Parsed commands.
	 */
	_getParsedList() {
		let cmdPatterns = this.getPatterns();
		if (this.prefix) {
			cmdPatterns = cmdPatterns.filter(p => p.isWordToken(0, this.prefix));
		}
		return cmdPatterns;
	}
}

export default CmdPatternStep;
