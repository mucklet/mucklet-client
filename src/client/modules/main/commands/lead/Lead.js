import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'lead <span class="param">Character</span>';
const shortDesc = 'Have a character follow you wherever you go';
const helpText =
`<p>Lead another character wherever you go. The other character must be in the same room.</p>
<p><code class="param">Character</code> is the name of the character to lead.</p>
<p>Alias: <code>carry</code></p>`;

/**
 * Lead adds the lead command.
 */
class Lead {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'lead',
			next: [
				this.module.cmdSteps.newInRoomAwakeCharStep({
					errRequired: step => new Err('lead.charRequired', "Who do you wish to lead?"),
					filterMuted: true,
					sortOrder: [ 'watch' ],
				}),
			],
			alias: [ 'carry' ],
			value: (ctx, p) => this.lead(ctx.char, { charId: p.charId }),
		});

		this.module.help.addTopic({
			id: 'lead',
			category: 'transport',
			cmd: 'lead',
			alias: [ 'carry' ],
			usage: l10n.l('lead.usage', usageText),
			shortDesc: l10n.l('lead.shortDesc', shortDesc),
			desc: l10n.l('lead.helpText', helpText),
			sortOrder: 120,
		});
	}

	lead(char, params) {
		return char.call('lead', params);
	}
}

export default Lead;
