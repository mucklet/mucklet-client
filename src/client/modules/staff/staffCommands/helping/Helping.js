import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'helping <span class="param">Character</span> =<span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a help message to an awake characters';
const helpText =
`<p>Send a help message to an awake character in the realm. All other helpers on the helper channel will also get the message.<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to help. If omitted, it defaults to the character(s) last messaged.</p>
<p><code class="param">Message</code> is the help text. It may be formatted and span multiple paragraphs.</p>`;
const examples = [
	{ cmd: 'helping Jane Doe = Type `home` to teleport home', desc: l10n.l('helping.helpingSingleDesc', "Helping Jane Doe") },
];

/**
 * Helping adds the helping command.
 */
class Helping {
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

		let charListOpt = {
			sortOrder: [ 'room' ],
		};

		this.module.cmd.addCmd({
			key: 'helping',
			next: [
				this.module.cmdSteps.newAwakeCharStep({
					errRequired: step => new Err('helping.charRequired', "Who do you wish to help?"),
					...charListOpt,
				}),
				new DelimStep("=", {
					next: [
						new MultiDelimStep({
							":": { next: new ValueStep('pose', true), errRequired: null },
						}),
						new TextStep('msg', {
							spanLines: true,
							errRequired: step => new Err('helping.messageRequired', "What help message do you want to send?"),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getCharsAwake(charListOpt),
							formatText: true,
						}),
					],
				}),
			],
			value: (ctx, p) => this.helping(ctx.char, { charId: p.charId, msg: p.msg, pose: p.pose }),
		});

		this.module.help.addTopic({
			id: 'helping',
			category: 'helper',
			cmd: 'helping',
			usage: l10n.l('helping.usage', usageText),
			shortDesc: l10n.l('helping.shortDesc', shortDesc),
			desc: l10n.l('helping.helpText', helpText),
			examples,
			sortOrder: 100,
		});
	}

	helping(char, params) {
		return char.call('helping', params);
	}
}

export default Helping;
