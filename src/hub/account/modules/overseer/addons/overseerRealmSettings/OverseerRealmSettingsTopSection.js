import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import apiStates, { getApiState } from 'utils/apiStates';
import ModelCollapser from 'components/ModelCollapser';

/**
 * OverseerRealmSettingsTopSection draws the overseer edit form top section for a realm.
 */
class RouteRealmSettingsRealms {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'overseerrealmsettings-topsection' }, [

			// Realm state
			n.elem('div', { className: 'common--sectionpadding' }, [
				n.component(new ModelComponent(
					this.realm,
					new Elem(n => n.elem('div', [
						n.component('icon', new FAIcon('circle')),
						n.html('&nbsp;&nbsp;'),
						n.component('txt', new Txt('')),
					])),
					(m, c) => {
						let state = getApiState(m);
						c.getNode('txt').setText(state.text);
						let icon = c.getNode('icon');
						for (let s of apiStates) {
							icon[state == s ? 'addClass' : 'removeClass'](s.className);
						}
					},
				)),
			]),

			// Node realm action buttons
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiType == 'node',
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row m pad16' }, [
					// Realm up
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary small common--btnwidth',
								events: {
									click: () => this._callRealm('up'),
								},
							}, [
								n.component(new Txt(l10n.l('overseerRealmSettings.realmUp', "Realm Up"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional ? 'disabled' : null);
							},
						)),
					]),

					// Realm stop
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn secondary small common--btnwidth',
								events: {
									click: () => this._callRealm('stop'),
								},
							}, [
								n.component(new Txt(l10n.l('overseerRealmSettings.realmStop', "Realm Stop"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional ? 'disabled' : null);
							},
						)),
					]),

					// Realm down
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn warning small common--btnwidth',
								events: {
									click: () => this._callRealm('down'),
								},
							}, [
								n.component(new Txt(l10n.l('overseerRealmSettings.realmDown', "Realm Down"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional ? 'disabled' : null);
							},
						)),
					]),
				])),
			}])),

			// Manual realm action buttons
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiType == 'manual',
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row m pad16' }, [
					// Set Online
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary small common--btnwidth',
								events: {
									click: () => this._callRealm('set', { apiState: 'online' }),
								},
							}, [
								n.component(new Txt(l10n.l('overseerRealmSettings.setOnline', "Set Online"))),
							])),
							(m, c) => c.setProperty('disabled', m.apiState == 'online' ? 'disabled' : null),
						)),
					]),

					// Set Offline
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn warning small common--btnwidth',
								events: {
									click: () => this._callRealm('set', { apiState: 'offline' }),
								},
							}, [
								n.component(new Txt(l10n.l('overseerRealmSettings.setOffline', "Set Offline"))),
							])),
							(m, c) => c.setProperty('disabled', m.apiState == 'offline' ? 'disabled' : null),
						)),
					]),
				])),
			}])),

			n.elem('div', { className: 'common--hr' }),

		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_callRealm(method, params) {
		this.module.api.call(`control.overseer.realm.${this.realm.id}`, method, params)
			.catch(err => this.module.confirm.openError(err));
	}
}

export default RouteRealmSettingsRealms;
