import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import errToL10n from 'utils/errToL10n';

class ErrorEvent extends Txt {
	constructor(charId, ev) {
		super(l10n.l(errToL10n(ev.error)), { className: 'charlog--error' });
	}
}

export default ErrorEvent;
