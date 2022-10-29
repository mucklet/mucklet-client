import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';

class CharSettingsDndComponent {
	constructor(module, char, puppeteer, charSettings, state) {
		this.module = module;
		this.char = char;
		this.puppeteer = puppeteer;
		this.charSettings = charSettings;
		this.state = state;
	}

	render(el) {
		let components = {};
		this.elem = new Context(
			() => new ModifyModel(this.charSettings, {
				eventBus: this.module.self.app.eventBus
			}),
			charSettings => charSettings.dispose(),
			charSettings => new Elem(n => n.elem('div', [
				n.component(new ModelComponent(
					charSettings,
					new LabelToggleBox(l10n.l('charSettingsDnd.enabledDoNotDisturb', "Enable do not disturb"), false, {
						className: 'common--formmargin',
						onChange: (v, c) => this._setValue(charSettings, v),
						popupTip: l10n.l('charSettingsDnd.enabledDoNotDisturbInfo', "Prevent messages to be sent to and from the character."),
						popupTipClassName: 'popuptip--width-s'
					}),
					(m, c) => c.setValue(m.dnd, false)
				)),
				n.component(new ModelComponent(
					charSettings,
					new Collapser(),
					(m, c) => c.setComponent(components.setDndMsg = m.dnd
						? components.setDndMsg || new Elem(n => n.elem('button', { events: {
							click: () => this.module.dialogEditDndMsg.open(this.char, this.puppeteer, this.charSettings)
						}, className: 'btn medium light full-width icon-left' }, [
							n.component(new FAIcon('pencil')),
							n.component(new Txt(l10n.l('charSettingsDnd.editMessage', "Edit message")))
						]))
						: null
					)
				))
			]))
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setValue(charSettings, v) {
		charSettings.set({ dnd: v });
		this.module.player.getPlayer().call('setCharSettings', {
			charId: this.char.id,
			puppeteerId: this.puppeteer ? this.puppeteer.id : undefined,
			dnd: v
		}).catch(err => {
			if (charSettings.getModel()) {
				charSettings.reset('dnd');
			}
			this.module.toaster.openError(err);
		});
	}
}

export default CharSettingsDndComponent;
