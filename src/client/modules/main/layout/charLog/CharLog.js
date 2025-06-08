import CharLogComponent from './CharLogComponent';
import { Transition } from 'modapp-base-component';
import { Model, Collection, sortOrderCompare } from 'modapp-resource';
import ResizeObserverComponent from 'components/ResizeObserverComponent';
import Err from 'classes/Err';
import getCtrlId from 'utils/getCtrlId';
import { isTargeted } from 'utils/charEvent';
import {
	msgEvent,
	sayEvent,
	methodMsgEvent,
	travelEvent,
	stopFollowEvent,
	stopLeadEvent,
} from './charLogEvents';
import CharLogEvent from './CharLogEvent';
import ErrorEvent from './ErrorEvent';
import LocalErrorEvent from './LocalErrorEvent';
import InfoEvent from './InfoEvent';
import WhisperEvent from './WhisperEvent';
import DescribeEvent from './DescribeEvent';
import PrivateDescribeEvent from './PrivateDescribeEvent';
import MessageEvent from './MessageEvent';
import SummonEvent from './SummonEvent';
import JoinEvent from './JoinEvent';
import OocEvent from './OocEvent';
import WarnEvent from './WarnEvent';
import MailEvent from './MailEvent';
import AddressEvent from './AddressEvent';
import LeadRequestEvent from './LeadRequestEvent';
import FollowRequestEvent from './FollowRequestEvent';
import FollowEvent from './FollowEvent';
import ControlRequestEvent from './ControlRequestEvent';
import DndEvent from './DndEvent';
import './charLog.scss';
import './charLogEvent.scss';
import './charLogHighlight.scss';


const componentFactories = {
	component: (charId, ev) => ev.component,
	localError: (charId, ev) => new LocalErrorEvent(charId, ev),
	error: (charId, ev) => new ErrorEvent(charId, ev),
	info: (charId, ev) => new InfoEvent(charId, ev),
	say: (charId, ev) => sayEvent(charId, ev, true),
	pose: (charId, ev) => msgEvent(charId, ev, true),
	wakeup: (charId, ev) => methodMsgEvent(charId, ev, 'wakeup'),
	sleep: (charId, ev) => methodMsgEvent(charId, ev, 'sleep'),
	leave: (charId, ev) => methodMsgEvent(charId, ev, ev.method),
	arrive: (charId, ev) => methodMsgEvent(charId, ev, ev.method),
	travel: (charId, ev) => travelEvent(charId, ev),
	whisper: (charId, ev) => new WhisperEvent(charId, ev),
	message: (charId, ev) => new MessageEvent(charId, ev),
	describe: (charId, ev) => new DescribeEvent(charId, ev),
	privateDescribe: (charId, ev) => new PrivateDescribeEvent(charId, ev),
	summon: (charId, ev, opt) => new SummonEvent(charId, ev, opt),
	join: (charId, ev, opt) => new JoinEvent(charId, ev, opt),
	ooc: (charId, ev) => new OocEvent(charId, ev),
	warn: (charId, ev) => new WarnEvent(charId, ev),
	action: (charId, ev) => msgEvent(charId, ev),
	mail: (charId, ev) => new MailEvent(charId, ev),
	address: (charId, ev) => new AddressEvent(charId, ev),
	leadRequest: (charId, ev, opt) => new LeadRequestEvent(charId, ev, opt),
	followRequest: (charId, ev, opt) => new FollowRequestEvent(charId, ev, opt),
	follow: (charId, ev, opt) => new FollowEvent(charId, ev, opt),
	stopFollow: (charId, ev, opt) => stopFollowEvent(charId, ev, opt),
	stopLead: (charId, ev, opt) => stopLeadEvent(charId, ev, opt),
	controlRequest: (charId, ev, opt) => new ControlRequestEvent(charId, ev, opt),
	dnd: (charId, ev) => new DndEvent(charId, ev),
};

// Event types that should not increase unseen counter.
const ignoreUnseen = {
	control: true,
	release: true,
};

/**
 * CharLog draws the log for characters.
 */
