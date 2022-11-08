import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'unwatch <span class="param">Character</span>';
const shortDesc = 'Stop watching for a character';
const helpText =
`<p>Stop watching for a character.</p>
<p><code class="param">Character</code> is the name of the character to stop watching for.</p>`;

/**
 * Unwatch adds the unwatch command.*/
class Unwatch {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'unwatch',
			next: [
				new ListStep('charId', this.module.cmdLists.getWatchedChars(), {
					name: "watched character",
					errRequired: step => ({ code: 'suspend.characterRequired', message: "Who do you want to stop watching for?" }),
				}),
			],
			value: (ctx, p) => this.unwatch(ctx.player, ctx.char, { charId: p.charId }),
		});

		this.module.help.addTopic({
			id: 'unwatch',
			category: 'friends',
			cmd: 'unwatch',
			usage: l10n.l('unwatch.usage', usageText),
			shortDesc: l10n.l('unwatch.shortDesc', shortDesc),
			desc: l10n.l('unwatch.helpText', helpText),
			sortOrder: 20,
		});
	}

	unwatch(player, char, params) {
		return this.module.api.call('note.player.' + player.id + '.watch.' + params.charId, 'delete').then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('suspend.charUnwatched', "Removed watch for {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default Unwatch;
