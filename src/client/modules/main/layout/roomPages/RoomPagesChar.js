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

/**
 * Holds the state of a character's room panel, which pages are opened, and if
 * an area is being viewed.
 */
class RoomPagesChar {
	constructor(module, ctrl, update, opt) {
		this.module = module;
		this.ctrl = ctrl;
		this.update = update;

		this.roomInstanceId = null;
		this.areaId = null;
		// Page stacks
		this.roomPages = {};
		this.areaPages = {};
		this.charPages = [];
		this.defaultRoomStates = {};
		this.defaultAreaStates = {};

		this.setDefaultRoomPageFactory(opt?.defaultRoomPageFactory);
		this.setDefaultAreaPageFactory(opt?.defaultAreaPageFactory);
	}

	/**
	 * Sets the ID of the area to view.
	 * @param {string | null} areaId Area ID to view, or null to view the room.
	 */
	setAreaId(areaId) {
		this.areaId = areaId || null;
	}

	/**
	 * Gets the ID of the area being viewed.
	 * @returns {string | null} Area ID or null if the room is viewed.
	 */
	getAreaId() {
		return this.areaId;
	}

	/**
	 * Opens a page to for a specific room ID or area ID. The page will be
	 * placed on top of the stack for the specific roomInstanceId or areaId. If
	 * both roomInstanceId and areaId is null, the charPages stack will be used,
	 * and will have priority over any other page set.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that room, that page will be moved to the top.
	 * @param {string | null} roomInstanceId Room instance ID
	 * @param {string | null} areaId Area ID. Ignored if roomInstanceId is not null.
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @param {function} [opt.stateFactory] Initial state factory function.
	 * @returns {function} Function that closes the page.
	 */
	openPage(pageId, roomInstanceId, areaId, pageFactory, opt) {
		opt = opt || {};
		let stack = this._getPageStack(roomInstanceId, areaId);
		let firstIdx = roomInstanceId ? 1 : 0;
		// Check if page with that ID already existed
		let pageIdx = getPageIdx(pageId, stack);

		if (opt.reset) {
			this._closePages(roomInstanceId);
		} else if (pageIdx >= firstIdx) {
			// Move page from stack to end.
			stack.push(stack.splice(pageIdx, 1)[0]);
		}

		// Check if page didn't exist before
		if (pageIdx < 0) {
			let close = () => this._closePage(roomInstanceId, pageId, true);
			stack.push({
				id: pageId,
				factory: pageFactory,
				state: opt.stateFactory ? opt.stateFactory(this.ctrl) : {},
				close: opt.beforeClose
					? force => force ? close : opt.beforeClose(close)
					: close,
				onClose: opt.onClose,
			});
		}

		this.update(this.ctrl);

		return stack[stack.length - 1].close || null;
	}

	/**
	 * Gets the top-most page from the relevant stack of pages. If there are
	 * pages in the charPages stack, that stack is used. If areaId is not null,
	 * the areaPages stack is used. Otherwise, the character's current
	 * roomInstance is used.
	 * @returns {Object | null} Page object.
	 */
	getPage() {
		let stack = this.charPages;
		if (!stack.length) {
			stack = this._getPageStack(this.areaId ? null : getRoomInstanceId(this.ctrl.inRoom), this.areaId);
		}
		return stack?.length ? stack[stack.length - 1] : null;
	}

	createFactory(page, room, area) {
		return (layoutId) => page.factory?.(this.ctrl, page.state, page.close, layoutId, {
			room,
			area,
		});
	}

	/**
	 * Gets a page stack for a specific roomInstance or area. If both
	 * roomInstanceId and areaId is null, it will return the stack for the
	 * character.
	 * @param {string | null} roomInstanceId Room instance ID
	 * @param {string | null} areaId Area ID. Ignored if roomInstanceId is not null.
	 * @returns {Array.<Object>} Array of page objects.
	 */
	_getPageStack(roomInstanceId, areaId) {
		let pages = this.charPages;
		if (roomInstanceId) {
			pages = this.roomPages[roomInstanceId];
			if (!pages) {
				pages = [ this.defaultRoomPage ];
				this.roomPages[roomInstanceId] = pages;
			}
		} else if (areaId) {
			pages = this.areaPages[areaId];
			if (!pages) {
				pages = [ this.defaultAreaPage ];
				this.areaPages[areaId] = pages;
			}
		}
		return pages;
	}

	setDefaultRoomPageFactory(pageFactory) {
		let f = pageFactory?.componentFactory;


		this.defaultRoomPage = {
			id: null,
			state: (pageFactory?.stateFactory ? pageFactory.stateFactory(this.ctrl) : {}),
			factory: f
				? (ctrl, state, close, layoutId, opt) => f(ctrl, opt.room, state, layoutId)
				: null,
			close: null,
		};
	}

	setDefaultAreaPageFactory(pageFactory) {
		let f = pageFactory?.componentFactory;
		this.defaultAreaPage = {
			id: null,
			state: (pageFactory?.stateFactory ? pageFactory.stateFactory(this.ctrl) : {}),
			factory: f
				? (ctrl, state, close, layoutId, opt) => f(ctrl, opt.area, state, layoutId)
				: null,
			close: null,
		};
	}

	_closePages(roomInstanceId, skipPageId) {
		let stack = this._getPageStack(roomInstanceId);
		let firstIdx = roomInstanceId ? 1 : 0;
		for (let i = stack.length - 1; i >= firstIdx; i--) {
			if (stack[i].id !== skipPageId) {
				this._closePage(roomInstanceId, stack[i].id);
			}
		}
	}

	_closePage(roomInstanceId, pageId, triggerUpdate) {
		let stack = this._getPageStack(roomInstanceId);
		// Find index position of page
		let pageIdx = getPageIdx(pageId, stack);

		// Assert page is found
		if (pageIdx < 0) {
			return;
		}

		let page = stack.splice(pageIdx, 1)[0];
		if (triggerUpdate && pageIdx >= stack.length) {
			this.update(this.ctrl);
		}

		if (page.onClose) {
			page.onClose();
		}
	}

	dispose() {}
}

export default RoomPagesChar;
