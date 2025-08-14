import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import realmStates, { getRealmState } from 'utils/realmStates';

/**
 * OverseerEditRealmTopSection draws the overseer edit form top section for a realm.
 */
class RouteEditRealmRealms {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'overseereditrealm-topsection' }, [

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
						let state = getRealmState(m);
						c.getNode('txt').setText(state.text);
						let icon = c.getNode('icon');
						for (let s of realmStates) {
							icon[state == s ? 'addClass' : 'removeClass'](s.className);
						}
					},
				)),
			]),

			// Action buttons
			n.elem('div', { className: 'flex-row m pad16' }, [

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
							n.component('txt', new Txt('')),
						])),
						(m, c) => {
							c.setProperty('disabled', m.state == 'booting' || m.state == 'restarting' ? 'disabled' : null);
							c.getNode('txt').setText([ 'offline', 'booting', 'stopped' ].includes(m.state)
								? l10n.l('overseerEditRealm.realmUp', "Realm Up")
								: l10n.l('overseerEditRealm.realmResync', "Realm Resync"),
							);
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
							n.component('txt', new Txt(l10n.l('overseerEditRealm.realmStop', "Realm Stop"))),
						])),
						(m, c) => c.setProperty('disabled', m.state == 'online' ? null : 'disabled'),
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
							n.component('txt', new Txt(l10n.l('overseerEditRealm.realmDown', "Realm Down"))),
						])),
						(m, c) => c.setProperty('disabled', m.state == 'online' || m.state == 'stopped' ? null : 'disabled'),
					)),
				]),
			]),

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

	_callRealm(method) {
		this.module.api.call(`control.overseer.realm.${this.realm.id}`, method)
			.catch(err => this.module.confirm.openError(err));
	}
}

export default RouteEditRealmRealms;
