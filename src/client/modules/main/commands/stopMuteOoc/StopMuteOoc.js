import l10n from 'modapp-l10n';

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

	stopMuteOoc(char) {
		return this.module.mute.toggleMuteOoc(char, false, true)
			.then(() => this.module.charLog.logInfo(char, l10n.l('stopMuteOoc.stopMuteOoc', "Deactivated muting of OOC messages.")));
	}
}

export default StopMuteOoc;
