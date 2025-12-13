import { Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { ModelToCollection, Model } from 'modapp-resource';
import NodeContainersBadge from './NodeContainersBadge';

/**
 * NodeContainersComponent draws a list of node container badge components.
 */
class NodeContainersComponent {
	constructor(module, containers, opt) {
		this.module = module;
		this.containers = containers;
		this.opt = opt;
		this.selectedModel = new Model({ data: { containerId: null }});
	}

	render(el) {
		this.elem = new Context(
			() => new ModelToCollection(this.containers, {
				compare: (a, b) => a.value.name.localeCompare(b.value.name) || a.key.localeCompare(b.key),
				eventBus: this.module.self.eventBus,
			}),
			containers => containers.dispose(),
			containers => new CollectionList(
				containers,
				m => new NodeContainersBadge(this.module, m, this.selectedModel),
				{
					...this.opt,
					className: 'nodecontainers' + (this.opt?.className ? ' ' + this.opt.className : ''),
					subClassName: () => 'nodecontainers--listitem',
				},
			),
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

export default NodeContainersComponent;
