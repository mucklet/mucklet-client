import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import formatDuration from 'utils/formatDuration';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';

class RouteRealmBackupsBadgeContent {
	constructor(module, realmBackup) {
		this.module = module;
		this.realmBackup = realmBackup;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routerealmbackups-badgecontent badge--margin badge--info' }, [
			n.elem('div', { className: 'badge--select badge--select-gap' }, [
				// Info
				n.elem('div', { className: 'flex-1' }, [

					// Keep until
					n.elem('div', { className: 'badge--select badge--select-gap' }, [
						n.component(new Txt(l10n.l('routeRealmBackups.keep', "Keep"), { className: 'badge--iconcol badge--subtitle' })),
						n.component(new ModelTxt(
							this.realmBackup,
							m => m.keepUntil > 0
								? l10n.l('routeRealmBackups.until', "Until #{keepUntil}", { keepUntil: m.keepUntil })
								: l10n.l('routeRealmBackups.forever', "Forever"),
							{ className: 'badge--text' },
						)),
					]),

					// Duration
					n.elem('div', { className: 'badge--select badge--select-gap' }, [
						n.component(new Txt(l10n.l('routeRealmBackups.time', "Time"), { className: 'badge--iconcol badge--subtitle' })),
						n.component(new ModelTxt(this.realmBackup, m => formatDuration(m.duration), { className: 'badge--text' })),
					]),
				]),

				// Buttons
				n.elem('div', { className: 'badge--select badge--select-margin flex-auto flex-end' }, [

					// Restore realm
					n.elem('button', { className: 'btn small icon-left common--btnwidth', events: {
						click: (c, ev) => {
							ev.stopPropagation();
							this.module.confirm.open(() => this._restore(), {
								title: l10n.l('routeRealmBackups.confirmRestore', "Confirm restore"),
								body: new Elem(n => n.elem('div', [
									n.component(new Txt(l10n.l('routeRealmBackups.restoreBackupBody', "Do you really wish to restore the realm to this backup?"), { tagName: 'p' })),
									n.elem('p', [
										n.component(new ModelTxt(this.realmBackup, m => l10n.l('routeRealmBackups.backupSeq', "Backup #{seq}", { seq: m.seq }), { tagName: 'div', className: 'dialog--strong' })),
										n.component(new ModelTxt(this.realmBackup, m => formatDateTime(new Date(m.created), { showYear: true }), { tagName: 'div', className: 'dialog--small' })),
									]),
								])),
								confirm: l10n.l('routeRealmBackups.restore', "Restore"),
							});
						},
					}}, [
						n.component(new FAIcon('refresh')),
						n.component(new Txt(l10n.l('routeRealmBackups.restore', "Restore"))),
					]),

					// Delete realm
					n.elem('button', { className: 'badge--faicon iconbtn warning small', events: {
						click: (c, ev) => {
							ev.stopPropagation();
							this.module.confirm.open(() => this._delete(), {
								title: l10n.l('routeRealmBackups.confirmDelete', "Confirm deletion"),
								body: new Elem(n => n.elem('div', [
									n.component(new Txt(l10n.l('routeRealmBackups.deleteBackupBody', "Do you really wish to delete this backup?"), { tagName: 'p' })),
									n.elem('p', [
										n.component(new ModelTxt(this.realmBackup, m => l10n.l('routeRealmBackups.backupSeq', "Backup #{seq}", { seq: m.seq }), { tagName: 'div', className: 'dialog--strong' })),
										n.component(new ModelTxt(this.realmBackup, m => formatDateTime(new Date(m.created), { showYear: true }), { tagName: 'div', className: 'dialog--small' })),
									]),
									n.elem('p', { className: 'dialog--error' }, [
										n.component(new FAIcon('exclamation-triangle')),
										n.html("&nbsp;&nbsp;"),
										n.component(new Txt(l10n.l('routeRealmBackups.deletionWarning', "Deletion cannot be undone."))),
									]),
								])),
								confirm: l10n.l('routeRealmBackups.delete', "Delete"),
							});
						},
					}}, [
						n.component(new FAIcon('trash')),
					]),
				]),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_restore() {
		this.module.api.call(`control.overseer.realm.${this.realmBackup.realmId}`, 'backupRestore', { backupId: this.realmBackup.id })
			.then((taskRun) => this.module.toaster.open({
				title: l10n.l('routeRealmBackups.restoringFromBackup', "Restoring from backup"),
				content: new Txt(l10n.l('routeRealmBackups.restoringFromBackupBody', "Realm is being restored from backup.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.toaster.openError(err));
	}

	_delete() {
		this.module.api.call(`control.overseer.realm.${this.realmBackup.realmId}`, 'backupRemove', { backupId: this.realmBackup.id })
			.then((taskRun) => this.module.toaster.open({
				title: l10n.l('routeRealmBackups.backupDeleted', "Backup getting deleted"),
				content: new Txt(l10n.l('routeRealmBackups.backupDeletedBody', "Backup is getting deleted.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.toaster.openError(err));
	}
}

export default RouteRealmBackupsBadgeContent;
