import { Html } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import formatText from 'utils/formatText';

/**
 * BroadcastHandler handles broadcasted messages and shows them in a toaster notification.
 */
class BroadcastHandler {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onOut = this._onOut.bind(this);

		this.app.require([ 'api', 'toaster', 'login' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.model = new Model({ data: { info: null }, eventBus: this.app.eventBus });

		this.module.login.getLoginPromise()
			.then(() => this.module.api.get('core.info'))
			.then(info => {
				if (this.model) {
					this.model.set({ info });
					info.on('out', this._onOut);
				}
			})
			.catch(err => console.error("Failed to get info: ", err));
	}

	_onOut(ev) {
		if (ev.type != 'broadcast') return;

		this.module.toaster.open({
			id: ev.id,
			title: ev.title || l10n.l('broadcastHandler.broadcast', "Broadcast"),
			content: new Html(formatText(ev.msg), { className: 'common--formattext' }),
			closeOn: 'button',
			time: ev.time ? new Date(ev.time) : new Date()
		});
	}

	dispose() {
		if (this.model) {
			this.model.info.off('out', this._onOut);
		}
		this.model = null;
	}
}

export default BroadcastHandler;
