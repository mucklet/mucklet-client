import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class OverviewAccountSecurityComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
		this.state = state;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.user,
			new Collapser(),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('hasLogin')) {
					return;
				}
				c.setComponent(m && m.hasLogin
					? new PanelSection(
						l10n.l('overviewAccountSecurity.security', "Security"),
						new Elem(n => n.elem('button', { events: {
							click: () => this.module.dialogChangePassword.open(m.id),
						}, className: 'btn medium light icon-left' }, [
							n.component(new FAIcon('key')),
							n.component(new Txt(l10n.l('overviewAccountSecurity.changePassword', "Change password"))),
						])),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				);
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

export default OverviewAccountSecurityComponent;
