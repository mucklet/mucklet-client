import { Model } from 'modapp-resource';
import CharPagesChar from './CharPagesChar';

const namespace = 'module.charPages';

/**
 * CharPages holds the char panel pages.
 */
class CharPages {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCtrlAdd = this._onCtrlAdd.bind(this);
		this._onCtrlRemove = this._onCtrlRemove.bind(this);
		this._onActiveChange = this._onActiveChange.bind(this);
		this._onUpdate = this._onUpdate.bind(this);

		this.app.require([
			'api',
			'player',
			'charPagesStore',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { page: null, factory: null }});
		this.chars = {};

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
	 * Sets the component factory function for creating the default char page.
	 * @param {function} pageFactory Page factory callback function: function(ctrl, char, panelState) -> { component, [title], [onClose], [closeIcon] }
	 * @returns {this}
	 */
	setDefaultPageFactory(pageFactory) {
		this.defaultPageFactory = pageFactory;
		return this;
	}

	/**
	 * Gets the default page component factory function.
	 * @returns {?function} Component factory callback function: function(ctrl, char, panelState) -> { component, [title], [onClose], [closeIcon] }
	 */
	getDefaultPageFactory() {
		return this.defaultPageFactory;
	}

	/**
	 * Opens a in-panel page set to a specific char ID.
	 * @param {string} ctrlId Char ID of controlled character.
	 * @param {string} charId Char ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, char, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {function} [onClose] Optional callback called on page close.
 	 * @returns {function} Function that closes the page.
	 */
	openPage(ctrlId, charId, pageFactory, onClose) {
		let c = this.chars[ctrlId];
		if (!c) {
			throw new Error("No controlled char " + charId);
		}
		return c.addPage(charId, pageFactory, onClose);
	}

	// Triggers an open event that panels may be listening to.
	openPanel() {
		this.app.eventBus.emit(this, namespace + '.open');
	}

	_setListeners(on) {
		let p = this.module.player;
		let cb = on ? 'on' : 'off';
		p[cb]('ctrlAdd', this._onCtrlAdd);
		p[cb]('ctrlRemove', this._onCtrlRemove);
		p[cb]('activeChange', this._onActiveChange);
	}

	_onCtrlAdd(ev) {
		let char = ev.char;
		this.chars[char.id] = new CharPagesChar(this.module, char, this._onUpdate);
	}

	_onCtrlRemove(ev) {
		let c = this.chars[ev.char.id];
		delete this.chars[ev.char.id];
		c.dispose();
	}

	_onActiveChange() {
		this._setPage();
	}

	_onUpdate(charId) {
		let active = this.module.player.getActiveChar();
		if (active && active.id === charId) {
			this._setPage();
		}
	}

	_setPage() {
		let active = this.module.player.getActiveChar();
		if (!active) {
			this._setModel();
			return;
		}

		let panelChar = this.chars[active.id];
		// Quick exit if the panelChar isn't created yet.
		if (!panelChar) {
			return;
		}
		let page = panelChar.getPage();
		if (this.model.page == page) {
			return;
		}

		this._setModel(active, page, panelChar.createFactory(page));

	}

	_setModel(char, page, factory) {
		this.model.set({
			char: char || null,
			page: page || null,
			factory: factory || null
		});
	}

	dispose() {
		this._setListeners(false);
		this._setModel();
		this.chars = {};
	}
}

export default CharPages;
