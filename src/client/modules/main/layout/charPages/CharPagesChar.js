import { Model } from 'modapp-resource';

/**
 * CharPagesChar holds information about a charPages for a character on char panel.
 */
class CharPagesChar {

	/**
	 * Creates an instance of CharPagesChar.
	 * @param {object} module Modapp modules.
	 * @param {Model} ctrl Controlled character.
	 * @param {function} update Callback to call whenever a model changes so that it may affect which component to show.
	 */
	constructor(module, ctrl, update) {
		this.module = module;
		this.ctrl = ctrl;
		this.update = update;

		this.lookingAt = undefined;
		this.charId = null;
		this.char = undefined;
		this.charPages = {};
		this.state = {};

		// Models is a map of Model for chars
		this.models = {};
		this.model = null;

		// Bind callback
		this._onCtrlChange = this._onCtrlChange.bind(this);
		this._onLookAtChange = this._onLookAtChange.bind(this);
		this._onCharChange = this._onCharChange.bind(this);

		this._setCtrlListeners(true);
		this._onCtrlChange();
	}

	/**
	 * Adds a page to a specific look at char ID.
	 * @param {string} charId Char ID
	 * @param {function} pageFactory Page factory callback function: function(ctrl, char, roomState, close) -> { component, [title], [onClose], [closeIcon] }
	 * @param {function} [onClose] Optional callback called on page close.
 	 * @returns {function} Function that closes the page.
	 */
	addPage(charId, pageFactory, onClose) {
		let pages = this.charPages[charId];
		if (!pages) {
			pages = [];
			this.charPages[charId] = pages;
		}

		let page = { factory: pageFactory, state: {}, onClose };
		page.close = this._closePage.bind(this, charId, page);
		pages.push(page);
		if (charId === this.charId) {
			this.update(this.ctrl.id);
		}
		return page.close;
	}

	/**
	 * Gets the page for the char currently looked at.
	 * @returns {object} Page object.
	 */
	getPage() {
		let pages = this.charPages[this.charId];
		return pages
			? pages[pages.length - 1]
			: this.charPage;
	}

	/**
	 * Creates a new component object for a page.
	 * @param {object} page Page object
	 * @returns {object} Object with component: { component, [title], [onClose], [closeIcon] }
	 */
	createFactory(page) {
		return (layoutId) => page.factory(this.ctrl, this.model, page.state, page.close, layoutId);
	}

	_setCtrlListeners(on) {
		this.ctrl[on ? 'on' : 'off']('change', this._onCtrlChange);
	}

	_setLookAtListeners(on) {
		if (this.lookingAt) {
			this.lookingAt[on ? 'on' : 'off']('change', this._onLookAtChange);
		}
	}

	_setCharListeners(on) {
		if (this.char) {
			this.char[on ? 'on' : 'off']('change', this._onCharChange);
		}
	}

	_onCtrlChange(change) {
		if (this.ctrl.lookingAt === this.lookingAt) return;

		// Stop listening to previous and start listening to new
		this._setLookAtListeners(false);
		this.lookingAt = this.ctrl.lookingAt;
		this._setLookAtListeners(true);

		this._onLookAtChange();
	}

	_onLookAtChange() {
		let l = this.lookingAt;
		if (l && l.charId !== this.ctrl.id) {
			this._setChar(l.charId, l.char || l.unseen, !!l.char);
		} else {
			this._setChar(this.ctrl.id, this.ctrl, true);
		}
	}

	_onCharChange(change, m) {
		if (m === this.char) {
			this._updateModel();
		}
	}

	_setChar(charId, char, seen) {
		if (char === this.char) {
			return;
		}

		this._setCharListeners(false);
		this.char = char;
		this.isSeen = seen;
		this.model = this._getModel(charId);
		this._updateModel();
		this._setCharListeners(true);

		// Did we switch character we are looking at?
		if (this.charId !== charId) {
			this.charId = charId;
			this.charPage = {
				factory: this.module.self.getDefaultPageFactory(),
				state: this.state,
				close: null,
			};
			this.update(this.ctrl.id);
		}
	}

	_getModel(charId) {
		let m = this.models[charId];
		if (!m) {
			m = new Model({ eventBus: this.module.self.app.eventBus });
			this.models[charId] = m;

			if (!this.isSeen) {
				this.module.charPagesStore.getChar(this.ctrl.id, charId).then(char => {
					// Make sure we haven't gotten an update since trying to fetch
					if (!m.timestamp) {
						m.set(char);
					}
				});
			}
		}
		return m;
	}

	_updateModel() {
		if (!this.char) return;

		let props = this.char.props;
		if (this.isSeen) {
			let c = this.char;
			let timestamp = Date.now();
			this.module.charPagesStore.setChar(this.ctrl.id, {
				id: c.id,
				image: c.image ? c.image.toJSON() : null,
				desc: c.desc,
				about: c.about,
				timestamp,
			});
			props = Object.assign({ timestamp }, props);
		}
		this.model.set(props);
	}

	_closePage(charId, page) {
		let pages = this.charPages[charId];
		if (pages) {
			for (let i = 0; i < pages.length; i++) {
				if (pages[i] == page) {
					if (pages.length == 1) {
						delete this.charPages[charId];
					} else {
						pages.splice(i, 1);
					}
					break;
				}
			}
		}

		if (this.charId === charId) {
			this.update(this.ctrl.id);
		}

		if (page.onClose) {
			page.onClose();
		}
	}

	dispose() {
		this._setCharListeners(false);
		this._setLookAtListeners(false);
		this._setCtrlListeners(false);
		this.char = undefined;
		this.lookingAt = undefined;
		this.ctrl = null;
	}
}

export default CharPagesChar;
