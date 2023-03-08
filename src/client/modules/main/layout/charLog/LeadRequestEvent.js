import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import fullname from 'utils/fullname';

const txtLeadRequest = l10n.l('charLog.leadRequest', "Lead request");
const txtHowToFollow = l10n.l('charLog.howToFollow', ". To follow, type:");

class LeadRequestEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		let self = c && c.id == charId;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtLeadRequest)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.text(' wants to lead '),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(new Txt(self || opt.noCode ? '.' : txtHowToFollow)),
				n.component(self || opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt("follow " + fullname(c), { tagName: 'code' })),
						]),
					])),
				),
			]),
		]));
	}
}

export default LeadRequestEvent;
