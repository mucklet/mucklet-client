import { Model } from 'modapp-resource';
import objectKeyDiff from 'utils/objectKeyDiff';
import RoomPagesChar from './RoomPagesChar';

const namespace = 'module.roomPages';

/**
 * RoomPages holds the room panel pages.
 */
class RoomPages {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlChange = this._onCtrlChange.bind(this);
		this._onPlayerChange = this._onPlayerChange.bind(this);
		this._onCharChange = this._onCharChange.bind(this);
		this._update = this._update.bind(this);

		this.app.require([
			'api',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { char: null, inRoom: null, page: null, factory: null }});

		this.playerModel = this.module.player.getModel();
		this.ctrlModel = this.module.player.getControlledModel();

		this.charComponents = {};
		this.defaultPageFactory = null;

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
	 * Sets the component factory function for creating the default room page.
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, panelState, layoutId) -> { component, [title], [onClose], [closeIcon] }
	 * @returns {this}
	 */
	setDefaultPageFactory(pageFactory) {
		this.defaultPageFactory = pageFactory;
		return this;
	}

	/**
	 * Gets the default page component factory function.
	 * @returns {?function} Page factory callback function: function(ctrl, room, panelState, layoutId) -> { component, [title], [onClose], [closeIcon] }
	 */
	getDefaultPageFactory() {
		return this.defaultPageFactory;
	}

	/**
	 * Opens a in-panel page set to a specific room ID.
	 * @param {string} pageId Page ID. If a page with the same ID is already open for that character and room, that page will be moved to the top.
	 * @param {string} ctrlId Char ID of controlled character.
	 * @param {string} roomId Room ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, room, roomState, close, layoutId) -> { component, [title], [onClose], [closeIcon] }
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.openPanel] Flag to tell if the panel should be opened when opening the page.
	 * @param {function} [opt.onClose] Callback called when page is closed.
 	 * @returns {function} Function that closes the page.
	 */
	openPage(pageId, ctrlId, roomId, pageFactory, opt) {
		opt = opt || {};
		let c = this.charComponents[ctrlId];
		if (!c) {
			throw new Error("No component for char " + ctrlId);
		}
		let ret = c.openPage(pageId, roomId, pageFactory, opt);
		// if (opt.openPanel) {
		// 	this.component.toggle(true);
		// }

		return ret;
	}

	// Triggers an open event that panels may be listening to.
	openPanel() {
		this.app.eventBus.emit(this, namespace + '.open');
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';

		this.ctrlModel[cb]('change', this._onCtrlChange);
		this.playerModel[cb]('change', this._onPlayerChange);
		if (on) {
			this._onCtrlChange();
		}
	}

	_setCharListener(ctrl, on) {
		if (ctrl) {
			ctrl[on ? 'on' : 'off']('change', this._onCharChange);
		}
	}

	_onCtrlChange() {
		this._listenChars(objectKeyDiff(this.charComponents, this.ctrlModel?.props));
		this._onPlayerChange();
	}

	_listenChars(change) {
		for (let charId in change) {
			let char = change[charId];
			let prev = this.charComponents[charId];
			if (char) {
				if (!prev) {
					this.charComponents[charId] = new RoomPagesChar(this.module, char, this._update);
				}
			} else if (prev) {
				prev.dispose();
				delete this.charComponents[charId];
			}
		}
	}

	_onPlayerChange(ev) {
		this._setModel(this.playerModel.activeChar);
	}

	_onCharChange(change, char) {
		if ((change && !change.hasOwnProperty('inRoom')) || char != this.model.char) return;

		this._setModel(this.model.char);
	}

	_update(ctrl) {
		// Only update the model if the character is the active one
		if (this.model.char == ctrl) {
			this._setModel(ctrl);
		}
	}

	_setModel(ctrl) {
		let page = null;
		ctrl = ctrl || null;
		let c = null;
		if (ctrl) {
			c = this.charComponents[ctrl.id];
			if (c) {
				page = c.getPage();
			}
		}
		if (this.model.char !== ctrl) {
			this._setCharListener(this.model.char, false);
			this._setCharListener(ctrl, true);
		}
		if (this.model.page === page) {
			return;
		}
		this.model.set(page
			? { char: ctrl, inRoom: ctrl.inRoom, page, factory: c ? c.createFactory() : null }
			: { char: null, inRoom: null, page: null, factory: null },
		);
	}

	dispose() {
		this._setModel(null);
		this._setListeners(false);
		this._listenChars(Object.keys(this.charComponents).map(k => undefined));
	}
}

export default RoomPages;
