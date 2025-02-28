import Err from 'classes/Err';
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
		if (!stream) {
			return this._setRequired(state);
		}

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
			let remaining = cmd.matches(str);
			// If all was matched, select this command by adding its step.
			if (remaining == "") {
				state.backUp(stream);
				state.addStep(cmd.getStep());
				return false;
			}

			let matched = str.length - remaining.length;
			if (maxMatch < matched) {
				maxMatch = matched;
				bestMatch = cmd;
			}
		}

		// While not a perfect match, we select this command by adding its step.
		if (bestMatch) {
			state.backUp(stream);
			state.addStep(bestMatch.getStep());
			return false;
		}

		// No match
		state.backUp(stream);
		return this._setRequired(state);
	}

	_setRequired(state) {
		if (this.else) {
			state.addStep(this.else);
		} else if (this.errRequired) {
			state.setError(this.errRequired(this));
		}
		return false;
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
				o = new CmdPatternParsedCmd(this.module, cmd);
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
