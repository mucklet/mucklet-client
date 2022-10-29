import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';

class LogoutToolComponent {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('button', { className: 'btn medium logouttool lighten', events: {
			click: () => this.module.self.logout()
		}}, [
			n.component(new FAIcon('sign-out')),
			n.component(new Txt(l10n.l('playerPanel.logout', "Logout")))
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default LogoutToolComponent;
