import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import './playerTabs.scss';
import PlayerTabsTabs from './PlayerTabsTabs';

function getPageIdx(pageId, pages) {
	if (pageId) {
		for (let i = 0; i < pages.length; i++) {
			if (pages[i].id === pageId) {
				return i;
			}
		}
	}
	return -1;
};

/**
 * PlayerTabs draws the player tabs for mobile layout and for desktop realm panel.
 */
class PlayerTabs {
	constructor(app, params) {
		this.app = app;

		this._init();
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.tabs = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.model = new Model({
			data: {
				tabId: null,
				page: null,
				pageIdx: 0,
				factory: null,
				defaultTab: null,
			},
			eventBus: this.module.self.app.eventBus,
		});

		this.state = {};
		this.tabPages = {};
		this.nullPages = [];
	}

	getModel() {
		return this.model;
	}

	getCurrentTab() {
		return this.model.tabId;
	}

	/**
	 * Open a tab.
	 * @param {string} tabId Tab ID. If null of missing, all tabs will be closed.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 */
	openTab(tabId, reset) {
		tabId = tabId || null;
		let tab = this.tabs.get(tabId);
		if (!tab) {
			this.closeTabs();
			return;
		}
		let pages = this._getTabPages(tab);
		if (reset) {
			this._closePages(tabId);
		}
		let pageIdx = pages.length - 1;
		this._setModel(tabId, pages[pageIdx], pageIdx);
		this._closePages(null);
	}

	/**
	 * Opens a page not attached to any given tab.
	 * @param {string} pageId Tab page ID. If a page with the same ID is already open on the tab, that page will be moved to the top.
	 * @param {function} pageFactory Page factory callback function: function(state, close, layoutId) -> { component: {Component}, [title]: {string|LocaleString}, [close]: {function}, [closeIcon]: {string} }
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.reset] Flag if the tab should be opened upon the default page, closing all others. Defaults to false.
	 * @param {function} [opt.beforeClose] Callback called before closing a page. If the beforeClose is set, the provided close method must be called for the page to close: function(close)
	 * @param {function} [opt.onClose] Callback called when page is closed: function()
	 * @returns {function} Close function for the tab page. If force is true, the page will be closed without calling beforeClose: function(force)
	 */
	openPage(pageId, pageFactory, opt) {
		return this.openTabPage(null, pageId, pageFactory, opt);
	}

	/**
	 * Opens a page on a given tab.
	 * @param {string} tabId Tab ID.
	 * @param {string} pageId Tab page ID. If a page with the same ID is already open on the tab, that page will be moved to the top.
	 * @param {function} pageFactory Page factory callback function: function(state, close, layoutId) -> { component: {Component}, [title]: {string|LocaleString}, [closeIcon]: {string} }
	 * @param {object} [opt] Optional parameters.
	 * @param {bool} [opt.reset] Flag if the tab should be opened upon the default page, closing all others. Defaults to false.
	 * @param {function} [opt.beforeClose] Callback called before closing a page. If the beforeClose is set, the provided close method must be called for the page to close: function(close)
	 * @param {function} [opt.onClose] Callback called when page is closed: function()
	 * @returns {function} Close function for the tab page. If force is true, the page will be closed without calling beforeClose: function(force)
	 */
	openTabPage(tabId, pageId, pageFactory, opt) {
		tabId = tabId || null;
		opt = opt || {};
		let tab = this.tabs.get(tabId);
		let pages = this._getTabPages(tab);
		let firstIdx = tab ? 1 : 0;
		// Check if page with that ID already existed
		let pageIdx = getPageIdx(pageId, pages);
		if (opt.reset) {
			this._closePages(tabId, pageId);
		} else if (pageIdx >= firstIdx && i < pages.length - 1) {
			// Move page from stack to end.
			pages.push(pages.splice(pageIdx, 1)[0]);
		}

		// If we are opening an non-tabbed page, if we had a tab opened before,
		// store the tabId as a 'reference' page.
		if (!tab && !pages.length && this.model.tabId) {
			pages.push({ refTabId: this.model.tabId });
		}

		// If we didn't have page before, add it.
		if (pageIdx < 0) {
			let close = () => this._closePage(tabId, pageId, true);
			pages.push({
				id: pageId,
				state: {},
				factory: pageFactory,
				close: opt.beforeClose
					? force => force ? close : opt.beforeClose(close)
					: close,
				onClose: opt.onClose,
			});
		}

		// When switching to a tab, all other non-tabbed pages are closed
		if (tab) {
			this._closePages(null);
		}

		pageIdx = pages.length - 1;
		let page = pages[pageIdx];
		this._setModel(tabId, page, pageIdx);

		return page.close;
	}

	/**
	 * Closes all tabs so that no tab is selected.
	 */
	closeTabs() {
		this._setModel(null, null, 0);
	}

