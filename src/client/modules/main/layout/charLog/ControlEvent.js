import { Elem, Txt } from 'modapp-base-component';
import formatDateTime from 'utils/formatDateTime';
import fullname from 'utils/fullname';

class ControlEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.hchar;
		super(n => n.elem('div', { className: 'ev-control--border' }, [
			n.component(new Txt(fullname(c) + " – " + formatDateTime(new Date(ev.time)))),
		]));
	}
}

export default ControlEvent;