class CharLog {
	constructor(app, params) {
		this.app = app;

		this.initialChunkSize = params && parseInt(params.initialChunkSize) || 100;
		this.chunkSize = params && parseInt(params.chunkSize) || 20;

		// Bind callbacks
		this._onCtrlAdd = this._onCtrlAdd.bind(this);
		this._onCtrlRemove = this._onCtrlRemove.bind(this);
		this._onActiveChange = this._onActiveChange.bind(this);
		this._onOut = this._onOut.bind(this);
		this._onVisibilityChange = this._onVisibilityChange.bind(this);

		this.app.require([
			'player',
			'charLogStore',
			'layout',
			'highlightSettings',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.localId = 0;
		this.sessionId = Math.random().toString(36).substring(7);
		this.activeCharId = null;
		this.isHidden = 0;

		this.logs = {};
		this.hasMore = {};
		this.factories = {};
		this.handlers = {};
		this.controlled = null;
		this.addingEvent = {};

		this.viewport = new Model({ data: { x: 0, y: 0, width: 0, height: 0 }, eventbus: this.app.eventBus });
		this.unseen = new Model({ eventBus: this.app.eventBus });
		this.unseenTargeted = new Model({ eventBus: this.app.eventBus });
		this.menuItems = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.overlays = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});
		this.modifiers = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		for (let k in componentFactories) {
			this.addEventComponentFactory(k, componentFactories[k]);
		}

		this.transition = new Transition({ className: 'charlog' });
		this.component = new ResizeObserverComponent(this.transition, (rect) => rect && this.viewport.set(rect));
		this.charComponents = {};

		this._setListeners(true);
		document.addEventListener('visibilitychange', this._onVisibilityChange);
	}

	/**
	 * Returns the charLog component.
	 * @returns {Component} CharLog component.
	 */
	getComponent() {
		return this.component;
	}

	/**
	 * Returns the viewport model that gives the x, y, width, and height of the
	 * charlog viewport.
	 * @returns {Model} Viewport model.
	 */
	getViewportModel() {
		return this.viewport;
	}

	/**
	 * Returns the log collection for the given ctrlId.
	 * @param {string} char Controlled character.
	 * @param {number} [chunk] Chunk number. Defaults to 0;
	 * @returns {Promise.<Collection>} Promise of a log collection.
	 */
	getLog(char, chunk) {
		let ctrlId = getCtrlId(char);
		chunk = chunk || 0;
		let l = this.logs[ctrlId];
		if (!l) {
			l = [];
			this.logs[ctrlId] = l;
		}

		if (l[chunk]) {
			return l[chunk];
		}

		if (chunk > l.length) {
			throw new Error("Cannot read log chunk " + String(chunk) + " before reading chunk " + String(chunk - 1));
		}

		if (chunk && !this.hasMore[ctrlId]) {
			return Promise.resolve(null);
		}

		l[chunk] = (chunk > 0
			? l[chunk - 1]
			: Promise.resolve(null)
		).then(prevBlock => {
			let lastEv = null;
			if (prevBlock) {
				lastEv = Array.isArray(prevBlock) ? prevBlock[0] : prevBlock.atIndex(0);
			}

			let started = !lastEv;
			let hasMore = false;
			let events = [];
			let chunkSize = chunk ? this.chunkSize : this.initialChunkSize;
			return this.module.charLogStore.getEvents(ctrlId, lastEv ? lastEv.time : null, ev => {
				// Skip events with identical timestamps, until we've passed last event.
				if (!started) {
					if (lastEv.time > ev.time) {
						started = true;
					} else {
						if (lastEv.id == ev.id) {
							started = true;
						}
						return;
					}
				}
				if (events.length >= chunkSize) {
					hasMore = true;
					return false;
				}

				// Add the event
				events.unshift(ev);
			}).catch(err => {
				console.error("[CharLog] Failed to load log for char " + ctrlId + " (" + chunk + "): ", err);
			}).then(() => {
				this.hasMore[ctrlId] = hasMore;
				return chunk
					? events
					: new Collection({ data: events, eventBus: this.app.eventBus });
			});
		});

		return l[chunk];
	}

	/**
	 * Returns the unseen model.
	 * @returns {Model} Model where the key is the char ID and value is numbers of unseen log entries.
	 */
	getUnseen() {
		return this.unseen;
	}

	/**
	 * Returns the unseen targeted model.
	 * @returns {Model} Model where the key is the char ID and value is numbers of unseen targeted log entries.
	 */
	getUnseenTargeted() {
		return this.unseenTargeted;
	}

	/**
	 * Adds a component to a character log, generating a local event ID.
	 * @param {string} char Controlled character.
	 * @param {string} type Event type.
	 * @param {Component} component Component.
	 * @param {object}[opt] Optional params.
	 * @param {Date} [opt.time] Optional timestamp. Defaults to now.
	 * @param {boolean} [opt.noMenu] Optional noMenu flag. Defaults to true.
	 */
	logComponent(char, type, component, opt) {
		this.getLog(char).then(l => l.add({
			id: this._getLogId(),
			type,
			time: this._getTimestamp(l, opt?.time),
			component,
			noMenu: opt && opt.hasOwnProperty('noMenu') ? opt.noMenu : true,
			noReport: true,
		}));
	}

