import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';

/**
 * MuteCmd adds the mute command.
 */
class MuteCmd {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._exec = this._exec.bind(this);

		this.app.require([ 'cmd' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.muteType = new ItemList('object', {
			name: "message type"
		});

		this.module.cmd.addCmd({
			key: 'mute',
			next: new ListStep('object', this.muteType, {
				name: "message type",
				token: 'name',
				errRequired: step => ({ code: 'muteCmd.messageTypeRequired', message: "What sort of messages do you want to mute?" })
			}),
			value: this._exec
		});
	}

	addType(type) {
		this.muteType.addItem(type);
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

export default MuteCmd;
