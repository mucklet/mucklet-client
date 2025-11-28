import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import ProjectState from 'components/ProjectState';
import formatDateTime from 'utils/formatDateTime';
import RouteNodesNodeBadgeContent from './RouteNodesNodeBadgeContent';


class RouteNodesNodeBadge {
	constructor(module, model, node) {
		this.module = module;
		this.model = model;
		this.node = node;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('badge', 'div', {
			className: 'routenodes-nodebadge badge dark large btn',
			events: {
				click: (c, ev) => {
					this.module.self.setRoute({ nodeKey: this.model.node == this.node
						? null
						: this.node.key,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--select' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new FAIcon('server')),
				]),
				n.elem('div', { className: 'badge--info-morepad' }, [
					n.elem('div', { className: 'flex-row flex-start' }, [
						n.elem('div', { className: 'routenodes-nodebadge--title badge--title badge--nowrap flex-1' }, [
							n.component(new ModelTxt(this.node, m => m.key)),
						]),
						n.elem('div', { className: 'routenodes-nodebadge--date badge--nowrap flex-auto' }, [
							n.component(new ModelTxt(this.node, m => formatDateTime(new Date(m.created), { showYear: true }))),
						]),
					]),

					// Node state
					n.elem('div', { className: 'routenodes-nodebadge--state badge--nowrap flex-1' }, [
						n.component(new ProjectState(this.node, {
							size: 'small',
						})),
					]),
				]),
			]),
			n.component(new ModelCollapser(this.model, [{
				condition: m => m.node == this.node,
				factory: m => new RouteNodesNodeBadgeContent(this.module, this.node),
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

export default RouteNodesNodeBadge;
