import { Elem, Transition } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import KebabMenu from 'components/KebabMenu';
import LayoutMobileTitleBar from './LayoutMobileTitleBar';

class LayoutMobileComponent {
	constructor(module, mainComponent) {
		this.module = module;
		this.mainComponent = mainComponent;
	}

	render(el) {
		let component = {};
		let tabPage = new Transition({ className: 'layoutmobile--tabpage' });
		let model = new Model({ data: { pageInfo: null, tabId: null }, eventBus: this.module.self.app.eventBus });
		this.elem = new ModelComponent(
			this.module.playerTabs.getModel(),
			new ModelComponent(
				model,
				new Elem(n => (
					n.elem('div', { className: 'layoutmobile' }, [
						n.elem('div', { className: 'layoutmobile--container' }, [
							n.elem('div', { className: 'layoutmobile--topbar' }, [
								n.component('titleBar', new Collapser()),
								n.elem('div', { className: 'layoutmobile--tabscont' }, [
									n.component(this.module.playerTabs.newTabs({
										closeOnReselect: true
									})),
									n.component(new KebabMenu(this.module.playerTools.getTools(), {
										className: 'layoutmobile--kebabmenu',
										btnClassName: 'iconbtn medium light',
										topMargin: 10,
									})),
								]),
							]),
							n.component('main', new Fader(null, { className: 'layoutmobile--main' })),
						])
					])
				)),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('pageInfo')) {
						c.getNode('titleBar').setComponent(component.titleBar = m.pageInfo
							? component.titleBar || new LayoutMobileTitleBar(this.module, model)
							: null
						);

						if (m.pageInfo) {
							let dir = 0;
							if (change && change.hasOwnProperty('tabId')) {
								dir = this.module.playerTabs.getTabDirection(change.tabId, m.tabId);
							}
							tabPage[dir == 0
								? 'fade'
								: dir > 0
									? 'slideLeft'
									: 'slideRight'
							](m.pageInfo.component);
						}

						c.getNode('main').setComponent(m.pageInfo
							? tabPage
							: this.mainComponent
						);
					}
				},
			),
			(m, c, change) => {
				if (!change || change.hasOwnProperty('factory')) {
					model.set(Object.assign({
						pageInfo: m.factory
							? m.factory('mobile')
							: null
					}, m.props));
				}
			}
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default LayoutMobileComponent;
