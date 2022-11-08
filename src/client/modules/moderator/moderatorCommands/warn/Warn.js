import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'warn <span class="opt"><span class="param">Character</span></span> =<span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a warning message to a character';
const helpText =
`<p>Send a warning message to any awake character in the realm. The warning is shown as a red colored message.<br>
A warning is always considered an out of character (OOC) message.<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to warn. It defaults to the character last warned.</p>
<p><code class="param">Message</code> is the warning text. It may be formatted and span multiple paragraphs.</p>`;

/**
 * Warn adds the warn command.
 */
class Warn {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'helpModerate', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'warn',
			next: [
				new ListStep('charId', this.module.cmdLists.getCharsAwake(), {
					name: "character",
					errRequired: null,
				}),
				new DelimStep("=", {
					next: [
						new DelimStep(":", { next: new ValueStep('pose', true), errRequired: null }),
						new TextStep('msg', {
							spanLines: true,
							errRequired: step => ({ code: 'warn.messageRequired', message: "What warning message do you want to send?" }),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getCharsAwake(),
						}),
					],
				}),
			],
			value: (ctx, p) => this.warn(ctx.char, { charId: p.charId, msg: p.msg, pose: p.pose }),
		});

		this.module.helpModerate.addTopic({
			id: 'warn',
			cmd: 'warn',
			usage: l10n.l('warn.usage', usageText),
			shortDesc: l10n.l('warn.shortDesc', shortDesc),
			desc: l10n.l('warn.helpText', helpText),
			sortOrder: 10,
		});
	}

	warn(char, params) {
		// If we are missing target charId, we fetch the last one warned to.
		let charId = params.charId;
		if (!charId) {
			charId = this.lastCharId[char.id];
			if (!charId) {
				return Promise.reject({ code: 'warn.noCharacter', message: "Who do you want to warn?" });
			}
			params.charId = charId;
		} else {
			this.lastCharId[char.id] = charId;
		}
		return char.call('warn', params);
	}
}

export default Warn;
