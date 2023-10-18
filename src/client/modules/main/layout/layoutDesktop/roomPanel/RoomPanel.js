import { Model } from 'modapp-resource';
import Panel from 'components/Panel';
import './roomPanel.scss';

/**
 * RoomPanel draws player room panel.
 */
class RoomPanel {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onRoomPagesChanges = this._onRoomPagesChanges.bind(this);
		this._onModelChange = this._onModelChange.bind(this);
		this._onRoomPanelOpen = this._onRoomPanelOpen.bind(this);

		this.app.require([
			'activePanel',
			'roomPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({
			data: Object.assign({ pageInfo: null }, this.module.roomPages.getModel().props),
			eventBus: this.module.self.app.eventBus,
		});
		this.component = new Panel("", null, { align: 'right', className: 'roompanel' });

		this.module.activePanel.setNode('roomPanel', this.component);
		this._setListeners(true);
		this._onRoomPagesChanges();
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
		this.module.roomPages.getModel()[cb]('change', this._onRoomPagesChanges);
		this.model[cb]('change', this._onModelChange);
		this.module.roomPages[cb]('open', this._onRoomPanelOpen);
	}

	_onRoomPagesChanges(change) {
		if (!change || change.hasOwnProperty('factory')) {
			let m = this.module.roomPages.getModel();
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
			.setButton(pi.close || (page && page.close) || null, pi.closeIcon || (page && page.closeIcon) || 'chevron-circle-left')
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

	_onRoomPanelOpen() {
		this.toggle(true);
	}

	dispose() {
		this._setListeners(false);
		this.module.activePanel.setNode('roomPanel', null);
	}
}

export default RoomPanel;
