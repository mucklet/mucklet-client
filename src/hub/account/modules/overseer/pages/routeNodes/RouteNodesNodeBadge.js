import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import formatDateTime from 'utils/formatDateTime';
import apiStates, { getApiState } from 'utils/apiStates';
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
					n.component(new ModelComponent(
						this.node,
						new Elem(n => n.elem('div', { className: 'routenodes-nodebadge--state badge--nowrap flex-1' }, [
							n.component('icon', new FAIcon('circle', { className: 'routenodes-nodebadge--stateicon' })),
							n.html('&nbsp;&nbsp;'),
							n.component('txt', new Txt('', { className: 'badge--text' })),
						])),
						(m, c) => {
							let state = getApiState(m, 'state');
							c.getNode('txt').setText(state.text);
							let icon = c.getNode('icon');
							for (let s of apiStates) {
								icon[state == s ? 'addClass' : 'removeClass'](s.className);
							}
						},
					)),
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
