import l10n from 'modapp-l10n';

const usageText = 'mute message';
const shortDesc = 'Mute messages from other characters';
const helpText =
	`<p>Mute messages from other characters. Whispers, poses and say are not affected. It only affects the currently controlled character.</p>
<p>Use <code>stop mute message</code> to stop muting messages.</p>`;

/**
 * MuteMessage adds the mute message command.
 */
class MuteMessage {
	constructor(app) {
		this.app = app;

		this.app.require([ 'muteCmd', 'charLog', 'mute', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.muteCmd.addType({
			key: 'message',
			value: (ctx, p) => this.muteMessage(ctx.char),
		});

		this.module.help.addTopic({
			id: 'muteMessage',
			category: 'mute',
			cmd: 'mute message',
			usage: l10n.l('muteMessage.usage', usageText),
			shortDesc: l10n.l('muteMessage.shortDesc', shortDesc),
			desc: l10n.l('muteMessage.helpText', helpText),
			sortOrder: 50,
		});
	}

	muteMessage(char) {
		return this.module.mute.toggleMuteMessage(char, true, true)
			.then(() => this.module.charLog.logInfo(char, l10n.l('muteMessage.muteMessageStart', "Activated muting of messages.")));
	}
}

export default MuteMessage;
