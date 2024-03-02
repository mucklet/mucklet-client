import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'stop mute message';
const shortDesc = 'Stop muting messages from other characters';
const helpText =
`<p>Stop muting messages previously muted with <code>mute message</code>. It only affects the currently controlled character.</p>
<p>Alias: <code>unmute message</code>`;

/**
 * StopMuteMessage adds the stop mute message command.
 */
class StopMuteMessage {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._exec = this._exec.bind(this);

		this.app.require([ 'stopMute', 'help', 'charLog', 'mute' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.stopMute.addType({
			key: 'message',
			value: (ctx, p) => this.stopMuteMessage(ctx.char),
		});

		this.module.help.addTopic({
			id: 'stopMuteMessage',
			category: 'mute',
			cmd: 'stop mute message',
			alias: [ 'unmute message' ],
			usage: l10n.l('stopMuteMessage.usage', usageText),
			shortDesc: l10n.l('stopMuteMessage.shortDesc', shortDesc),
			desc: l10n.l('stopMuteMessage.helpText', helpText),
			sortOrder: 60,
		});
	}

	_exec(ctx, p) {
		let f = p.object;
		if (typeof f != 'function') {
			throw new Error("Object value is not a function");
		}
		return f(ctx, p);
	}

	stopMuteMessage(char) {
		return this.module.mute.toggleMuteMessage(char.id, false)
			.then(change => {
				if (change) {
					this.module.charLog.logInfo(char, l10n.l('stopMuteMessage.stopMuteMessage', "Deactivated muting of messages."));
				} else {
					this.module.charLog.logError(char, new Err('stopMuteMessage.notMutingMessage', "Messages are not being muted."));
				}
			});
	}
}

export default StopMuteMessage;
