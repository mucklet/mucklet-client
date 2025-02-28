import { Html } from 'modapp-base-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import { StreamLanguage } from '@codemirror/language';
import l10n from 'modapp-l10n';
import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';
import ErrorStep from 'classes/ErrorStep';
import Err from 'classes/Err';
import escapeHtml from 'utils/escapeHtml';
import { getToken } from 'utils/codemirror';
import cmdParser from './cmdParser';
import cmdHighlightStyle from './cmdHighlightStyle';
import cmdFormattingStyle from './cmdFormattingStyle';
import './cmd.scss';

const errCommandNotFound = new Err('cmd.commandNotFound', "Command not found");

/**
 * Cmd holds available commands.
 */
class Cmd {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._execPrefix = this._execPrefix.bind(this);

		this.app.require([], this._init.bind(this));
	}

	/**
	 * Returns an error of type cmd.commandNotFound.
	 * @param {string} [match] Command match.
	 * @returns {Err} Error
	 */
	newCommandNotFound(match) {
		return match
			? new Err('cmd.commandNotFound', `There is no command called "{match}".`, { match })
			: errCommandNotFound;
	}

	_init(module) {
		this.module = module;
		this.notFoundHandlers = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.cmdHandler = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.cmds = new ItemList({ regex: /^\s*([\p{L}\p{N}/][\p{L}\p{N}]*)/u }); // The / is for /msg type commands
		this.cmdStep = new ListStep('cmd', this.cmds, {
			textId: 'cmdText',
			textIdOnMatch: true,
			name: 'command',
			token: 'name',
			delimToken: 'name',
			errRequired: null,
		});
		this.prefixes = {};
		this.lists = {};

		this._setCmdHandlers();
	}

	/**
	 * Returns the CodeMirror language for commands.
	 * @param {string} charId ID of character for which
	 * @returns {object} CodeMirror language.
	 */
	getCMLanguage(charId) {
		return StreamLanguage.define(cmdParser({
			step: this.cmdStep,
			ctx: { charId },
		}));;
	}

	/**
	 * Returns the CodeMirror highlight style for commands.
	 * @returns {object} CodeMirror highlight style.
	 */
	getCMHighlightStyle() {
		return cmdHighlightStyle;
	}

	/**
	 * Returns the CodeMirror formatting style for formatted text in commands.
	 * @returns {object} CodeMirror highlight style.
	 */
	getCMFormattingStyle() {
		return cmdFormattingStyle;
	}

	getCMTabComplete(editorState) {
		let pos = editorState.selection.main.head;
		let token = getToken(editorState, t => t.to > pos || (t.to == pos && t.type !== null && t.type !== 'delim'));

		let step = token?.state.step;
		if (typeof step?.complete == 'function') {
			// Get the { list, from, to } range from the completer.
			let line = editorState.doc.lineAt(token.from);
			let range = step.complete(line.text.slice(token.from - line.from, token.to - line.from), pos - token.from, token.state);
			if (range && range.list && range.list.length) {
				return {
					list: range.list,
					from: range.from + token.from,
					to: range.to + token.from,
				};
			}
		}
		return null;
	}

	/**
	 * Executes a command using a state parsed by the CodeMirror chartale mode.
	 * @param {object} ctx Call context
	 * @param {object} ctx.player Player object.
	 * @param {object} ctx.char Controlled char object.
	 * @param {import('classes/CmdState').default} state State returned by the chartale mode parser.
	 * @returns {Promise} Promise to the call.
	 */
	exec(ctx, state) {
		state = state.getFinalState();

		console.debug("Command state: ", state);

		var p = state.params;
		let err = state.error;
		if (err) {
			return Promise.reject(typeof err == 'string'
				? new Err('cmd.parseError', err)
				: err.code == 'cmd.commandNotFound'
					? this._resolveNotFound(ctx, err, p.unknown || null)
					: err,
			);
		}
		let f = p.cmd;
		return Promise.resolve(f ? f(ctx, p) : null).then(() => {
			state.callOnExec();
		});
	}

	addCmd(def) {
		this.cmds.addItem(def);
		return this;
	}

	/**
	 * Adds a command with a prefix, such as "create room"
	 * @param {string} prefix Prefix name, such as 'create', 'set', etc.
	 * @param {object} def Command item definition.
	 * @param {function} exec Command execution callback.
	 */
	addPrefixCmd(prefix, def, exec) {
		let list = this.prefixes[prefix];
		if (!list) {
			list = new ItemList('object', {
				name: "object type",
			});
			this.prefixes[prefix] = list;
			this.addCmd({
				key: prefix,
				next: new ListStep('object', list, {
					name: "object type",
					token: 'name',
				}),
				value: this._execPrefix,
			});
		}

		if (typeof exec == 'function') {
			def = Object.assign({}, def, { value: exec });
		}

		list.addItem(def);
	}

	getList(id) {
		let list = this.lists[id];
		if (!list) {
			list = new ItemList();
			this.lists[id] = list;
		}
		return list;
	}

	/**
	 * Registers a not found handler.
	 * @param {object} notFoundHandler NotFound handler object
	 * @param {string} notFoundHandler.id NotFound handler ID.
	 * @param {function} notFoundHandler.onNotFound Callback called when a command is not found. If should return a { code, message, data } object if handled, or else null.
	 * @param {number} notFoundHandler.sortOrder Sort order.
	 * @returns {this}
	 */
	addNotFoundHandler(notFoundHandler) {
		if (this.notFoundHandlers.get(notFoundHandler.id)) {
			throw new Error("NotFoundHandler ID already registered: ", notFoundHandler.id);
		}
		this.notFoundHandlers.add(notFoundHandler);
		return this;
	}

	/**
	 * Unregisters a previously registered not found handler.
	 * @param {string} notFoundHandlerId NotFound handler ID.
	 * @returns {this}
	 */
	removeNotFoundHandler(notFoundHandlerId) {
		this.notFoundHandlers.remove(notFoundHandlerId);
		return this;
	}

	/**
	 * Registers a command handler that adds steps to try to parse/handle
	 * commands. If the handler does not handle the command, it should pass on
	 * handling to the "else" step received by the factory function.
	 * @param {object} cmdHandler Command handler object
	 * @param {string} cmdHandler.id Command handler ID.
	 * @param {(else: Step) => Step} cmdHandler.factory Function that creates a handler step.
	 * @param {number} cmdHandler.sortOrder Sort order.
	 * @returns {this}
	 */
	addCmdHandler(cmdHandler) {
		if (this.cmdHandler.get(cmdHandler.id)) {
			throw new Error("CmdHandler ID already registered: ", cmdHandler.id);
		}
		this.cmdHandler.add(cmdHandler);
		this._setCmdHandlers();
		return this;
	}

	/**
	 * Unregisters a previously registered command handler.
	 * @param {string} cmdHandlerId Command handler ID.
	 * @returns {this}
	 */
	removeCmdHandler(cmdHandlerId) {
		this.cmdHandler.remove(cmdHandlerId);
		this._setCmdHandlers();
		return this;
	}

	_setCmdHandlers() {
		if (!this.cmdStep) {
			return;
		}

		// Last step is always a commandNotFound error.
		let step = new ErrorStep(
			/^\s*([\p{L}\p{N}/][\p{L}\p{N}\s]*)/u,
			(match) => this.newCommandNotFound(match),
		);
		for (let i = this.cmdHandler.length - 1; i >= 0; i--) {
			step = this.cmdHandler.atIndex(i).factory(step);
		}

		this.cmdStep.setElse(step);
	}

	_execPrefix(ctx, p) {
		let f = p.object;
		if (typeof f != 'function') {
			throw new Error("Object value is not a function");
		}
		return f(ctx, p);
	}

	_resolveNotFound(ctx, err, unknown) {
		let match = err.data.match;
		for (let h of this.notFoundHandlers) {
			let result = h.onNotFound(ctx, match, unknown ? match + ' ' + unknown : match);
			if (result) {
				return result;
			}
		}
		return new Html(
			l10n.t('cmd.commandNotFound', 'There is no command named "{match}".', { match: escapeHtml(match) }) + ' Type <span class="cmd">help</span> to learn more.',
			{ className: 'common--formattext' },
		);
	}
}

export default Cmd;
