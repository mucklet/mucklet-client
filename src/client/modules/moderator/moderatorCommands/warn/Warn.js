import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import RepeatStep from 'classes/RepeatStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'warn <span class="opt"><span class="param">Character</span> <span class="opt">, <span class="param">Character</span></span></span> =<span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a warning message to characters';
const helpText =
`<p>Send a warning message to one or more awake characters in the realm. The warning is shown as a red colored message.<br>
A warning is always considered an out of character (OOC) message.<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to warn. If omitted, it defaults to the characters last warned.</p>
<p><code class="param">Message</code> is the warning text. It may be formatted and span multiple paragraphs.</p>`;
const examples = [
	{ cmd: 'warn Jane Doe = No inflammatory topics.', desc: l10n.l('warn.warnSingleDesc', "Warns Jane Doe") },
	{ cmd: 'warn John, Jane =: points to the `area rules`.', desc: l10n.l('warn.warnPoseMultipleDesc', "Warns John and Jane with a pose") },
];

/**
 * Warn adds the warn command.
 */
class Warn {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'helpModerate',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharIds = {};

		this.module.cmd.addCmd({
			key: 'warn',
			next: [
				new RepeatStep(
					'chars',
					(next, idx) => this.module.cmdSteps.newAwakeCharStep({
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
			value: (ctx, p) => {
				let charIds = [];
				let i = 0;
				while (p['charId-' + i]) {
					charIds.push(p['charId-' + i]);
					i++;
				}
				return this.warn(ctx.char, { charIds, msg: p.msg, pose: p.pose });
			},
		});

		this.module.helpModerate.addTopic({
			id: 'warn',
			cmd: 'warn',
			usage: l10n.l('warn.usage', usageText),
			shortDesc: l10n.l('warn.shortDesc', shortDesc),
			desc: l10n.l('warn.helpText', helpText),
			examples,
			sortOrder: 10,
		});
	}

	warn(char, params) {
		// If we are missing target charIds, we fetch the last ones targeted.
		let charIds = params.charIds || [];
		if (!charIds.length) {
			charIds = this.lastCharIds[char.id];
			if (!charIds) {
				return Promise.reject({ code: 'warn.noCharacter', message: "Who do you want to warn?" });
			}
			params.charIds = charIds;
		} else {
			this.lastCharIds[char.id] = charIds;
		}
		return char.call('warn', params);
	}
}

export default Warn;
