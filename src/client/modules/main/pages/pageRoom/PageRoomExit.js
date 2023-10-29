import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import ExitIcon from 'components/ExitIcon';

class PageRoomExit {
	constructor(module, ctrl, room, exit) {
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.exit = exit;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageroom-exit' }, [
			n.elem('btn', 'div', { className: 'badge btn', events: {
				click: () => this._useExit(),
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--faicon smallicon' }, [
						n.component(new ModelComponent(
							this.exit,
							new ExitIcon('', { default: 'dot' }),
							(m, c) => c.setIcon(m.icon),
						)),
					]),
					n.elem('div', { className: 'badge--info' }, [
						n.component(new ModelTxt(this.exit, m => m.name, { tagName: 'div', className: 'badge--title' })),
						n.component(new ModelTxt(this.exit, m => m.keys.join(", "), { tagName: 'div', className: 'badge--text' })),
					]),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_useExit() {
		this.ctrl.call('useExit', { exitId: this.exit.id })
			.catch(err => this.module.toaster.openError(err));
	}

}

export default PageRoomExit;
