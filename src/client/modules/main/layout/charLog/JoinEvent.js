import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtJoin = l10n.l('charLog.join', "Join");
const txtHowToSummon = l10n.l('charLog.howToSummon', ". To summon, type:");

class JoinEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		let self = c && c.id == charId;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtJoin)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.text(' wants to join '),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(new Txt(self || opt.noCode ? '.' : txtHowToSummon)),
				n.component(self || opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt("summon " + (c.name + " " + c.surname).trim(), { tagName: 'code' })),
						]),
					])),
				),
			]),
		]));
	}
}

export default JoinEvent;