	/**
	 * Adds an info event to a character log, generating a local event ID.
	 * @param {string} char Controlled character.
	 * @param {string|LocaleString} msg Info message.
	 * @param {object}[opt] Optional params.
	 * @param {Date} [opt.time] Optional timestamp. Defaults to now.
	 * @param {boolean} [opt.noMenu] Optional noMenu flag. Defaults to true.
	 */
	logInfo(char, msg, opt) {
		this.getLog(char).then(l => l.add({
			id: this._getLogId(),
			type: 'info',
			time: this._getTimestamp(l, opt?.time),
			msg,
			noMenu: opt && opt.hasOwnProperty('noMenu') ? opt.noMenu : true,
			noReport: true,
		}));
	}

	/**
	 * Adds a local error event to a character log, generating a local event ID.
	 * @param {string} char Controlled character.
	 * @param {object} err Error object with a message property.
	 * @param {object}[opt] Optional params.
	 * @param {Date} [opt.time] Optional timestamp. Defaults to now.
	 * @param {boolean} [opt.noMenu] Optional noMenu flag. Defaults to true.
	 */
	logError(char, err, opt) {
		this.getLog(char).then(l => l.add({
			id: this._getLogId(),
			type: 'localError',
			time: this._getTimestamp(l, opt?.time),
			error: err,
			noMenu: opt && opt.hasOwnProperty('noMenu') ? opt.noMenu : true,
			noReport: true,
		}));
	}

	getEventComponentFactory(typ) {
		return this.factories[typ];
	}

	addEventComponentFactory(typ, factory) {
		if (this.factories[typ]) {
			throw new Error(typ + " already registered.");
		}
		this.factories[typ] = factory;
		return this;
	}

	removeEventComponentFactory(typ) {
		delete this.factories[typ];
		return this;
	}

	/**
	 * Adds an event handler.
	 * @param {string} typ Event type.
	 * @param {function} callback Callback function: function(charId, ev)
	 * @returns {this}
	 */
	addEventHandler(typ, callback) {
		let hs = this.handlers[typ];
		if (!hs) {
			hs = [];
			this.handlers[typ] = hs;
		}
		hs.push(callback);
		return this;
	}

	/**
	 * Removes an event handler.
	 * @param {string} typ Event type.
	 * @param {function} callback Registered callback function
	 * @returns {this}
	 */
	removeEventHandler(typ, callback) {
		let hs = this.handlers[typ];
		if (hs) {
			let idx = hs.indexOf(callback);
			if (idx >= 0) {
				if (hs.length == 1) {
					delete this.handlers[typ];
				} else {
					hs.splice(idx, 1);
				}
			}
		}
		return this;
	}

	/**
	 * Adds an item to the char log event menu.
	 * @param {object} menuItem  Menu item object.
	 * @param {string} menuItem.id Menu item ID. Eg. 'reportAbuse'
	 * @param {LocaleString} menuItem.name Display name. Eg. l10n.l('example.reportAbuse', "Report abuse")
	 * @param {string} menuItem.icon Icon name as passed to FAIcon.
	 * @param {function} menuItem.onClick Callback called on click.
	 * @param {function} [menuItem.filter] Filter callback function: (charId, ev) => boolean
	 * @param {number} [menuItem.sortOrder] Sort order number.
	 * @returns {this}
	 */
	addMenuItem(menuItem) {
		if (this.menuItems.get(menuItem.id)) {
			throw new Error("Menu item ID already registered: ", menuItem.id);
		}
		this.menuItems.add(menuItem);
		return this;
	}

	/**
	 * Unregisters a previously registered menu item..
	 * @param {string} menuItemId Menu item ID.
	 * @returns {this}
	 */
	removeMenuItem(menuItemId) {
		this.menuItems.remove(menuItemId);
		return this;
	}

	/**
	 * Gets a collection of registered menu items.
	 * @returns {Collection} Collection of registered menu items.
	 */
	getMenuItems() {
		return this.menuItems;
	}

