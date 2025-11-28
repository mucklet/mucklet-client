import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ModelCollapser from 'components/ModelCollapser';
import formatDateTime from 'utils/formatDateTime';
import RouteRealmBackupsBadgeContent from './RouteRealmBackupsBadgeContent';


class RouteRealmBackupsBadge {
	constructor(module, model, realmBackup) {
		this.module = module;
		this.model = model;
		this.realmBackup = realmBackup;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'routerealmbackups-badge badge dark btn',
			events: {
				click: (c, ev) => {
					this.module.self.setRoute({
						realmId: this.model.realm.id,
						backupId: this.model.backupId == this.realmBackup.id
							? null
							: this.realmBackup.id,
						pageNr: this.model.pageNr,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--info badge--select badge--select-gap badge--select-center' }, [
				n.elem('div', { className: 'badge--symbol' }, [
					n.component(new FAIcon('database')),
				]),
				n.elem('div', { className: 'badge--info badge--title badge--nowrap flex-1' }, [
					n.component(new ModelTxt(this.realmBackup, m => l10n.l('routeRealmBackups.backupSeq', "Backup #{seq}", { seq: m.seq }))),
				]),
				n.elem('div', { className: 'badge--padright badge--text badge--nowrap flex-auto' }, [
					n.component(new ModelTxt(this.realmBackup, m => formatDateTime(new Date(m.created), { showYear: true }))),
				]),
			]),

			// Content
			n.component(new ModelCollapser(this.model, [{
				condition: m => m.backupId == this.realmBackup.id,
				factory: m => new RouteRealmBackupsBadgeContent(this.module, this.realmBackup),
			}])),

		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteRealmBackupsBadge;
