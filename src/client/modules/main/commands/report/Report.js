import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'report <span class="param">Character</span> <span class="opt">= <span class="param">Message</span></span>';
const shortDesc = 'Report a character';
const helpText =
`<p>Open a dialog to report a character to the moderators. If the character is a puppet, the current puppeteer is reported.</p>
<p>For more info on creating reports, type: <code>help reporting</code></p>
<p><code class="param">Character</code> is the name of the character to report.</p>
<p><code class="param">Message</code> is the optional report message. It may be formatted and span multiple paragraphs.</p>`;
const examples = [
	{ cmd: 'report John Mischief = Excessive spamming.', desc: l10n.l('report.reportExampleDesc', "Opens a dialog to report John Mischief to the moderators") },
];

/**
 * Report adds the report command.
 */
class Report {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'help',
			'info',
			'dialogReport',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'report',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('report.characterRequired', "Who do you want to report?"),
					sortOrder: [ 'awake', 'room' ],
				}),
				new DelimStep("=", {
					errRequired: null,
					next: [
						new TextStep('msg', {
							spanLines: true,
							maxLength: () => this.module.info.getReport().reportMsgMaxLength,
							errTooLong: communicationTooLong,
							errRequired: step => new Err('report.messageRequired', "What do you want to report?"),
							completer: this.module.cmdLists.getCharsAwake(),
							formatText: true,
						}),
					],
				}),
			],
			value: (ctx, p) => this.report(ctx.player, ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'report',
			category: 'reporting',
			cmd: 'report',
			usage: l10n.l('report.usage', usageText),
			shortDesc: l10n.l('report.shortDesc', shortDesc),
			desc: l10n.l('report.helpText', helpText),
			examples,
			sortOrder: 10,
		});
	}

	report(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => {
			this.module.dialogReport.open(char.id, c.id, c.puppeteer?.id, {
				msg: params.msg || null,
			});
		});
	}
}

export default Report;
