import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'join <span class="param">Character</span>';
const shortDesc = 'Join a character who has summoned you';
const helpText =
`<p>Join a character who has summoned you.</p>
<p><code class="param">Character</code> is the name of the character who sent the summons.</p>
<p>Alias: <code>mjoin</code></p>`;

/**
 * Join adds the join command.
 */
class Join {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'join',
			next: [
				new ListStep('charId', this.module.cmdLists.getCharsAwake(), {
					name: "character",
					errRequired: step => ({ code: 'join.charRequired', message: "Who do you wish to join?" }),
				}),
			],
			alias: [ 'mjoin' ],
			value: (ctx, p) => this.join(ctx.char, { charId: p.charId }),
		});

		this.module.help.addTopic({
			id: 'join',
			category: 'transport',
			cmd: 'join',
			alias: [ 'mjoin' ],
			usage: l10n.l('join.usage', usageText),
			shortDesc: l10n.l('join.shortDesc', shortDesc),
			desc: l10n.l('join.helpText', helpText),
			sortOrder: 110,
		});
	}

	join(char, params) {
		return char.call('join', params);
	}
}

export default Join;
