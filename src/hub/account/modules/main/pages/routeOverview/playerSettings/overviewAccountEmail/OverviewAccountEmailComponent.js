import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class OverviewAccountEmailComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
		this.state = state;
	}

	render(el) {
		this.elem = new PanelSection(
			l10n.l('overviewAccountEmail.email', "Email"),
			this.module.accountEmail.newEmailButton(this.user),
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

export default OverviewAccountEmailComponent;
