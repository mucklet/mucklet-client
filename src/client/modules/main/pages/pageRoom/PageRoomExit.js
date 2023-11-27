import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import ExitIcon from 'components/ExitIcon';
import ModelCollapser from 'components/ModelCollapser';
import isError from 'utils/isError';
import PageRoomExitChars from './PageRoomExitChars';

class PageRoomExit {
	constructor(module, ctrl, exit, onClick, opt) {
		this.module = module;
		this.ctrl = ctrl;
		this.exit = exit;
		this.onClick = onClick;
		this.opt = opt;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageroom-exit' }, [
			n.elem('btn', 'div', { className: 'badge btn', events: {
				click: (c, ev) => this.onClick(this.exit.id, ev),
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
				n.component(new ModelComponent(
					this.exit,
					new ModelCollapser(null, [{
						condition: m => m?.awake && !isError(m.awake),
						factory: m => new PageRoomExitChars(this.module, m.awake, this.opt),
					}]),
					(m, c) => c.setModel(m.target),
				)),
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
}

export default PageRoomExit;
