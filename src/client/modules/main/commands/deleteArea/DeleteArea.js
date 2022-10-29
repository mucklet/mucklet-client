import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import ListStep from 'classes/ListStep';

const usageText = 'delete area <span class="param">#AreaID<span class="comment">/</span>Area</span>';
const shortDesc = 'Delete an area';
const helpText =
`<p>Delete an unused area without rooms or child areas.</p>
<code class="param">#AreaID</code> is the ID of the area to delete.</p>
<code class="param">Area</code> is the name of an owned area to delete.</p>`;

/**
 * DeleteArea adds command to delete a character area.
 */
class DeleteArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'area',
			next: [
				new IDStep('areaId', {
					name: "area ID",
					list: () => {
						let c = this.module.player.getActiveChar();
						return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
					},
					else: new ListStep('areaId', this.module.cmdLists.getCharOwnedAreas(), {
						name: "area"
					})
				})
			],
			value: (ctx, p) => this.deleteArea(ctx.char, {
				areaId: p.areaId
			})
		});

		this.module.help.addTopic({
			id: 'deleteArea',
			category: 'buildAreas',
			cmd: 'delete area',
			usage: l10n.l('deleteArea.usage', usageText),
			shortDesc: l10n.l('deleteArea.shortDesc', shortDesc),
			desc: l10n.l('deleteArea.helpText', helpText),
			sortOrder: 40,
		});
	}

	deleteArea(char, params) {
		return char.call('deleteArea', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteArea.areaDeleted', "Deleted area \"{areaName}\".", { areaName: result.name })));
	}
}

export default DeleteArea;
