import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtFollowRequest = l10n.l('charLog.followRequest', "Follow request");
const txtHowToLead = l10n.l('charLog.howToLead', ". To take the lead, type:");

class FollowRequestEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		let self = c && c.id == charId;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtFollowRequest)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.text(' wants to follow '),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(new Txt(self || opt.noCode ? '.' : txtHowToLead)),
				n.component(self || opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt("lead " + (c.name + " " + c.surname).trim(), { tagName: 'code' })),
						]),
					])),
				),
			]),
		]));
	}
}

export default FollowRequestEvent;
