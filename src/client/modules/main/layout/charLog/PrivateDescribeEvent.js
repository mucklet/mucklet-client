import { Elem, Html } from 'modapp-base-component';
import formatText from 'utils/formatText';
import * as charEvent from 'utils/charEvent';

class PrivateDescribeEvent extends Elem {
	constructor(charId, ev) {
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--card' }, [
				n.component(new Html(formatText(ev.msg, { ...ev.mod, mode: 'description' }), { tagName: 'span', className: 'common--formattext' })),
			]),
		]));
	}

	get canHighlight() {
		return true;
	}

	getTooltipText(ev) {
		return charEvent.targetTooltipText(ev);
	}
}

export default PrivateDescribeEvent;
