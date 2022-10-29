import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'look <span class="param">Character</span>';
const shortDesc = 'Look at a character in the room';
const helpText =
`<p>Look at a character in the room.</p>
<p><code class="param">Character</code> is the name of the character to look at.</p>
<p>Alias: <code>l</code>, <code>lookat</code></p>`;

/**
 * Look adds the look command.
 */
class Look {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'charPages' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'look',
			next: new ListStep('charId', this.module.cmdLists.getInRoomChars(), {
				name: "character",
				errRequired: () => ({ code: 'look.required', message: 'Who do you want to look at?' })
			}),
			alias: [ 'l', 'lookat' ],
			value: this.look.bind(this)
		});

		this.module.help.addTopic({
			id: 'look',
			category: 'basic',
			cmd: 'look',
			alias: [ 'l', 'lookat' ],
			usage: l10n.l('look.usage', usageText),
			shortDesc: l10n.l('look.shortDesc', shortDesc),
			desc: l10n.l('look.helpText', helpText),
			sortOrder: 20,
		});
	}

	look(ctx, p) {
		return ctx.char.call('look', { charId: p.charId }).then(() => {
			this.module.charPages.openPanel();
		});
	}
}

export default Look;
