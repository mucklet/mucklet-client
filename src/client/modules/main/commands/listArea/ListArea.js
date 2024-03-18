import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';

/**
 * ListArea adds command to show list of items belonging to an area.
 */
class ListArea {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.areaAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});

		this.module.cmd.addPrefixCmd('list', {
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
					}),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.areaAttr, {
					name: "area attribute",
					errRequired: step => new Err('listArea.attributeRequired', "What do you want to list for this area?"),
					token: 'attr',
				}),
			],
			value: this._exec.bind(this),
		});
	}

	addAttribute(attr) {
		this.areaAttr.addItem(Object.assign({}, attr));
		return this;
	}

	_exec(ctx, p) {
		return p.attr(ctx, p, this);
	}
}

export default ListArea;
