import { Elem } from 'modapp-base-component';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { standardKeymap, insertNewline, cursorDocEnd } from '@codemirror/commands';
import l10n from 'modapp-l10n';
import tabCompletion from 'utils/codemirrorTabCompletion';
import spellcheck from 'utils/codemirrorSpellcheck';
import { getToken } from 'utils/codemirror';

const txtPlaceholder = l10n.l('console.enterYourCommand', "Enter your command (or type help)");

// [TODO] Workaround for CodeMirror issue:
// https://github.com/codemirror/dev/issues/1028
// Remove once the issue is resolved.
const isAndroid = /Android\b/.test(navigator.userAgent || '');

class ConsoleEditor {
	constructor(module, state) {
		this.module = module;
		this.state = state;

		// Bind callbacks
		this._onSend = this._onSend.bind(this);
		this._onUpdate = this._onUpdate.bind(this);
		this._cyclePrev = this._cycleHistory.bind(this, true);
		this._cycleNext = this._cycleHistory.bind(this, false);
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'console-editor' }));
		let rel = this.elem.render(el);
		this.cm = new EditorView({
			state: this._newState(this.state?.doc || ''),
			parent: rel,
		});

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.state?.setDoc(this._getValue());
			this.cm.destroy();
			this.cm = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	setState(state) {
		this.state = state || null;
		this._setConsole(state ? this.state.doc : '');
		if (this.cm) {
			cursorDocEnd(this.cm);
		}
	}

	/**
	 * Tries to set the focus to the editor, if it is rendered.
	 */
	focus() {
		if (this.cm) {
			this.cm.focus();
		}
	}

	cyclePrev() {
		this._cycleHistory(true, this.cm);
	}

	cycleNext() {
		this._cycleHistory(false, this.cm);
	}

	_newState(doc) {
		doc = doc || '';
		let state = EditorState.create({
			doc,
			extensions: [
				... isAndroid ? [] : [ placeholder(l10n.t(txtPlaceholder)) ],
				tabCompletion({
					complete: state => this.module.cmd.getCMTabComplete(state),
				}),
				spellcheck,
				keymap.of([
					{ key: 'Enter', run: this._onSend },
					{ key: 'Ctrl-Enter', run: insertNewline },
					{ key: 'Ctrl-ArrowUp', run: this._cyclePrev },
					{ key: 'Cmd-ArrowUp', run: this._cyclePrev },
					{ key: 'Ctrl-P', run: this._cyclePrev },
					{ key: 'Cmd-P', run: this._cyclePrev },
					{ key: 'Ctrl-ArrowDown', run: this._cycleNext },
					{ key: 'Cmd-ArrowDown', run: this._cycleNext },
					{ key: 'Ctrl-N', run: this._cycleNext },
					{ key: 'Cmd-N', run: this._cycleNext },
					...standardKeymap,
				]),
				this.module.cmd.getCMLanguage(),
				this.module.cmd.getCMHighlightStyle(),
				EditorView.lineWrapping,
				EditorView.updateListener.of(this._onUpdate),
			],
		});
		return state;
	}

	_setConsole(doc) {
		if (this.cm) {
			this.cm.setState(this._newState(doc));
		}
		this.state?.setDoc(doc.trim());
	}

	_onSend(ctx) {
		let token = getToken(ctx.state);

		let char = this.module.player.getActiveChar();
		this.module.cmd.exec({
			player: this.module.player.getPlayer(),
			char,
		}, token.state).catch(err => {
			if (typeof err == 'object' && err) {
				if (err.code) {
					this.module.charLog.logError(char, err);
				} else if (err.render) {
					this.module.charLog.logComponent(char, 'errorComponent', err);
				}
				console.error(err, token.state);
			} else {
				console.error(err, token.state);
			}
		});

		this.state?.storeHistory();
		this._setConsole('');
		return true;
	}

	_onUpdate(update) {
		this.state?.setDoc(this._getValue());
	}

	_getValue() {
		return (this.cm ? this.cm.state.doc.toString() : this.state?.doc || '').trim();
	}

	_cycleHistory(prev, ctx) {
		this._setConsole(this.state
			? prev
				? this.state.prevHistory()
				: this.state.nextHistory()
			: '',
		);
		if (ctx) {
			cursorDocEnd(ctx);
		}
		return true;
	}
}

export default ConsoleEditor;
