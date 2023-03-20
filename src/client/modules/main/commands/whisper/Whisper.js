import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'whisper <span class="opt"><span class="param">Character</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Whisper something to a character in the room';
const helpText =
`<p>Whisper something to a character in the room.<br>
If the message starts with <code>&gt;</code> (greater than), the whisper will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the whisper will be treated in the same way as a <code>pose</code> action rather than something being said.</p>
<p><code class="param">Character</code> is the name of the character to whisper to. It defaults to the character last whispered to.</p>
<p><code class="param">Message</code> is the whispered message. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>w</code>, <code>wh</code></p>`;

/**
 * Whisper adds the whisper command.
 */
class Whisper {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'help',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'whisper',
			next: [
				this.module.cmdSteps.newInRoomAwakeCharStep({
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
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							errRequired: step => ({ code: 'whisper.messageRequired', message: "What do you want to whisper?" }),
							completer: this.module.cmdLists.getInRoomChars(),
						}),
					],
				}),
			],
			alias: [ 'w', 'wh' ],
			value: (ctx, p) => this.whisper(ctx.char, { charId: p.charId, msg: p.msg, pose: p.pose, ooc: p.ooc }),
		});

		this.module.help.addTopic({
			id: 'whisper',
			category: 'communicate',
			cmd: 'whisper',
			alias: [ 'w', 'wh' ],
			usage: l10n.l('whisper.usage', usageText),
			shortDesc: l10n.l('whisper.shortDesc', shortDesc),
			desc: l10n.l('whisper.helpText', helpText),
			sortOrder: 30,
		});
	}

	whisper(char, params) {
		// If we are missing target charId, we fetch the last one whispered to.
		let charId = params.charId;
		if (!charId) {
			charId = this.lastCharId[char.id];
			if (!charId) {
				return Promise.reject({ code: 'whisper.noCharacter', message: "Who do you want to whisper to?" });
			}
			params.charId = charId;
		} else {
			this.lastCharId[char.id] = charId;
		}
		return char.call('whisper', params);
	}
}

export default Whisper;
