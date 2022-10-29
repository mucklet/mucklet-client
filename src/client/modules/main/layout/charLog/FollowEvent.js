import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtFollow = l10n.l('charLog.follow', "Follow");
const txtStartsToFollow = l10n.l('charlog.startsToFollow', " starts to follow ");
const txtHowToStopFollow = l10n.l('charLog.howToStopFollow', ". To stop following, type:");
const txtHowToStopLead = l10n.l('charLog.howToStopLead', ". To stop leading, type:");

class FollowEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		let self = c && c.id == charId;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtFollow)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.component(new Txt(txtStartsToFollow)),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(new Txt(opt.noCode
					? "."
					: self
						? txtHowToStopFollow
						: txtHowToStopLead
				)),
				n.component(opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt(
								self || opt.noCode
									? "stop follow"
									: "stop lead " + (c.name + " " + c.surname).trim()
								, { tagName: 'code' }))
						])
					]))
				)
			])
		]));
	}
}

export default FollowEvent;
