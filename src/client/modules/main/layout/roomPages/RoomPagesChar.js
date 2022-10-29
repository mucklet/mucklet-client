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
	constructor(module, ctrl, update) {
		this.module = module;
		this.ctrl = ctrl;
		this.update = update;

		this.roomPages = {};
		this.charPages = [];
		this.defaultRoomStates = {};
	}

	/**
	 * Opens a page to for a specific room ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that room, that page will be moved to the top.
	 * @param {string} roomId Room ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @returns {function} Function that closes the page.
	 */
	openPage(pageId, roomId, pageFactory, opt) {
		opt = opt || {};
		let pages = this._getRoomPages(roomId);
		let firstIdx = roomId ? 1 : 0;
		// Check if page with that ID already existed
		let pageIdx = getPageIdx(pageId, pages);

		if (opt.reset) {
			this._closePages(roomId);
		} else if (pageIdx >= firstIdx) {
			// Move page from stack to end.
			pages.push(pages.splice(pageIdx, 1)[0]);
		}

		// Check if page didn't exists before
		if (pageIdx < 0) {
			let close = () => this._closePage(roomId, pageId, true);
			pages.push({
				id: pageId,
				factory: pageFactory,
				state: {},
				close: opt.beforeClose
					? force => force ? close : opt.beforeClose(close)
					: close,
				onClose: opt.onClose,
			});
		}

		this.update(this.ctrl, roomId);

		return pages[pages.length - 1].close || null;
	}

	getPage() {
		if (!this.ctrl.inRoom && !this.charPages.length) {
			return null;
		}
		let roomId = this.ctrl.inRoom.id;
		let pages = this.charPages.length ? this.charPages : this._getRoomPages(roomId);
		return pages[pages.length - 1];
	}

	createFactory() {
		let page = this.getPage();
		return (layoutId) => page.factory(this.ctrl, this.ctrl.inRoom, page.state, page.close, layoutId);
	}

	_getRoomPages(roomId) {
		let pages = roomId ? this.roomPages[roomId] : this.charPages;
		if (!pages) {
			let f = this.module.self.getDefaultPageFactory();
			pages = [{
				id: null,
				state: {},
				factory: (ctrl, room, state, close, layoutId) => f(ctrl, room, state, layoutId),
				close: null,
			}];
			this.roomPages[roomId] = pages;
		}
		return pages;
	}

	_closePages(roomId, skipPageId) {
		let pages = this._getRoomPages(roomId);
		let firstIdx = roomId ? 1 : 0;
		for (let i = pages.length - 1; i >= firstIdx; i--) {
			if (pages[i].id !== skipPageId) {
				this._closePage(tabId, pages[i].id);
			}
		}
	}

	_closePage(roomId, pageId, triggerUpdate) {
		let pages = this._getRoomPages(roomId);
		// Find index position of page
		let pageIdx = getPageIdx(pageId, pages);

		// Assert page is found
		if (pageIdx < 0) {
			return;
		}

		let page = pages.splice(pageIdx, 1)[0];
		if (triggerUpdate && pageIdx >= pages.length) {
			this.update(this.ctrl, roomId);
		}

		if (page.onClose) {
			page.onClose();
		}
	}

	dispose() {}
}

export default RoomPagesChar;
