import getRoomInstanceId from 'utils/getRoomInstanceId';

function getPageIdx(pageId, pages) {
	if (pageId) {
		for (let i = 0; i < pages.length; i++) {
			if (pages[i].id === pageId) {
				return i;
			}
		}
	}
	return -1;
}

class RoomPagesChar {
	constructor(module, ctrl, update, defaultPageFactory) {
		this.module = module;
		this.ctrl = ctrl;
		this.update = update;

		this.roomPages = {};
		this.charPages = [];
		this.defaultRoomStates = {};

		this.setDefaultPageFactory(defaultPageFactory);
	}

	/**
	 * Opens a page to for a specific room ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that room, that page will be moved to the top.
	 * @param {string} roomInstanceId Room instance ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @param {function} [opt.stateFactory] Initial state factory function.
	 * @returns {function} Function that closes the page.
	 */
	openPage(pageId, roomInstanceId, pageFactory, opt) {
		opt = opt || {};
		let pages = this._getRoomPages(roomInstanceId);
		let firstIdx = roomInstanceId ? 1 : 0;
		// Check if page with that ID already existed
		let pageIdx = getPageIdx(pageId, pages);

		if (opt.reset) {
			this._closePages(roomInstanceId);
		} else if (pageIdx >= firstIdx) {
			// Move page from stack to end.
			pages.push(pages.splice(pageIdx, 1)[0]);
		}

		// Check if page didn't exists before
		if (pageIdx < 0) {
			let close = () => this._closePage(roomInstanceId, pageId, true);
			pages.push({
				id: pageId,
				factory: pageFactory,
				state: opt.stateFactory ? opt.stateFactory(this.ctrl) : {},
				close: opt.beforeClose
					? force => force ? close : opt.beforeClose(close)
					: close,
				onClose: opt.onClose,
			});
		}

		this.update(this.ctrl, roomInstanceId);

		return pages[pages.length - 1].close || null;
	}

	getPage() {
		if (!this.ctrl.inRoom && !this.charPages.length) {
			return null;
		}
		let roomInstanceId = getRoomInstanceId(this.ctrl.inRoom);
		let pages = this.charPages.length ? this.charPages : this._getRoomPages(roomInstanceId);
		return pages[pages.length - 1];
	}

	createFactory() {
		let page = this.getPage();
		return (layoutId) => page.factory(this.ctrl, this.ctrl.inRoom, page.state, page.close, layoutId);
	}

	_getRoomPages(roomInstanceId) {
		if (!roomInstanceId) {
			return this.charPages;
		}
		let pages = this.roomPages[roomInstanceId];
		if (!pages) {
			pages = [ this.defaultPage ];
			this.roomPages[roomInstanceId] = pages;
		}
		return pages;
	}

	setDefaultPageFactory(pageFactory) {
		let f = pageFactory?.componentFactory;
		this.defaultPage = {
			id: null,
			state: (pageFactory.stateFactory ? pageFactory.stateFactory(this.ctrl) : {}),
			factory: f
				? (ctrl, room, state, close, layoutId) => f(ctrl, state, layoutId)
				: null,
			close: null,
		};
	}

	_closePages(roomInstanceId, skipPageId) {
		let pages = this._getRoomPages(roomInstanceId);
		let firstIdx = roomInstanceId ? 1 : 0;
		for (let i = pages.length - 1; i >= firstIdx; i--) {
			if (pages[i].id !== skipPageId) {
				this._closePage(roomInstanceId, pages[i].id);
			}
		}
	}

	_closePage(roomInstanceId, pageId, triggerUpdate) {
		let pages = this._getRoomPages(roomInstanceId);
		// Find index position of page
		let pageIdx = getPageIdx(pageId, pages);

		// Assert page is found
		if (pageIdx < 0) {
			return;
		}

		let page = pages.splice(pageIdx, 1)[0];
		if (triggerUpdate && pageIdx >= pages.length) {
			this.update(this.ctrl);
		}

		if (page.onClose) {
			page.onClose();
		}
	}

	dispose() {}
}

export default RoomPagesChar;
