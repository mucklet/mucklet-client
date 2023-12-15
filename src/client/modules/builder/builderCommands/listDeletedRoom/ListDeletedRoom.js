import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ItemList from 'classes/ItemList';
import IDStep from 'classes/IDStep';
import l10n from 'modapp-l10n';
import helpDefList from 'utils/helpDefList';

const usageText = 'list deleted room <span class="opt"><span class="param">#RoomID</span></span> : <span class="param">Item type</span>';
const shortDesc = `List deleted items belonging to a room`;
const helpText =
`<p>List deleted items of a specific type belonging to a room.</p>
<code class="param">#RoomID</code> is the optional ID of the room. Defaults to current room if omitted.</p>`;

/**
 * ListDeletedRoom adds the list deleted room command.
 */
class ListDeletedRoom {
	constructor(app) {
		this.app = app;

		this.app.require([
			'listDeleted',
			'helpBuilder',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.itemList = new ItemList();

		this.module.listDeleted.getItemList().addItem({
			key: 'room',
			next: [
				new IDStep('roomId', { errRequired: null }),
				new DelimStep(":", { errRequired: null }),
				new ListStep('item', this.itemList, {
					name: "item type",
					token: 'item',
				}),
			],
			value: this._exec.bind(this),
		});

		this.module.helpBuilder.addTopic({
			id: 'listDeletedRoom',
			cmd: 'list deleted room',
			usage: l10n.l('listDeletedRoom.usage', usageText),
			shortDesc: l10n.l('listDeletedRoom.shortDesc', shortDesc),
			desc: () => helpDefList(l10n.t('listDeletedRoom.helpText', helpText), this.itemList.getItems(), l10n.l('listDeletedRoom.itemType', "Item type")),
			sortOrder: 1220,
		});
	}

	getItemList() {
		return this.itemList;
	}

	_exec(ctx, p) {
		let f = p.item;
		if (typeof f != 'function') {
			throw Error("Room list deleted item value is not a function.");
		}
		return f(ctx, p);
	}
}

export default ListDeletedRoom;
