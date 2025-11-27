import { Collection } from 'modapp-resource';
import compareSortOrderId from 'utils/compareSortOrderId';
import PageRoomComponent from './PageRoomComponent';
import PageRoomChar from './PageRoomChar';
import PageRoomExits from './PageRoomExits';

import { roomInfo } from './pageRoomTxt';
import './pageRoom.scss';

/**
 * PageRoom sets the default page in the room panel.
 */
class PageRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'roomPages',
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

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: compareSortOrderId,
			eventBus: this.app.eventBus,
		});
		this.module.roomPages.setDefaultRoomPageFactory({
			componentFactory: (ctrl, room, state, layout) => ({
				component: new PageRoomComponent(this.module, ctrl, room, state, layout),
				title: roomInfo,
			}),
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
	 * @param {(ctrl: CtrlChar, room: RoomModel, state: object, roomState: object) => Component} tool.componentFactory Tool component factory.
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

	/**
	 * Creates a new PageRoomExits collection component.
	 * @param {Model} ctrl Controlled character.
	 * @param {Collection} exits Exits collection
	 * @param {object} [opt] Optional params
	 * @param {(exitId: string, ev: object) => void} [opt.onExitClick] Callback called on exit click. Defaults to using the exit.
	 * @param {boolean} [opt.clickTooltip] Flag to enable custom tooltip to be opened when clicking on a character.
	 * @returns {Component} PageRoomExits component.
	 */
	newRoomExits(ctrl, exits, opt) {
		return new PageRoomExits(this.module, ctrl, exits, opt);
	}

	dispose() {
		this.module.roomPages.setDefaultRoomPageFactory(null);
	}
}

export default PageRoom;
