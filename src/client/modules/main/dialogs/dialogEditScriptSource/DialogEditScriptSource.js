// import { Elem, Txt, Textarea } from 'modapp-base-component';
// import { ModelTxt } from 'modapp-resource-component';
// import { ModifyModel } from 'modapp-resource';
import { isResError } from 'resclient';
import l10n from 'modapp-l10n';
// import Collapser from 'components/Collapser';
// import Dialog from 'classes/Dialog';
import Err from 'classes/Err';
import errToL10n from 'utils/errToL10n';
// import isError from 'utils/isError';
import './dialogEditScriptSource.scss';

class DialogEditScriptSource {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'auth',
			'player',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to edit a script's source code.
	 * @param {Model} char Controlled character.
	 * @param {string} scriptId Script ID.
	 * @returns {Promise<Dialog>} Promise of an opened dialog.
	 */
	open(char, scriptId) {
		if (this.dialog) return;

		// Get script details
		return this.module.api.get(`core.roomscript.${scriptId}.details`).then(script => {

			// Get script source code
			return (!script.source || isResError(script.source)
				? Promise.reject(script.source
					? l10n.t(errToL10n(script.source))
					: null,
				)
				// First refresh the tokens as the access token may have expired.
				: this.module.auth.refreshTokens()
					.then(() => fetch(script.source.href, {
						credentials: 'include',
					}).then(response => {
						if (response.status >= 300) {
							throw response.text();
						};
						return response.text();
					}).catch(err => {
						throw new Err('dialogEditScriptSource.errorFetchingScript', "Error fetching script: {err}", { err: String(err) });
					}))
			).then(source => {

				window.open('scripteditor/#editscript/' + encodeURIComponent(scriptId), 'script#' + scriptId);
				// let model = new ModifyModel({ source }, { eventBus: this.app.eventBus });

				// // Source code text area
				// let textarea = new Textarea(source, {
				// 	events: { input: c => model.set({ source: c.getValue() }) },
				// 	attributes: {
				// 		spellcheck: 'true',
				// 		placeholder: l10n.t('dialogEditScriptSource.textPlaceholder', "Write source script code here."),
				// 	},
				// 	className: 'dialog--input common--paneltextarea-small',
				// });

				// let messageComponent = new Collapser(null);

				// this.dialog = new Dialog({
				// 	title: l10n.l('dialogEditScriptSource.editScript', "Edit script"),
				// 	className: 'dialogeditscriptsource',
				// 	content: new Elem(n => n.elem('div', [
				// 		n.elem('div', { className: 'common--sectionpadding' }, [
				// 			n.component(new ModelTxt(script, m => m.key, { className: 'dialogeditscriptsource--keyword flex-1' })),
				// 			n.component(textarea),
				// 		]),
				// 		n.component(messageComponent),
				// 		n.elem('div', { className: 'pad-top-xl pad-bottom-m' }, [
				// 			n.elem('submit', 'button', {
				// 				events: { click: () => this._onSave(char, scriptId, model, messageComponent) },
				// 				className: 'btn primary dialogeditscriptsource--submit',
				// 			}, [
				// 				n.component(new ModelTxt(model, m => m.isModified
				// 					? l10n.l('dialogEditScriptSource.saveChanges', "Save changes")
				// 					: l10n.l('dialogEditScriptSource.close', "Close"),
				// 				)),
				// 			]),
				// 		]),
				// 	])),
				// 	onClose: () => {
				// 		model.dispose();
				// 		this.dialog = null;
				// 	},
				// });
				// this.dialog.open();
				// textarea.getElement().focus();
			});
		});

	}

	// _onSave(ctrl, scriptId, model, messageComponent) {
	// 	if (this.savePromise) return this.savePromise;

	// 	// Quick close if there are no modifications
	// 	if (!model.isModified) {
	// 		if (this.dialog) {
	// 			this.dialog.close();
	// 		}
	// 		return;
	// 	}

	// 	this._setMessage(messageComponent);

	// 	ctrl.call('setRoomScript', {
	// 		scriptId: scriptId,
	// 		source: model.source,
	// 	}).then(() => {
	// 		this.dialog?.close();
	// 	}).catch(err => {
	// 		if (!isError(err, 'core.compileError')) {
	// 			return this._setMessage(messageComponent, errToL10n(err));
	// 		}
	// 		throw new ScriptCompileError(err);
	// 	}).then(() => {
	// 		this.savePromise = null;
	// 	});

	// 	return this.savePromise;
	// }

	// _setMessage(messageComponent, msg) {
	// 	messageComponent.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	// }
}

export default DialogEditScriptSource;
