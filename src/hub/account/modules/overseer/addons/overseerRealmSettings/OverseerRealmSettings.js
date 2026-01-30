import { Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import OverseerRealmSettingsTopSection from './OverseerRealmSettingsTopSection';
import OverseerRealmSettingsBottomSection from './OverseerRealmSettingsBottomSection';
import './overseerRealmSettings.scss';

/**
 * OverseerRealmSettings adds a section to the RouteRealmSettings to show and set
 * overseer fields.
 */
class OverseerRealmSettings {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeRealmSettings',
			'confirm',
			'toaster',
			'nodeContainers',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Realm state actions
		this.module.routeRealmSettings.addTool({
			id: 'overseerActions',
			type: 'topSection',
			componentFactory: (realm) => new OverseerRealmSettingsTopSection(this.module, realm),
			sortOrder: 10,
		});

		// Edit overseer fields
		this.module.routeRealmSettings.addTool({
			id: 'overseerFields',
			type: 'section',
			componentFactory: (realm) => new OverseerRealmSettingsBottomSection(this.module, realm),
			onSave: (params) => {
				// Prepare params for release.
				if (params.hasOwnProperty('release')) {
					params.releaseId = params.release?.id || null;
					delete params.release;
				}
				return params;
			},
			sortOrder: 100,
		});

		// Update default realm
		this.module.routeRealmSettings.addTool({
			id: 'overseerUpdateDefaultRealm',
			type: 'footer',
			componentFactory: (realm) => new ModelFader(realm, [{
				condition: m => m.isDefault,
				factory: m => new Elem(n => n.elem('div', { className: 'pad-right-l' }, [
					n.elem('button', { events: {
						click: () => this._updateDefaultRealm(realm)
							.then(() => this.module.toaster.open({
								title: l10n.l('overseerRealmSettings.realmRefreshed', "Realm refreshed"),
								content: new Txt(l10n.l('overseerRealmSettings.realmRefreshedBody', "Realm settings has been refreshed from config.")),
								closeOn: 'click',
								type: 'success',
								autoclose: true,
							})),
					}, className: 'iconbtn medium solid' }, [
						n.component(new FAIcon('refresh')),
					]),
				])),
			}]),
			sortOrder: 10,
		});

		// Delete realm
		this.module.routeRealmSettings.addTool({
			id: 'overseerDelete',
			type: 'footer',
			componentFactory: (realm) => new Elem(n => n.elem('button', { events: {
				click: () => this.module.confirm.open(() => this._delete(realm), {
					title: l10n.l('overseerRealmSettings.confirmDelete', "Confirm deletion"),
					body: l10n.l('overseerRealmSettings.deleteRealmBody', "Do you really wish to delete this realm?"),
					confirm: l10n.l('overseerRealmSettings.delete', "Delete"),
				}),
			}, className: 'iconbtn medium solid' }, [
				n.component(new FAIcon('trash')),
			])),
			sortOrder: 100,
		});
	}

	_delete(realm) {
		return this.module.api.call(`control.overseer.realm.${realm.id}`, 'delete')
			.catch(err => this.module.confirm.openError(err));
	}

	_updateDefaultRealm(realm) {
		return this.module.api.call(`control.overseer.realm.${realm.id}`, 'updateDefaultRealm')
			.catch(err => this.module.confirm.openError(err));
	}

	dispose() {
		this.module.routeRealmSettings.removeTool('overseerActions');
		this.module.routeRealmSettings.removeTool('overseerFields');
		this.module.routeRealmSettings.removeTool('overseerUpdateDefaultRealm');
		this.module.routeRealmSettings.removeTool('overseerDelete');
	}
}

export default OverseerRealmSettings;
