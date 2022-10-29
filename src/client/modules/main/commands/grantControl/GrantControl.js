import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'grant control <span class="param">Character</span>';
const shortDesc = 'Grant control of a puppet';
const helpText =
`<p>Grant control of a puppet to a character who has requested to take over control.</p>
<p><code class="param">Character</code> is the name of the character to grant control to.</p>`;

/**
 * GrantControl adds the grant control command.
 */
class GrantControl {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'player', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('grant', {
			key: 'control',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: null
				}),
			],
			value: (ctx, p) => this.grantControl(ctx.char, { charId: p.charId })
		});

		this.module.help.addTopic({
			id: 'grantControl',
			category: 'puppets',
			cmd: 'grant control',
			usage: l10n.l('grantControl.usage', usageText),
			shortDesc: l10n.l('grantControl.shortDesc', shortDesc),
			desc: l10n.l('grantControl.helpText', helpText),
			sortOrder: 100,
		});
	}

	grantControl(char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: params.charName
				? this.module.player.getPlayer().call('getChar', { charName: params.charName })
				: Promise.resolve({})
		)
			.then(c => char.call('controlRequestAccept', { charId: c.id }))
			.then(() => {
				this.module.charLog.logInfo(char, l10n.l('grantControl.controlRequestAccepted', "Control request was accepted."));
			});
	}
}

export default GrantControl;
