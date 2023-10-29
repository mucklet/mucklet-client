import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'whereis <span class="param">Character</span>';
const shortDesc = "Show a character's location";
const helpText =
`<p>Show where a character is currently located.</p>
<p><code class="param">Character</code> is the name of the character.</p>
<p>Alias: <code>where</code></p>`;

/**
 * Whereis adds the whereis command.
 */
class Whereis {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'helpAdmin',
			'charLog',
			'player',
			'api',
		],
		this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'whereis',
			next: this.module.cmdSteps.newAnyCharStep({
				errRequired: step => new Err('whereisCmd.characterRequired', "Who do you want to locate?"),
				sortOrder: [ 'awake', 'watch' ],
			}),
			alias: [ 'where' ],
			value: (ctx, p) => this.whereis(ctx.player, ctx.char, p),
		});


		this.module.helpAdmin.addTopic({
			id: 'whereis',
			cmd: 'whereis',
			usage: l10n.l('whereis.usage', usageText),
			shortDesc: l10n.l('whereis.shortDesc', shortDesc),
			desc: l10n.l('whereis.helpText', helpText),
			sortOrder: 35,
		});
	}

	toConsole(charName) {
		let item = this.module.cmdLists.getAllChars().getItem(charName);
		return (item && item.value
			? Promise.resolve({ id: item.value })
			: this.module.player.getPlayer().call('getChar', { charName: charName })
		).then(c => this.module.api.get('core.char.' + c.id + '.owned')).then(c => {
			let charName = (c.name + ' ' + c.surname).trim();
			let r = c.inRoom;
			console.log(l10n.t('whereis.charInRoom', "{charName} is located in {roomName} (#{roomId})", { charName: charName, roomName: r.name.replace(/([^.])\.$/, "$1"), roomId: r.id }));
		});
	}

	whereis(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => this.module.api.get('core.char.' + c.id + '.owned')).then(c => {
			let charName = (c.name + ' ' + c.surname).trim();
			let r = c.inRoom;
			this.module.charLog.logInfo(char, l10n.l('whereis.charInRoom', "{charName} is located in {roomName} (#{roomId})", { charName: charName, roomName: r.name.replace(/([^.])\.$/, "$1"), roomId: r.id }));
		});
	}
}

export default Whereis;
