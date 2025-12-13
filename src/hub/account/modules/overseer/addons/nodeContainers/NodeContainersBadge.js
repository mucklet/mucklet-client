import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import formatDateTime from 'utils/formatDateTime';
import containerStates, { getContainerState } from 'utils/containerStates';
import NodeContainersBadgeContent from './NodeContainersBadgeContent';

class NodeContainersBadge {
	constructor(module, container, selectedModel) {
		this.module = module;
		this.container = container;
		this.selectedModel = selectedModel;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'nodecontainers-badge badge dark btn',
			events: {
				click: (c, ev) => {
					this.selectedModel.set({ containerId: this.selectedModel.containerId == this.container.id
						? null
						: this.container.id,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--info badge--select badge--select-gap badge--select-center' }, [
				n.elem('div', { className: 'badge--symbol' }, [
					n.component(new ModelComponent(
						this.container,
						new FAIcon('circle'),
						(m, c) => {
							let state = getContainerState(m, 'state');
							for (let s of containerStates) {
								c[state == s ? 'addClass' : 'removeClass'](s.className);
							}
						},
					)),
				]),
				n.elem('div', { className: 'badge--info badge--title badge--nowrap flex-1' }, [
					n.component(new ModelTxt(this.container, m => m.name)),
				]),
				n.elem('div', { className: 'badge--padright badge--text badge--nowrap flex-auto' }, [
					n.component(new ModelTxt(this.container, m => formatDateTime(new Date(m.stateSince), { showYear: true }))),
				]),
			]),
			n.component(new ModelCollapser(this.selectedModel, [{
				condition: m => m.containerId == this.container.id,
				factory: m => new NodeContainersBadgeContent(this.module, this.container),
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

export default NodeContainersBadge;
