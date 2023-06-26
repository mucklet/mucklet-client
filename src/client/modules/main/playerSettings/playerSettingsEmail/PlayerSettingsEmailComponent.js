import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class PlayerSettingsEmailComponent {
	constructor(module, identity) {
		this.module = module;
		this.identity = identity;
	}

	render(el) {
		this.elem = new PanelSection(
			l10n.l('playerSettingsEmail.email', "Email"),
			this.module.accountEmail.newEmailButton(this.identity, { fullWidth: true }),
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

export default PlayerSettingsEmailComponent;
