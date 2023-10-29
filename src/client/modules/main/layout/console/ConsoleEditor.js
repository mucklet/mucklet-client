import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
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
		this.state = state || null;

		// Bind callbacks
		this._onEnter = this._onEnter.bind(this);
		this._onEditorUpdate = this._onEditorUpdate.bind(this);
		this._cyclePrev = this._cycleHistory.bind(this, true);
		this._cycleNext = this._cycleHistory.bind(this, false);
	}

	render(el) {
		this.elem = new ModelComponent(
			this.state,
			new Elem(n => n.elem('div', { className: 'console-editor' }, [
				n.component(new Txt(txtPlaceholder, { tagName: 'div', className: 'console-editor--placeholder' })),
			])),
			(m, c, change) => {
				// Creates a new editor state if the state.doc has changed. This
				// should not happen due to simple edits to the console as the
				// editor's doc and the state's doc would match. This is rather
				// an affect of changing history.
				if (change && this.cm && m && m.doc.trim() != this.cm.state.doc.toString().trim()) {
					this.cm.setState(this._newEditorState(m));
				}
			},
		);
		let rel = this.elem.render(el);
		this._createEditor(this.state);
		this._setEmpty();

		return rel;
	}

	unrender() {
		if (this.elem) {
			this.state?.setDoc(this._getValue());
			this._destroyEditor();
			this.elem.unrender();
			this.elem = null;
		}
	}

	/**
	 * Creates the editor if we have are rendered and have a state, otherwise
	 * destroys the editor. If an editor already exists, we set a new state.
	 * @param {object} state State object
	 */
	_createEditor(state) {
		let rel = this.elem?.getComponent().getElement();
		if (rel && state) {
			let editorState = this._newEditorState(state);
			if (this.cm) {
				this.cm.setState(editorState);
			} else {
				this.cm = new EditorView({
					state: editorState,
					parent: rel,
				});
			}
			cursorDocEnd(this.cm);
		} else {
			this._destroyEditor();
		}
	}

	/**
	 * Destroys the editor if it exists.
	 */
	_destroyEditor() {
		if (this.cm) {
			this.cm.destroy();
			this.cm = null;
		}
	}

	/**
	 * Set a new state. This will set a new editor state if rendered.
	 * @param {object} state State object.
	 */
	setState(state) {
		state = state || null;
		if (state !== this.state) {
			this.state = state;
			if (this.elem) {
				this.elem.setModel(this.state);
				this._createEditor(state);
			}
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

	_newEditorState(state, doc) {
		doc = (typeof doc != 'undefined' ? doc : state?.doc) || '';
		let editorState = EditorState.create({
			doc,
			extensions: [
				tabCompletion({
					complete: editorState => this.module.cmd.getCMTabComplete(editorState),
				}),
				spellcheck,
				this.module.cmd.getCMFormattingStyle(),
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
				state.getCMLanguage(),
				this.module.cmd.getCMHighlightStyle(),
				EditorView.lineWrapping,
				EditorView.updateListener.of(this._onEditorUpdate),
			],
		});
		return editorState;
	}

	// Sets a new editor state with the provided doc string value, and updates the state
	_setConsole(doc) {
		if (this.cm) {
			this.cm.setState(this._newEditorState(this.state, doc));
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

	_onEditorUpdate(update) {
		this.state?.setDoc(this._getValue());

		this._setEmpty();
	}

	_setEmpty() {
		if (this.elem && this.cm) {
			this.elem.getComponent()[this.cm.state.doc.toString() ? 'removeClass' : 'addClass']('empty');
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
