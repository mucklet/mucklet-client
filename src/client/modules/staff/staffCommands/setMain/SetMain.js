import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';

const usageText = 'set main <span class="opt">=</span> <span class="param">Character</span>';
const shortDesc = 'Set main character';
const helpText =
`<p>Set an owned character as main character, used to represent the player when relating to other staff.</p>`;


/**
 * SetMain adds command to set the current player's attributes.
 */
class SetMain {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'charLog',
			'help',
			'player',
			'roleFeature',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.roleFeature.addFeature({
			id: 'setMain',
			anyRole: [ 'overseer', 'admin', 'moderator', 'helper' ],
			init: () => {
				this.module.cmd.addPrefixCmd('set', {
					key: 'main',
					next: [
						new DelimStep("=", { errRequired: null }),
						this.module.cmdSteps.newOwnedCharStep({
							errRequired: null,
						}),
					],
					value: (ctx, p) => this.setMain(ctx, p),
				});

				this.module.help.addTopic({
					id: 'setMain',
					category: { 'moderate': 200, 'helper': 200 },
					cmd: 'set main',
					usage: l10n.l('setMain.usage', usageText),
					shortDesc: l10n.l('setMain.shortDesc', shortDesc),
					desc: l10n.l('setMain.helpText', helpText),
					sortOrder: 200,
				});
			},
			dispose: () => {
				this.module.help.removeTopic('setMain');
			},
		});
	}

	setMain(ctx, p) {
		let mainChar = p.charId || "";
		return ctx.player.call('setPreference', { mainChar })
			.then(() => {
				this.module.charLog.logInfo(ctx.char, mainChar
					? l10n.l('setMain.mainCharacterSet', "Main character set.")
					: l10n.l('setMain.mainCharacterCleared', "Main character cleared."),
				);
			});
	}

	dispose() {
		this.module.roleFeature.removeFeature('setMain');
	}
}

export default SetMain;
