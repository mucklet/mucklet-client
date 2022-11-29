import { Elem, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import helpAttribDesc from 'utils/helpAttribDesc';

class HelpTopic {
	constructor(module, topic, cmd) {
		this.module = module;
		this.topic = topic;
		this.cmd = cmd;
	}

	render(el) {
		let t = this.topic;
		let examples = null;
		if (t.examples) {
			let ex = typeof t.examples == 'function' ? t.examples() : t.examples;
			if (ex && ex.length) {
				let hasDesc = false;
				let items = ex.map(e => {
					hasDesc |= !!e.desc;
					return { key: e.cmd, desc: e.desc };
				});
				examples = helpAttribDesc('', items, {
					attribute: l10n.l('help.example', "Example"),
					value: hasDesc ? l10n.l('help.description', "Description") : '',
				});
			}
		}
		this.elem = new Elem(n => n.elem('div', { className: 'help-topic' }, [
			n.elem('div', { className: 'charlog--code' }, [
				n.component(new Html(typeof t.usage == 'function' ? t.usage() : t.usage, { tagName: 'code', className: 'help-topic--title margin-bottom-m' })),
				n.component(new Html(typeof t.desc == 'function' ? t.desc() : t.desc, { className: 'help-topic--desc' })),
				n.component(examples ? new Html(examples, { className: 'margin-top-s' }) : null),
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
