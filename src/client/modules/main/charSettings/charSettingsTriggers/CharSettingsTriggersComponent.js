import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
// import LabelToggleBox from 'components/LabelToggleBox';
import PanelSection from 'components/PanelSection';
import KeywordList from 'components/KeywordList';
import FAIcon from 'components/FAIcon';
import objectDefault from 'utils/objectDefault';

const txtErrorAddingTrigger = l10n.l('charSettingsTriggers.failedToAddTrigger', "Failed to add trigger");

class CharSettingsTriggersComponent {
	constructor(module, char, puppeteer, charSettings, state) {
		this.module = module;
		this.char = char;
		this.puppeteer = puppeteer;
		this.charSettings = charSettings;
		this.state = objectDefault(state, {
			trigger: '',
		});
	}

	render(el) {
		this.elem = new PanelSection(
			l10n.l('charSettingsTriggers.mentionTriggers', "Mention triggers"),
			new Context(
				() => new ModifyModel(this.charSettings, {
					eventBus: this.module.self.app.eventBus,
				}),
				charSettings => charSettings.dispose(),
				charSettings => new ModelComponent(
					charSettings,
					new Elem(n => n.elem('div', [
						// n.component('highlightTriggers', new LabelToggleBox(l10n.l('charSettingsTriggers.enableHighlight', "Highlight triggers"), false, {
						// 	className: 'common--formmargin',
						// 	onChange: (v, c) => this._setValue(charSettings, v),
						// 	popupTip: l10n.l('charSettingsTriggers.enableHighlightInfo', "Highlight trigger words and phrases in the chat log."),
						// 	popupTipClassName: 'popuptip--width-s'
						// })),
						n.elem('div', [
							n.elem('div', { className: 'common--sectionpadding' }, [
								n.elem('div', { className: 'charsettingstriggers--trigger' }, [
									n.component('trigger', new Input(this.state.trigger, {
										attributes: {
											placeholder: l10n.t('charSettingsTriggers.typeTrigger', "Enter trigger to add"),
											spellcheck: 'false',
										},
										events: {
											input: c => this._setTrigger(c.getProperty('value')),
											keydown: (c, e) => {
												if (e.key == 'Enter') {
													e.preventDefault();
													e.stopPropagation();
													this._addTrigger();
												}
											},
										},
									})),
									n.elem('add', 'button', {
										className: 'charsettingstriggers--add iconbtn medium tinyicon',
										attributes: { type: 'button' },
										events: {
											click: (c, e) => {
												this._addTrigger();
												e.preventDefault();
											},
										},
									}, [
										n.component(new FAIcon('plus')),
									]),
								]),
							]),
							n.component(new KeywordList(this.charSettings.triggers, {
								keywordCallback: k => k.key,
								eventBus: this.module.self.app.eventBus,
								onDelete: trigger => {
									this.module.confirm.open(() => this._deleteTrigger(trigger), {
										title: l10n.l('charSettingsTriggers.confirmDelete', "Confirm deletion"),
										body: new Elem(n => n.elem('div', [
											n.component(new Txt(l10n.l('charSettingsTriggers.deleteCustomTagBody', "Do you wish to delete the trigger?"), { tagName: 'p' })),
											n.component(new Txt(trigger.key, { tagName: 'p', className: 'dialog--strong' })),
										])),
										confirm: l10n.l('charSettingsTriggers.delete', "Delete"),
									});
								},
							})),
						]),
					])),
					(m, c, change) => {
						if (!change) {
							this._setTrigger(this.state.trigger);
						}
						// c.getNode('highlightTriggers').setValue(m.highlightTriggers, false);
					},
				),
			),
			{
				className: 'common--sectionpadding',
				noToggle: true,
				popupTip: l10n.l('charSettingsTriggers.triggersInfo', "Keywords or phrases, such as character name, nick names, or alternate spelling, used to notify you when someone mentions your character."),
				popupTipClassName: 'popuptip--width-s',
			},
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	// _setValue(charSettings, v) {
	// 	charSettings.set({ highlightTriggers: v });
	// 	this.module.player.getPlayer().call('setCharSettings', {
	// 		charId: this.char.id,
	// 		puppeteerId: this.puppeteer ? this.puppeteer.id : undefined,
	// 		highlightTriggers: v
	// 	}).catch(err => {
	// 		if (charSettings.getModel()) {
	// 			charSettings.reset('highlightTriggers');
	// 		}
	// 		this.module.toaster.openError(err);
	// 	});
	// }

	_setTrigger(trigger) {
		this.state.trigger = trigger;
		if (this.elem) {
			let ctx = this.elem.getComponent();
			ctx.getComponent().getComponent().setNodeProperty('add', 'disabled', this._triggerIsValid(trigger) ? null : 'disabled');
		}
	}

	_triggerIsValid(v) {
		v = (v || "").trim().toLowerCase();
		if (!v) return false;

		let triggers = this.charSettings.triggers;
		for (let k of triggers) {
			if (k.key == v) {
				return false;
			}
		}
		return true;
	}

	_deleteTrigger(trigger) {
		return this.module.player.getPlayer().call('setCharSettings', {
			charId: this.char.id,
			puppeteerId: this.puppeteer ? this.puppeteer.id : undefined,
			triggers: { [trigger.key]: false },
		}).catch(err => this.module.toaster.openError(err));
	}

	_addTrigger() {
		if (!this.elem) return;

		let n = this.elem.getComponent().getComponent().getComponent().getNode('trigger');
		let v = n.getProperty('value');
		if (this._triggerIsValid(v)) {
			this.module.player.getPlayer().call('setCharSettings', {
				charId: this.char.id,
				puppeteerId: this.puppeteer ? this.puppeteer.id : undefined,
				triggers: { [v]: true },
			}).then(() => {
				n.setProperty('value', '');
				this._setTrigger('');
			}).catch(err => this.module.toaster.openError(err, {
				title: txtErrorAddingTrigger,
			}));
		}
	}
}

export default CharSettingsTriggersComponent;
