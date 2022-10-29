import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';

/**
 * MobileRoomBadgeComponent is an area map overlay component.
 */
class MobileRoomBadgeComponent {

	constructor(module, ctrl, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
	}

	render(el) {
		let roomComponent = null;

		this.elem = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				null,
				new Fader(),
				(m, c) => {
					c.setComponent(roomComponent = m
						? roomComponent || new Elem(n => n.elem('div', { className: 'mobileroombadge' }, [
							n.elem('div', { className: 'mobileroombadge--badge' }, [
								n.elem('div', { className: 'badge btn nooutline', events: {
									click: (c, ev) => {
										this.module.roomPages.openPanel();
										ev.stopPropagation();
									}
								}}, [
									n.elem('div', { className: 'mobileroombadge--badgecont' }, [
										n.elem('div', { className: 'badge--select badge--select-margin flex-baseline' }, [
											n.elem('div', { className: 'badge--info' }, [
												n.component('name', new Txt("", {
													tagName: 'div',
													className: 'badge--text badge--nowrap mobileroombadge--name'
												})),
											]),
											n.elem('div', { className: 'mobileroombadge--counter' }, [
												n.component('pop', new Txt('', {
													tagName: 'div',
													className: 'badge--text',
													duration: 0,
												})),
											]),
										]),
									]),
								])
							]),
						]))
						: null
					);
					this._setBadge(m, roomComponent);
				}
			),
			(m, c) => c.setModel(m && m.inRoom)
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setBadge(m, c) {
		if (!m || !c) {
			return;
		}

		c.getNode('name').setText(m.name);
		c.getNode('pop').setText(m.pop || "0");
	}
}

export default MobileRoomBadgeComponent;
