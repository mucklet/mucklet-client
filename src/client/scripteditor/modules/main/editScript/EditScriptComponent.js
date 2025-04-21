import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from "@codemirror/state";
import {
	EditorView, keymap, highlightSpecialChars, drawSelection,
	highlightActiveLine, dropCursor, rectangularSelection,
	crosshairCursor, lineNumbers, highlightActiveLineGutter,
} from "@codemirror/view";
import {
	defaultHighlightStyle, syntaxHighlighting, indentOnInput,
	bracketMatching, indentUnit, //, foldGutter, foldKeymap,
} from "@codemirror/language";
import {
	defaultKeymap, history, historyKeymap,
	indentWithTab,
} from "@codemirror/commands";
import { muckletStyle } from "./EditScriptTheme";
// import {
// 	searchKeymap, highlightSelectionMatches,
// } from "@codemirror/search";
// import {
// 	autocompletion, completionKeymap, closeBrackets,
// 	closeBracketsKeymap,
// } from "@codemirror/autocomplete";

/**
 * EditScriptEditor renders the script editor.
 */
class EditScriptEditor {

	constructor(module, roomScript, source) {
		this.module = module;
		this.roomScript = roomScript;
		this.source = source;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'editscript' }, [
			n.elem('div', { className: 'editscript--header' }, [
				n.elem('div', { className: 'editscript--headercontent' }, [
					// Title
					n.component(new Txt("Script editor", { tagName: 'h2', className: 'editscript--headertitle' })),
					// Script info
					n.elem('div', { className: 'editscript--headerinfo' }, [
						n.component(new ModelTxt(this.roomScript.room, m => m?.name || '', { className: 'editscript--headerinfo-room' })),
						n.component(new ModelTxt(this.roomScript, m => m.key || '', { className: 'editscript--headerinfo-key' })),
					]),
					// Buttons
					n.elem('div', { className: 'editscript--headerbuttons' }, [
						n.elem('button', {
							events: { click: () => this._onSave() },
							className: 'btn primary editscript--save',
						}, [
							n.component(new ModelTxt(this.roomScript, m => m.isModified
								? l10n.l('editScript.saveChanges', "Save changes")
								: l10n.l('editScript.close', "Close"),
							)),
						]),
					]),
				]),
			]),
			n.elem('main', 'div', { className: 'editscript--main' }),
		]));
		let rel = this.elem.render(el);
		this._createEditor();
		return rel;
	}

	unrender() {
		if (this.elem) {
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
		let rel = this.elem?.getNode('main');
		if (rel) {
			this.cm = new EditorView({
				state: this._newEditorState(),
				parent: rel,
			});
		}
	}

	_destroyEditor() {
		if (this.cm) {
			this.cm.destroy();
			this.cm = null;
		}
	}

	_newEditorState() {
		return EditorState.create({
			doc: this.source,
			extensions: [
				// A line number gutter
				lineNumbers(),
				// Replace non-printable characters with placeholders
				highlightSpecialChars(),
				// The undo history
				history(),
				// Replace native cursor/selection with our own
				drawSelection(),
				// Show a drop cursor when dragging over the editor
				dropCursor(),
				// Allow multiple cursors/selections
				EditorState.allowMultipleSelections.of(true),
				// Re-indent lines when typing specific input
				indentOnInput(),
				// Highlight syntax with a default style
				syntaxHighlighting(defaultHighlightStyle),
				// Highlight matching brackets near cursor
				bracketMatching(),
				// // Automatically close brackets
				// closeBrackets(),
				// // Load the autocompletion system
				// autocompletion(),
				// Allow alt-drag to select rectangular regions
				rectangularSelection(),
				// Change the cursor to a crosshair when holding alt
				crosshairCursor(),
				// Style the current line specially
				highlightActiveLine(),
				// Style the gutter for current line specially
				highlightActiveLineGutter(),
				// // Highlight text that matches the selected text
				// highlightSelectionMatches(),
				// // Indentation
				indentUnit.of("\t"),
				// Keymap
				keymap.of([
					// // Closed-brackets aware backspace
					// ...closeBracketsKeymap,
					// A large set of basic bindings
					...defaultKeymap,
					// // Search-related keys
					// ...searchKeymap,
					// Redo/undo keys
					...historyKeymap,
					// // Autocompletion keys
					// ...completionKeymap,
					// // Keys related to the linter system
					// ...lintKeymap,
					indentWithTab,
				]),
				javascript({ typescript: true }),
				muckletStyle,
			],
		});
	}


	_onSave() {
		window.opener?.focus();
		window.close();
		// console.error("not implemented");
	}
}

export default EditScriptEditor;
