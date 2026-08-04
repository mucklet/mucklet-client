import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PageAreaComponent from './PageAreaComponent';
import PageAreaImage from './PageAreaImage';
import { areaInfo } from './pageAreaTxt';
import { alpha } from 'utils/color';
import './pageArea.scss';

const themeTokens = [
	{ keyPrefix: 'pagearea', name: l10n.l('pagearea.pageAreaTokens', "Area page module tokens"), sortOrder: 1020 },
	{ key: 'pagearea.image.location.border', value: (getToken) => alpha(getToken('color.danger.300'), 0.6), type: 'rgba' },
	{ key: 'pagearea.image.location.border.selected', value: (getToken) => alpha(getToken('color.danger.300'), 0.8), type: 'rgba' },
];

/**
 * PageArea opens an in-panel edit room page in the room panel.
 */
class PageArea {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'roomPages',
			'player',
			'theme',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.theme.addTokens(themeTokens);

		this.tools = new Model({ eventBus: this.app.eventBus });
		this.module.roomPages.setDefaultAreaPageFactory({
			componentFactory: (ctrl, area, state, layout) => ({
				component: new PageAreaComponent(this.module, ctrl, area, state, layout),
				title: areaInfo,
			}),
		});
	}

	/**
	 * Gets a model of tools.
	 * @returns {Model} Model of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers an area page tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(ctrl, area) -> Component
	 * @param {number} [tool.filter] Filter function: function(ctrl, area) -> bool
	 * @param {string} [tool.type] Target type. May be 'area'. Defaults to 'area';
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.props[tool.id]) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.set({ [tool.id]: tool });
		return this;
	}

	/**
	 * Unregisters a previously registered tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeTool(toolId) {
		this.tools.set({ [toolId]: undefined });
		return this;
	}

	/**
	 * Creates a new PageArea image component.
	 * @param {Model} ctrl Controlled character.
	 * @param {string} areaId Id of area to show.
	 * @param {Model} image Image model.
	 * @param {AreaChildrenModel} children Area children model.
	 * @param {Model} selectedModel Model with a selected property.
	 * @param {object} state State object.
	 * @param {object} [opt] Optional parameters.
 	 * @returns {Component} Area map image component.
	 */
	newImage(ctrl, areaId, image, children, selectedModel, state, opt) {
		return new PageAreaImage(this.module, ctrl, areaId, image, children, selectedModel, state, opt);
	}

	dispose() {
		this.module.roomPages.setDefaultAreaPageFactory(null);
		this.module.theme.removeTokens(themeTokens);
	}
}

export default PageArea;
