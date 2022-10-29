import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';

/**
 * RequestArea adds sub command to request changes to area attributes.
 */
class RequestArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.areaAttr = new ItemList();

		this.module.cmd.addPrefixCmd('request', {
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
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.areaAttr, {
					name: "area attribute",
					token: 'attr'
				})
			],
			value: this._exec.bind(this)
		});
	}

	getAreaAttr() {
		return this.areaAttr;
	}

	_exec(ctx, p) {
		let f = p.attr;
		if (typeof f != 'function') {
			throw Error("Request area attribute value is not a function.");
		}
		return f(ctx, p);
	}
}

export default RequestArea;
