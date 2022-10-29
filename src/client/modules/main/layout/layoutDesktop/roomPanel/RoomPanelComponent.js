import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';

function getDialogIdx(dialogs, pageId) {
	if (pageId) {
		for (let i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id === pageId) {
				return i;
			}
		}
	}
	return -1;
}

class RoomPanelComponent {
	constructor(module, ctrl, panel) {
		this.module = module;
		this.ctrl = ctrl;
		this.panel = panel;
		this.state = {};
		this.roomStates = {};
		this.roomDialogs = {};
		this.roomPage = null;
		this.roomState = null;
		this.charDialogs = [];
		this.current = null;
		this.scrollTop = 0;
		this.defaultTitle = l10n.l('roomPanel.roomInfo', "Room Info");
	}

	render(el) {
		this.elem = new ModelComponent(
			this.ctrl,
			new Fader(null, { className: 'roompanel--content' }),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('inRoom')) return;

				if (change) {
					this.scrollTop = 0;
				}

				let f = this.module.self.getDefaultPageFactory();
				let roomId = m.inRoom && m.inRoom.id;
				let state;
				if (roomId) {
					state = this.roomStates[roomId];
					if (!state) {
						state = {};
						this.roomStates[roomId] = state;
					}
				}
				this.roomPage = (m.inRoom && f && f(m, m.inRoom, this.state)) || {};
				this.roomState = state;
				this._setComponent();
			}
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.roomPage = null;
			this.roomState = null;
			this.current = null;
		}
	}

	/**
	 * Opens a in-panel page set to a specific room ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that room, that page will be moved to the top.
	 * @param {string} roomId Room ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @returns {function} Function that closes the page.
	 */
	openPage(pageId, roomId, pageFactory, opt) {
		let dialogs = roomId ? this.roomDialogs[roomId] : this.charDialogs;
		if (!dialogs) {
			dialogs = [];
			this.roomDialogs[roomId] = dialogs;
		}

		let i = getDialogIdx(dialogs, pageId);
		let d;
		if (i < 0) {
			d = { id: pageId, f: pageFactory, state: {}, onClose: opt.onClose };
			d.close = this._closeDialog.bind(this, roomId, d);
		} else {
			// Quick exit if page is already at end
			if (i === (dialogs.length - 1)) {
				return;
			}
			// Remove page from stack (to be pushed to the end)
			d = dialogs[i];
			dialogs.splice(i, 1);
		}
		dialogs.push(d);
		this._setComponent();
		return d.close;
	}

	_setComponent() {
		if (!this.elem) return;

		if (!this.ctrl.inRoom && !this.charDialogs.length) {
			this._setPage({});
			this.current = null;
			return;
		}

		let roomId = this.ctrl.inRoom.id;
		let dialogs = this.charDialogs.length ? this.charDialogs : this.roomDialogs[roomId];

		if (dialogs) {
			let d = dialogs[dialogs.length - 1];
			if (this.current == d) {
				return;
			}
			let page = d.f(this.ctrl, this.ctrl.inRoom, d.state, d.close);
			this._setPage(page, d);
			this.current = d;
			return;
		}

		this._setPage(this.roomPage, this.roomState);
		this.current = this.roomPage;
	}

	_setPage(page, d) {
		this.panel
			.setTitle(page.title || this.defaultTitle)
			.setButton(page.onClose || null, page.closeIcon);
		this.elem.getComponent().setComponent(page.component || null, d && {
			onRender: () => {
				// Restore scrolling of page
				let sb = this.panel.getSimpleBar();
				if (sb) {
					sb.getScrollElement().scrollTop = d.scrollTop || 0;
				}
			},
			onUnrender: () => {
				// Store scrolling of page
				let sb = this.panel.getSimpleBar();
				if (sb) {
					d.scrollTop = sb.getScrollElement().scrollTop;
				}
			}
		});
	}

	_closeDialog(roomId, dialog) {
		let dialogs = roomId ? this.roomDialogs[roomId] : this.charDialogs;
		if (dialogs) {
			for (let i = 0; i < dialogs.length; i++) {
				if (dialogs[i] == dialog) {
					if (dialogs.length == 1 && roomId) {
						delete this.roomDialogs[roomId];
					} else {
						dialogs.splice(i, 1);
					}
					break;
				}
			}
		}

		if (this.current == dialog) {
			this._setComponent();
		}

		if (dialog.onClose) {
			dialog.onClose();
		}
	}

	_setTitle(title) {

	}

	dispose() {}
}

export default RoomPanelComponent;
