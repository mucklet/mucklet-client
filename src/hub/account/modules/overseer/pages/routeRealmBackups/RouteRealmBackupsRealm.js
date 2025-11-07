import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import PageList from 'components/PageList';
import RouteRealmBackupsBadge from './RouteRealmBackupsBadge';

const backupsPerPage = 20;

/**
 * RouteRealmBackupsRealm draws the backups form for a realm.
 */
class RouteRealmBackupsRealm {
	constructor(module, realm, model) {
		this.module = module;
		this.realm = realm;
		this.model = model;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'routerealmbackups-realm' }, [
			n.elem('div', { className: 'flex-row flex-end' }, [
				n.component(new PageHeader(l10n.l('routeRealmBackups.realmBackups', "Realm backups"), "", { className: 'flex-1' })),
				n.elem('div', { className: 'flex-col' }, [
					n.elem('button', {
						className: 'btn fa small',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.routeRealms.setRoute({ realmId: this.realm.id });
							},
						},
					}, [
						n.component(new FAIcon('angle-left')),
						n.component(new Txt(l10n.l('routeRealmBackups.backToRealms', "Back to Realms"))),
					]),
				]),
			]),
			n.elem('div', { className: 'common--hr' }),

			// Sub header
			n.elem('div', { className: 'flex-row' }, [

				// Realm name
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelTxt(this.realm, m => m.name, { className: 'routerealmbackups-realm--name' })),
				]),

				n.elem('div', { className: 'routerealmbackups-realm--subheader flex-auto' }, [
					n.elem('button', {
						className: 'btn fa tiny',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.confirm.open(() => this._backup(), {
									title: l10n.l('routeRealmBackups.confirmCreate', "Confirm backup"),
									body: l10n.l('routeRealmBackups.createBackupBody', "Do you really wish to trigger a manual backup outside of backup schedule?"),
									confirm: l10n.l('routeRealmBackups.createBackup', "Create backup"),
								});
							},
						},
					}, [
						n.component(new FAIcon('plus')),
						n.component(new Txt(l10n.l('routeRealmBackups.backToRealms', "Create backup"))),
					]),
				]),
			]),

			// Backups
			n.component(new ModelComponent(
				this.model,
				new PageList({
					fetchCollection: (offset, limit) => {
						// Update URL with new page nr.
						this.module.self.setRoute({
							realmId: this.realm.id,
							pageNr: Math.floor(offset / backupsPerPage),
							backupId: this.model.backupId,
						});
						return this.module.api.get(`control.realm.${this.realm.id}.backups?offset=${offset}&limit=${limit}`);
					},
					componentFactory: (realmBackup) => new RouteRealmBackupsBadge(this.module, this.model, realmBackup),
					itemName: l10n.l('routeRealmBackups.backup', "Backup"),
					placeholder: l10n.l('routeRealmBackups.noBackups', "No backups for this realm."),
					page: this.model.pageNr,
					limit: backupsPerPage,
					className: 'routerealmbackups-realm--pagelist',
					listSubClassName: () => 'routerealmbackups-realm--pagelistitem',
				}),
				(m, c) => {
					if (m.realm == this.realm) {
						c.setPage(m.pageNr || 0);
					}
				},
			)),
		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}

	_save(model) {
		let params = model.getModifications();
		if (!params) {
			return;
		}

		// Prepare params from tools
		for (let tool of this.module.self.getTools()) {
			params = tool.onSave?.(params) || params;
		}

		this._setMessage();
		return this.realm.call('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_backup() {
		this.module.api.call(`control.overseer.realm.${this.realm.id}`, 'backupCreate')
			.then((taskRun) => this.module.toaster.open({
				title: l10n.l('routeRealmBackups.creatingBackup', "Backuping realm"),
				content: new Txt(l10n.l('routeRealmBackups.creatingBackupBody', "Realm is being backed up.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.toaster.openError(err));

	}
}

export default RouteRealmBackupsRealm;
