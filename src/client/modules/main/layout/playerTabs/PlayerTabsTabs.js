import { Context } from 'modapp-base-component';
import { CollectionWrapper } from 'modapp-resource';
import { CollectionList } from 'modapp-resource-component';
import PlayerTabsTab from './PlayerTabsTab';

class PlayerTabsTabs {

	/**
	 * Creates an instance of PlayerTabsTabs.
	 * @param {object} module Module object.
	 * @param {object} [opt] Optional parameters as defined by CollectionList.
	 * @param {boolean} [opt.closeOnReselect] Flag to close tabs when clicking on a tab that is already selected. Defaults to false.
	 * @param {boolean} [opt.hideDefaultTab] Flag to hide the default tab. Defaults to false.
	 */
	constructor(module, opt) {
		opt = Object.assign({ horizontal: true }, opt);
		opt.className = 'playertabs-tabs' + (opt.className ? ' ' + opt.className : '');
		this.module = module;
		this.opt = opt;

		// Bind callback
		this._onTabClick = this._onTabClick.bind(this);
		this._onModelChange = this._onModelChange.bind(this);
	}

	render(el) {
		this.elem = new Context(
			() => {
				if (this.opt.hideDefaultTab) {
					let model = this.module.self.getModel();
					model.on('change', this._onModelChange);
					return new CollectionWrapper(
						this.module.self.getTabs(),
						{
							filter: t => t.id != model.defaultTab,
							eventBus: this.module.self.app.eventBus,
						},
					);
				}
				return this.module.self.getTabs();
			},
			tabs => {
				if (this.opt.hideDefaultTab) {
					tabs.dispose();
					this.module.self.getModel().off('change', this._onModelChange);
				}
			},
			tabs => new CollectionList(
				tabs,
				m => new PlayerTabsTab(this.module, m, this._onTabClick),
				this.opt,
			),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onTabClick(tab) {
		let playerTabs = this.module.self;
		if (tab.id == playerTabs.getModel().tabId && this.opt.closeOnReselect) {
			playerTabs.closeTabs();
		} else {
			playerTabs.openTab(tab.id);
		}
	}

	_onModelChange() {
		let ctx = this.elem && this.elem.getContext();
		if (ctx) {
			ctx.refresh();
		}
	}
}

export default PlayerTabsTabs;
