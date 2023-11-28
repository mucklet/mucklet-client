import { Context, Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import LabelToggleBox from 'components/LabelToggleBox';
import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class CharSettingsHelperComponent {
	constructor(module, char, puppeteer, charSettings, state) {
		this.module = module;
		this.char = char;
		this.puppeteer = puppeteer;
		this.charSettings = charSettings;
		this.state = state;
	}

	render(el) {
		this.elem = new Context(
			() => new ModifyModel(this.charSettings, {
				eventBus: this.module.self.app.eventBus,
			}),
			charSettings => charSettings.dispose(),
			charSettings => new PanelSection(
				l10n.l('charSettingsHelper.helperSettings', "Helper settings"),
				new Elem(n => n.elem('div', [
					n.component(new ModelComponent(
						charSettings,
						new LabelToggleBox(l10n.l('charSettingsHelper.listenOnHelpChannel', "Listen on helper channel"), false, {
							className: 'common--formmargin',
							onChange: (v, c) => this._setValue(charSettings, v),
							popupTip: l10n.l('charSettingsHelper.listenOnHelpChannelInfo', "Listen and reply to messages sent on the helper channel using the helpme command."),
							popupTipClassName: 'popuptip--width-s',
						}),
						(m, c) => c.setValue(m.isHelping, false),
					)),
				])),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			),
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
		charSettings.set({ helper: v });
		this.module.player.getPlayer().call('setCharSettings', {
			charId: this.char.id,
			puppeteerId: this.puppeteer ? this.puppeteer.id : undefined,
			isHelping: v,
		}).catch(err => {
			if (charSettings.getModel()) {
				charSettings.reset('isHelping');
			}
			this.module.toaster.openError(err);
		});
	}
}

export default CharSettingsHelperComponent;
