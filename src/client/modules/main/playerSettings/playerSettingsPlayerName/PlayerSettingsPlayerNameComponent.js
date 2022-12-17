import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';

class PlayerSettingsPlayerNameComponent {
	constructor(module, identity, player, state) {
		this.module = module;
		this.identity = identity;
		this.player = player;
		this.state = state;
	}

	render(el) {
		let components = {};
		this.elem = new Elem(n => n.elem('div', { className: 'playersettingsplayername' }, [
			n.component(new ModelComponent(
				this.identity,
				new Collapser(),
				(m, c, change) => c.setComponent(components.playerName = m && m.name
					? components.playerName || new PanelSection(
						l10n.l('playerSettingsPlayerName.name', "Player name"),
						new ModelTxt(m, m => m.name, { className: 'playersettingsplayername--name' }),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)
					: null,
				),
			)),
			n.component(new ModelComponent(
				this.identity,
				new Collapser(),
				(m, c, change) => c.setComponent(components.username = m && m.username && m.name.toLowerCase() != m.username
					? components.username || new PanelSection(
						l10n.l('playerSettingsPlayerName.username', "Login name"),
						new ModelTxt(this.identity, m => m.username, { className: 'playersettingsplayername--username' }),
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

export default PlayerSettingsPlayerNameComponent;
