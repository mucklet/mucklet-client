import { Elem, Html } from 'modapp-base-component';
import formatText from 'utils/formatText';

class DescribeEvent extends Elem {
	constructor(charId, ev) {
		super(n => n.elem('div', { className: 'charlog--highlight' }, [
			n.text('⌈'),
			n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
			n.text('⌋'),
		]));
	}

	get canHighlight() {
		return true;
	}
}

export default DescribeEvent;
