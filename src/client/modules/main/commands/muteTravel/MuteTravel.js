import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'mute travel';
const shortDesc = 'Mute travel messages';
const helpText =
`<p>Mute arrive, leave, and awake status messages of other characters. It only affects the currently controlled character.</p>
<p>Use <code>stop mute travel</code> to stop muting travel messages.</p>`;

/**
 * MuteTravel adds the mute travel command.*/
class MuteTravel {
	constructor(app) {
		this.app = app;

		this.app.require([ 'muteCmd', 'charLog', 'mute', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.muteCmd.addType({
			key: 'travel',
			value: (ctx, p) => this.muteTravel(ctx.char),
		});

		this.module.help.addTopic({
			id: 'muteTravel',
			category: 'mute',
			cmd: 'mute travel',
			usage: l10n.l('muteTravel.usage', usageText),
			shortDesc: l10n.l('muteTravel.shortDesc', shortDesc),
			desc: l10n.l('muteTravel.helpText', helpText),
			sortOrder: 10,
		});
	}

	muteTravel(char) {
		return this.module.mute.toggleMuteTravel(char.id, true)
			.then(change => {
				if (change) {
					this.module.charLog.logInfo(char, l10n.l('muteTravel.muteTravelStart', "Activated muting of travel messages."));
				} else {
					this.module.charLog.logError(char, new Err('muteTravel.alreadyMutingTravel', "Travel messages are already getting muted."));
				}
			});
	}
}

export default MuteTravel;
