import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import copyToClipboard from 'utils/copyToClipboard';

class PageTeleportCharRoom {
	constructor(module, ctrl, room, closePage) {
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.closePage = closePage;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageteleportchar-room' }, [
			n.elem('btn', 'div', { className: 'badge btn', events: {
				click: () => this._teleport()
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--info' }, [
						n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'badge--title' })),
						n.component(new ModelTxt(this.room, m => "#" + m.id, { tagName: 'div', className: 'badge--text' })),
					]),
					n.elem('div', { className: 'badge--tools pageteleportchar-room--tools' }, [
						n.elem('button', { className: 'iconbtn medium tinyicon', events: {
							click: (c, ev) => {
								copyToClipboard("#" + this.room.id);
								ev.stopPropagation();
							}
						}}, [
							n.component(new FAIcon('clipboard')),
						])
					])
				])
			])
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_teleport() {
		this.ctrl.call('teleport', { roomId: this.room.id })
			.then(() => this.closePage());
	}

}

export default PageTeleportCharRoom;
