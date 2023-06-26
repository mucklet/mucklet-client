import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteRealmsComponent draws a the realms route page.
 */
class RouteRealmsComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routerealms' }, [
			n.component(new Txt(l10n.l('routeRealms.realms', "Realms"), { tagName: 'h2' })),
			n.elem('div', { className: 'common--hr' }),
			n.component(new Txt(l10n.l('routeRealms.disclaimer1', "Want to create a realm of your own? This is where you will be able to manage them."), { tagName: 'p', className: 'common--placeholder' })),
			n.component(new Txt(l10n.l('routeRealms.disclaimer2', "... but we are still working on it."), { tagName: 'p', className: 'common--placeholder' })),
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

export default RouteRealmsComponent;
