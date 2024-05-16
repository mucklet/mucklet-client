import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'stop mute char <span class="param">Character</span>';
const shortDesc = 'Stop muting a character';
const helpText =
`<p>Stop muting a character previously muted with <code>mute char</code>. It affects all controlled characters.</p>
<p><code class="param">Character</code> is the name of the character to stop muting.</p>
<p>Alias: <code>unignore</code>, <code>unmute char</code>`;

/**
 * StopMuteChar adds the stop mute char command.
 */
class StopMuteChar {
	constructor(app) {
		this.app = app;
		this.app.require([ 'cmd', 'stopMute', 'help', 'charLog', 'mute', 'cmdSteps' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		let opts = {
			next: this.module.cmdSteps.newAnyCharStep({
				errRequired: step => new Err('stopMuteChar.characterRequired', "Who do you want to stop muting?"),
				sortOrder: [ 'awake' ],
			}),
			value: (ctx, p) => this.stopMuteChar(ctx.player, ctx.char, p),
		};

		this.module.stopMute.addType(Object.assign({ key: 'char' }, opts));
		this.module.cmd.addCmd(Object.assign({ key: 'unignore' }, opts));

		this.module.help.addTopic({
			id: 'stopMuteChar',
			category: 'mute',
			cmd: 'stop mute char',
			alias: [ 'unignore', 'unmute char' ],
			usage: l10n.l('stopMuteChar.usage', usageText),
			shortDesc: l10n.l('stopMuteChar.shortDesc', shortDesc),
			desc: l10n.l('stopMuteChar.helpText', helpText),
			sortOrder: 40,
		});
	}

	stopMuteChar(player, char, params) {
		return player.call('getChar', params.charId ? { charId: params.charId } : { charName: params.charName })
			.then(c => this.module.mute.toggleMuteChar(c.id, false).then(changed => {
				if (changed[c.id]) {
					this.module.charLog.logInfo(char, l10n.l('stopMuteChar.stopMuteChar', "Deactivated muting of {name}.", { name: c.name }));
				} else {
					this.module.charLog.logError(char, new Err('stopMuteChar.notMutingChar', "Not currently muting {name}.", { name: c.name }));
				}
			}));
	}
}

export default StopMuteChar;
