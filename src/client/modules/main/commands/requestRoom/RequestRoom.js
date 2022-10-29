import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';

/**
 * RequestRoom adds sub command to request changes to room attributes.
 */
class RequestRoom {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.roomAttr = new ItemList();

		this.module.cmd.addPrefixCmd('request', {
			key: 'room',
			next: new ListStep('attr', this.roomAttr, {
				name: "room attribute",
				token: 'attr'
			}),
			value: this._exec.bind(this)
		});
	}

	getRoomAttr() {
		return this.roomAttr;
	}

	_exec(ctx, p) {
		let f = p.attr;
		if (typeof f != 'function') {
			throw Error("Request room attribute value is not a function.");
		}
		return f(ctx, p);
	}
}

export default RequestRoom;
