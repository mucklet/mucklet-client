import l10n from 'modapp-l10n';

const usageText = 'stop mute travel';
const shortDesc = 'Stop muting travel messages';
const helpText =
`<p>Stop muting travel messages previously muted with <code>mute travel</code>. It only affects the currently controlled character.</p>
<p>Alias: <code>unmute travel</code>`;

/**
 * StopMuteTravel adds the stop mute travel command.*/
class StopMuteTravel {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._exec = this._exec.bind(this);

		this.app.require([ 'stopMute', 'help', 'charLog', 'mute' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.stopMute.addType({
			key: 'travel',
			value: (ctx, p) => this.stopMuteTravel(ctx.char),
		});

		this.module.help.addTopic({
			id: 'stopMuteTravel',
			category: 'mute',
			cmd: 'stop mute travel',
			alias: [ 'unmute travel' ],
			usage: l10n.l('stopMuteTravel.usage', usageText),
			shortDesc: l10n.l('stopMuteTravel.shortDesc', shortDesc),
			desc: l10n.l('stopMuteTravel.helpText', helpText),
			sortOrder: 20,
		});
	}

	_exec(ctx, p) {
		let f = p.object;
		if (typeof f != 'function') {
			throw new Error("Object value is not a function");
		}
		return f(ctx, p);
	}

	stopMuteTravel(char) {
		return this.module.mute.toggleMuteTravel(char.id, false)
			.then(change => {
				if (change) {
					this.module.charLog.logInfo(char, l10n.l('stopMuteTravel.stopMuteTravel', "Deactivated muting of travel messages."));
				} else {
					this.module.charLog.logError(char, { code: 'stopMuteTravel.notMutingTravel', message: "Travel messages are not being muted." });
				}
			});
	}
}

export default StopMuteTravel;
