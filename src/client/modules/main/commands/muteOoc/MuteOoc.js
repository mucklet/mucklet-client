import l10n from 'modapp-l10n';

const usageText = 'mute ooc';
const shortDesc = 'Mute out of character messages';
const helpText =
	`<p>Mute out of character messages of other characters. It only affects the currently controlled character.</p>
<p>Use <code>stop mute ooc</code> to stop muting OOC messages.</p>`;

/**
 * MuteOoc adds the mute ooc command.
 */
class MuteOoc {
	constructor(app) {
		this.app = app;

		this.app.require([ 'muteCmd', 'charLog', 'mute', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.muteCmd.addType({
			key: 'ooc',
			value: (ctx, p) => this.muteOoc(ctx.char),
		});

		this.module.help.addTopic({
			id: 'muteOoc',
			category: 'mute',
			cmd: 'mute ooc',
			usage: l10n.l('muteOoc.usage', usageText),
			shortDesc: l10n.l('muteOoc.shortDesc', shortDesc),
			desc: l10n.l('muteOoc.helpText', helpText),
			sortOrder: 70,
		});
	}

	muteOoc(char) {
		return this.module.mute.toggleMuteOoc(char, true, true)
			.then(() => this.module.charLog.logInfo(char, l10n.l('muteOoc.muteOocStart', "Activated muting of OOC messages.")));
	}
}

export default MuteOoc;
