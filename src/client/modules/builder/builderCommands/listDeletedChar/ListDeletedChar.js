import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import l10n from 'modapp-l10n';
import helpDefList from 'utils/helpDefList';

const usageText = 'list deleted char <span class="param">Character</span> : <span class="param">Item type</span>';
const shortDesc = `List deleted items owned by a character`;
const helpText =
`<p>List deleted items of a specific type owned by a character.</p>`;

/**
 * ListDeletedChar adds the list deleted char command.
 */
class ListDeletedChar {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'listDeleted',
			'helpBuilder',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.itemList = new ItemList();

		this.module.listDeleted.getItemList().addItem({
			key: 'char',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('listDeletedChar.characterRequired', "Who do you want to list deleted things for?"),
					sortOrder: [ 'room', 'awake', 'watch' ],
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
			id: 'listDeletedChar',
			cmd: 'list deleted char',
			usage: l10n.l('listDeletedChar.usage', usageText),
			shortDesc: l10n.l('listDeletedChar.shortDesc', shortDesc),
			desc: () => helpDefList(l10n.t('listDeletedChar.helpText', helpText), this.itemList.getItems(), l10n.l('listDeletedChar.itemType', "Item type")),
			sortOrder: 1210,
		});
	}

	getItemList() {
		return this.itemList;
	}

	_exec(ctx, p) {
		let f = p.item;
		if (typeof f != 'function') {
			throw Error("Char list deleted item value is not a function.");
		}
		return f(ctx, p);
	}
}

export default ListDeletedChar;
