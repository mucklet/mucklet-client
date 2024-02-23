import l10n from 'modapp-l10n';
import { replyCmds, replyAllCmds, containsTarget } from 'utils/replyToEvent';
import { relistenResource } from 'utils/listenResource';

function getReply(charId, ev, all) {
	return (all ? replyAllCmds : replyCmds)[ev.type](charId, ev);
}

/**
 * ConsoleReplyLast adds Alt-R as a keymap to the console to reply to last replyable message.
 */
class ConsoleReplyLast {
	constructor(app, params) {
		this.app = app;

		// Size of the buffer for reply to messages.
		this.bufferSize = parseInt(params?.bufferSize) || 10;

		// Bind callbacks
		this._replyAll = this._replyLast.bind(this, true);
		this._reply = this._replyLast.bind(this, false);
		this._addEvent = this._addEvent.bind(this);
		this._onStateChange = this._onStateChange.bind(this);

		this.app.require([
			'console',
			'charLog',
			'helpConsole',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.lastState = null;
		this.lastIdx = null;
		this.lastReply = null;

		this.chars = {};

		for (let type in replyCmds) {
			this.module.charLog.addEventHandler(type, this._addEvent);
		}

		this.module.console.addKeymap('Alt-r', { run: this._replyAll });
		this.module.console.addKeymap('Alt-R', { run: this._reply });

		this.module.helpConsole.addShortcut({
			id: 'replyLastAll',
			usage: '<kbd>Alt</kbd> + <kbd>R</kbd>',
			desc: l10n.l('consoleReplyLast.replyAllDesc', `<p>Reply to sender and receivers of recent messages. Cycle by pressing the keys repeatedly.<p>`),
			sortOrder: 70,
		});
		this.module.helpConsole.addShortcut({
			id: 'replyLastSender',
			usage: '<kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>',
			desc: l10n.l('consoleReplyLast.replySenderDesc', `<p>Reply to sender of recent messages. Cycle by pressing the keys repeatedly.<p>`),
			sortOrder: 80,
		});
	}

	/**
	 * Callback for keymap binding.
	 * @param {bool} all Flag to reply to all.
	 * @param {ConsoleState} state Console module's ConsoleState for the character.
	 * @param {EditorView} ctx CodeMirror's EditorView.
	 */
	_replyLast(all, state, ctx) {
		let charId = state.getCtrlId();
		let charEvents = this._getCharEvents(charId);
		let l = charEvents.length;
		// Do nothing if we have nothing to reply to.
		if (!l) return;

		let idx = this.lastIdx || 0;
		let storeHistory = true;
		let reply = '';
		// If it is the same state that we used last, we are cycling through the
		// events list till we find a different one. History is not stored.
		if (this.lastState == state) {
			storeHistory = false;
			for (let i = 0; i < l + 1; i++) {
				idx = (idx + 1) % l;
				reply = getReply(charId, charEvents[idx], all);
				if (reply != this.lastReply) {
					break;
				}
			}
		} else {
			reply = getReply(charId, charEvents[idx], all);
		}

		this.lastState = relistenResource(this.lastState, state, this._onStateChange);
		this.lastIdx = idx;
		this.lastReply = reply;

		this.module.console.setCommand(charId, reply, storeHistory);
	}

	_addEvent(charId, ev) {
		// Ignore events, such as address, where character is neither the sender
		// nor a target.
		if (ev.char?.id != charId && !containsTarget(charId, ev)) {
			return;
		}

		let charEvents = this._getCharEvents(charId);
		charEvents.unshift(ev);
		if (charEvents.length > this.bufferSize) {
			charEvents.pop();
		}
		// If we are currently cycling, add to lastIdx to match the shift.
		if (charId == this.lastState?.getCtrlId()) {
			this.lastIdx++;
		}
	}

	_getCharEvents(charId) {
		let charEvents = this.chars[charId];
		if (!charEvents) {
			charEvents = [];
			this.chars[charId] = charEvents;
		}
		return charEvents;
	}

	_onStateChange() {
		if (!this.lastState) return;

		// Remove the stored state as we are no longer cycling.
		if (this.lastState.doc !== this.lastReply) {
			this._removeLastState();
		}
	}

	_removeLastState() {
		this.lastState = relistenResource(this.lastState, null, this._onStateChange);
		this.lastIdx = null;
		this.lastReply = null;
	}

	dispose() {
		this._removeLastState();
		this.module.console.removeKeymap('Alt-r');
		this.module.console.removeKeymap('Alt-R');
		for (let type in replyCmds) {
			this.module.charLog.removeEventHandler(type, this._addEvent);
		}
	}
}

export default ConsoleReplyLast;
