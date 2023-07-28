import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';
import extractEventTarget from 'utils/extractEventTarget';
import targetTooltipText from 'utils/targetTooltipText';

class MessageEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = extractEventTarget(charId, ev);
		let more = ev.targets?.length - (ev.target ? 0 : 1);
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(ev.ooc
						? more
							? l10n.l('charLog.messageOocTo', "Message ooc to {fullname} +{more} more", { fullname: fullname(t), more })
							: l10n.l('charLog.messageOocTo', "Message ooc to {fullname}", { fullname: fullname(t) })
						: more
							? l10n.l('charLog.messageTo', "Message to {fullname} +{more} more", { fullname: fullname(t), more })
							: l10n.l('charLog.messageTo', "Message to {fullname}", { fullname: fullname(t) }),
					)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.elem('span', { className: ev.ooc ? 'charlog--ooc' : 'charlog--comm' }, [
					n.text(ev.pose ? poseSpacing(ev.msg) : ' writes, "'),
					n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
					n.text(ev.pose ? '' : '"'),
				]),
			]),
		]));
	}

	get isCommunication() {
		return true;
	}

	getTooltipText(ev) {
		return targetTooltipText(ev);
	}
}

export default MessageEvent;
