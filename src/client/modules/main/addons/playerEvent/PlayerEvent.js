import { Model } from 'modapp-resource';

/**
 * PlayerEvent listens for player events and calls the matching handler.
 */
class PlayerEvent {
	constructor(app, params) {
		this.app = app;
		// Bind callbacks
		this._onPlayerModelChange = this._onPlayerModelChange.bind(this);
		this._onAuthModelChange = this._onAuthModelChange.bind(this);
		this._onPlayerEvent = this._onPlayerEvent.bind(this);
		this._onNoticeAdd = this._onNoticeAdd.bind(this);
		this._onNoticeRemove = this._onNoticeRemove.bind(this);

		this.app.require([ 'player', 'auth', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.handlers = new Model({ eventBus: this.app.eventBus });

		this.player = null;
		this.user = null;
		this.userNotices = null;
		this.readNotices = {};
		this._setListeners(true);
		this._onPlayerModelChange();
		this._onAuthModelChange();

	}

	addHandler(id, callback) {
		if (this.handlers.props.hasOwnProperty(id)) {
			throw new Error("PlayerEvent handler already registered for " + id);
		}
		this.handlers.set({ [id]: callback });
		return this;
	}

	removeHandler(id) {
		this.handlers.set({ [id]: undefined });
		return this;
	}

	_setListeners(on) {
		this.module.player.getModel()[on ? 'on' : 'off']('change', this._onPlayerModelChange);
		this.module.auth.getModel()[on ? 'on' : 'off']('change', this._onAuthModelChange);
	}

	_onPlayerModelChange() {
		let p = this.module.player.getPlayer();
		if (p === this.player) return;

		this._setPlayerListeners(false);
		this.player = p;
		this._setPlayerListeners(true);
	}

	_setPlayerListeners(on) {
		if (this.player) {
			this.player[on ? 'on' : 'off']('out', this._onPlayerEvent);
		}
	}

	_onPlayerEvent(ev) {
		let h = this.handlers.props[ev.type];
		if (!h) {
			console.error("PlayerEvent missing handler for event type " + ev.type, ev);
		} else {
			h(ev);
		}
	}

	_onAuthModelChange() {
		let user = this.module.auth.getUser();
		if (user === this.user) return;

		this._setNoticeListeners(false);
		this.user = user;
		this.userNotices = null;
		this._loadNotices();
	}

	_loadNotices() {
		if (!this.user) return;

		let userId = this.user.id;
		this.module.api.get('auth.user.' + userId + '.notices').then(notices => {
			if (this.user && this.user.id == userId) {
				this.userNotices = notices;
				this._setNoticeListeners(true);
				this._onNoticeAdd();
			}
		});

		if (this.user.identity) {
			this.module.api.get('identity.user.' + userId + '.notices').then(notices => {
				if (!this.user || this.user.id !== userId) {
					return;
				}
				this.identityNotices = notices;
				this._setIdentityNoticeListeners(true);
				this._onNoticeAdd();
			});
		}
	}

	_setNoticeListeners(on) {
		let cb = on ? 'on' : 'off';
		if (this.userNotices) {
			this.userNotices[cb]('add', this._onNoticeAdd);
			this.userNotices[cb]('remove', this._onNoticeRemove);
		}
	}

	_setIdentityNoticeListeners(on) {
		let cb = on ? 'on' : 'off';
		if (this.identityNotices) {
			this.identityNotices[cb]('add', this._onNoticeAdd);
			this.identityNotices[cb]('remove', this._onNoticeRemove);
		}
	}

	_onNoticeAdd(ev) {
		this._showNextNotice();
	}

	_onNoticeRemove(ev) {
		if (this.noticeShowing && this.noticeShowing.noticeId == ev.item.id && this.noticeShowing.close) {
			this.noticeShowing.close();
		}
	}

	_showNextNotice() {
		if (this.noticeShowing) return;

		let notices = this.identityNotices;
		// Run two times. First with identityNotices, then with userNotices.
		for (let i = 0; i < 2; i++) {
			if (notices) {
				for (let notice of notices) {
					if (!this.readNotices[notice.id]) {
						let h = this.handlers.props[notice.type];
						if (!h) {
							console.error("PlayerEvent missing handler for event type " + notice.type, notice);
						} else {
							let close = h(notice.data, this._onNoticeClose.bind(this, notice));
							this.noticeShowing = { noticeId: notice.id, close };
						}
						return;
					}
				}
			}
			notices = this.userNotices;
		}
	}

	_onNoticeClose(notice) {
		if (this.noticeShowing.noticeId == notice.id) {
			this.noticeShowing = null;
		}
		this.readNotices[notice.id] = true;
		notice.call('read').catch(err => console.error("Error setting notice as read: ", err));

		this._showNextNotice();
	}

	dispose() {
		this._setIdentityNoticeListeners(false);
		this._setNoticeListeners(false);
		this._setPlayerListeners(false);
		this._setListeners(false);
		this.player = null;
	}
}

export default PlayerEvent;
