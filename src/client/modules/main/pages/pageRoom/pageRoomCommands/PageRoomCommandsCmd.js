import { Elem, Html } from 'modapp-base-component';
import ModelCollapser from 'components/ModelCollapser';

class PageRoomCommandsCmd {
	constructor(module, cmd, model, onClick) {
		this.module = module;
		this.cmd = cmd;
		this.model = model;
		this.onClick = onClick;
	}

	render(el) {
		let topic = this.module.cmdPattern.getHelpTopic(this.cmd.id, this.cmd.cmd);
		this.elem = new Elem(n => n.elem('div', { className: 'pageroomcommands-cmd' }, [
			n.elem('btn', 'div', { className: 'badge btn', events: {
				click: (c, ev) => this.onClick(topic.desc && this.cmd.id != this.model.selected ? this.cmd.id : null),
			}}, [
				n.elem('div', { className: 'badge--info' }, [
					n.component(new Html(topic.usage, { className: 'badge--text' })),
				]),
				n.component(new ModelCollapser(this.model, [{
					condition: m => m.selected == this.cmd.id && topic.desc,
					factory: m => new Elem(n => n.elem('div', { className: 'pageroomcommands-cmd--desc' }, [
						n.elem('div', { className: 'badge--divider' }),
						n.elem('div', { className: 'badge--info' }, [
							n.component(new Html(topic.desc, { className: 'badge--text' })),
						]),
					])),
				}])),
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

export default PageRoomCommandsCmd;
