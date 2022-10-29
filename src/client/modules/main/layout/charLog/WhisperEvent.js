import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';
import poseSpacing from 'utils/poseSpacing';

const txtWhisper = l10n.l('charLog.whisper', "Whisper");
const txtWhisperOoc = l10n.l('charLog.whisperOoc', "Whisper ooc");

class WhisperEvent extends Elem {
	constructor(charId, ev) {
		let c = ev.char;
		let t = ev.target;
		super(n => n.elem('div', [
			n.elem('div', { className: 'charlog--fieldset' }, [
				n.elem('div', { className: 'charlog--fieldset-label' }, [
					n.component(new Txt(c && c.id === charId
						? ev.ooc
							? l10n.l('charLog.whisperOocTo', "Whisper ooc to {name}", { name: t && t.name })
							: l10n.l('charLog.whisperTo', "Whisper to {name}", { name: t && t.name })
						: ev.ooc
							? txtWhisperOoc
							: txtWhisper
					)),
				]),
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.elem('span', { className: ev.ooc ? 'charlog--ooc' : 'charlog--comm' }, [
					n.text(ev.pose ? poseSpacing(ev.msg) : ' whispers, "'),
					n.component(new Html(formatText(ev.msg, ev.mod), { tagName: 'span', className: 'common--formattext' })),
					n.text(ev.pose ? '' : '"')
				])
			])
		]));
	}

	get isCommunication() {
		return true;
	}
}

export default WhisperEvent;
