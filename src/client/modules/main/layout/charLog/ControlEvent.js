import { Elem, Txt } from 'modapp-base-component';
import formatDateTime from 'utils/formatDateTime';

class ControlEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.hchar;
		super(n => n.elem('div', { className: 'ev-control--border' }, [
			n.component(new Txt(c && (c.name + " " + c.surname).trim() + " – " + formatDateTime(new Date(ev.time))))
		]));
	}
}

export default ControlEvent;
