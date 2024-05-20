import l10n from 'modapp-l10n';

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

	stopMuteMessage(char) {
		return this.module.mute.toggleMuteMessage(char, false, true)
			.then(() => this.module.charLog.logInfo(char, l10n.l('stopMuteMessage.stopMuteMessage', "Deactivated muting of messages.")));
	}
}

export default StopMuteMessage;