	/**
	 * Gets a collection of tabs.
	 * @returns {Collection} Collection of tabs.
	 */
	getTabs() {
		return this.tabs;
	}

	getTabDirection(beforeTabId, afterTabId) {
		if (beforeTabId === afterTabId || !beforeTabId || !afterTabId) {
			return 0;
		}

		return this._getTabIdx(afterTabId) - this._getTabIdx(beforeTabId);
	}

	/**
	 * Registers a realm tab.
	 * @param {object} tab Tab object
	 * @param {string} tab.id Tab ID.
	 * @param {number} tab.sortOrder Sort order.
	 * @param {function} tab.tabFactory Tab component factory: function(click) -> Component
	 * @param {function} tab.factory Tab component factory: function(state, close) ->  { component: {Component}, [title]: {string|LocaleString}, [closeIcon]: {string} }
	 * @param {string|LocaleString} tab.title Tab title
	 * @param {boolean} isDefault Flag marking the tab as default.
	 * @returns {this}
	 */
	addTab(tab, isDefault) {
		if (this.tabs.get(tab.id)) {
			throw new Error("Tab ID already registered: ", tab.id);
		}
		this.tabs.add(tab);
		if (isDefault) {
			this.model.set({ defaultTab: tab.id });
		}
		return this;
	}

	/**
	 * Unregisters a previously registered tab.
	 * @param {string} tabId Tab ID.
	 * @returns {this}
	 */
	removeTab(tabId) {
		let tab = this.tabs.get(tabId);
		if (tab) {
			this.tabs.remove(tabId);
			if (this.model.defaultTab == tab.id) {
				this.model.set({ defaultTab: null });
			}
		}
		return this;
	}

	/**
	 * Creates an instance of PlayerTabsTabs.
	 * @param {object} [opt] Optional parameters as defined by CollectionList.
	 * @param {boolean} [opt.closeOnReselect] Flag to close tabs when clicking on a tab that is already selected. Defaults to false.
	 * @returns {PlayerTabsTabs} Tabs component.
	 */
	newTabs(opt) {
		return new PlayerTabsTabs(this.module, opt);
	}

	getDefaultTabFactory() {
		let tabId = this.model.defaultTab;
		if (tabId) {
			let tab = this.tabs.get(this.model.defaultTab);
			if (tab) {
				let page = this._getTabPages(tab)[0];
				return layoutId => page.factory(page.state, page.close, layoutId);
			}
		}
		return null;
	}

	_setModel(tabId, page, pageIdx) {
		tabId = tabId || null;
		page = page || null;
		pageIdx = pageIdx && pageIdx > 0 ? pageIdx : 0;
		let factory = this.model.factory || null;
		if (this.model.page !== page) {
			factory = page
				? layoutId => page.factory(page.state, page.close, layoutId)
				: null;
		}
		this.model.set({ tabId, page: page, pageIdx, factory });
	}

	_closePage(tabId, pageId, updateModel) {
		tabId = tabId || null;
		let tab = this.tabs.get(tabId);
		let pages = this._getTabPages(tab);
		// Check if page with that ID already existed
		let pageIdx = getPageIdx(pageId, pages);

		// Assert page is found
		if (pageIdx < 0) {
			return;
		}

		let page = pages.splice(pageIdx, 1)[0];
		if (updateModel && this.model.tabId === tabId) {
			if (pages.length) {
				let i = pages.length - 1;
				let nextPage = pages[i];
				if (nextPage.refTabId) {
					pages.pop();
					this.openTab(nextPage.refTabId);
				} else {
					this._setModel(tabId, pages[i], i);
				}
			} else {
				this.closeTabs();
			}
		}

		if (page.onClose) {
			page.onClose();
		}
	}

	_closePages(tabId, skipPageId) {
		// Close all other pages
		tabId = tabId || null;
		let tab = this.tabs.get(tabId);
		let pages = this._getTabPages(tab);
		let firstIdx = tab ? 1 : 0;
		for (let i = pages.length - 1; i >= firstIdx; i--) {
			if (pages[i].id !== skipPageId) {
				this._closePage(tabId, pages[i].id);
			}
		}
	}

	_getTabPages(tab) {
		if (!tab) {
			return this.nullPages;
		}
		let pages = this.tabPages[tab.id];
		if (!pages) {
			pages = [{
				id: null,
				state: {},
				factory: tab.factory,
				close: () => this.closeTabs(),
			}];
			this.tabPages[tab.id] = pages;
		}

		return pages;
	}

	_getTabIdx(tabId) {
		let idx = 0;
		for (let tab of this.tabs) {
			if (tab.id == tabId) {
				return idx;
			}
			idx++;
		}
		return -1;
	}

	dispose() {
		this.module.mobileLayout.setNode('topbar', null);
	}
}

export default PlayerTabs;
