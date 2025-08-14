import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import OverseerEditRealmTopSection from './OverseerEditRealmTopSection';
import OverseerEditRealmBottomSection from './OverseerEditRealmBottomSection';

/**
 * OverseerEditRealm adds a section to the RouteEditRealm to show and set
 * overseer fields.
 */
class OverseerEditRealm {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeEditRealm',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Realm state actions
		this.module.routeEditRealm.addTool({
			id: 'overseerActions',
			type: 'topSection',
			componentFactory: (realm) => new OverseerEditRealmTopSection(this.module, realm),
			sortOrder: 10,
		});

		// Edit overseer fields
		this.module.routeEditRealm.addTool({
			id: 'overseerFields',
			type: 'section',
			componentFactory: (realm) => new OverseerEditRealmBottomSection(this.module, realm),
			sortOrder: 10,
		});

		// Update default realm
		this.module.routeEditRealm.addTool({
			id: 'overseerUpdateDefaultRealm',
			type: 'footer',
			componentFactory: (realm) => new ModelFader(realm, [{
				condition: m => m.isDefault,
				factory: m => new Elem(n => n.elem('div', { className: 'pad-right-l' }, [
					n.elem('button', { events: {
						click: () => this._updateDefaultRealm(realm),
					}, className: 'iconbtn medium solid' }, [
						n.component(new FAIcon('refresh')),
					]),
				])),
			}]),
			sortOrder: 10,
		});

		// Delete realm
		this.module.routeEditRealm.addTool({
			id: 'overseerDelete',
			type: 'footer',
			componentFactory: (realm) => new Elem(n => n.elem('button', { events: {
				click: () => this.module.confirm.open(() => this._delete(realm), {
					title: l10n.l('overseerEditRealm.confirmDelete', "Confirm deletion"),
					body: l10n.l('overseerEditRealm.deleteRealmBody', "Do you really wish to delete this realm?"),
					confirm: l10n.l('overseerEditRealm.delete', "Delete"),
				}),
			}, className: 'iconbtn medium solid' }, [
				n.component(new FAIcon('trash')),
			])),
			sortOrder: 100,
		});
	}

	_delete(realm) {
		this.module.api.call(`control.overseer.realm.${realm.id}`, 'delete')
			.catch(err => this.module.confirm.openError(err));
	}

	_updateDefaultRealm(realm) {
		this.module.api.call(`control.overseer.realms`, 'updateDefaultRealm')
			.catch(err => this.module.confirm.openError(err));
	}

	dispose() {
		this.module.routeEditRealm.removeTool('overseerActions');
		this.module.routeEditRealm.removeTool('overseerFields');
		this.module.routeEditRealm.removeTool('overseerUpdateDefaultRealm');
		this.module.routeEditRealm.removeTool('overseerDelete');
	}
}

export default OverseerEditRealm;
