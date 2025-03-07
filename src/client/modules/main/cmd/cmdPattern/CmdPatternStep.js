import Err from 'classes/Err';
import { mergeCompleteResults, expandCompleteResult } from 'utils/codemirrorTabCompletion';
import CmdPatternParsedCmd from './CmdPatternParsedCmd';

/**
 * @typedef {object} CmdPattern
 * @property {string} id Command ID
 * @property {string} pattern Command pattern. Eg. "push <Color> [button]"
 * @property {string} help Command help text.
 * @property {Record<string, { type: string, desc: string, opts?: any }} fields Command fields.
 */

/**
 * CmdPatternStep is a step that uses command pattern objects.
 */
class CmdPatternStep {

	/**
	 * Creates an instance of CmdPatternStep.
	 * @param {CmdPatternModules} module CmdPattern modules.
	 * @param {Array<{id: string, cmd: CmdPattern}> | () => Array<{id: string, cmd: CmdPattern}>} list Sorted pattern list, or function that returns a sorted pattern list.
	 * @param {object} [opt] Optional params.
	 * @param {Step} [opt.else] Step after if the not matching any item. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required: function(this)
	 */
	constructor(module, list, opt) {
		opt = opt || {};
		this.module = module;
		this.factory = typeof list == 'function' ? list : (() => list);
		this.else = opt.else || null;
		this.parseCache = {};
		this.errRequired = opt.hasOwnProperty('errRequired')
			? opt.errRequired
			: self => new Err('cmdPatternStep.required', 'There is no matching command.');

	}

	/**
	 * Parses the stream input stream.
	 * @param {import('@codemirror/language').StringStream | null} stream String stream.
	 * @param {import('classes/CmdState').default} state Command state.
	 * @returns {null | string | false} Null if no token, string on token, false if no match
	 */
	parse(stream, state) {
		// Set state to mark that this step has been called.
		state.setParam('cmdPattern', true);

		// Consume space
		if (stream.eatSpace()) {
			state.addStep(this);
			return null;
		}

		let list = this._getParsedList();

		let m = stream.match(/^.+/, false);
		if (!m || !m[0]) {
			state.backUp(stream);
			return this._setRequired(state);
		}

		let str = m[0];

		let maxMatch = 0;
		let bestMatch = null;
		for (let cmd of list) {
			// If the command matches, add its step and exit.
			let m = cmd.matches(str);
			// If all was matched, select this command by adding its step.
			if (m.complete) {
				this._setStepAndBackup(stream, state, cmd);
				return false;
			}

			let matched = str.length - m.remaining.length;
			if (maxMatch < matched) {
				maxMatch = matched;
				bestMatch = cmd;
			}
		}

		// While not a perfect match, we select this command by adding its step.
		if (bestMatch) {
			this._setStepAndBackup(stream, state, bestMatch);
			return false;
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
		if (!state.getParam('cmdPattern')) {
			return null;
		}

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
	 * Tests if testCmd is overshadowed by other commands.
	 * @param {string} doc Text to test against.
	 * @param {CmdPatternParsedCmd} testCmd Parsed command to test.
	 * @param {Array<CmdPatternParsedCmd>} list List of parsed commands.
	 * @returns {boolean} True if overshadowed.
	 */
	_isOvershadowed(doc, testCmd, list) {
		let maxMatch = 0;
		let bestMatch = null;
		for (let cmd of list) {
			if (cmd == testCmd) {
				return false;
			}
			// If the command matches, add its step and exit.
			let m = cmd.matches(doc);
			// If all was matched, select this command by adding its step.
			if (m.complete) {
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

	_setStepAndBackup(stream, state, cmd) {
		state.backUp(stream);
		state.addStep(cmd.getStep());
	}

	/**
	 * Gets a list of parsed patterns.
	 * @returns {Array<ParsedCmd>} Parsed commands.
	 */
	_getParsedList() {
		let list = this.factory();

		let parsed = [];
		let ids = {};
		// Parse commands or get them from cache
		for (let { id, cmd } of list) {
			ids[id] = true;
			let o = this.parseCache[id];
			if (!o) {
				o = new CmdPatternParsedCmd(this.module, id, cmd);
				this.parseCache[id] = o;
			}
			parsed.push(o);
		}

		// Delete unused items
		for (let id in this.parseCache) {
			if (!ids[id]) {
				delete this.parseCache[id];
			}
		}

		return parsed;
	}
}

export default CmdPatternStep;
