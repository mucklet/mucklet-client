import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';
import * as charEvent from 'utils/charEvent';

class HelpmeEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(t
						? t.id == charId
							? l10n.l('charLog.fromHelper', "From helper {fullname}", { fullname: fullname(c) })
							: l10n.l('charLog.helping', "Helping {fullname}", { fullname: fullname(t) })
						: c.id == charId
							? l10n.l('charLog.toHelpers', "To helpers")
							: l10n.l('charLog.fromHelper', "Help {fullname}", { fullname: fullname(c) }),
					)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.elem('span', [
					n.text(ev.pose ? poseSpacing(ev.msg) : ' writes, "'),
					n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
					n.text(ev.pose ? '' : '"'),
				]),
			]),
		]));
	}

	get canHighlight() {
		// While it technically can be highlighted as it is communication, we
		// don't want to do that, to avoid confusing newcomers.
		return false;
	}

	getTooltipText(ev) {
		return charEvent.targetTooltipText(ev);
	}
}

export default HelpmeEvent;
