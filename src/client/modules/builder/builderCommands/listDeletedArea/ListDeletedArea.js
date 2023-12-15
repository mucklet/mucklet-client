import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ItemList from 'classes/ItemList';
import IDStep from 'classes/IDStep';
import l10n from 'modapp-l10n';
import helpDefList from 'utils/helpDefList';

const usageText = 'list deleted area <span class="opt"><span class="param">#AreaID<span class="comment">/</span>Area</span></span> : <span class="param">Item type</span>';
const shortDesc = `List deleted items belonging to an area`;
const helpText =
`<p>List deleted items of a specific type belonging to an area.</p>
<code class="param">#AreaID</code> is the ID of the area. Defaults to the area ID of the current room's area.</p>
<code class="param">Area</code> is the name of an owned area.</p>`;

/**
 * ListDeletedArea adds the list deleted area command.
 */
class ListDeletedArea {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmdLists',
			'player',
			'listDeleted',
			'helpBuilder',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.itemList = new ItemList();

		this.module.listDeleted.getItemList().addItem({
			key: 'area',
			next: [
				new IDStep('areaId', {
					name: "area ID",
					list: () => {
						let c = this.module.player.getActiveChar();
						return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
					},
					else: new ListStep('areaId', this.module.cmdLists.getCharOwnedAreas(), {
						name: "area",
						errRequired: null,
					}),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('item', this.itemList, {
					name: "item type",
					token: 'item',
				}),
			],
			value: this._exec.bind(this),
		});

		this.module.helpBuilder.addTopic({
			id: 'listDeletedArea',
			cmd: 'list deleted area',
			usage: l10n.l('listDeletedArea.usage', usageText),
			shortDesc: l10n.l('listDeletedArea.shortDesc', shortDesc),
			desc: () => helpDefList(l10n.t('listDeletedArea.helpText', helpText), this.itemList.getItems(), l10n.l('listDeletedArea.itemType', "Item type")),
			sortOrder: 1230,
		});
	}

	getItemList() {
		return this.itemList;
	}

	_exec(ctx, p) {
		let f = p.item;
		if (typeof f != 'function') {
			throw Error("Area list deleted item value is not a function.");
		}
		return f(ctx, p);
	}
}

export default ListDeletedArea;
