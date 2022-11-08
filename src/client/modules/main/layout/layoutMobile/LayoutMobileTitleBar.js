import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';

class LayoutMobileTitleBar {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		let currentIcon = null;
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => (
				n.elem('div', { className: 'layoutmobile-titlebar' }, [
					n.elem('div', { className: 'layoutmobile-titlebar--btncont' }, [
						n.elem('button', {
							className: 'layoutmobile-titlebar--btn iconbtn medium',
							events: {
								click: (c, e) => {
									let m = this.module.playerTabs.getModel();
									if (m && m.page && m.page.close) {
										m.page.close();
									}
									e.stopPropagation();
								},
							},
						}, [
							n.component('icon', new Fader()),
						]),
					]),
					n.elem('div', { className: 'layoutmobile-titlebar--title' }, [
						n.component('txt', new Txt(null, { tagName: 'h3', className: 'layoutmobile-titlebar--titletxt' })),
					]),
				])
			)),
			(m, c) => {
				if (!m || !m.pageInfo) return;

				let pi = m.pageInfo;
				c.getNode('txt').setText(pi.title || (m.page && m.page.id) || m.tabId);
				let icon = pi.closeIcon || (m.pageIdx > 0
					? 'chevron-circle-left'
					: 'times'
				);
				if (currentIcon != icon) {
					c.getNode('icon').setComponent(new FAIcon(icon));
					currentIcon = icon;
				}
			},
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

export default LayoutMobileTitleBar;