	/**
	 * Registers a char log overlay component.
	 * @param {object} overlay Overlay object
	 * @param {string} overlay.id Overlay ID.
	 * @param {number} overlay.sortOrder Sort order.
	 * @param {function} overlay.componentFactory Overlay component factory: function(ctrl) -> Component
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
	 * Unregisters a previously registered char log overlay.
	 * @param {string} overlayId Overlay ID.
	 * @returns {this}
	 */
	removeOverlay(overlayId) {
		this.overlays.remove(overlayId);
		return this;
	}

	/**
	 * Gets a collection of char log overlays.
	 * @returns {Collection} Collection of registered char log overlays.
	 */
	getOverlays() {
		return this.overlays;
	}

	/**
	 * Registers an event modifier.
	 * @param {object} modifier EventModifier object
	 * @param {string} modifier.id EventModifier ID.
	 * @param {number} modifier.sortOrder Sort order.
	 * @param {(ctrl: Model, ev: object, mod: object) => void | Promise<void>} modifier.callback EventModifier callback. It thought mutate the mod object before returning or resolving its promise.
	 * @returns {this}
	 */
	addEventModifier(modifier) {
		if (this.modifiers.get(modifier.id)) {
			throw new Error("EventModifier ID already registered: ", modifier.id);
		}
		this.modifiers.add(modifier);
		return this;
	}

	/**
	 * Unregisters a previously registered event modifier.
	 * @param {string} modifierId EventModifier ID.
	 * @returns {this}
	 */
	removeEventModifier(modifierId) {
		this.modifiers.remove(modifierId);
		return this;
	}

	/**
	 * Gets a collection of event modifiers.
	 * @returns {Collection} Collection of registered event modifiers.
	 */
	getEventModifiers() {
		return this.modifiers;
	}

	/**
	 * Creates a new LogEvent component.
	 * @param {*} charId ID of character receiving the event.
	 * @param {*} ev Event
	 * @param {*} opt Optional parameters.
	 * @returns {Component}
	 */
	getLogEventComponent(charId, ev, opt) {
		return new CharLogEvent(this.module, charId, ev, opt);
	}

	/**
	 * Validates that the character is not controlled by a puppeteer.
	 * @param {object} char Character model.
	 * @param {object} err Error objects with code, message, and optional data parameter. Defaults to "Puppets are not allowed to do that." error.
	 * @returns {boolean} True if not controlled by a puppeteer, otherwise false.
	 */
	validateNotPuppet(char, err) {
		if (char && char.puppeteer) {
			this.logError(char.id, err || new Err('charLog.puppetAccessDenied', "Puppets are not allowed to do that."));
			return false;
		}

		return true;
	}

	_setListeners(on) {
		let p = this.module.player;
		let cb = on ? 'on' : 'off';
		p[cb]('ctrlAdd', this._onCtrlAdd);
		p[cb]('ctrlRemove', this._onCtrlRemove);
		p[cb]('activeChange', this._onActiveChange);
	}

	_onCtrlAdd(ev) {
		let char = ev.char;
		this.charComponents[char.id] = new CharLogComponent(this.module, char, {
			onAtBottom: this._onAtBottom.bind(this, char.id),
		});
		char.on('out', this._onOut);
		this.unseen.set({ [char.id]: 0 });
		this.unseenTargeted.set({ [char.id]: 0 });

		// Check if last event was after character was controlled.
		// If so, we shouldn't add a control event.
		this.getLog(char).then(l => {
			let idx = l.length - 1;
			if (idx >= 0) {
				let last = l.atIndex(idx);
				if (last.time && char.ctrlSince && last.time >= char.ctrlSince) {
					return;
				}
			}

			this.addEvent({
				id: this._getLogId(),
				type: 'control',
				time: char.ctrlSince || this._getTimestamp(l),
				hchar: {
					id: char.id,
					name: char.name,
					surname: char.surname,
				},
			}, char);
		});
	}

	_onCtrlRemove(ev) {
		let char = ev.char;
		let comp = this.charComponents[char.id];
		delete this.charComponents[char.id];
		if (comp) {
			comp.dispose();
		}
		char.off('out', this._onOut);
		this.unseen.set({ [char.id]: undefined });
		this.unseenTargeted.set({ [char.id]: undefined });
		this.getLog(char).then(l => {
			this.addEvent({
				id: this._getLogId(),
				type: 'release',
				time: this._getTimestamp(l),
			}, char);
		});
	}

	_onActiveChange(ev) {
		let char = ev.char;
		if (char) {
			let c = this.charComponents[char.id];
			if (ev.dir > 0) {
				this.transition.slideLeft(c);
			} if (ev.dir < 0) {
				this.transition.slideRight(c);
			} else {
				this.transition.fade(c);
			}
		}
		this.activeCharId = char ? char.id : null;
	}

