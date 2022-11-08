import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtSummon = l10n.l('charLog.summon', "Summon");
const txtHowToJoin = l10n.l('charLog.howToJoin', ". To accept the summons, type:");

class SummonEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		let self = c && c.id == charId;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtSummon)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.text(' tries to summon '),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(new Txt(self || opt.noCode ? '.' : txtHowToJoin)),
				n.component(self || opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt("join " + (c.name + " " + c.surname).trim(), { tagName: 'code' })),
						]),
					])),
				),
			]),
		]));
	}
}

export default SummonEvent;
