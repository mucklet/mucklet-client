import { Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import './dialogRequestControl.scss';

const txtNotSet = l10n.l('dialogRequestControl.unknownGenderAndSpecies', "Unknown gender and species");

class DialogRequestControl {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'player', 'avatar' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(puppeteer) {
		if (this.dialog) return;

		let model = new Model({ data: {
			msg: "",
		}, eventBus: this.app.eventBus });

		this.dialog = new Dialog({
			title: l10n.l('dialogRequestControl.requestControl', "Request puppet control"),
			className: 'dialogrequestcontrol',
			content: new Elem(n => n.elem('div', [
				n.elem('div', { className: 'flex-row pad12 pad-bottom-l' }, [
					n.elem('div', { className: 'flex-auto' }, [
						n.component(this.module.avatar.newAvatar(puppeteer.puppet, { size: 'large' }))
					]),
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelTxt(puppeteer.puppet, m => (m.name + " " + m.surname).trim(), {
							tagName: 'div',
							className: 'dialogrequestcontrol--fullname'
						})),
						n.component(new ModelComponent(
							puppeteer.puppet,
							new Txt('', {
								tagName: 'div',
								className: 'dialogrequestcontrol--genderspecies'
							}),
							(m, c) => {
								let genderSpecies = (firstLetterUppercase(m.gender) + ' ' + firstLetterUppercase(m.species)).trim();
								c[genderSpecies ? 'removeClass' : 'addClass']('common--placeholder')
									.setText(genderSpecies || txtNotSet);
							}
						)),
						n.component(new ModelComponent(
							puppeteer.puppet,
							new ModelComponent(
								null,
								new Txt("", { tagName: 'div', className: 'dialogrequestcontrol--controlledby' }),
								(m, c) => this._setControlledBy(c, puppeteer.puppet)
							),
							(m, c, change) => {
								if (!change || change.hasOwnProperty('puppeteer')) {
									c.setModel(m.puppeteer);
								} else {
									this._setControlledBy(c.getComponent(), m);
								}
							}
						)),
					]),
				]),
				n.component('msg', new PanelSection(
					l10n.l('dialogRequestControl.profileName', "Optional message"),
					new ModelComponent(
						model,
						new Textarea(model.msg, {
							className: 'dialogtag--msg dialog--input common--paneltextarea-small common--msg-size',
							events: {
								input: c => {
									let v = c.getValue().replace(/\r?\n/gi, '');
									c.setValue(v);
									model.set({ msg: v });
								}
							},
							attributes: { name: 'dialogtag-msg', spellcheck: 'true' }
						}),
						(m, c) => c.setValue(m.msg, false)
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('dialogRequestControl.msgInfo', "An optional message to include in the request to the current puppeteer.")
					}
				)),
				n.component('message', new Collapser(null)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: { click: () => this._onRequestControl(puppeteer, model) },
						className: 'btn primary dialog--btn'
					}, [
						n.component(new Txt(l10n.l('dialogrequestcontrol.requestControl', "Request control")))
					]),
				])
			])),
			onClose: () => { this.dialog = null; }
		});

		this.dialog.open();
		this.dialog.getContent().getNode('msg').getComponent().getComponent().getElement().focus();
	}

	_setControlledBy(c, puppet) {
		let puppeteer = puppet.puppeteer;
		c.setText(puppeteer
			? l10n.l('dialogRequestControl.controlledBy', "Controlled by {fullName}", { fullName: (puppeteer.name + ' ' + puppeteer.surname).trim() })
			: puppet.state == 'awake'
				? l10n.l('dialogRequestControl.controlledByOwner', "Controlled by owner")
				: l10n.l('dialogRequestControl.notControlled', "Not controlled")
		);
	}

	_onRequestControl(puppeteer, model) {
		if (this.requestPromise) return this.requestPromise;

		this.requestPromise = this.module.player.getPlayer().call('requestControl', {
			charId: puppeteer.char.id,
			puppetId: puppeteer.puppet.id,
			msg: model.msg.trim() || null
		}).then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.requestPromise = null;
		});

		return this.requestPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogRequestControl;
