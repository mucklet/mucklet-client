import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';

class MessageEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(c && c.id === charId
						? ev.ooc
							? l10n.l('charLog.messageOocTo', "Message ooc to {fullname}", { fullname: fullname(t) })
							: l10n.l('charLog.messageTo', "Message to {fullname}", { fullname: fullname(t) })
						: ev.ooc
							? l10n.l('charLog.messageOocFrom', "Message ooc from {fullname}", { fullname: fullname(c) })
							: l10n.l('charLog.messageFrom', "Message from {fullname}", { fullname: fullname(c) }),
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
}

export default MessageEvent;
