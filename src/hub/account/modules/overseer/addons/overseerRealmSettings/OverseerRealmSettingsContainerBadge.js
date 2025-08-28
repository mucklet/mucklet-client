import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import formatDateTime from 'utils/formatDateTime';
import containerStates, { getContainerState } from 'utils/containerStates';
import OverseerRealmSettingsContainerBadgeContent from './OverseerRealmSettingsContainerBadgeContent';

class OverseerRealmSettingsContainerBadge {
	constructor(module, container, selectedModel) {
		this.module = module;
		this.container = container;
		this.selectedModel = selectedModel;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'overseerrealmsettings-containerbadge badge dark btn',
			events: {
				click: (c, ev) => {
					this.selectedModel.set({ selected: this.selectedModel.selected == this.container.id
						? null
						: this.container.id,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--info flex-row flex-start flex-center' }, [
				n.elem('div', { className: 'overseerrealmsettings-containerbadge--state badge--nowrap flex-1' }, [
					n.component(new ModelComponent(
						this.container,
						new FAIcon('circle', { className: 'overseerrealmsettings-containerbadge--stateicon' }),
						(m, c) => {
							let state = getContainerState(m, 'state');
							for (let s of containerStates) {
								c[state == s ? 'addClass' : 'removeClass'](s.className);
							}
						},
					)),
					n.html('&nbsp;&nbsp;'),
					n.component(new ModelTxt(this.container, m => m.name, { className: 'badge--title' })),
				]),
				n.elem('div', { className: 'overseerrealmsettings-containerbadge--timestamp badge--text badge--nowrap flex-auto' }, [
					n.component(new ModelTxt(this.container, m => formatDateTime(new Date(m.stateSince), { showYear: true }))),
				]),
			]),
			n.component(new ModelCollapser(this.selectedModel, [{
				condition: m => m.selected == this.container.id,
				factory: m => new OverseerRealmSettingsContainerBadgeContent(this.module, this.container),
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

export default OverseerRealmSettingsContainerBadge;
