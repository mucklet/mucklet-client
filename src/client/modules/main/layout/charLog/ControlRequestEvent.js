import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import fullname from 'utils/fullname';

const txtControlRequest = l10n.l('charLog.controlRequest', "Control request");
const txtRequestToTakeControl = l10n.l('charlog.requestToTakeControl', " request to take over control of ");
const txtHowtoGrantControl = l10n.l('charLog.howtoGrantControl', ". To grant the request, type:");
const txtHowtoDenyControl = l10n.l('charLog.howtoDenyControl', "To deny the request, type:");

class ControlRequestEvent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(txtControlRequest)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.component(new Txt(txtRequestToTakeControl)),
				n.component(new Txt(t && t.name, { className: 'charlog--char' })),
				n.component(opt.noCode ? '.' : new Txt(txtHowtoGrantControl)),
				n.component(opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Html('grant control <span class="opt">' + escapeHtml(fullname(c)) + '</span>', { tagName: 'code' })),
						]),
					])),
				),
				n.component(opt.noCode ? null : new Txt(txtHowtoDenyControl)),
				n.component(opt.noCode
					? null
					: new Elem(n => n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Html('deny control <span class="opt">' + escapeHtml(fullname(c)) + '</span> <span class="opt">= <span class="param">Reason</span></span>', { tagName: 'code' })),
						]),
					])),
				),
				n.component(ev.msg
					? new Txt('"' + ev.msg + '"')
					: null,
				),
			]),
		]));
	}
}

export default ControlRequestEvent;
