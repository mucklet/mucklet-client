import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';

/**
 * StopMuteTravel adds the stop mute travel command.
 */
class StopMuteTravel {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._exec = this._exec.bind(this);

		this.app.require([ 'cmd' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.stopMuteType = new ItemList('object', {
			name: "message type"
		});

		let opts = {
			next: [
				new ListStep('object', this.stopMuteType, {
					name: "message type",
					token: 'name',
					errRequired: step => ({ code: 'stopMuteTravel.messageTypeRequired', message: "What sort of messages do you want to stop muting?" })
				})
			],
			value: this._exec
		};
		this.module.cmd.addPrefixCmd('stop', Object.assign({ key: 'mute' }, opts));
		this.module.cmd.addCmd(Object.assign({ key: 'unmute' }, opts));
	}

	addType(type) {
		this.stopMuteType.addItem(type);
		return this;
	}

	_exec(ctx, p) {
		let f = p.object;
		if (typeof f != 'function') {
			throw new Error("Object value is not a function");
		}
		return f(ctx, p);
	}
}

export default StopMuteTravel;
