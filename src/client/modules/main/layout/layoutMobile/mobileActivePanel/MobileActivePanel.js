import { Elem } from 'modapp-base-component';
import { Collection, Model, sortOrderCompare } from 'modapp-resource';
import Fader from 'components/Fader';
import MobileActivePanelPlaceholder from './MobileActivePanelPlaceholder';
import './mobileActivePanel.scss';

/**
 * MobileActivePanel draws the active character area.
 */
class MobileActivePanel {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'layoutMobile',
			'player',
			'api',
			'info',
			'charPages',
			'roomPages',
			'layout',
			'charLog',
		], this._init.bind(this));

		// Bind callbacks
		this._onActiveChange = this._onActiveChange.bind(this);
		this._onCharPanelOpen = this._setModelIfMobile.bind(this, true, false);
		this._onCharPanelClose = this._orModelIfMobile.bind(this, false, true);
		this._onRoomPanelOpen = this._setModelIfMobile.bind(this, false, true);
		this._onRoomPanelClose = this._orModelIfMobile.bind(this, true, false);

	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.playerModel = this.module.player.getModel();

		this.model = new Model({ data: {
			charPanelOpen: false,
			roomPanelOpen: false,
		}, eventBus: this.app.eventBus });

		this.overlays = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus
		});
		this.renderedOverlays = {};

		this.info = this.module.info.getCore();
		this.isHidden = false;

		this.elem = new Elem(n => n.elem('div', { className: 'mobileactivepanel' }, [
			n.elem('main', 'div', { className: 'mobileactivepanel--main' }, [
				n.component('charPanel', new Fader(null, { className: 'mobileactivepanel--charpanel' })),
				n.component('roomPanel', new Fader(null, { className: 'mobileactivepanel--roompanel' })),
				n.component('logPanel', new Fader(null, { className: 'mobileactivepanel--logpanel' })),
			]),
			n.component('consolePanel', new Fader(null, { className: 'mobileactivepanel--consolepanel' })),
		]));

		this._setListeners(true);
		this._onActiveChange();
	}

	setNode(node, component) {
		this.elem.getNode(node).setComponent(component);
	}

	getModel() {
		return this.model;
	}

	render(el) {
		this._setCharLogHidden(true);
		let rel = this.elem.render(el);
		// Render main area overlays
		let main = this.elem.getNode('main');
		for (let overlay of this.overlays) {
			let comp = overlay.componentFactory(this.playerModel.player);
			if (comp) {
				comp.render(main);
				this.renderedOverlays[overlay.id] = comp;
			}
		}
		return rel;
	}

	unrender() {
		for (let overlayId in this.renderedOverlays) {
			this.renderedOverlays[overlayId].unrender();
		}
		this.renderedOverlays = {};
		this.elem.unrender();
		this._setCharLogHidden(false);
	}

	toggleCharPanel(open) {
		open = typeof open == 'undefined'
			? !this.model.charPanelOpen
			: !!open;
		this._setModel(open, this.model.roomPanelOpen && !open);
	}

	toggleRoomPanel(open) {
		open = typeof open == 'undefined'
			? !this.model.roomPanelOpen
			: !!open;
		this._setModel(this.model.charPanelOpen && !open, open);
	}

	/**
	 * Registers a main area overlay component.
	 * @param {object} overlay Overlay object
	 * @param {string} overlay.id Overlay ID.
	 * @param {number} overlay.sortOrder Sort order.
	 * @param {function} overlay.componentFactory Overlay component factory: function(player) -> Component
	 * @returns {this}
	 */
	addOverlay(overlay) {
		if (this.overlays.get(overlay.id)) {
			throw new Error("Overlay ID already registered: ", overlay.id);
		}
		this.overlays.add(overlay);
		return this;
	}

	/**
	 * Unregisters a previously registered main area overlay.
	 * @param {string} overlayId Overlay ID.
	 * @returns {this}
	 */
	removeOverlay(overlayId) {
		this.overlays.remove(overlayId);
		let comp = this.renderedOverlays[overlayId];
		if (comp) {
			comp.unrender();
			delete this.renderedOverlays[overlayId];
		}
		return this;
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.playerModel[cb]('change', this._onActiveChange);
		this.module.charPages[cb]('open', this._onCharPanelOpen);
		this.module.charPages[cb]('close', this._onCharPanelClose);
		this.module.roomPages[cb]('open', this._onRoomPanelOpen);
		this.module.roomPages[cb]('close', this._onRoomPanelClose);
	}

	_onActiveChange(changed) {
		if (changed && !changed.hasOwnProperty('activeChar')) {
			return;
		}
		this.module.layoutMobile.setMainComponent(this.playerModel.activeChar ? this : new MobileActivePanelPlaceholder(this.module, this.info));
	}

	_setModelIfMobile(charPanelOpen, roomPanelOpen) {
		if (this.module.layout.getCurrentLayout() == 'mobile') {
			this._setModel(charPanelOpen, roomPanelOpen);
		}
	}

	_orModelIfMobile(charPanelOpen, roomPanelOpen) {
		if (this.module.layout.getCurrentLayout() == 'mobile') {
			let m = this.model;
			this._setModel(m.charPanelOpen || charPanelOpen, m.roomPanelOpen || roomPanelOpen);
		}
	}

	_setModel(charPanelOpen, roomPanelOpen) {
		this.model.set({ charPanelOpen, roomPanelOpen });
		this._setCharLogHidden();
	}

	_setCharLogHidden(rendered) {
		rendered = typeof rendered == 'undefined' ? !!this.elem.getElement() : rendered;
		let hidden = !!(rendered && (this.model.charPanelOpen || this.model.roomPanelOpen));
		if (this.isHidden !== hidden) {
			this.isHidden = hidden;
			this.module.charLog.setIsHidden(hidden);
		}
	}

	dispose() {
		this._setListeners(false);
		this.module.layoutMobile.setMainComponent(null);
		if (this.info) {
			this.info.dispose();
			this.info = null;
		}
	}
}

export default MobileActivePanel;
