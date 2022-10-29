import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'request area <span class="param">#AreaID<span class="comment">/</span>Area</span> : parent = <span class="param">Parent #AreaID</span>';
const shortDesc = "Request to set the parent area to an area owned by someone else's character";
const helpText =
`<p>Request to set the parent area to an area owned by someone else's character.</p>
<code class="param">#AreaID</code> is the ID of the owned area.</p>
<code class="param">Area</code> is the name of an owned area.</p>
<p><code class="param">Parent #AreaID</code> is the ID of the area to set as parent.</p>`;

/**
 * RequestAreaParent adds command to request to changed area parent to an area
 * owned by another player.
 */
class RequestAreaParent {
	constructor(app) {
		this.app = app;

		this.app.require([ 'requestArea', 'cmdLists', 'charLog', 'help', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.requestArea.getAreaAttr().addItem({
			key: 'parent',
			next: [
				new DelimStep("=", { errRequired: null }),
				new IDStep('parentId', {
					name: "parent area ID",
					list: () => {
						let c = module.player.getActiveChar();
						return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
					}
				})
			],
			value: (ctx, p) => this.requestAreaParent(ctx.char, Object.assign({ areaId: p.areaId, parentId: p.parentId }))
		});

		this.module.help.addTopic({
			id: 'requestAreaParent',
			category: 'request',
			cmd: 'request area parent',
			usage: l10n.l('requestAreaParent.usage', usageText),
			shortDesc: l10n.l('requestAreaParent.shortDesc', shortDesc),
			desc: l10n.l('requestAreaParent.helpText', helpText),
			sortOrder: 210,
		});
	}

	requestAreaParent(char, params) {
		return char.call('requestSetArea', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('requestAreaParent.areaParentRequested', "Requested to set parent area."));
		});
	}
}

export default RequestAreaParent;
