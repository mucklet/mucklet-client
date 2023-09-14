import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import Err from 'classes/Err';

const usageText = 'request area <span class="param">#AreaID<span class="comment">/</span>Area</span> : owner = <span class="param">Character</span>';
const shortDesc = "Request to give area ownership to someone else's character";
const helpText =
`<p>Request to change area ownership to another player's character.</p>
<code class="param">#AreaID</code> is the ID of the owned area.</p>
<code class="param">Area</code> is the name of an owned area.</p>
<p><code class="param">Character</code> is the name of the character to transfer area ownership to.</p>`;

/**
 * RequestAreaOwner adds command to request to changed area owner to a character
 * owned by another player.
 */
class RequestAreaOwner {
	constructor(app) {
		this.app = app;

		this.app.require([ 'requestArea', 'cmdSteps', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.requestArea.getAreaAttr().addItem({
			key: 'owner',
			next: [
				new DelimStep("=", { errRequired: null }),
				this.module.cmdSteps.newAnyCharStep({
					name: "new owner",
					errRequired: step => new Err('requestAreaOwner.characterRequired', "Who do you want to transfer ownership to?"),
				}),
			],
			value: (ctx, p) => this.requestAreaOwner(ctx.char, Object.assign({ areaId: p.areaId }, p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			)),
		});

		this.module.help.addTopic({
			id: 'requestAreaOwner',
			category: 'request',
			cmd: 'request area owner',
			usage: l10n.l('requestAreaOwner.usage', usageText),
			shortDesc: l10n.l('requestAreaOwner.shortDesc', shortDesc),
			desc: l10n.l('requestAreaOwner.helpText', helpText),
			sortOrder: 200,
		});
	}

	requestAreaOwner(char, params) {
		return char.call('requestSetAreaOwner', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('requestAreaOwner.areaOwnerRequested', "Requested to set {newOwner} as the new area owner.", { newOwner: (result.newOwner.name + ' ' + result.newOwner.surname).trim() }));
		});
	}
}

export default RequestAreaOwner;
