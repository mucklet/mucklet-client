import { Elem, Txt, Context } from 'modapp-base-component';
import { Model, Collection, CollectionWrapper } from 'modapp-resource';
import { CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import counterString from 'utils/counterString';
import PageTicketsComponent from './PageTicketsComponent';
import './pageTickets.scss';

/**
 * PageTickets adds the tickets panel and tickets button to player panel's
 * footer.
 */
class PageTickets {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onTicketAdd = this._onTicketAdd.bind(this);

		this.app.require([
			'playerTabs',
			'auth',
			'api',
			'avatar',
			'toaster',
			'player',
			'dialogCloseTicket',
			'dialogCommentTicket',
			'dialogReopenTicket',
			'confirm',
			'notify',
			'copyCharId',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { tickets: null }, eventBus: this.app.eventBus });
		this.activityTypes = new Collection({
			idAttribute: m => m.id,
			eventBus: this.app.eventBus,
		});

		this.module.auth.getUserPromise()
			.then(user => this.module.api.get('support.tickets'))
			.then(tickets => {
				if (!this.model) return;
				this.model.set({ tickets });

				// Make sure it is not unsubscribed
				this._listen(true);

				// Add tickets player tab
				this.module.playerTabs.addTab({
					id: 'tickets',
					sortOrder: 105,
					tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light pagetickets--tool-btn', events: {
						click: (c, e) => {
							click();
							e.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('medkit')),
						n.component(new Context(
							() => new CollectionWrapper(tickets, { filter: m => !m.assigned, eventBus: this.app.eventBus }),
							unassigned => unassigned.dispose(),
							unassigned => new CollectionComponent(
								tickets,
								new CollectionComponent(
									unassigned,
									new Elem(n => n.elem('div', { className: 'counter' }, [
										n.component('txt', new Txt("")),
									])),
									(col, c) => this._setCounter(c, tickets, unassigned),
								),
								(col, c) => this._setCounter(c.getComponent(), tickets, unassigned),
							),
						)),
					])),
					factory: (state, close, layoutId) => ({
						component: new PageTicketsComponent(this.module, this.model.tickets, state, close),
						title: l10n.l('pageTickets.helpRequests', "Help requests"),
					}),
				});
			});
	}

	/**
	 * Opens an in-panel ticket page in the player panel.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 * @returns {function} Close function.
	 */
	open(reset) {
		return this.module.playerTabs.openTab('tickets', reset);
	}

	/**
	 * Gets a collection of activity types.
	 * @returns {Collection} Collection of activity types.
	 */
	 getActivityTypes() {
		return this.activityTypes;
	}

	/**
	 * Registers a tags type.
	 * @param {object} type Activity type object
	 * @param {string} type.id Activity type ID.
	 * @param {function} type.componentFactory Activity type component factory: function(ctrl, state) -> Component
	 * @returns {this}
	 */
	addActivityType(type) {
		if (this.activityTypes.get(type.id)) {
			throw new Error("ActivityType ID already registered: ", type.id);
		}
		this.activityTypes.add(type);
		return this;
	}

	/**
	 * Unregisters a previously registered activity type.
	 * @param {string} typeId Activity type ID.
	 * @returns {this}
	 */
	removeActivityType(typeId) {
		this.activityTypes.remove(typeId);
		return this;
	}

	_setCounter(c, tickets, unassigned) {
		let len = (unassigned.length || tickets.length) || "";
		c.getNode('txt').setText(counterString(len));
		c[len ? 'removeClass' : 'addClass']('hide');
		c[unassigned.length ? 'addClass' : 'removeClass']('alert');
	}

	_listen(on) {
		let m = this.model && this.model.tickets;
		if (m) {
			m[on ? 'on' : 'off']('add', this._onTicketAdd);
		}
	}

	_onTicketAdd(ev) {
		let nm = this.module.notify.getModel();

		if (nm.notifyOnRequests) {
			let c = ev.item.char;
			this.module.notify.send(
				l10n.l('pageTickets.charRequestedHelp', "{name} requested help", { name: (c.name + ' ' + c.surname).trim() }),
				{
					onClick: () => {
						this.open();
						window.focus();
					},
				},
			);
		}
	}

	dispose() {
		this._listen(false);
		if (this.model.tickets) {
			this.module.playerTabs.removeTab('tickets');
		}
		this.model = null;
	}
}

export default PageTickets;
