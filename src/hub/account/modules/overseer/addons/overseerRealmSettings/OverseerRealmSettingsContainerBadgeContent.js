import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import { getContainerState } from 'utils/containerStates';
import ModelCollapser from 'components/ModelCollapser';
import errToL10n from 'utils/errToL10n';


class OverseerRealmSettingsContainerBadgeContent {
	constructor(module, container) {
		this.module = module;
		this.container = container;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overseerrealmsettings-containerbadgecontent badge--margin badge--info' }, [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overseerRealmSettings.state', "State"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.container, m => getContainerState(m).text, { className: 'badge--text badge--info-morepad' })),
			]),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overseerRealmSettings.img', "Img"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.container, m => m.image, { className: 'badge--text badge--info-morepad' })),
			]),
			n.component(new ModelCollapser(this.container, [{
				condition: m => m.error,
				factory: m => new Elem(n => n.elem('div', { className: 'badge--select' }, [
					n.component(new Txt(l10n.l('overseerRealmSettings.err', "Error"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(this.container, m => errToL10n(m.error), { className: 'overseerrealmsettings-containerbadgecontent--error badge--error badge--info-morepad' })),
				])),
			}])),
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

export default OverseerRealmSettingsContainerBadgeContent;
