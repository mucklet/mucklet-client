import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'watch <span class="param">Character</span>';
const shortDesc = 'Add a watch for a character';
const helpText =
`<p>Add a watch for a character to know when they are awake.</p>
<p><code class="param">Character</code> is the name of the character to watch for.</p>
<p>Alias: <code>watchfor</code>, <code>wf</code></p>`;

/**
 * Watch adds the watch command.
 */
class Watch {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdSteps', 'charLog', 'help', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'watch',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('watch.characterRequired', "Who do you want to watch for?"),
				}),
			],
			alias: [ 'watchfor', 'wf' ],
			value: (ctx, p) => this.watch(ctx.player, ctx.char, p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			),
		});

		this.module.help.addTopic({
			id: 'watch',
			category: 'friends',
			cmd: 'watch',
			alias: [ 'watchfor', 'wf' ],
			usage: l10n.l('watch.usage', usageText),
			shortDesc: l10n.l('watch.shortDesc', shortDesc),
			desc: l10n.l('watch.helpText', helpText),
			sortOrder: 10,
		});
	}

	watch(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => this.module.api.call('note.player.' + player.id + '.watch.' + c.id, 'addWatcher', {
			charId: char.id,
		})).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('watch.addedWatchFor', "Added a watch for {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default Watch;
