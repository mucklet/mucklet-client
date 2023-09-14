import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import l10n from 'modapp-l10n';
import helpDefList from 'utils/helpDefList';

const usageText = 'list char <span class="param">Character</span> : <span class="param">Item type</span>';
const shortDesc = `List items owned by another player's character`;
const helpText =
`<p>List items of a specific type owned by another player's character.</p>`;

/**
 * ListChar adds the list char command.
 */
class ListChar {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'helpBuilder',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.itemList = new ItemList();

		this.module.cmd.addPrefixCmd('list', {
			key: 'char',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('listChar.characterRequired', "Who do you want to list things for?"),
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
			id: 'listChar',
			cmd: 'list char',
			usage: l10n.l('listChar.usage', usageText),
			shortDesc: l10n.l('listChar.shortDesc', shortDesc),
			desc: () => helpDefList(l10n.t('listChar.helpText', helpText), this.itemList.getItems(), l10n.l('listChar.itemType', "Item type")),
			sortOrder: 10,
		});
	}

	getItemList() {
		return this.itemList;
	}

	_exec(ctx, p) {
		let f = p.item;
		if (typeof f != 'function') {
			throw Error("Char list item value is not a function.");
		}
		return f(ctx, p);
	}
}

export default ListChar;
