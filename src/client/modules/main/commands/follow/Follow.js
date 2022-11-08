import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'follow <span class="param">Character</span>';
const shortDesc = 'Follow a character wherever they go';
const helpText =
`<p>Follow another character wherever they go. The other character must be in the same room.</p>
<p><code class="param">Character</code> is the name of the character to follow.</p>
<p>Alias: <code>hopon</code></p>`;

/**
 * Follow adds the follow command.
 */
class Follow {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'follow',
			next: [
				new ListStep('charId', this.module.cmdLists.getInRoomCharsAwake(), {
					name: "character",
					errRequired: step => ({ code: 'follow.charRequired', message: "Who do you wish to follow?" }),
				}),
			],
			alias: [ 'hopon' ],
			value: (ctx, p) => this.follow(ctx.char, { charId: p.charId }),
		});

		this.module.help.addTopic({
			id: 'follow',
			category: 'transport',
			cmd: 'follow',
			alias: [ 'hopon' ],
			usage: l10n.l('follow.usage', usageText),
			shortDesc: l10n.l('follow.shortDesc', shortDesc),
			desc: l10n.l('follow.helpText', helpText),
			sortOrder: 130,
		});
	}

	follow(char, params) {
		return char.call('follow', params);
	}
}

export default Follow;
