import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';

/**
 * RouteOverviewComponent draws a the overview route page.
 */
class RouteOverviewComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routeoverview' }, [
			n.elem('label', [
				n.component(new Txt(l10n.l('routeOverview.accountDetails', "Account details"), { tagName: 'h2' })),
			]),
			n.component(new ModelTxt(this.model.user, m => m.email, { tagName: 'div', className: 'common--formmargin' })),
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

export default RouteOverviewComponent;
