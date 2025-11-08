import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import { getApiState } from 'utils/apiStates';

class RouteNodesNodeBadgeContent {
	constructor(module, node) {
		this.module = module;
		this.node = node;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routenodes-nodebadgecontent badge--margin badge--select badge--select-margin' }, [
			// Node up
			n.elem('div', { className: 'flex-1' }, [
				n.component(new ModelComponent(
					this.node,
					new Elem(n => n.elem('button', {
						className: 'btn primary medium icon-left full-width',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.routeNodeSettings.nodeUp(this.node.key);
							},
						},
					}, [
						n.component(new FAIcon('play')),
						n.component(new Txt(l10n.l('routeNodeSettings.nodeUp', "Node Up"))),
					])),
					(m, c) => {
						let state = getApiState(m, 'state');
						c.setProperty('disabled', state.transitional ? 'disabled' : null);
					},
				)),
			]),

			// Node stop
			n.elem('div', { className: 'flex-1' }, [
				n.component(new ModelComponent(
					this.node,
					new Elem(n => n.elem('button', {
						className: 'btn secondary medium icon-left full-width',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.routeNodeSettings.nodeStop(this.node.key);
							},
						},
					}, [
						n.component(new FAIcon('pause')),
						n.component(new Txt(l10n.l('routeNodeSettings.nodeStop', "Node Stop"))),
					])),
					(m, c) => {
						let state = getApiState(m, 'state');
						c.setProperty('disabled', state.transitional ? 'disabled' : null);
					},
				)),
			]),

			// Node down
			n.elem('div', { className: 'flex-1' }, [
				n.component(new ModelComponent(
					this.node,
					new Elem(n => n.elem('button', {
						className: 'btn warning medium icon-left full-width',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.routeNodeSettings.nodeDown(this.node.key);
							},
						},
					}, [
						n.component(new FAIcon('stop')),
						n.component(new Txt(l10n.l('routeNodeSettings.nodeDown', "Node Down"))),
					])),
					(m, c) => {
						let state = getApiState(m, 'state');
						c.setProperty('disabled', state.transitional ? 'disabled' : null);
					},
				)),
			]),
			n.elem('button', { className: 'iconbtn medium solid', events: {
				click: (c, ev) => {
					ev.stopPropagation();
					this.module.routeNodeSettings.setRoute({ nodeKey: this.node.key });
				},
			}}, [
				n.component(new FAIcon('cog')),
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

export default RouteNodesNodeBadgeContent;
