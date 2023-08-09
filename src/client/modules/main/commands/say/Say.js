import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'say <span class="param">Message</span>';
const shortDesc = 'Say something to others in the room';
const helpText =
`<p>Say something to all characters in the room.</p>
<p><code class="param">Message</code> is the spoken message. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>"</code> (quotation mark)</p>
<p>When using the <code>"</code> alias, the message may optionally end with a closing quote.</p>`;

/**
 * Say adds the say command.
 */
class Say {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'say',
			next: new TextStep('msg', {
				spanLines: true,
				errRequired: step => ({ code: 'say.messageRequired', message: "What do you want to say?" }),
				maxLength: () => this.module.info.getCore().communicationMaxLength,
				errTooLong: communicationTooLong,
				completer: this.module.cmdLists.getInRoomChars(),
				formatText: true,
			}),
			symbol: '"',
			value: this.say.bind(this),
		});

		this.module.help.addTopic({
			id: 'say',
			category: 'communicate',
			cmd: 'say',
			alias: [ '"' ],
			usage: l10n.l('say.usage', usageText),
			shortDesc: l10n.l('say.shortDesc', shortDesc),
			desc: l10n.l('say.helpText', helpText),
			sortOrder: 10,
		});
	}

	say(ctx, p) {
		return ctx.char.call('say', { msg: p.cmdText == '"' ? p.msg.replace(/"$/, '') : p.msg });
	}
}

export default Say;
