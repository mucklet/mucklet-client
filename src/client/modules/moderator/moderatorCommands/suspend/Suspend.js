import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'suspend <span class="param">Character</span> = <span class="param">Reason</span>';
const shortDesc = 'Suspend a character';
const helpText =
`<p>Suspend a character by putting it to sleep and disabling the option of waking them up again for a period of time.</p>
<p>The duration is automatically set for an hour, a day, or a week, depending on previous suspensions. The penalty period that increases suspend duration is reset after a maximum of 2 weeks. </p>
<p><code class="param">Character</code> is the full name of the character to suspend.</p>
<p><code class="param">Reason</code> is the reason why the character was suspended, as shown to that player.</p>
<p>Example: <code>suspend John Doe = Being abusive by calling another player an idiot.</code></p>`;

/**
 * Suspend adds the suspend command.
 */
class Suspend {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'helpModerate', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'suspend',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: step => ({ code: 'suspend.characterRequired', message: "Who do you want to suspend?" })
				}),
				new DelimStep("=", {
					next: [
						new TextStep('reason', {
							spanLines: false,
							errRequired: step => ({ code: 'suspend.reasonRequired', message: "What is the reason to suspend the character?" }),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getCharsAwake()
						}),
					]
				})
			],
			value: (ctx, p) => this.suspend(ctx.char, p.charId
				? { charId: p.charId, reason: p.reason }
				: { charName: p.charName, reason: p.reason }
			)
		});

		this.module.helpModerate.addTopic({
			id: 'suspend',
			cmd: 'suspend',
			usage: l10n.l('suspend.usage', usageText),
			shortDesc: l10n.l('suspend.shortDesc', shortDesc),
			desc: l10n.l('suspend.helpText', helpText),
			sortOrder: 20,
		});
	}

	suspend(char, params) {
		return char.call('suspend', params).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('suspend.charSuspended', "Successfully suspended {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default Suspend;
