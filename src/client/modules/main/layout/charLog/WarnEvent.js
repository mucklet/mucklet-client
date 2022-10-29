import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';

class WarnEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(c && c.id === charId
						? l10n.l('charLog.messageTo', "Message to {name}", { name: t && t.name })
						: l10n.l('charLog.message', "Message")
					)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--default' })),
				n.text(ev.pose ? poseSpacing(ev.msg) : ' warns, "'),
				n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
				n.text(ev.pose ? '' : '"')
			])
		]));
	}

	get isCommunication() {
		return true;
	}
}

export default WarnEvent;
