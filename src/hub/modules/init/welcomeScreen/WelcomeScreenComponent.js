import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class WelcomeScreenComponent {

	constructor(module, err) {
		this.module = module;
		this.err = err;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'welcomescreen' }, [
			n.elem('div', { className: 'welcomescreen--container' }, [
				n.elem('div', { className: 'welcomescreen--header' }, [
					n.component(new Txt(APP_TITLE, { tagName: 'h1' })),
				]),
				n.elem('div', { className: 'welcomescreen--content' }, [
					n.component(new Txt(l10n.l('welcomeScreen.welcomeContent', "A world of role play"), { tagName: 'p' })),
				]),
			])
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

export default WelcomeScreenComponent;
