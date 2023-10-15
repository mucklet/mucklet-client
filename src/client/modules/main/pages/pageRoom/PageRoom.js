import { Txt } from 'modapp-base-component';
import { Collection, sortOrderCompare } from 'modapp-resource';
import { roomInfo } from './pageRoomTxt';
import PageRoomComponent from './PageRoomComponent';
import PageRoomChar from './PageRoomChar';
import './pageRoom.scss';

/**
 * PageRoom sets the default page in the room panel.
 */
class PageRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'roomPages',
			'pageEditExit',
			'player',
			'avatar',
			'charsAwake',
			'dialogEditNote',
			'charPages',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.areaComponentFactory = null;

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.module.roomPages.setDefaultPageFactory((ctrl, state, layout) => {
			let title = new Txt(roomInfo, { tagName: 'h3', className: 'panel--titletxt' });
			return {
				component: new PageRoomComponent(this.module, ctrl, state, layout, (txt) => title.setText(txt)),
				title,
			};
		});
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a room page tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(ctrl, room) -> Component
	 * @param {number} [tool.filter] Filter function: function(ctrl, room, canEdit, canDelete, layoutId) -> bool
	 * @param {string} [tool.type] Target type. May be 'room', 'exit', or 'inRoom'. Defaults to 'room';
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.add(tool);
		return this;
	}

	/**
	 * Unregisters a previously registered tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeTool(toolId) {
		this.tools.remove(toolId);
		return this;
	}

	/**
	 * Sets the component factory function for creating the area page.
	 * @param {(ctrl: Model, area: Model, state: object, layoutId: string) => Component} areaComponentFactory Area component factory callback function
	 * @returns {this}
	 */
	setAreaComponentFactory(areaComponentFactory) {
		this.areaComponentFactory = areaComponentFactory;
		return this;
	}

	/**
	 * Gets the area component factory function.
	 * @returns {(ctrl: Model, area: Model, state: object, layoutId: string) => Component} Area component factory callback function
	 */
	getAreaComponentFactory() {
		return this.areaComponentFactory;
	}


	/**
	 * Checks if a controlled character can edit a room.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} room Room model.
	 * @returns {boolean} True if allowed to edit room, otherwise false.
	 */
	canEdit(ctrl, room) {
		return !ctrl.puppeteer && (this.module.player.isBuilder() || (room.owner && room.owner.id == ctrl.id));
	}

	/**
	 * Checks if a controlled character can delete a room.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} room Room model.
	 * @returns {boolean} True if allowed to delete room, otherwise false.
	 */
	canDelete(ctrl, room) {
		return !ctrl.puppeteer && (this.module.player.isAdmin() || (room.owner && room.owner.id == ctrl.id));
	}

	/**
	 * Creates a new PageRoomChar badge component for in room characters.
	 * @param {Model} ctrl Controlled character.
	 * @param {Model} char Character.
	 * @returns {Component} PageRoomChar component.
	 */
	newRoomChar(ctrl, char) {
		return new PageRoomChar(this.module, ctrl, char);
	}

	dispose() {
		this.module.roomPages.setDefaultPageFactory(null);
	}
}

export default PageRoom;
