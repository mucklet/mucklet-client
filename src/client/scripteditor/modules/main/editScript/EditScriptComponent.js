import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { ModifyModel, Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import {
	EditorView, keymap, highlightSpecialChars, drawSelection,
	highlightActiveLine, dropCursor, rectangularSelection,
	crosshairCursor, lineNumbers, highlightActiveLineGutter,
} from '@codemirror/view';
import {
	defaultHighlightStyle, syntaxHighlighting, indentOnInput,
	bracketMatching, indentUnit,
} from '@codemirror/language';
import {
	defaultKeymap, history, historyKeymap,
	indentWithTab,
} from '@codemirror/commands';
import SpinnerModal from 'components/SpinnerModal';
import ModelFader from 'components/ModelFader';
import ModelCollapser from 'components/ModelCollapser';
import FAIcon from 'components/FAIcon';
import isError from 'utils/isError';
import { muckletStyle } from './EditScriptTheme';
import EditScriptErrors from './EditScriptErrors';

/**
 * EditScriptEditor renders the script editor.
 */
class EditScriptEditor {

	constructor(module, model) {
		this.module = module;
		this.model = model;
		this.roomScript = model.roomScript;
		this.source = model.source || model.boilerplate || '';
		this.version = model.version;

		this._onEditorUpdate = this._onEditorUpdate.bind(this);
		this.compiling = false;
		this.spinner = null;

		this.stateModel = new Model({
			data: {
				errorsOpen: false,
				errors: null,
			},
		});
	}

	render(el) {
		this.modifyModel = new ModifyModel(this.model, { props: { source: this.source }});
		this.elem = new Elem(n => n.elem('div', { className: 'editscript' }, [

			// Toggle button for script errors
			n.component(new ModelFader(this.stateModel, [{
				condition: m => m.errors,
				factory: m => new Elem(n => n.elem('button', {
					className: 'iconbtn medium editscript--errorsbtn lighten',
					events: {
						click: () => this._toggleErrors(),
					},
				}, [
					n.component(new ModelFader(this.stateModel, [
						{
							condition: m => m.errorsOpen,
							factory: m => new FAIcon('times'),
						},
						{
							factory: m => new FAIcon('exclamation-triangle', { className: 'editscript--erroricon' }),
						},
					])),
				])),
			}])),

			// Header
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
						n.elem('a', {
							attributes: {
								href: 'https://github.com/mucklet/mucklet-script/blob/master/docs/documentation.md#mucklet-script-documentation',
								target: '_blank',
								rel: 'noopener noreferrer',
							},
							className: 'editscript--helpbtn iconbtn light',
						}, [
							n.component(new FAIcon('question-circle')),
						]),
						n.elem('compile', 'button', {
							events: {
								click: () => {
									if (this.modifyModel.isModified) {
										if (!this.compiling) {
											this._onSave(this.modifyModel.source);
										}
									} else {
										if (window.opener) {
											window.opener.focus();
											window.close();
										} else {
											window.location.assign('/');
										}
									}
								},
							},
							className: 'btn primary editscript--update',
						}, [
							n.component(new ModelComponent(
								this.modifyModel,
								new Txt(),
								(m, c) => c.setText(m.isModified
									? l10n.l('editScript.update', "Update")
									: window.opener
										? l10n.l('editScript.close', "Close")
										: l10n.l('editScript.goBack', "Go back"),
								),
							)),
						]),
					]),
				]),
			]),

			// Errors
			n.component(new ModelCollapser(this.stateModel, [{
				condition: m => m.errorsOpen,
				factory: m => m.errors,
			}], { className: 'editscript--errors' })),

			// Main
			n.elem('div', { className: 'editscript--main' }, [
				n.elem('editor', 'div', { className: 'editscript--editor' }),
			]),
		]));

		let rel = this.elem.render(el);
		this._createEditor();
		this._setSpinner(this.compiling);
		return rel;
	}

	unrender() {
		if (this.elem) {
			this._setSpinner(false);
			this._destroyEditor();
			this.elem.unrender();
			this.elem = null;
			this.source = this.modifyModel.source;
			this.modifyModel.dispose();
			this.modifyModel = null;
			this._setIsModified();
		}
	}

	/**
	 * Creates the editor if we have are rendered and have a state, otherwise
	 * destroys the editor. If an editor already exists, we set a new state.
	 * @param {object} state State object
	 */
	_createEditor(state) {
		let rel = this.elem?.getNode('editor');
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
				// Allow alt-drag to select rectangular regions
				rectangularSelection(),
				// Change the cursor to a crosshair when holding alt
				crosshairCursor(),
				// Style the current line specially
				highlightActiveLine(),
				// Style the gutter for current line specially
				highlightActiveLineGutter(),
				// // Indentation
				indentUnit.of("\t"),
				// Keymap
				keymap.of([
					// A large set of basic bindings
					...defaultKeymap,
					// Redo/undo keys
					...historyKeymap,
					// Indentation with tab
					indentWithTab,
				]),
				javascript({ typescript: true }),
				muckletStyle,
				EditorView.updateListener.of(this._onEditorUpdate),
			],
		});
	}


	_onSave(source) {
		if (this.roomScript.version != this.version) {
			this.module.confirm.open(() => this._setSource(source), {
				title: l10n.l('editScript.confirmUpdate', "Confirm update"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('editScript.confirmUpdateBody1', "The script has been updated while you were editing it."), { tagName: 'p' })),
					n.component(new Txt(l10n.l('editScript.confirmUpdateBody2', "Do you still wish to update?"), { tagName: 'p' })),
				])),
				confirm: l10n.l('editScript.update', "Update"),
			});
		} else {
			this._setSource(source);
		}
	}

	_onEditorUpdate(update) {
		let view = update.view;
		this.modifyModel?.set({ source: view.state.doc.toString() });
		this._setIsModified();
	}

	_setIsModified() {
		if (this.roomScript == this.model.roomScript) {
			this.model.set({ isModified: this.modifyModel ? this.modifyModel.isModified : source != this.source });
		}
	}

	_setSource(source) {
		if (this.compiling) {
			console.error("already compiling");
			return;
		}
		this.compiling = true;
		this._setSpinner(true);
		this.roomScript.call('set', { source })
			.then((result) => {
				this._setErrors('', false);
				this.module.toaster.open({
					title: l10n.l('editScript.scriptUpdated', "Script updated"),
					content: close => new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('editScript.scriptUpdatedInfo1', "The script was updated successfully."), { tagName: 'p' })),
						n.component(new Txt(l10n.l('editScript.scriptUpdatedInfo2', "You may safely close this window."), { tagName: 'p' })),
					])),
					closeOn: 'click',
					type: 'success',
					autoclose: true,
				});
				// Update the module module if we still are on the same roomScript.
				if (this.model.roomScript == this.roomScript) {
					this.model.set({
						source,
						version: result.version,
						isModified: (this.modifyModel ? this.modifyModel.source : this.source) != source,
					});
				}
				this.version = result.version;
			})
			.catch(err => {
				if (isError(err, 'core.compileError')) {
					this._setErrors(err.message, true);
					this.module.toaster.open({
						title: l10n.l('editScript.compileError', "Update failed"),
						content: close => new Elem(n => n.elem('div', [
							n.component(new Txt(l10n.l('editScript.compileErrorInfo', "Update failed due to compilation errors."), { tagName: 'p' })),
						])),
						closeOn: 'click',
						type: 'warn',
						autoclose: true,
					});
				} else {
					this.module.confirm.openError(err);
				}
			})
			.finally(() => {
				this.compiling = false;
				this._setSpinner(false);
			});
	}

	_setSpinner(show) {
		if (show) {
			if (!this.spinner) {
				this.spinner = new SpinnerModal();
				this.spinner.render(document.body);
			}
		} else {
			if (this.spinner) {
				this.spinner.unrender();
				this.spinner = null;
			}
		}
	}

	/**
	 * Sets the compiler errors.
	 * @param {string} errText Error text.
	 * @param {boolean} [open] Flag to tell if the errors should be open. Remains as is if omitted.
	 */
	_setErrors(errText, open) {
		if (errText) {
			let errors = this.stateModel.errors?.setError(errText) || new EditScriptErrors(errText);
			this.stateModel.set({ errors, errorsOpen: typeof open == 'boolean' ? open : this.stateModel.errorsOpen });
		} else {
			this.stateModel.set({ errors: null, errorsOpen: false });
		}
	}

	_toggleErrors(open) {
		open = this.stateModel.errors
			? typeof open == 'undefined' ? !this.stateModel.errorsOpen : !!open
			: false;
		this.stateModel.set({ errorsOpen: open });
	}
}

export default EditScriptEditor;
