import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'set main <span class="opt">=</span> <span class="param">Character</span>';
const shortDesc = 'Set main character';
const helpText =
`<p>Set an owned character as main character, used to represent the player when relating to other moderators.</p>`;


/**
 * SetMain adds command to set the current player's attributes.
 */
class SetMain {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('set', {
			key: 'main',
			next: [
				new DelimStep("=", { errRequired: null }),
				new ListStep('charId', module.cmdLists.getOwnedChars(), {
					name: "main character",
					errRequired: null,
				}),
			],
			value: (ctx, p) => this.setMain(ctx, p),
		});

		this.module.help.addTopic({
			id: 'setMain',
			category: 'moderate',
			cmd: 'set main',
			usage: l10n.l('setMain.usage', usageText),
			shortDesc: l10n.l('setMain.shortDesc', shortDesc),
			desc: l10n.l('setMain.helpText', helpText),
			sortOrder: 200,
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
}

export default SetMain;
