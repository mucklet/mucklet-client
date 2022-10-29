import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';

class DndEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(l10n.l('charLog.notSentTo', "Not sent to {name}", { name: c && c.name }))),
				]),
				n.component(new Html(formatText(ev.msg), { tagName: 'span', className: 'common--formattext' })),
			])
		]));
	}
}

export default DndEvent;
