import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'join <span class="param">Character</span>';
const shortDesc = 'Join a character by force';
const helpText =
`<p>Join a character by force without any summon. The character must be awake.</p>
<p><code class="param">Character</code> is the name of the character to join.</p>
<p>Alias: <code>force mjoin</code></p>`;

/**
 * ForceJoin adds the force join command.
 */
class ForceJoin {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'help',
			'roleFeature',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.roleFeature.addFeature({
			id: 'forceJoin',
			anyRole: [ 'overseer', 'admin', 'moderator', 'builder' ],
			init: () => {
				this.module.cmd.addPrefixCmd('force', {
					key: 'join',
					next: [
						new ListStep('charId', this.module.cmdLists.getCharsAwake(), {
							name: "character",
							errRequired: step => ({ code: 'join.charRequired', message: "Who do you wish to join?" }),
						}),
					],
					alias: [ 'mjoin' ],
					value: (ctx, p) => this.forceJoin(ctx.char, { charId: p.charId }),
				});

				this.module.help.addTopic({
					id: 'forceJoin',
					category: 'transport',
					cmd: 'force join',
					alias: [ 'force mjoin' ],
					usage: l10n.l('forceJoin.usage', usageText),
					shortDesc: l10n.l('forceJoin.shortDesc', shortDesc),
					desc: l10n.l('forceJoin.helpText', helpText),
					sortOrder: 1010,
				});
			},
			dispose: () => {
				this.module.help.removeTopic('forceJoin');
			},
		});
	}

	forceJoin(char, params) {
		return char.call('forceJoin', params);
	}
}

export default ForceJoin;
