import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import fullname from 'utils/fullname';
import * as charEvent from 'utils/charEvent';

class PrivateDescribeEvent extends Elem {
	constructor(charId, ev) {
		let t = charEvent.extractTarget(charId, ev);
		let more = ev.targets?.length - (ev.target ? 0 : 1);
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(more
						? l10n.l('charLog.toNameAndMore', "To {fullname} +{more} more", { fullname: fullname(t), more })
						: l10n.l('charLog.toName', "To {fullname}", { fullname: fullname(t) }),
					)),
				]),
				n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
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