	_onOut(ev, ctrl) {
		this.addEvent(ev, ctrl);
	}

	/**
	 * Adds a raw event to the log.
	 * @param {object} ev Event to add
	 * @param {object} ctrl Controlled character
	 * @returns {Promise} Promise of the event being added.
	 */
	async addEvent(ev, ctrl) {
		let l = await this.getLog(ctrl);

		// Creates a unique id for the controller and event to be used with
		// this.addingEvent to ensure it is duplicated by being added from two
		// sources.
		let ctrlId = getCtrlId(ctrl);
		let ctrlEvId = ctrlId + '_' + ev.id;

		// Quick exit if log entry already exists
		if (l.get(ev.id) || this.addingEvent[ctrlEvId]) {
			return;
		}
		this.addingEvent[ctrlEvId] = ev;

		try {

			// Add event modifiers
			let mod = await this._getEventModifications(ev, ctrl);
			if (mod) {
				ev.mod = mod;
			}

			// Ensure to insert it at right position
			let i = l.length;
			let time = ev.time;
			if (time) {
				while (i > 0 && (l.atIndex(i - 1).time || 0) > time) {
					i--;
				}
			} else {
				time = (new Date()).getTime();
				if (l.length) {
					let lastTime = l.atIndex(l.length - 1).time || 0;
					if (time < lastTime) {
						time = lastTime + 1;
					}
				}
				ev.time = time;
			}
			l.add(ev, i);


			this.module.charLogStore.addEvent(ctrlId, ev);
			// Call (notification) handler if we have one
			let hs = this.handlers[ev.type];
			if (hs) {
				for (let h of hs) {
					try {
						h(ctrl.id, ev);
					} catch (e) {
						console.error("[CharLog] Error calling event handler: ", e);
					}
				}
			}

			// If log is not visible, increase unseen with 1
			if (!this._isVisible(ctrl.id) &&
				this.unseen.props.hasOwnProperty(ctrl.id) &&
				!ignoreUnseen[ev.type] &&
				(!mod || !mod.muted)
			) {
				this.unseen.set({ [ctrl.id]: this.unseen.props[ctrl.id] + 1 });
				// Increase targeted if character is the target
				if (isTargeted(ctrl.id, ev)) {
					this.unseenTargeted.set({ [ctrl.id]: this.unseenTargeted.props[ctrl.id] + 1 });
				}
			}
		} finally {
			delete this.addingEvent[ctrlEvId];
		}
	}

	setIsHidden(hidden) {
		this.isHidden += hidden ? 1 : -1;
		this._onVisibilityChange();
	}

	// Checks if the characters log is visible and scrolled to the bottom.
	_isVisible(charId) {
		if (document.visibilityState == 'visible' &&
			charId === this.activeCharId &&
			!this.isHidden
		) {
			let c = this.charComponents[charId];
			return c && c.isRendered() && c.atBottom();
		}
		return false;
	}

	// Check if we are at the bottom, and if so, set unseen to seen.
	_onAtBottom(charId, v) {
		if (charId == this.activeCharId && this._isVisible(charId)) {
			// If we are at bottom, set unseen to 0
			if (v) {
				if (this.unseen.props.hasOwnProperty(charId)) {
					this.unseen.set({ [charId]: 0 });
					this.unseenTargeted.set({ [charId]: 0 });
				}
			}
		}
	}

	_onVisibilityChange() {
		this._onAtBottom(this.activeCharId, true);
	}

	_getLogId() {
		return '_' + this.sessionId + '_' + this.localId++;
	}

	_getTimestamp(log, time) {
		if (time) {
			return typeof time == 'number' ? time : time.getTime();
		}

		time = (new Date()).getTime();
		if (log.length) {
			let lastTime = log.atIndex(log.length - 1).time || 0;
			if (time < lastTime) {
				time = lastTime + 1;
			}
		}
		return time;
	}

	// Gets modifications to be applied client side to an event.
	// These modifications may be things like muted, or highlighted words.
	async _getEventModifications(ev, ctrl) {
		let mod = {};
		for (let m of this.modifiers) {
			await Promise.resolve(m.callback(ev, ctrl, mod));
		}

		return Object.keys(mod).length ? mod : null;
	}

	dispose() {
		this._setListeners(false);
		this.charComponents = {};
		document.removeEventListener('visibilitychange', this._onVisibilityChange);
	}
}

export default CharLog;
