import { Elem } from 'modapp-base-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import Fader from 'components/Fader';
import './layout.scss';

/**
 * Layout handles the different types of layouts.
 */
class Layout {
	constructor(app, params) {
		this.app = app;

		this.mode = typeof params.mode == 'string'
			? params.mode.toLowerCase()
			: null;

		// Bind callbacks
		this._onPlayerChange = this._onPlayerChange.bind(this);
		this._onQueryChange = this._onQueryChange.bind(this);

		this.app.require([ 'screen', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.defaultComponent = null;
		this.queries = {};
		this.queryState = {};

		this.currentLayout = null;

		this.layouts = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus
		});

		this.elem = new Elem(n => (
			n.elem('div', { className: 'layout' }, [
				n.elem('div', { className: 'layout--container' }, [
					n.component('playerPanel', new Fader(null, { className: 'layout--playerpanel' })),
					n.component('activePanel', new Fader(null, { className: 'layout--activepanel' }))
				])
			])
		));
		this.playerModel = this.module.player.getModel();
		this.playerModel.on('change', this._onPlayerChange);
		this._onPlayerChange();
	}

	getCurrentLayout() {
		return this.currentLayout;
	}

	/**
	 * Sets the default layout used when no other media queries match.
	 * @param {Component} component Layout component.
	 */
	setDefaultLayout(component) {
		this.defaultComponent = component;
		this._trySetLayout();
	}

	/**
	 * Registers a media query layout.
	 * @param {object} layout Layout object
	 * @param {string} layout.id Layout ID.
	 * @param {number} layout.sortOrder Sort order.
	 * @param {function} layout.component Layout component.
	 * @param {number} [layout.query] Media query for the layout.
	 * @returns {this}
	 */
	 addLayout(layout) {
		let id = layout.id;
		if (this.layouts.get(id)) {
			throw new Error("Layout ID already registered: ", id);
		}
		this.layouts.add(layout);
		let mql = window.matchMedia(layout.query);
		let cb = this._onQueryChange.bind(this, id);
		mql.addEventListener('change', cb);
		this.queries[id] = { mql, cb };
		this._onQueryChange(id, mql);
		return this;
	}

	/**
	 * Unregisters a previously registered layout.
	 * @param {string} layoutId Layout ID.
	 * @returns {this}
	 */
	removeLayout(layoutId) {
		let o = this.queries[k];
		if (o) {
			o.mql.removeEventListener('change', o.cb);
			deleted(this.queries[k]);
		}
		this.layouts.remove(layoutId);
		this._trySetLayout();
		return this;
	}

	_onQueryChange(k, e) {
		this.queryState[k] = e.matches;
		this._trySetLayout();
	}

	_onPlayerChange(changed) {
		if (!changed || changed.hasOwnProperty('player')) {
			this._trySetLayout();
		}
	}

	_trySetLayout() {
		if (!this.playerModel.player) {
			return;
		}

		let component = this.defaultComponent;
		let currentLayout = 'desktop';
		for (let layout of this.layouts) {
			if ((!this.mode || this.mode == 'auto')
				? this.queryState[layout.id]
				: this.mode == layout.id
			) {
				component = layout.component;
				currentLayout = layout.id;
				break;
			}
		}
		this.currentLayout = currentLayout;
		this.module.screen.setComponent(component);
	}
}

export default Layout;
