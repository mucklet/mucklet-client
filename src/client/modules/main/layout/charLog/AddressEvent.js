import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';

class AddressEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', { className: 'charlog--highlight' }, [
			n.component(new Txt(c && c.name, { className: 'charlog--char' })),
			n.elem('span', { className: 'charlog--tag' }, [ n.text(ev.ooc
				? l10n.t('charLog.oocTo', "ooc to {fullname}", { fullname: fullname(t) })
				: l10n.t('charLog.to', " to {fullname}", { fullname: fullname(t) }),
			) ]),
			n.elem('span', { className: ev.ooc ? 'charlog--ooc' : 'charlog--comm' }, [
				n.text(ev.pose ? poseSpacing(ev.msg) : ' says, "'),
				n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
				n.text(ev.pose ? '' : '"'),
			]),
		]));
	}

	get isCommunication() {
		return true;
	}
}

export default AddressEvent;
