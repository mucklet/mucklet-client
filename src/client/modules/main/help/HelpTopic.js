import { Elem, Html } from 'modapp-base-component';

class HelpTopic {
	constructor(module, topic, cmd) {
		this.module = module;
		this.topic = topic;
		this.cmd = cmd;
	}

	render(el) {
		let t = this.topic;
		this.elem = new Elem(n => n.elem('div', { className: 'help-topic' }, [
			n.elem('div', { className: 'charlog--code' }, [
				n.component(new Html(typeof t.usage == 'function' ? t.usage() : t.usage, { tagName: 'code', className: 'help-topic--title margin-bottom-m' })),
				n.component(new Html(typeof t.desc == 'function' ? t.desc() : t.desc, { className: 'help-topic--desc' })),
				n.component(t.examples ? new Html(t.examples.map(ex => ('<p>Example: <code>' + ex + '</code></p>'))) : null),
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

export default HelpTopic;
