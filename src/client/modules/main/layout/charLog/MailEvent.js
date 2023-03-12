import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';

class MailEvent extends Elem {
	constructor(charId, ev) {
		super(n => {
			let c = ev.char;
			let t = ev.target;
			let children = [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(c && c.id === charId
						? ev.ooc
							? l10n.l('charLog.mailOocTo', "Mail sent ooc to {fullname}", { fullname: fullname(t) })
							: l10n.l('charLog.mailTo', "Mail sent to {fullname}", { fullname: fullname(t) })
						: ev.ooc
							? l10n.l('charLog.mailOocFrom', "Mail received ooc from {fullname}", { fullname: fullname(c) })
							: l10n.l('charLog.mailFrom', "Mail received from {fullname}", { fullname: fullname(c) }),
					)),
				]),
			];
			if (ev.pose) {
				children.push(n.component(new Txt(c && c.name, { className: 'charlog--char' })));
				let sp = poseSpacing(ev.msg);
				if (sp) {
					children.push(n.text(sp));
				}
			}
			children.push(n.component(new Html(formatText(ev.msg), { tagName: 'span', className: 'common--formattext' })));
			return n.elem('div', [
				n.elem('div', { className: 'charlog--fieldset ' + (ev.ooc ? 'charlog--ooc' : 'charlog--comm') }, children),
			]);
		});
	}

	get isCommunication() {
		return true;
	}
}

export default MailEvent;
