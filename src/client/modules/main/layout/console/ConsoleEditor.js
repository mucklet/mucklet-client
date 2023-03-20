import { Elem, Txt } from 'modapp-base-component';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { standardKeymap, insertNewline, cursorDocEnd } from '@codemirror/commands';
import l10n from 'modapp-l10n';
import tabCompletion, { tabComplete } from 'utils/codemirrorTabCompletion';
import spellcheck from 'utils/codemirrorSpellcheck';
import { getToken } from 'utils/codemirror';

const txtPlaceholder = l10n.l('console.enterYourCommand', "Enter your command (or type help)");

class ConsoleEditor {
	constructor(module, state) {
		this.module = module;
		this.state = state;

		// Bind callbacks
		this._onEnter = this._onEnter.bind(this);
		this._onUpdate = this._onUpdate.bind(this);
		this._cyclePrev = this._cycleHistory.bind(this, true);
		this._cycleNext = this._cycleHistory.bind(this, false);
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'console-editor' }, [
			n.component(new Txt(txtPlaceholder, { tagName: 'div', className: 'console-editor--placeholder' })),
		]));
		let rel = this.elem.render(el);
		this.cm = new EditorView({
			state: this._newState(this.state?.doc || ''),
			parent: rel,
		});
		this._setEmpty();

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

	inserNewLine() {
		insertNewline(this.cm);
	}

	send() {
		this._onSend(this.cm);
	}

	tabComplete() {
		tabComplete(this.cm);
	}

	_newState(doc) {
		doc = doc || '';
		let state = EditorState.create({
			doc,
			extensions: [
				tabCompletion({
					complete: state => this.module.cmd.getCMTabComplete(state),
				}),
				spellcheck,
				keymap.of([
					{ key: 'Enter', run: this._onEnter },
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

	_onEnter(ctx) {
		return this.module.self.getModel().mode == 'touch'
			? insertNewline(ctx)
			: this._onSend(ctx);
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

		this._setEmpty();
	}

	_setEmpty() {
		if (this.elem) {
			this.elem[this.cm.state.doc.toString() ? 'removeClass' : 'addClass']('empty');
		}
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
