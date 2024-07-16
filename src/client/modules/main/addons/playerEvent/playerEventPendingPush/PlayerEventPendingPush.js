import isVisible from 'utils/isVisible.js';

// 2 seconds between a pendingPush and sending cancelPush. Since the server has
// a 5 second delay before sending, delaying the cancelPush will reduce
// cancel-spamming if there are bursts of pending push events.
const defaultDelay = 1000 * 2;

/**
 * PlayerEventPendingPush registers the pending push playerEvent handler, to
 * cancel push notifications if the app is visible.
 */
class PlayerEventPendingPush {
	constructor(app, params) {
		this.app = app;
		this.delay = Number(params.delay || defaultDelay);

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([
			'playerEvent',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.playerEvent.addHandler('pendingPush', this._handleEvent);
	}

	_handleEvent() {
		setTimeout(() => {
			// Cancel the pushEvent if the app is visible.
			if (isVisible()) {
				this.module.player.getPlayer()?.call('cancelPush').catch(err => {
					console.error("error calling cancelPush: ", err);
				});
			}
		}, this.delay);
	}

	dispose() {
		this.module.playerEvent.removeHandler('pendingPush');
	}
}

export default PlayerEventPendingPush;
