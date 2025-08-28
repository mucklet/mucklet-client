import { Elem, Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { ModelToCollection, Model } from 'modapp-resource';
import OverseerRealmSettingsContainerBadge from './OverseerRealmSettingsContainerBadge';

/**
 * OverseerRealmSettingsContainers draws a list of realm container badge components.
 */
class OverseerRealmSettingsContainers {
	constructor(module, model, containers, user) {
		this.module = module;
		this.model = model;
		this.containers = containers;
		this.user = user;
		this.selectedModel = new Model({ data: { selected: null }});
	}

	render(el) {
		this.elem = new Context(
			() => new ModelToCollection(this.containers, {
				compare: (a, b) => a.value.name.localeCompare(b.value.name) || a.key.localeCompare(b.key),
				eventBus: this.module.self.eventBus,
			}),
			containers => containers.dispose(),
			containers => new Elem(n => n.elem('div', { className: 'overseerrealmsettings-containers' }, [
				n.component(new CollectionList(
					containers,
					m => new OverseerRealmSettingsContainerBadge(this.module, m, this.selectedModel),
					{
						className: 'overseerrealmsettings-containers--list',
						subClassName: () => 'overseerrealmsettings-containers--listitem',
					},
				)),
			])),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default OverseerRealmSettingsContainers;
