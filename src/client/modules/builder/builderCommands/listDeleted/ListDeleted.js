import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';

/**
 * ListDeleted adds the list deleted command prefix.
 */
class ListDeleted {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.itemList = new ItemList();

		this.module.cmd.addPrefixCmd('list', {
			key: 'deleted',
			next: [
				new ListStep('deletedObject', this.itemList, {
					name: "object type",
					token: 'name',
				}),
			],
			value: this._exec.bind(this),
		});
	}

	getItemList() {
		return this.itemList;
	}

	_exec(ctx, p) {
		let f = p.item;
		if (typeof f != 'function') {
			throw Error("List deleted object value is not a function.");
		}
		return f(ctx, p);
	}
}

export default ListDeleted;
