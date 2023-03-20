import l10n from 'modapp-l10n';

const usageText = 'summon <span class="param">Character</span>';
const shortDesc = 'Summon a character to join you';
const helpText =
`<p>Summon a character to join you.</p>
<p><code class="param">Character</code> is the name of the character to summon.</p>
<p>Alias: <code>msummon</code></p>`;

/**
 * Summon adds the summon command.
 */
class Summon {
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
			key: 'summon',
			next: [
				this.module.cmdSteps.newAwakeCharStep({
					errRequired: step => ({ code: 'summon.charRequired', message: "Who do you wish to summon?" }),
				}),
			],
			alias: [ 'msummon' ],
			value: (ctx, p) => this.summon(ctx.char, { charId: p.charId }),
		});

		this.module.help.addTopic({
			id: 'summon',
			category: 'transport',
			cmd: 'summon',
			alias: [ 'msummon' ],
			usage: l10n.l('summon.usage', usageText),
			shortDesc: l10n.l('summon.shortDesc', shortDesc),
			desc: l10n.l('summon.helpText', helpText),
			sortOrder: 100,
		});
	}

	summon(char, params) {
		return char.call('summon', params);
	}
}

export default Summon;
