import { Elem, Txt, Textarea, Context } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PopupTip from 'components/PopupTip';
import Dialog from 'classes/Dialog';
import './dialogEditNote.scss';

class DialogEditNote {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'auth', 'player', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens edit note dialog for a given character ID.
	 * @param {string} charId Character ID.
	 */
	open(charId) {
		if (this.dialog) return;

		this.dialog = true;

		this.module.auth.getUserPromise()
			.then(user => Promise.all([
				this.module.api.get('note.player.' + user.id + '.note.' + charId),
				this.module.api.get('core.char.' + charId),
			]))
			.then(result => {
				let [ note, char ] = result;
				this.dialog = new Dialog({
					title: l10n.l('dialogEditNote.createNewChar', "Character notes"),
					className: 'dialogeditnote',
					content: new Context(
						() => new ModifyModel(note, { eventBus: this.app.eventBus }),
						model => model.dispose(),
						model => new Elem(n => n.elem('div', [
							n.elem('div', { className: 'flex-row' }, [
								n.component(new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialogeditnote--fullname flex-1' })),
								n.component(new PopupTip(l10n.l('dialogEditNote.notesInfo', "The notes are your personal records about a character. No one else can read them."), { className: 'popuptip--width-m flex-auto' })),
							]),
							n.component('notes', new ModelComponent(
								model,
								new Textarea(model.text, {
									events: { input: c => model.set({ text: c.getValue() }) },
									attributes: {
										spellcheck: 'false',
										placeholder: l10n.t('dialogEditNote.textPlaceholder', "Enter some notes"),
									},
									className: 'dialog--input common--paneltextarea',
								}),
								(m, c) => c.setValue(m.text),
							)),
							n.component('message', new Collapser(null)),
							n.elem('div', { className: 'dialog--footer' }, [
								n.elem('submit', 'button', {
									events: { click: () => this._onSave(model) },
									className: 'btn primary dialogeditnote--submit',
								}, [
									n.component(new ModelTxt(model, m => m.isModified
										? model.text.trim()
											? l10n.l('dialogEditNote.saveNotes', "Save notes")
											: l10n.l('dialogEditNote.clearNotes', "Clear notes")
										: l10n.l('dialogEditNote.closeNotes', "Close notes"),
									)),
								]),
							]),
						])),
					),
					onClose: () => { this.dialog = null; },
				});

				this.dialog.open();
				this.dialog.getContent().getComponent().getNode('submit').focus();
			})
			.catch(err => {
				this.dialog = null;
				this.module.confirm.openError(err);
			});
	}

	_onSave(model) {
		if (this.savePromise) return this.savePromise;

		// Quick close if there are no modifications
		if (!model.isModified) {
			if (this.dialog) {
				this.dialog.close();
			}
			return;
		}

		model.getModel().call('set', model.getModifications()).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.savePromise = null;
		});

		return this.savePromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogEditNote;
