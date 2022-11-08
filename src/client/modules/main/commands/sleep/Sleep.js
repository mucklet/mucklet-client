import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'sleep <span class="opt"><span class="param">Message</span></span>';
const shortDesc = 'Put your character to sleep';
const helpText =
`<p>Put your character to sleep.</p>
<p><code class="param">Message</code> is an optional sleep message shown to the characters in the room. If omitted, a default message will be used.</p>`;

/**
 * Sleep holds available commands.
 */
class Sleep {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'sleep',
			next: new TextStep('msg', {
				name: "sleep message",
				maxLength: () => this.module.info.getCore().communicationMaxLength,
				errTooLong: communicationTooLong,
				errRequired: null,
				completer: this.module.cmdLists.getInRoomChars(),
			}),
			alias: [ 'quit' ],
			value: this.sleep.bind(this),
		});

		this.module.help.addTopic({
			id: 'sleep',
			category: 'basic',
			cmd: 'sleep',
			usage: l10n.l('sleep.usage', usageText),
			shortDesc: l10n.l('sleep.shortDesc', shortDesc),
			desc: l10n.l('sleep.helpText', helpText),
			sortOrder: 70,
		});
	}

	sleep(ctx, p) {
		return ctx.char.call('release', { msg: p.msg });
	}
}

export default Sleep;
