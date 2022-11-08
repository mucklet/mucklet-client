import { Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { isResError } from 'resclient';
import PanelSection from 'components/PanelSection';
import Fader from 'components/Fader';
import l10n from 'modapp-l10n';

class PlayerSettingsMainCharComponent {
	constructor(module, user, player, state) {
		this.module = module;
		this.user = user;
		this.player = player;
		this.state = state;
	}

	render(el) {
		this.elem = new PanelSection(
			l10n.l('playerSettings.preferences', "Main character"),
			new ModelComponent(
				this.player,
				new Fader(),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('mainChar')) return;
					c.setComponent(m.mainChar && !isResError(m.mainChar) && !m.mainChar.deleted
						? new ModelTxt(m.mainChar, m => (m.name + ' ' + m.surname).trim(), { className: 'pageSectionSettingsMainChar--name' })
						: new Txt(l10n.l('playerSettingsMainChar.noCharacterSet', "No character set"), { className: 'common--placeholder' }),
					);
				},
			),
			{
				className: 'common--sectionpadding',
				noToggle: true,
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
}

export default PlayerSettingsMainCharComponent;
