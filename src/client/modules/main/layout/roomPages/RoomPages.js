import { Model } from 'modapp-resource';
import { ModelComponent } from 'modapp-resource-component';
import ModelCollapser from 'components/ModelCollapser';
import Fader from 'components/Fader';
import objectKeyDiff from 'utils/objectKeyDiff';
import arraysEqual from 'utils/arraysEqual';
import { relistenResource } from 'utils/listenResource';
import RoomPagesChar from './RoomPagesChar';
import RoomPagesZoomBar from './RoomPagesZoomBar';
import './roomPages.scss';

const namespace = 'module.roomPages';
const emptyModelValues = {
	// Controlled character
	char: null,
	// Current room
	inRoom: null,
	// Current area
	area: null,
	// Current collection of areas. First item is always null.
	areas: null,
	// Current page in display
	page: null,
	// Page info factory function for the page
	factory: null,
};

/**
 * RoomPages holds the room panels room or area pages per controlled character.
 */
class RoomPages {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlChange = this._onCtrlChange.bind(this);
		this._onPlayerChange = this._onPlayerChange.bind(this);
		this._onCharChange = this._onCharChange.bind(this);
		this._onAreaChange = this._onAreaChange.bind(this);
		this._update = this._update.bind(this);

		this.app.require([
			'api',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: emptyModelValues });

		this.playerModel = this.module.player.getModel();
		this.ctrlModel = this.module.player.getControlledModel();

		this.charStates = {};
		this.defaultRoomPageFactory = null;
		this.defaultAreaPageFactory = null;

