import { Elem, Txt, Context } from 'modapp-base-component';
import { Model, Collection, CollectionWrapper } from 'modapp-resource';
import { CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import counterString from 'utils/counterString';
import PageRequestsComponent from './PageRequestsComponent';
import './pageRequests.scss';

/**
 * PageRequests adds the requests panel and requests button to player panel's
 * footer.
 */
class PageRequests {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onRequestAdd = this._onRequestAdd.bind(this);

		this.app.require([
			'playerTabs',
			'auth',
			'player',
			'api',
			'confirm',
			'notify',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ eventBus: this.app.eventBus });
		this.requestTypes = new Collection({
			idAttribute: m => m.id,
			eventBus: this.app.eventBus,
		});

		this.module.auth.getUserPromise()
			.then(user => Promise.all([
				this.module.api.get('core.player.' + user.id + '.incoming.requests'),
				this.module.api.get('core.player.' + user.id + '.outgoing.requests'),
			]))
			.then(result => {
				if (!this.model) return;
				let incoming = result[0];
				let outgoing = result[1];
				this.model.set({ incoming, outgoing });

				// Make sure it is not unsubscribed
				this._listen(true);

				// Add request player tab
				this.module.playerTabs.addTab({
					id: 'requests',
					sortOrder: 100,
					tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light pagerequests--tool-btn', events: {
						click: (c, e) => {
							click();
							e.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('bell')),
						n.component(new Context(
							() => new CollectionWrapper(incoming, { filter: m => m.state == 'pending', eventBus: this.app.eventBus }),
							requests => requests.dispose(),
							requests => new CollectionComponent(
								requests,
								new Elem(n => n.elem('div', { className: 'counter alert' }, [
									n.component('txt', new Txt("")),
								])),
								(col, c) => {
									c.getNode('txt').setText(counterString(col.length));
									c[col.length ? 'removeClass' : 'addClass']('hide');
								},
							),
						)),
					])),
					factory: (state, close, layoutId) => ({
						component: new PageRequestsComponent(this.module, this.model.incoming, this.model.outgoing, state, close),
						title: l10n.l('pageRequests.requests', "Requests"),
					}),
				});
			});
	}

	/**
	 * Opens an in-panel request page in the player panel.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 * @returns {function} Close function.
	 */
	open(reset) {
		return this.module.playerTabs.openTab('requests', reset);
	}

	/**
	 * Gets a specifig request type, or null if not found.
	 * @param {string} id Request type ID.
	 * @returns {?object} Request type.
	 */
	getRequestType(id) {
		return this.requestTypes.get(id) || null;
	}

	/**
	 * Registers a request type.
	 * @param {object} requestType Request type.
	 * @param {string} requestType.id Request type ID.
	 * @param {string} requestType.titleFactory RequestType title factory: function(request) -> string|LocaleString
	 * @param {function} requestType.componentFactory Request type info component factory: function(request) -> Component
	 * @returns {this}
	 */
	addRequestType(requestType) {
		if (this.requestTypes.get(requestType.id)) {
			throw new Error("Request type ID already registered: ", requestType.id);
		}
		this.requestTypes.add(requestType);
		return this;
	}

	/**
	 * Unregisters a previously registered request type.
	 * @param {string} id Request type ID.
	 * @returns {this}
	 */
	removeRequestType(id) {
		this.requestTypes.remove(id);
		return this;
	}

	_listen(on) {
		if (!this.model) return;
		let cb = on ? 'on' : 'off';
		let inc = this.model.incoming;
		if (inc) {
			inc[cb]('add', this._onRequestAdd);
		}
		let out = this.model.outgoing;
		if (out) {
			out[cb]();
		}
	}

	_onRequestAdd(ev) {
		let nm = this.module.notify.getModel();
		if (nm.notifyOnRequests) {
			let c = ev.item.from;
			this.module.notify.send(
				l10n.l('pageReports.charSentRequest', "{name} sent a request.", { name: (c.name + ' ' + c.surname).trim() }),
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
		if (this.model.incoming) {
			this.module.playerTabs.removeTab('requests');
		}
		this.model = null;
		this.requestTypes = null;
	}
}

export default PageRequests;
