import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'message <span class="opt"><span class="param">Character</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a message to any awake character';
const helpText =
`<p>Send a message to any awake character in the realm.<br>
If the message starts with <code>&gt;</code> (greater than), the message will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to message. It defaults to the character last messaged.</p>
<p><code class="param">Message</code> is the messaged text. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>m</code>, <code>msg</code>, <code>p</code>, <code>page</code></p>`;

/**
 * Message adds the message command.
 */
class Message {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'message',
			next: [
				new ListStep('charId', this.module.cmdLists.getCharsAwake(), {
					name: "character",
					errRequired: null,
				}),
				new DelimStep("=", {
					next: [
						new MultiDelimStep({
							">": { next: new ValueStep('ooc', true), errRequired: null },
							":": { next: new ValueStep('pose', true), errRequired: null },
						}),
						new TextStep('msg', {
							spanLines: true,
							errRequired: step => ({ code: 'message.messageRequired', message: "What do you want to message?" }),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getCharsAwake(),
						}),
					],
				}),
			],
			alias: [ 'm', 'msg', 'p', 'page' ],
			value: (ctx, p) => this.message(ctx.char, { charId: p.charId, msg: p.msg, pose: p.pose, ooc: p.ooc }),
		});

		this.module.help.addTopic({
			id: 'message',
			category: 'communicate',
			cmd: 'message',
			alias: [ 'm', 'msg', 'p', 'page' ],
			usage: l10n.l('message.usage', usageText),
			shortDesc: l10n.l('message.shortDesc', shortDesc),
			desc: l10n.l('message.helpText', helpText),
			sortOrder: 40,
		});
	}

	message(char, params) {
		// If we are missing target charId, we fetch the last one messaged to.
		let charId = params.charId;
		if (!charId) {
			charId = this.lastCharId[char.id];
			if (!charId) {
				return Promise.reject({ code: 'message.noCharacter', message: "Who do you want to message?" });
			}
			params.charId = charId;
		} else {
			this.lastCharId[char.id] = charId;
		}
		return char.call('message', params);
	}
}

export default Message;
