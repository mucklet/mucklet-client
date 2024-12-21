import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import Err from 'classes/Err';
import * as translateErr from 'utils/translateErr';

const usageText = 'go <span class="param">Keyword</span>';
const shortDesc = 'Go to another room';
const helpText =
`<p>Go to another room through an exit.</p>
<p><code class="param">Keyword</code> is the keyword of the exit to use.</p>`;

/**
 * Go adds the go command.
 */
class Go {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'go',
			next: new ListStep('exitId', this.module.cmdLists.getInRoomExits(), {
				name: "exit",
				textId: 'exitKey',
				errRequired: () => new Err('go.exitRequired', "Where do you want to go?"),
			}),
			value: this.go.bind(this),
		});

		this.module.help.addTopic({
			id: 'go',
			category: 'transport',
			cmd: 'go',
			usage: l10n.l('go.usage', usageText),
			shortDesc: l10n.l('go.shortDesc', shortDesc),
			desc: l10n.l('go.helpText', helpText),
			sortOrder: 10,
		});
	}

	go(ctx, p) {
		return ctx.char.call('useExit', p.exitId
			? { exitId: p.exitId }
			: { exitKey: p.exitKey },
		).catch(err => {
			throw translateErr.exitNotFound(err, p.exitKey);
		});
	}
}

export default Go;
