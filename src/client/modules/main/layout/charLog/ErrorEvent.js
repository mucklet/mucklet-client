import { Html } from 'modapp-base-component';
import formatText from 'utils/formatText';
import l10n from 'modapp-l10n';

class ErrorEvent extends Html {
	constructor(charId, ev) {
		super(formatText(typeof ev.msg == 'string' ? ev.msg : l10n.t(ev.msg)), { tagName: 'div', className: 'charlog--error common--formattext' });
	}
}

export default ErrorEvent;
