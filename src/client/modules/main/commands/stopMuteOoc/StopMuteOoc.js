import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'stop mute ooc';
const shortDesc = 'Stop muting out of character messages';
const helpText =
`<p>Stop muting out of character messages previously muted with <code>mute ooc</code>. It only affects the currently controlled character.</p>
<p>Alias: <code>unmute ooc</code>`;

/**
 * StopMuteOoc adds the stop mute ooc command.
 */
class StopMuteOoc {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._exec = this._exec.bind(this);

		this.app.require([ 'stopMute', 'help', 'charLog', 'mute' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.stopMute.addType({
			key: 'ooc',
			value: (ctx, p) => this.stopMuteOoc(ctx.char),
		});

		this.module.help.addTopic({
			id: 'stopMuteOoc',
			category: 'mute',
			cmd: 'stop mute ooc',
			alias: [ 'unmute ooc' ],
			usage: l10n.l('stopMuteOoc.usage', usageText),
			shortDesc: l10n.l('stopMuteOoc.shortDesc', shortDesc),
			desc: l10n.l('stopMuteOoc.helpText', helpText),
			sortOrder: 80,
		});
	}

	_exec(ctx, p) {
		let f = p.object;
		if (typeof f != 'function') {
			throw new Error("Object value is not a function");
		}
		return f(ctx, p);
	}

	stopMuteOoc(char) {
		return this.module.mute.toggleMuteOoc(char.id, false)
			.then(change => {
				if (change) {
					this.module.charLog.logInfo(char, l10n.l('stopMuteOoc.stopMuteOoc', "Deactivated muting of OOC messages."));
				} else {
					this.module.charLog.logError(char, new Err('stopMuteOoc.notMutingOoc', "OOC messages are not being muted."));
				}
			});
	}
}

export default StopMuteOoc;