		this._setListeners(true);
	}

	/**
	 * Attach an event handler function for one or more player module events.
	 * @param {?string} events One or more space-separated events. Null means any event. Available events are 'open'.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.app.eventBus.on(this, events, handler, namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, namespace);
	}

	getModel() {
		return this.model;
	}

	/**
	 * Sets the area to show.
	 * @param {string} ctrlId Controlled character ID
	 * @param {string | null} areaId Area ID to show. Null means to show the room.
	 */
	setArea(ctrlId, areaId) {
		let c = this._getChar(ctrlId);
		c.setAreaId(areaId);
		if (ctrlId === this.model.char.id) {
			this._onAreaChange();
		}
		return this;
	}

	/**
	 * @typedef {object} RoomPagesDefaultPageFactory
	 * @property {(ctrl: Model, state: Object, layoutId: string) => { component: Component, title?: String | LocaleString }} componentFactory Default page compoent factory callback function
	 * @property {(ctrl: Model) => Object} stateFactory Initial state factory function.
	 */

	/**
	 * Sets the default page factory for the room pages.
	 * @param {?RoomPagesDefaultPageFactory} pageFactory Default page room factory.
	 * @returns {this}
	 */
	setDefaultRoomPageFactory(pageFactory) {
		this.defaultRoomPageFactory = pageFactory || null;
		// Set it for all existing character components.
		for (let k in this.charStates) {
			this.charStates[k].setDefaultRoomPageFactory(pageFactory);
		}
		return this;
	}

	/**
	 * Gets the default page factory for the room pages.
	 * @returns {?RoomPagesDefaultPageFactory} Default room page factory.
	 */
	getDefaultRoomPageFactory() {
		return this.defaultRoomPageFactory;
	}

	/**
	 * Sets the default page factory for the area pages.
	 * @param {?RoomPagesDefaultPageFactory} pageFactory Default page area factory.
	 * @returns {this}
	 */
	setDefaultAreaPageFactory(pageFactory) {
		this.defaultAreaPageFactory = pageFactory || null;
		// Set it for all existing character states.
		for (let k in this.charStates) {
			this.charStates[k].setDefaultAreaPageFactory(pageFactory);
		}
		return this;
	}

	/**
	 * Gets the default page factory for the area pages.
	 * @returns {?RoomPagesDefaultPageFactory} Default area page factory.
	 */
	getDefaultAreaPageFactory() {
		return this.defaultAreaPageFactory;
	}

	/**
	 * Creates a new instance of a RoomPagesZoomBar.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class name to add to the ZoomBar.
	 * @returns {RoomPagesZoomBar} ZoomBar component.
	 */
	newZoomBar(opt) {
		return new ModelCollapser(this.model, [{
			condition: m => m.areas?.length > 1,
			factory: m => new ModelComponent(
				m,
				new Fader(),
				(m, c, change) => {
					if ((!change || change.hasOwnProperty('areas') || change.hasOwnProperty('char')) && m.areas?.length > 1 && m.char) {
						c.setComponent(new RoomPagesZoomBar(this.module, m.char.id, m.areas, m, opt));
					}
				},
			),
		}], { duration: 150 });
	}


	/**
	 * Opens a in-panel page set to a specific room ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that character and room, that page will be moved to the top.
	 * @param {string} ctrlId Char ID of controlled character.
	 * @param {string} roomInstanceId Room instance ID
	 * @param {(ctrl: Model, room: Model, roomState: any, close: () => void, layoutId: string) => { component: Component, title?: string | LocaleString, onClose?: () => void, closeIcon?: string }} pageFactory Page factory callback function.
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.openPanel] Flag to tell if the panel should be opened when opening the page.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @param {(ctrl: Model) => Object} [opt.stateFactory] Initial state factory function.
 	 * @returns {function} Function that closes the page.
	 */
	openRoomPage(pageId, ctrlId, roomInstanceId, pageFactory, opt) {
		return this._openPage(pageId, ctrlId, roomInstanceId, null, (ctrl, state, close, layoutId, opt) => pageFactory(ctrl, opt.room, state, close, layoutId), opt);
	}


	/**
	 * Opens a in-panel page set to a specific area ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that character and room, that page will be moved to the top.
	 * @param {string} ctrlId Char ID of controlled character.
	 * @param {string} areaId Area ID
	 * @param {(ctrl: Model, area: Model, roomState: any, close: () => void, layoutId: string) => { component: Component, title?: string | LocaleString, onClose?: () => void, closeIcon?: string }} pageFactory Page factory callback function.
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.openPanel] Flag to tell if the panel should be opened when opening the page.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @param {(ctrl: Model) => Object} [opt.stateFactory] Initial state factory function.
 	 * @returns {function} Function that closes the page.
	 */
	openAreaPage(pageId, ctrlId, areaId, pageFactory, opt) {
		return this._openPage(pageId, ctrlId, null, areaId, (ctrl, state, close, layoutId, opt) => pageFactory(ctrl, opt.area, state, close, layoutId), opt);
	}


	/**
	 * Opens a in-panel page set to a specific room ID or area ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that character and room, that page will be moved to the top.
	 * @param {string} ctrlId Char ID of controlled character.
	 * @param {string?} roomInstanceId Room instance ID
	 * @param {string?} areaId Area ID. Ignored if roomInstanceId is not null.
	 * @param {(ctrl: Model, room: Model, roomState: any, close: () => void, layoutId: string) => { component: Component, title?: string | LocaleString, onClose?: () => void, closeIcon?: string }} pageFactory Page factory callback function.
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.openPanel] Flag to tell if the panel should be opened when opening the page.
	 * @param {function} [opt.onClose] Callback called when page is closed.
	 * @param {(ctrl: Model) => Object} [opt.stateFactory] Initial state factory function.
 	 * @returns {function} Function that closes the page.
	 */
	_openPage(pageId, ctrlId, roomInstanceId, areaId, pageFactory, opt) {
		let ret = this._getChar(ctrlId).openPage(pageId, roomInstanceId, areaId, pageFactory, opt);
		if (opt?.openPanel) {
			this.openPanel();
		}

		return ret;
	}

	// Triggers an open event that panels may be listening to.
	openPanel() {
		this.app.eventBus.emit(this, namespace + '.open');
	}

	/**
	 * Gets a character state
	 * @param {string} ctrlId Character ID.
	 * @returns {RoomPagesChar} Character state.
	 */
	_getChar(ctrlId) {
		let c = this.charStates[ctrlId];
		if (!c) {
			throw new Error("No state for char " + ctrlId);
		}
		return c;
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';

		this.ctrlModel[cb]('change', this._onCtrlChange);
		this.playerModel[cb]('change', this._onPlayerChange);
		if (on) {
			this._onCtrlChange();
		}
	}

	_onCtrlChange() {
		this._listenChars(objectKeyDiff(this.charStates, this.ctrlModel?.props));
		this._onPlayerChange();
	}

	_listenChars(change) {
		for (let charId in change) {
			let char = change[charId];
			let prev = this.charStates[charId];
			if (char) {
				if (!prev) {
					this.charStates[charId] = new RoomPagesChar(this.module, char, this._update, {
						defaultRoomPageFactory: this.getDefaultRoomPageFactory(),
						defaultAreaPageFactory: this.getDefaultAreaPageFactory(),
					});
				}
			} else if (prev) {
				prev.dispose();
				delete this.charStates[charId];
			}
		}
	}

	_onPlayerChange(ev) {
		this._updateModel(this.playerModel.activeChar);
	}

	_onCharChange(change, char) {
		if ((change && !change.hasOwnProperty('inRoom')) || char != this.model.char) return;

		this._updateModel(this.model.char);
	}

	_onAreaChange() {
		this._updateModel(this.model.char);
	}

	_update(ctrl) {
		// Only update the model if the character is the active one
		if (this.model.char == ctrl) {
			this._updateModel(ctrl);
		}
	}

	_updateModel(char) {
		let c = char ? this.charStates[char.id] : null;
		if (!c) {
			if (!char) {
				relistenResource(this.model.char, null, this._onCharChange);
				this._listenAreas(this.model.areas, null);
				this.model.set(emptyModelValues);
			}
			return;
		}

		let changedChar = this.model.char !== char;
		if (changedChar) {
			relistenResource(this.model.char, char, this._onCharChange);
		}

		// Get area list. If we switch character, we still change the areas list
		// even if both characters are in the same area.
		let areas = this._getAreas(char);
		if (!changedChar && arraysEqual(areas, this.model.areas)) {
			areas = this.model.areas;
		} else {
			this._listenAreas(this.model.areas, areas);
		}

		// Current area.
		let area = this._getCurrentArea(c.getAreaId(), this.model.areas, areas);
		c.setAreaId(area?.id);

		// Current in room unless we have an area.
		let inRoom = (!area && char.inRoom) || null;

		// Get current page.
		let page = c.getPage() || null;
		// Current factory.
		let factory = this.model.factory;
		// Update factory if we've changed the page, the area, or the room.
		if (this.model.page !== page || this.model.area !== area || this.model.inRoom !== inRoom) {
			factory = (page && c.createFactory(page, inRoom, area)) || null;
		}

		return this.model.set({ char, inRoom, area, areas, page, factory });
	}

	_listenAreas(before, after) {
		for (let b of before || []) {
			b?.off('change', this._onAreaChange);
		}
		for (let a of after || []) {
			a?.on('change', this._onAreaChange);
		}
	}

	_getAreas(ctrl) {
		if (!ctrl) {
			return null;
		}
		let list = [ null ];
		let area = ctrl.inRoom?.area;
		while (area) {
			list.push(area);
			area = area.parent;
		}
		return list;
	}

	// Gets the area that is to be set as current, depending on what areaId was
	// previous set as current, what areas we had before, and what areas we have
	// now.
	_getCurrentArea(areaId, before, after) {
		// Assert that we have areas
		if (areaId && after?.length > 1) {
			// If we were watching the room's current area, we will continue do
			// so even after entering a room belonging to a new area.
			if (before && before[1]?.id === areaId) {
				return after[1];
			}
			// Try to see if the area we used to watch still exists after the
			// changes. If so, select that area.
			for (let area of after) {
				if (area?.id == areaId) {
					return area;
				}
			}
		}
		// Default to show the room
		return null;
	}

	dispose() {
		this._updateModel(null);
		this._setListeners(false);
		this._listenChars(Object.keys(this.charStates).map(k => undefined));
	}
}

export default RoomPages;
