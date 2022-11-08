import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'report <span class="param">Character</span> <span class="opt">= <span class="param">Message</span></span>';
const shortDesc = 'Report a character';
const helpText =
`<p>Report a character to the moderators. If the character is a puppet, the current puppeteer is reported.</p></p>
<p><code class="param">Character</code> is the name of the character to report.</p>
<p><code class="param">Message</code> is the optional report message. It may be formatted and span multiple paragraphs.</p>`;

/**
 * Report adds the report command.
 */
class Report {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'api', 'charLog', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'report',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: step => ({ code: 'report.characterRequired', message: "Who do you want to report?" }),
				}),
				new DelimStep("=", {
					errRequired: null,
					next: [
						new TextStep('msg', {
							spanLines: true,
							maxLength: () => this.module.info.getReport().reportMsgMaxLength,
							errTooLong: communicationTooLong,
							errRequired: step => ({ code: 'report.messageRequired', message: "What do you want to report?" }),
							completer: this.module.cmdLists.getCharsAwake(),
						}),
					],
				}),
			],
			value: (ctx, p) => this.report(ctx.player, ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'report',
			category: 'regulate',
			cmd: 'report',
			usage: l10n.l('report.usage', usageText),
			shortDesc: l10n.l('report.shortDesc', shortDesc),
			desc: l10n.l('report.helpText', helpText),
			sortOrder: 10,
		});
	}

	report(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => this.module.api.call('report.reports', 'create', {
			charId: char.id,
			targetId: c.id,
			currentPuppeteer: true,
			msg: params.msg || null,
		})).then(() => {
			this.module.charLog.logInfo(char, l10n.l('report.reportSentB', "The report was sent to the moderators."));
		});
	}
}

export default Report;
