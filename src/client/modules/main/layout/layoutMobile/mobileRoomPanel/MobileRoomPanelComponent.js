import { Transition } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import MobilePanel from 'components/MobilePanel';

function getAreaIdx(areas, area) {
	return areas ? areas.indexOf(area) : -1;
}

class RoomPanelComponent {
	constructor(module, opt) {
		this.module = module;

		this.transition = new Transition(null, { duration: 150 }),
		this.panel = new MobilePanel("", null, {
			closed: !opt?.open,
			align: 'right',
			className: 'mobileroompanel',
			onClose: () => this.module.mobileActivePanel.toggleRoomPanel(false),
			subheaderComponent: this.module.roomPages.newZoomBar({ className: 'mobileroompanel--zoombar' }),
		});
	}

	render(el) {
		this.elem = new ModelComponent(
			this.module.roomPages.getModel(),
			this.panel,
			(m, c, change) => {
				if (!change || change.hasOwnProperty('factory')) {
					let pageInfo = m.factory?.('mobile');

					if (!pageInfo) {
						c.setTitle("").setButton(null).setComponent(null);
						return;
					}

					let cb = 'fade';
					if (change?.hasOwnProperty('area')) {
						let before = getAreaIdx(change?.hasOwnProperty('areas') ? change.areas : m.areas, change.area);
						let after = getAreaIdx(m.areas, m.area);
						if (before >= 0 && after >= 0 && before != after) {
							cb = (after - before) > 0 ? 'slideLeft' : 'slideRight';
						}
					}

					let page = m.page;
					this.transition[cb](pageInfo.component, {
						onRender: () => {
							// Restore scrolling of page
							let sb = c.getSimpleBar();
							if (sb) {
								sb.getScrollElement().scrollTop = page.state.scrollTop || 0;
							}
						},
						onUnrender: () => {
							// Store scrolling of page
							let sb = c.getSimpleBar();
							if (sb) {
								page.state.scrollTop = sb.getScrollElement().scrollTop;
							}
						},
					});
					let close = pageInfo.close || page?.close;

					c
						.setTitle(pageInfo.title || "")
						.setButton(close || (() => this.toggle(false)), close ? pageInfo.closeIcon || page?.closeIcon || 'chevron-circle-left' : 'times')
						.setComponent(this.transition);
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

	/**
	 * Toggles the panel between open or close.
	 * @param {bool} open State to toggle to. Defaults to toggle between open and close.
	 * @returns {this}
	 */
	toggle(open) {
		this.panel.toggle(open);
		return this;
	}
}

export default RoomPanelComponent;
