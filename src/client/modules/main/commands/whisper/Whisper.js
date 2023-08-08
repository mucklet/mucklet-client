import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import RepeatStep from 'classes/RepeatStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'whisper <span class="opt"><span class="param">Character</span> <span class="opt">, <span class="param">Character</span></span><span class="comment">...</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Whisper something to characters in the room';
const helpText =
`<p>Whisper something to one or more characters in the room.<br>
If the message starts with <code>&gt;</code> (greater than), the whisper will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the whisper will be treated in the same way as a <code>pose</code> action rather than something being said.</p>
<p><code class="param">Character</code> is the name of the character to whisper to. If omitted, it defaults to the character(s) last whispered to.</p>
<p><code class="param">Message</code> is the whispered message. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>w</code>, <code>wh</code></p>`;
const examples = [
	{ cmd: 'whisper Jane Doe = Hi there.', desc: l10n.l('whisper.whisperSingleDesc', "Whispers to Jane Doe") },
	{ cmd: 'whisper John => Phonecall. BRB.', desc: l10n.l('whisper.whispeOocDesc', "Whispers out of character to John") },
	{ cmd: 'wh John, Jane =>: has to go AFK.', desc: l10n.l('whisper.whisperOocPoseMultipleDesc', "Whispers an out of character pose to John and Jane") },
	{ cmd: 'w =: nods discreetly.', desc: l10n.l('whisper.whisperPoseLastDesc', "Whispers a pose to last character(s) whispered to") },
];

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
		this.lastCharIds = {};

		this.module.cmd.addCmd({
			key: 'whisper',
			next: [
				new RepeatStep(
					'chars',
					(next, idx) => this.module.cmdSteps.newInRoomAwakeCharStep({
						id: 'charId-' + idx,
						errRequired: null,
						next,
					}),
					{
						delimiter: ",",
					},
				),

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
							formatText: true,
						}),
					],
				}),
			],
			alias: [ 'w', 'wh' ],
			value: (ctx, p) => {
				let charIds = [];
				let i = 0;
				while (p['charId-' + i]) {
					charIds.push(p['charId-' + i]);
					i++;
				}
				return this.whisper(ctx.char, { charIds, msg: p.msg, pose: p.pose, ooc: p.ooc });
			},
		});

		this.module.help.addTopic({
			id: 'whisper',
			category: 'communicate',
			cmd: 'whisper',
			alias: [ 'w', 'wh' ],
			usage: l10n.l('whisper.usage', usageText),
			shortDesc: l10n.l('whisper.shortDesc', shortDesc),
			desc: l10n.l('whisper.helpText', helpText),
			examples,
			sortOrder: 30,
		});
	}

	whisper(char, params) {
		// If we are missing target charIds, we fetch the last ones targeted.
		let charIds = params.charIds || [];
		if (!charIds.length) {
			charIds = this.lastCharIds[char.id];
			if (!charIds) {
				return Promise.reject({ code: 'whisper.noCharacter', message: "Who do you want to whisper to?" });
			}
			params.charIds = charIds;
		} else {
			this.lastCharIds[char.id] = charIds;
		}
		return char.call('whisper', params);
	}
}

export default Whisper;
