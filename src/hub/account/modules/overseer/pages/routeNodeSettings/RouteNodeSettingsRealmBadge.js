import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import apiStates, { getApiState } from 'utils/apiStates';
import RouteNodeSettingsRealmBadgeContent from './RouteNodeSettingsRealmBadgeContent';

class RouteNodeSettingsRealmBadge {
	constructor(module, realm, selectedModel) {
		this.module = module;
		this.realm = realm;
		this.selectedModel = selectedModel;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'routenodesettings-realmbadge badge dark btn',
			events: {
				click: (c, ev) => {
					this.selectedModel.set({ realmId: this.selectedModel.realmId == this.realm.id
						? null
						: this.realm.id,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--info flex-row flex-start flex-center' }, [
				n.elem('div', { className: 'routenodesettings-realmbadge--state badge--nowrap flex-1' }, [
					n.component(new ModelComponent(
						this.realm,
						new FAIcon('circle', { className: 'routenodesettings-realmbadge--stateicon' }),
						(m, c) => {
							let state = getApiState(m, 'apiState');
							for (let s of apiStates) {
								c[state == s ? 'addClass' : 'removeClass'](s.className);
							}
						},
					)),
					n.html('&nbsp;&nbsp;'),
					n.component(new ModelTxt(this.realm, m => m.name, { className: 'badge--title' })),
				]),
				n.elem('div', { className: 'routenodesettings-realmbadge--key badge--text badge--nowrap flex-auto' }, [
					n.component(new ModelTxt(this.realm, m => m.key)),
				]),
			]),
			n.component(new ModelCollapser(this.selectedModel, [{
				condition: m => m.realmId == this.realm.id,
				factory: m => new RouteNodeSettingsRealmBadgeContent(this.module, this.realm),
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

export default RouteNodeSettingsRealmBadge;
