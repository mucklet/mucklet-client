import { Html } from 'modapp-base-component';
import formatText, { modeDescription } from 'utils/formatText';
import l10n from 'modapp-l10n';

class InfoEvent extends Html {
	constructor(charId, ev) {
		super(
			formatText(typeof ev.msg == 'string' ? ev.msg : l10n.t(ev.msg), { mode: modeDescription }),
			{ tagName: 'div', className: 'charlog--info common--formattext' },
		);
	}
}

export default InfoEvent;
