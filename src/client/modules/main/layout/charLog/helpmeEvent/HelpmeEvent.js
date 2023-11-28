import l10n from 'modapp-l10n';
import HelpmeEventComponent from './HelpmeEventComponent';
import './helpmeEvent.scss';

/**
 * HelpmeEvent adds charlog event component for helpme events.
 */
class HelpmeEvent {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'charFocus',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.charLog.addEventComponentFactory('helpme', (charId, ev) => new HelpmeEventComponent(charId, ev));
		this.module.charLog.addEventHandler('helpme', (charId, ev) => (
			(ev.target && this.module.charFocus.notifyOnTargetEvent(charId, ev, l10n.l('helpmeEvent.charHelps', "{char.name} helps {target.name}"))) ||
			this.module.charFocus.notifyOnEvent(charId, ev, l10n.l('helpmeEvent.charNeedsHelp', "{char.name} needs help"))
		));
	}

	dispose() {
		this.module.charLog.removeEventComponentFactory('helpme');
		this.module.charLog.removeEventHandler('helpme');
	}
}

export default HelpmeEvent;
