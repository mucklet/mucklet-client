import { Model } from 'modapp-resource';
import Panel from 'components/Panel';
import './charPanel.scss';

/**
 * CharPanel draws player char menu.
 */
class CharPanel {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onCharPagesChange = this._onCharPagesChange.bind(this);
		this._onModelChange = this._onModelChange.bind(this);
		this._onCharPanelOpen = this._onCharPanelOpen.bind(this);

		this.app.require([
			'activePanel',
			'charPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({
			data: Object.assign({ pageInfo: null }, this.module.charPages.getModel().props),
			eventBus: this.module.self.app.eventBus,
		});
		this.component = new Panel("", null, { align: 'left', className: 'charpanel' });

		this.module.activePanel.setNode('charPanel', this.component);
		this._setListeners(true);
		this._onCharPagesChange();
		this._onModelChange();
	}

	/**
	 * Toggles the panel between open or close.
	 * @param {bool} open State to toggle to. Defaults to toggle between open and close.
	 * @returns {this}
	 */
	toggle(open) {
		this.component.toggle(open);
		return this;
	}

	_setListeners(on) {
		let cb = on ? 'on' : 'off';
		this.module.charPages.getModel()[cb]('change', this._onCharPagesChange);
		this.model[cb]('change', this._onModelChange);
		this.module.charPages[cb]('open', this._onCharPanelOpen);
	}

	_onCharPagesChange(change) {
		if (!change || change.hasOwnProperty('factory')) {
			let m = this.module.charPages.getModel();
			let factory = m.factory;
			this.model.set(Object.assign({
				pageInfo: factory
					? factory('desktop')
					: null,
			}, m.props));
		}
	}

	_onModelChange(change) {
		if (change && !change.hasOwnProperty('pageInfo')) {
			return;
		}


		let m = this.model;
		let pi = m.pageInfo;
		let page = m.page;

		if (!pi) {
			this.component.setTitle("").setButton(null).setComponent(null);
			return;
		}

		this.component
			.setTitle(pi.title || '')
			.setButton(pi.close || (page && page.close) || null, pi.closeIcon || 'chevron-circle-left')
			.setComponent(pi.component, {
				onRender: () => {
					// Restore scrolling of page
					let sb = this.component.getSimpleBar();
					if (sb) {
						sb.getScrollElement().scrollTop = page.state.scrollTop || 0;
					}
				},
				onUnrender: () => {
					// Store scrolling of page
					let sb = this.component.getSimpleBar();
					if (sb) {
						page.state.scrollTop = sb.getScrollElement().scrollTop;
					}
				},
			});
	}

	_onCharPanelOpen() {
		this.toggle(true);
	}

	dispose() {
		this._setListeners(false);
		this.module.activePanel.setNode('charPanel', null);
	}
}

export default CharPanel;
