import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'mute char <span class="param">Character</span>';
const shortDesc = 'Mute a character';
const helpText =
`<p>Mute all types of messages from a character. It affects all controlled characters.</p>
<p><code class="param">Character</code> is the name of the character to mute.</p>
<p>Use <code>stop mute char <span class="param">Character</span></code> to stop muting the character.</p>
<p>Alias: <code>ignore</code>`;

/**
 * MuteChar adds the mute char command.*/
class MuteChar {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'muteCmd', 'charLog', 'mute', 'help', 'cmdSteps' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		let opts = {
			next: this.module.cmdSteps.newAnyCharStep({
				errRequired: step => new Err('muteChar.characterRequired', "Who do you want to mute?"),
			}),
			value: (ctx, p) => this.muteChar(ctx.player, ctx.char, p),
		};

		this.module.muteCmd.addType(Object.assign({ key: 'char' }, opts));
		this.module.cmd.addCmd(Object.assign({ key: 'ignore' }, opts));

		this.module.help.addTopic({
			id: 'muteChar',
			category: 'mute',
			cmd: 'mute char',
			alias: [ 'ignore' ],
			usage: l10n.l('muteChar.usage', usageText),
			shortDesc: l10n.l('muteChar.shortDesc', shortDesc),
			desc: l10n.l('muteChar.helpText', helpText),
			sortOrder: 30,
		});
	}

	muteChar(player, char, params) {
		return player.call('getChar', params.charId ? { charId: params.charId } : { charName: params.charName })
			.then(c => this.module.mute.toggleMuteChar(c.id, true).then(change => {
				if (change) {
					this.module.charLog.logInfo(char, l10n.l('muteChar.muteCharStart', "Activated muting of {name}.", { name: c.name }));
				} else {
					this.module.charLog.logError(char, new Err('muteChar.alreadyMutingTravel', "Already muting {name}.", { name: c.name }));
				}
			}));
	}
}

export default MuteChar;
