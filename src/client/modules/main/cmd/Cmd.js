import { Html } from 'modapp-base-component';
import { Collection } from 'modapp-resource';
import { StreamLanguage, StringStream } from '@codemirror/language';
import l10n from 'modapp-l10n';
import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';
import ErrorStep from 'classes/ErrorStep';
import Err from 'classes/Err';
import escapeHtml from 'utils/escapeHtml';
import { getToken } from 'utils/codemirror';
import compareSortOrderId from 'utils/compareSortOrderId';
import { mergeCompleteResults, offsetCompleteResults } from 'utils/codemirrorTabCompletion';
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
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});
		this.cmdHandlers = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});
		this.cmdHandlerSteps = {};
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

		let doc = editorState.doc.toString();

		/** @type {import('classes/CmdState').default | undefined} */
		let state = token?.state;
		/** @type {import('types/interfaces/Completer').default | undefined} */
		let step = state?.step;

		// Start with completer results from cmdStep
		let result = mergeCompleteResults(doc, null, this._cmdStepComplete(doc, pos, state?.getCtx()));

		// Add completer results from the current token
		if (typeof step?.complete == 'function') {
			// Get the range from the completer.
			let range = step.complete(doc.slice(token.from, token.to), pos - token.from, state);
			if (range && range.list && range.list.length) {
				result = mergeCompleteResults(doc, result, offsetCompleteResults(range, token.from));
			}
		}

		// Add completer suggestions from other cmdHandlers
		if (state) {
			for (let cmdHandler of this.cmdHandlers) {
				let step = this.cmdHandlerSteps[cmdHandler.id];
				if (cmdHandler.complete && step) {
					result = mergeCompleteResults(doc, result, cmdHandler.complete(step, doc, pos, state));
				}
			}
		}

		return result;
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
			return typeof err == 'function'
				? Promise.resolve(err(ctx, p))
				: Promise.reject(typeof err == 'string'
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

	/**
	 * Adds a command.
	 * @param {object|string} def Item object to add, or item key as a string.
	 * @param {string} def.key Item key. Eg. 'say'.
	 * @param {string} [def.value] Item value. For commands, it is usually a callback function.
	 * @param {Step|Array.<CmdStep>} def.next Next step or steps to follow after the item.
	 * @param {Array.<string>} [def.alias] A list of alias for the item. Eg. [ 's', '/say' ]
	 * @param {string} [def.symbol] A single ascii symbol character for the item that may not otherwise match the regex. Eg. ':'
	 * @returns {this}
	 */
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
		let cmdPrefix = this.prefixes[prefix];
		if (!cmdPrefix) {
			let list = new ItemList('object', {
				name: "object type",
			});
			let step = new ListStep('object', list, {
				name: "object type",
				token: 'name',
				errRequired: null,
				errNotFound: null,
			});
			cmdPrefix = { list, step };
			this.prefixes[prefix] = cmdPrefix;
			this.addCmd({
				key: prefix,
				next: step,
				value: this._execPrefix,
			});

			this._setCmdPrefixHandlers(prefix, cmdPrefix);
		}

		if (typeof exec == 'function') {
			def = Object.assign({}, def, { value: exec });
		}

		cmdPrefix.list.addItem(def);
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
	 * @param {(step: Step, doc: string, pos: number: state: import('classes/CmdState').default) => import('types/interfaces/Completer').CompleteResult | null} [cmdHandler.complete] Complete callback using the full document as text.
	 * @param {number} cmdHandler.sortOrder Sort order.
	 * @returns {this}
	 */
	addCmdHandler(cmdHandler) {
		if (this.cmdHandlers.get(cmdHandler.id)) {
			throw new Error("CmdHandler ID already registered: ", cmdHandler.id);
		}
		this.cmdHandlers.add(cmdHandler);
		this._setCmdHandlers();
		return this;
	}

	/**
	 * Unregisters a previously registered command handler.
	 * @param {string} cmdHandlerId Command handler ID.
	 * @returns {this}
	 */
	removeCmdHandler(cmdHandlerId) {
		this.cmdHandlers.remove(cmdHandlerId);
		this._setCmdHandlers();
		return this;
	}

	/**
	 * Checks if a command is registered with `addCmd` or `addPrefixCmd` that
	 * matches the command/prefix + command.
	 *
	 * If we check for a non-prefixed command that matches a prefix (e.g.
	 * commandExist("create")), the function returns true.
	 * @param {string} prefixOrCmd Command prefix or command (if it has no prefix).
	 * @param {string} [cmd] Command after prefix, or omitted if it has no prefix..
	 * @returns {boolean} True if it matches a registered command.
	 */
	commandExists(prefixOrCmd, cmd) {
		let item = this.cmds.getItem(prefixOrCmd);
		let prefixCmds = item && this.prefixes[item.key]?.list;
		// Done if match was not a prefix or we have no prefix.
		if (!prefixCmds || !cmd) {
			return !!item;
		}
		return !!prefixCmds.getItem(cmd);
	}

	_setCmdHandlers() {
		// Last step is always a commandNotFound error.
		let step = new ErrorStep(
			/^\s*([\p{L}\p{N}/][\p{L}\p{N}\s]*)/u,
			(match) => this.newCommandNotFound(match),
		);
		let steps = {};
		for (let i = this.cmdHandlers.length - 1; i >= 0; i--) {
			let h = this.cmdHandlers.atIndex(i);
			let newStep = h.factory(step);
			if (newStep) {
				steps[h.id] = newStep;
				step = newStep;
			}
		}
		this.cmdHandlerSteps = steps;
		this.cmdStep.setElse(step);

		// Update all cmd prefixes ("create", "get", "set", etc.)
		for (let prefix in this.prefixes) {
			this._setCmdPrefixHandlers(prefix, this.prefixes[prefix]);
		}
	}

	_setCmdPrefixHandlers(prefix, cmdPrefix) {
		// Last step is always a commandNotFound error.
		let step = new ErrorStep(
			/^\s*([\p{L}\p{N}/][\p{L}\p{N}\s]*)/u,
			(match) => new Err('cmd.commandObjectTypeNotFound', `There is nothing called "{match}" to {prefix}.`, { prefix, match }),
			new Err('cmd.cmdObjectTypeRequired', `What would you like to {prefix}?`, { prefix }),
		);

		for (let i = this.cmdHandlers.length - 1; i >= 0; i--) {
			let h = this.cmdHandlers.atIndex(i);
			let newStep = h.factory(step, prefix);
			if (newStep) {
				step = newStep;
			}
		}
		cmdPrefix.step.setElse(step);
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

	/**
	 * Gets tab completion results for cmdSteps.
	 * @param {string} doc Console text.
	 * @param {number} pos Cursor position.
	 * @param {any} ctx Context.
	 * @returns {import('types/interfaces/Completer').CompleteResult | null} Results or null if not applicable.
	 */
	_cmdStepComplete(doc, pos, ctx) {
		let stream = new StringStream(doc, 0, 0, 0);
		stream.eatSpace();
		// If the cursor position is before any text starts
		if (stream.pos > pos) {
			return offsetCompleteResults(this.cmds.complete("", 0, ctx), pos);
		}

		let match = this.cmds.consume(stream);
		if (typeof match == 'string') {
			if (stream.pos >= pos) {
				// Eg. "  hejsa|n ":  pos = 7, stream.pos = 8, match = "hejsan"
				let offset = stream.pos - match.length;
				return offsetCompleteResults(this.cmds.complete(match, pos - offset, ctx), offset);
			}
			let item = this.cmds.getItem(match, ctx);
			let prefixCmds = item && this.prefixes[item.key]?.list;
			if (prefixCmds) {
				stream.eatSpace();
				// If the cursor position is before any text starts
				if (stream.pos > pos) {
					return offsetCompleteResults(prefixCmds.complete("", 0, ctx), pos);
				}
				let match = prefixCmds.consume(stream);
				if (typeof match == 'string') {
					if (stream.pos >= pos) {
						// Eg. "  hejsa|n ":  pos = 7, stream.pos = 8, match = "hejsan"
						let offset = stream.pos - match.length;
						return offsetCompleteResults(prefixCmds.complete(match, pos - offset, ctx), offset);
					}
				}
			}
		}

		// Beyond the initial cmd step
		return null;
	}
}

export default Cmd;
