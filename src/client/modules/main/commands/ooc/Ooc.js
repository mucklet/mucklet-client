import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'ooc <span class="param">Message</span>';
const shortDesc = 'Say something out of character';
const helpText =
`<p>Say something <em>Out of Character</em> to everyone in the room. OOC messages are sent from players to players and should be ignored by the characters.</p>
<p>If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being said.</p>
<p><code class="param">Message</code> is the out of character message. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>></code> (greater than)`;

/**
 * Ooc holds available commands.
 */
class Ooc {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'ooc',
			next: [
				new DelimStep(":", { next: new ValueStep('pose', true), errRequired: null }),
				new TextStep('msg', {
					spanLines: true,
					token: 'ooc',
					errRequired: step => new Err('ooc.messageRequired', "What do you want to say?"),
					maxLength: () => this.module.info.getCore().communicationMaxLength,
					errTooLong: communicationTooLong,
					completer: this.module.cmdLists.getInRoomChars(true),
					formatText: true,
				}),
			],
			symbol: '>',
			value: (ctx, p) => this.ooc(ctx.char, { msg: p.msg, pose: p.pose }),
		});

		this.module.help.addTopic({
			id: 'ooc',
			category: 'communicate',
			cmd: 'ooc',
			alias: [ '>' ],
			usage: l10n.l('ooc.usage', usageText),
			shortDesc: l10n.l('ooc.shortDesc', shortDesc),
			desc: l10n.l('ooc.helpText', helpText),
			sortOrder: 70,
		});
	}

	ooc(char, params) {
		return char.call('ooc', params);
	}
}

export default Ooc;
