import { Elem, Txt } from 'modapp-base-component';
import { CollectionComponent, ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import AutoComplete from 'components/AutoComplete';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import labelCompare from 'utils/labelCompare';
import patternMatch, { patternMatchRender } from 'utils/patternMatch';
import './dialogDeleteChar.scss';

class DialogDeleteChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(char) {
		if (this.dialog) return;

		let model = new Model({ data: {
			heir: "",
		}, eventBus: this.app.eventBus });

		let ownedChars = this.module.player.getChars();

		this.dialog = new Dialog({
			title: l10n.l('dialogDeleteChar.deleteChar', "Delete character"),
			className: 'dialogdeletechar',
			content: new CollectionComponent(
				ownedChars,
				new Collapser(),
				(col, c, ev) => {
					let len = col.toArray().filter(m => m.id !== char.id).length;
					if (!len) {
						c.setComponent(new Elem(n => n.elem('div', [
							n.elem('div', { className: 'common--formmargin' }, [
								n.component(new Txt(l10n.l('dialogDeleteChar.noHeir1', "You cannot delete your last character as you need someone to inherit any room or item owned by the character."))),
							]),
							n.elem('div', { className: 'pad-top-xl' }, [
								n.elem('button', { className: 'btn primary', events: {
									click: () => {
										if (this.dialog) {
											this.dialog.close();
										}
									},
								}}, [
									n.component(new Txt(l10n.l('dialogdeletechar.okay', "Okay"))),
								]),
							]),
						])));
						return;
					}

					if (!ev || (len === 1 && ev.event == 'add')) {
						c.setComponent(new Elem(n => n.elem('div', [
							n.elem('div', [
								n.component(new Txt(l10n.l('dialogDeleteChar.deleteCharBody', "Do you really wish to delete the character?"), { tagName: 'p' })),
								n.component(new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialogdeletechar--fullname' })),
							]),
							n.elem('p', { className: 'dialog--error' }, [
								n.component(new FAIcon('exclamation-triangle')),
								n.html("&nbsp;&nbsp;"),
								n.component(new Txt(l10n.l('dialogDeleteChar.deletionWarning', "Deletion cannot be undone."))),
							]),
							n.component('heir', new PanelSection(
								l10n.l('dialogDeleteChar.characterHeir', "Character heir"),
								new AutoComplete({
									className: 'dialog--input dialog--incomplete',
									attributes: { placeholder: l10n.t('dialogDeleteChar.selectAChar', "Search for an heir"), spellcheck: 'false' },
									fetch: (text, update, c) => {
										model.set({ heir: null });
										c.addClass('dialog--incomplete');
										let list = ownedChars.toArray()
											.filter(m => m.id != char.id && patternMatch((m.name + " " + m.surname).trim(), text))
											.map(m => ({ value: m.id, label: (m.name + " " + m.surname).trim() }))
											.sort(labelCompare);
										update(list);
									},
									events: { blur: c => {
										if (!model.heir) {
											c.setProperty('value', "");
										}
									} },
									render: patternMatchRender,
									minLength: 1,
									onSelect: (c, item) => {
										c.removeClass('dialog--incomplete');
										model.set({ heir: item.value });
										c.setProperty('value', item.label);
									},
								}),
								{
									className: 'common--sectionpadding',
									noToggle: true,
									required: true,
									popupTip: l10n.l('dialogDeleteChar.characterHeirInfo', "The heir inherits any room or item owned by the deleted character."),
								},
							)),
							n.component('message', new Collapser(null)),
							n.elem('div', { className: 'dialog--footer flex-row margin16' }, [
								n.elem('button', {
									events: { click: () => this._onDelete(char, model) },
									className: 'btn primary flex-1',
								}, [
									n.component(new Txt(l10n.l('dialogDeleteChar.delete', "Delete character"))),
								]),
								n.elem('button', {
									className: 'btn secondary flex-1',
									events: { click: () => this.close() },
								}, [
									n.component(new Txt(l10n.l('dialogDeleteChar.cancel', "Cancel"))),
								]),
							]),
						])));
					}
				},
			),
			onClose: () => { this.dialog = null; },
		});

		this.dialog.open();
		try {
			this.dialog.getContent().getComponent().getComponent().getNode('heir').getComponent().getElement().focus();
		} catch (e) {}
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_onDelete(char, model) {
		if (this.deletePromise) return this.deletePromise;

		this.deletePromise = this.module.player.getPlayer().call('deleteChar', {
			charId: char.id,
			heir: model.heir,
		}).then(() => {
			this.close();
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.deletePromise = null;
		});

		return this.deletePromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		try {
			let n = this.dialog.getContent().getComponent().getComponent().getNode('message');
			n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
		} catch (e) {}
	}
}

export default DialogDeleteChar;
