import { Elem, Txt, Context } from 'modapp-base-component';
import { Model, Collection, CollectionWrapper } from 'modapp-resource';
import { CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import counterString from 'utils/counterString';
import PageReportsComponent from './PageReportsComponent';
import './pageReports.scss';

/**
 * PageReports adds the reports panel and reports button to player panel's
 * footer.
 */
class PageReports {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onReportAdd = this._onReportAdd.bind(this);
		this._onNotificationNewReportEvent = this._onNotificationNewReportEvent.bind(this);

		this.app.require([
			'playerTabs',
			'auth',
			'api',
			'avatar',
			'toaster',
			'player',
			'dialogCloseReport',
			'dialogCommentReport',
			'dialogReopenReport',
			'confirm',
			'notify',
			'copyCharId',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.model = new Model({ data: { reports: null }, eventBus: this.app.eventBus });
		this.attachmentTypes = new Collection({
			idAttribute: m => m.id,
			eventBus: this.app.eventBus,
		});

		this.module.auth.getUserPromise()
			.then(user => this.module.api.get('report.reports'))
			.then(reports => {
				if (!this.model) return;
				this.model.set({ reports });

				// Make sure it is not unsubscribed
				this._listen(true);

				// Add reports player tab
				this.module.playerTabs.addTab({
					id: 'reports',
					sortOrder: 110,
					tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light pagereports--tool-btn', events: {
						click: (c, e) => {
							click();
							e.stopPropagation();
						},
					}}, [
						n.component(new FAIcon('flag')),
						n.component(new Context(
							() => new CollectionWrapper(reports, { filter: m => !m.assigned, eventBus: this.app.eventBus }),
							unassigned => unassigned.dispose(),
							unassigned => new CollectionComponent(
								reports,
								new CollectionComponent(
									unassigned,
									new Elem(n => n.elem('div', { className: 'counter' }, [
										n.component('txt', new Txt("")),
									])),
									(col, c) => this._setCounter(c, reports, unassigned),
								),
								(col, c) => this._setCounter(c.getComponent(), reports, unassigned),
							),
						)),
					])),
					factory: (state, close, layoutId) => ({
						component: new PageReportsComponent(this.module, this.model.reports, state, close),
						title: l10n.l('pageReports.reports', "Reports"),
					}),
				});
			});
	}

	/**
	 * Opens an in-panel report page in the player panel.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 * @returns {function} Close function.
	 */
	open(reset) {
		return this.module.playerTabs.openTab('reports', reset);
	}

	/**
	 * Gets a collection of attachment types.
	 * @returns {Collection} Collection of attachment types.
	 */
	 getAttachmentTypes() {
		return this.attachmentTypes;
	}

	/**
	 * Registers a tags type.
	 * @param {object} type Attachment type object
	 * @param {string} type.id Attachment type ID.
	 * @param {function} type.componentFactory Attachment type component factory: function(ctrl, state) -> Component
	 * @returns {this}
	 */
	addAttachmentType(type) {
		if (this.attachmentTypes.get(type.id)) {
			throw new Error("AttachmentType ID already registered: ", type.id);
		}
		this.attachmentTypes.add(type);
		return this;
	}

	/**
	 * Unregisters a previously registered attachment type.
	 * @param {string} typeId Attachment type ID.
	 * @returns {this}
	 */
	removeAttachmentType(typeId) {
		this.attachmentTypes.remove(typeId);
		return this;
	}

	_setCounter(c, reports, unassigned) {
		let len = (unassigned.length || reports.length) || "";
		c.getNode('txt').setText(counterString(len));
		c[len ? 'removeClass' : 'addClass']('hide');
		c[unassigned.length ? 'addClass' : 'removeClass']('alert');
	}

	_listen(on) {
		let m = this.model && this.model.reports;
		if (m) {
			m[on ? 'on' : 'off']('add', this._onReportAdd);
		}
		this.module.notify[on ? 'addNotificationHandler' : 'removeNotificationHandler']('newReport', this._onNotificationNewReportEvent);
	}

	_onReportAdd(ev) {
		let nm = this.module.notify.getModel();
		// Only notify if notifyOnRequest is set and the user is a moderator
		if (nm.notifyOnRequests && this.module.player.hasRoles('moderator')) {
			let c = ev.item.char;
			this.module.notify.send(
				l10n.l('pageReports.newReport', "New report"),
				l10n.l('pageReports.charReported', "{name} was reported.", { name: (c.name + ' ' + c.surname).trim() }),
				{
					onClick: () => {
						this.open();
						window.focus();
					},
					duration: 1000 * 60 * 60 * 24, // Max 1 day
					skipOnPush: true,
				},
			);
		}
	}

	_onNotificationNewReportEvent(params) {
		this.open();
	}

	dispose() {
		this._listen(false);
		if (this.model.reports) {
			this.module.playerTabs.removeTab('reports');
		}
		this.model = null;
	}
}

export default PageReports;
