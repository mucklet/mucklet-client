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
	bracketMatching, foldGutter, foldKeymap,
} from "@codemirror/language";
import {
	defaultKeymap, history, historyKeymap,
} from "@codemirror/commands";
import { muckletStyle } from "./ScriptEditorTheme";
// import {
// 	searchKeymap, highlightSelectionMatches,
// } from "@codemirror/search";
// import {
// 	autocompletion, completionKeymap, closeBrackets,
// 	closeBracketsKeymap,
// } from "@codemirror/autocomplete";

/**
 * ScriptEditorComponent renders the script editor.
 */
class ScriptEditorComponent {

	constructor(module, model, user) {
		this.module = module;
		this.model = model;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'scripteditor' }, [
			n.elem('div', { className: 'scripteditor--header' }, [
				// n.component(new Context(
				// 	() => new CollectionWrapper(this.module.self.getTools(), {
				// 		filter: t => !t.type || t.type == 'header' && (t.filter ? t.filter() : true),
				// 	}),
				// 	tools => tools.dispose(),
				// 	tools => new CollectionList(
				// 		tools,
				// 		t => t.componentFactory(),
				// 		{
				// 			className: 'scripteditor--headertools',
				// 			subClassName: t => t.className || null,
				// 			horizontal: true,
				// 		},
				// 	),
				// )),
				n.elem('div', { className: 'scripteditor--headercontent' }, [
					// Title
					n.component(new Txt("Script editor", { tagName: 'h2', className: 'scripteditor--headertitle' })),

					// Buttons
					n.elem('div', { className: 'scripteditor--headerbuttons' }, [
						n.elem('button', {
							events: { click: () => this._onSave() },
							className: 'btn primary scripteditor--save',
						}, [
							n.component(new ModelTxt(this.model, m => m.isModified
								? l10n.l('scriptEditor.saveChanges', "Save changes")
								: l10n.l('scriptEditor.close', "Close"),
							)),
						]),
					]),
				]),


				// n.component(new Context(
				// 	() => new CollectionWrapper(this.module.self.getTools(), {
				// 		filter: t => !t.type || t.type == 'logo' && (t.filter ? t.filter() : true),
				// 	}),
				// 	tools => tools.dispose(),
				// 	tools => new CollectionList(
				// 		tools,
				// 		t => t.componentFactory(),
				// 		{
				// 			className: 'scripteditor--logotools flex-1 flex-row sm',
				// 			subClassName: t => t.className || null,
				// 			horizontal: true,
				// 		},
				// 	),
				// )),
			]),
			n.elem('main', 'div', { className: 'scripteditor--main' }),
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
			doc: "Start document",
			extensions: [
				// A line number gutter
				lineNumbers(),
				// A gutter with code folding markers
				foldGutter(),
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
				keymap.of([
					// // Closed-brackets aware backspace
					// ...closeBracketsKeymap,
					// A large set of basic bindings
					...defaultKeymap,
					// // Search-related keys
					// ...searchKeymap,
					// Redo/undo keys
					...historyKeymap,
					// Code folding bindings
					...foldKeymap,
					// // Autocompletion keys
					// ...completionKeymap,
					// // Keys related to the linter system
					// ...lintKeymap,
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

export default ScriptEditorComponent;
