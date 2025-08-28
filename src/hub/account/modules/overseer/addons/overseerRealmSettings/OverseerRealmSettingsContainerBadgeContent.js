import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import { getContainerState } from 'utils/containerStates';


class OverseerRealmSettingsContainerBadgeContent {
	constructor(module, container) {
		this.module = module;
		this.container = container;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'overseercontainersettings-containerbadgecontent badge--margin badge--info' }, [
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overseerRealmSettings.state', "State"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.container, m => getContainerState(m).text, { className: 'badge--text' })),
			]),
			n.elem('div', { className: 'badge--select' }, [
				n.component(new Txt(l10n.l('overseerRealmSettings.img', "Img"), { className: 'badge--iconcol badge--subtitle' })),
				n.component(new ModelTxt(this.container, m => m.image, { className: 'badge--text' })),
			]),
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
