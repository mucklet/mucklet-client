import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

class ErrorEvent extends Txt {
	constructor(charId, ev) {
		super(l10n.l(ev.error.code, ev.error.message, ev.error.data), { className: 'charlog--error' });
	}
}

export default ErrorEvent;
