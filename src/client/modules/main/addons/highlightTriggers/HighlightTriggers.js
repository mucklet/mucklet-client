import { filterTriggers } from 'utils/formatText';


const msgEvents = {
	say: ev => ev.msg,
	ooc: ev => ev.msg,
	pose: ev => ev.msg,
	describe: ev => ev.msg,
	message: ev => ev.msg,
	whisper: ev => ev.msg,
	mail: ev => ev.msg,
};

/**
 * HighlightTriggers handles muting of events.
 */
class HighlightTriggers {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'charLog',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addEventModifier({
			id: 'highlightTriggers',
			sortOrder: 10,
			callback: this._applyModifications.bind(this)
		});
	}

	_applyModifications(ev, ctrl, mod) {
		let settings = ctrl.puppeteer
			? this.module.player.getPuppet(ctrl.id, ctrl.puppeteer.id).settings
			: this.module.player.getOwnedChar(ctrl.id).settings;


		let f = msgEvents[ev.type];
		if (f) {
			let msg = f(ev);
			if (typeof msg == 'string') {
				let triggers = settings && settings.triggers
					? settings.triggers.toArray()
					: [];

				let filteredTriggers = filterTriggers(msg, triggers);
				if (filteredTriggers) {
					mod.triggers = filteredTriggers;
					mod.mentioned = true;
				}
			}
		}

		if (ev.target && ev.target.id == ctrl.id) {
			mod.targeted = true;
		}
	}

	dispose() {
		this.module.charLog.removeEventModifier('highlightTriggers');
	}
}

export default HighlightTriggers;
