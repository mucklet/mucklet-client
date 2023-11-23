import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'helpme <span class="param">Message</span>';
const shortDesc = 'Send a message to helpers';
const helpText =
`<p>Send a message to the helpers. Helpers are friendly people willing to help you out around here.</p>
<p><code class="param">Message</code> is the message being sent to the helpers.</p`;
const examples = [
	{ cmd: 'helpme Hi! I am new here.' },
	{ cmd: 'helpme How can I find people to roleplay with?' },
	{ cmd: 'helpme Can I create my own area?' },
	{ cmd: 'helpme I got lost! How do I get back?' },
];

/**
 * Helpme adds the helpme command.
 */
class Helpme {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'helpme',
			next: new TextStep('msg', {
				spanLines: true,
				errRequired: step => new Err('helpme.messageRequired', "What do you want to helpme?"),
				maxLength: () => this.module.info.getCore().communicationMaxLength,
				errTooLong: communicationTooLong,
				completer: this.module.cmdLists.getInRoomChars({
					filterMuted: true,
					sortOrder: [ 'awake', 'watch' ],
				}),
				formatText: true,
			}),
			value: this.helpme.bind(this),
		});

		this.module.help.addTopic({
			id: 'helpme',
			category: { 'basic': 15, 'helper': 110 },
			cmd: 'helpme',
			usage: l10n.l('helpme.usage', usageText),
			shortDesc: l10n.l('helpme.shortDesc', shortDesc),
			desc: l10n.l('helpme.helpText', helpText),
			examples,
			sortOrder: 15,
		});
	}

	helpme(ctx, p) {
		return ctx.char.call('helpme', { msg: p.cmdText == '"' ? p.msg.replace(/"$/, '') : p.msg });
	}
}

export default Helpme;
