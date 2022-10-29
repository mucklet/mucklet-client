import { Elem } from 'modapp-base-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import Fader from 'components/Fader';
import ActivePanelPlaceholder from './ActivePanelPlaceholder';
import './activePanel.scss';

/**
 * ActivePanel draws the active character area.
 */
class ActivePanel {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'layoutDesktop',
			'player',
			'api',
			'info',
		], this._init.bind(this));

		// Bind callbacks
		this._onActiveChange = this._onActiveChange.bind(this);
	}

	_init(module) {
		this.module = Object.assign({ activePanel: this }, module);
		this.playerModel = this.module.player.getModel();

		this.overlays = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus
		});
		this.renderedOverlays = {};

		this.info = this.module.info.getCore();

		this.elem = new Elem(n => n.elem('div', { className: 'activepanel' }, [
			n.component('charPanel', new Fader(null, { className: 'activepanel--charpanel' })),
			n.elem('main', 'div', { className: 'activepanel--main' }, [
				n.component('logPanel', new Fader(null, { className: 'activepanel--logpanel' })),
				n.component('consolePanel', new Fader(null, { className: 'activepanel--consolepanel' })),
			]),
			n.component('roomPanel', new Fader(null, { className: 'activepanel--roompanel' }))
		]));

		this._setListeners(true);
		this._onActiveChange();
	}

	setNode(node, component) {
		this.elem.getNode(node).setComponent(component);
	}

	render(el) {
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
		this.playerModel[on ? 'on' : 'off']('change', this._onActiveChange);
	}

	_onActiveChange(changed) {
		if (changed && !changed.hasOwnProperty('activeChar')) {
			return;
		}
		this.module.layoutDesktop.setNode('activePanel', this.playerModel.activeChar ? this : new ActivePanelPlaceholder(this.module, this.info));
	}


	dispose() {
		this.module.layoutDesktop.setActivePanel(null);
		if (this.info) {
			this.info.dispose();
			this.info = null;
		}
	}
}

export default ActivePanel;
