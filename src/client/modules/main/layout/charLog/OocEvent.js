import { Elem, Txt, Html } from 'modapp-base-component';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';

class OocEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		super(n => n.elem('div', { className: 'charlog--highlight' }, [
			n.component(new Txt(c && c.name, { className: 'charlog--char' })),
			n.elem('span', { className: 'charlog--tag' }, [ n.text(" ooc") ]),
			n.elem('span', { className: 'charlog--ooc' }, [
				n.text(ev.pose ? poseSpacing(ev.msg) : ' says, "'),
				n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
				n.text(ev.pose ? '' : '"'),
			]),
		]));
	}

	get canHighlight() {
		return true;
	}
}

export default OocEvent;
