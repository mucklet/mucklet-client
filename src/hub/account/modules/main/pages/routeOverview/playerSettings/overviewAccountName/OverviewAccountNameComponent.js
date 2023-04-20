import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';

class OverviewAccountNameComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
		this.state = state;
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'overviewaccountname' }, [
			n.component(new ModelComponent(
				this.user,
				new Collapser(),
				(m, c, change) => c.setComponent(components.playerName = m && m.name
					? components.playerName || new PanelSection(
						l10n.l('overviewAccountName.name', "Player name"),
						new ModelTxt(m, m => m.name, { className: 'overviewaccountname--name' }),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
			n.component(new ModelComponent(
				this.user,
				new Collapser(),
				(m, c, change) => c.setComponent(components.username = m && m.username && m.name.toLowerCase() != m.username
					? components.username || new PanelSection(
						l10n.l('overviewAccountName.username', "Login name"),
						new ModelTxt(this.user, m => m.username, { className: 'overviewaccountname--username' }),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverviewAccountNameComponent;
