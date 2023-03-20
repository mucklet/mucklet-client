import l10n from 'modapp-l10n';

const usageText = 'force summon <span class="param">Character</span>';
const shortDesc = 'Summon a character by force';
const helpText =
`<p>Summon a character to join you by force.</p>
<p><code class="param">Character</code> is the name of the character to summon.</p>
<p>Alias: <code>force msummon</code></p>`;

/**
 * ForceSummon adds the force summon command.
 */
class ForceSummon {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'help',
			'roleFeature',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.roleFeature.addFeature({
			id: 'forceSummon',
			anyRole: [ 'overseer', 'admin', 'moderator', 'builder' ],
			init: () => {
				this.module.cmd.addPrefixCmd('force', {
					key: 'summon',
					next: [
						this.module.cmdSteps.newAnyCharStep({
							errRequired: step => ({ code: 'join.charRequired', message: "Who do you wish to summon?" }),
						}),
					],
					alias: [ 'msummon' ],
					value: (ctx, p) => this.forceSummon(ctx.player, ctx.char, p),
				});

				this.module.help.addTopic({
					id: 'forceSummon',
					category: [ 'transport', 'moderate', 'builder' ],
					cmd: 'force summon',
					alias: [ 'force msummon' ],
					usage: l10n.l('forceSummon.usage', usageText),
					shortDesc: l10n.l('forceSummon.shortDesc', shortDesc),
					desc: l10n.l('forceSummon.helpText', helpText),
					sortOrder: 1000,
				});
			},
			dispose: () => {
				this.module.help.removeTopic('forceSummon');
			},
		});
	}

	forceSummon(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => char.call('forceSummon', { charId: c.id }));
	}

	dispose() {
		this.module.roleFeature.removeFeature('forceSummon');
	}
}

export default ForceSummon;
