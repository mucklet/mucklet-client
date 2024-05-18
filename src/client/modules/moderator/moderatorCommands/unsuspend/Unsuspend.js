import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'unsuspend <span class="param">Character</span>';
const shortDesc = 'Unsuspend a currently suspended character';
const helpText =
`<p>Unsuspend a currently suspended character.</p>
<p>The command also reduces the penalty period which increments the duration a character is suspended.</p>
<p><code class="param">Character</code> is the full name of the character to unsuspend.</p>`;

/**
 * Unsuspend adds the unsuspend command.
 */
class Unsuspend {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdSteps', 'charLog', 'helpModerate' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'unsuspend',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('suspend.characterRequired', "Who do you want to unsuspend?"),
				}),
			],
			value: (ctx, p) => this.unsuspend(ctx.char, p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			),
		});

		this.module.helpModerate.addTopic({
			id: 'unsuspend',
			cmd: 'unsuspend',
			usage: l10n.l('unsuspend.usage', usageText),
			shortDesc: l10n.l('unsuspend.shortDesc', shortDesc),
			desc: l10n.l('unsuspend.helpText', helpText),
			sortOrder: 30,
		});
	}

	unsuspend(char, params) {
		return char.call('unsuspend', params).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('suspend.charUnsuspended', "Successfully unsuspended {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default Unsuspend;
