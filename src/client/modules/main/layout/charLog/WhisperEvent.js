import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';
import fullname from 'utils/fullname';
import * as charEvent from 'utils/charEvent';

class WhisperEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = charEvent.extractTarget(charId, ev);
		let more = ev.targets?.length - (ev.target ? 0 : 1);
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(ev.ooc
						? more
							? l10n.l('charLog.whisperOocTo', "Whisper ooc to {fullname} +{more} more", { fullname: fullname(t), more })
							: l10n.l('charLog.whisperOocTo', "Whisper ooc to {fullname}", { fullname: fullname(t) })
						: more
							? l10n.l('charLog.whisperTo', "Whisper to {fullname} +{more} more", { fullname: fullname(t), more })
							: l10n.l('charLog.whisperTo', "Whisper to {fullname}", { fullname: fullname(t) }),
					)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.elem('span', { className: ev.ooc ? 'charlog--ooc' : 'charlog--comm' }, [
					n.text(ev.pose ? poseSpacing(ev.msg) : ' whispers, "'),
					n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
					n.text(ev.pose ? '' : '"'),
				]),
			]),
		]));
	}

	get canHighlight() {
		return true;
	}

	getTooltipText(ev) {
		return charEvent.targetTooltipText(ev);
	}
}

export default WhisperEvent;
