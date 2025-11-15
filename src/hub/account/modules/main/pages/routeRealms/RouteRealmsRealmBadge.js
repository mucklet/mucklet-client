import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import ModelCollapser from 'components/ModelCollapser';
import CompositionState from 'components/CompositionState';
import formatDateTime from 'utils/formatDateTime';
import RouteRealmsRealmBadgeContent from './RouteRealmsRealmBadgeContent';


class RouteRealmsRealmBadge {
	constructor(module, model, realm) {
		this.module = module;
		this.model = model;
		this.realm = realm;
	}

	render(el) {
		let updateFader = new Fader();

		this.elem = new Elem(n => n.elem('badge', 'div', {
			className: 'routerealms-realmbadge badge dark large btn',
			events: {
				click: (c, ev) => {
					this.module.self.setRoute({ realmId: this.model.realm == this.realm
						? null
						: this.realm.id,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--select' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new ModelComponent(
						this.realm,
						new FAIcon('university'),
						(m, c) => c.setIcon('university'),
					)),
				]),
				n.elem('div', { className: 'badge--info-morepad' }, [
					n.elem('div', { className: 'flex-row flex-start' }, [
						n.elem('div', { className: 'routerealms-realmbadge--title badge--title badge--nowrap flex-1' }, [
							n.component(new ModelTxt(this.realm, m => m.name)),
						]),
						n.elem('div', { className: 'routerealms-realmbadge--date badge--nowrap flex-auto' }, [
							n.component(new ModelTxt(this.realm, m => formatDateTime(new Date(m.created), { showYear: true }))),
						]),
					]),

					// Realm state
					n.elem('div', { className: 'routerealms-realmbadge--state flex-row' }, [
						n.elem('div', { className: 'badge--nowrap flex-1' }, [
							n.component(new CompositionState(this.realm, {
								type: 'realm',
								size: 'small',
							})),
						]),
						// Update required
						n.elem('div', { className: 'routerealms-realmbadge--updaterequired badge--nowrap flex-auto' }, [
							n.component(new ModelComponent(
								this.realm,
								new ModelComponent(
									null,
									updateFader,
									(m, c, change) => change && this._setUpdateFader(updateFader),
								),
								(m, c, change) => {
									c.setModel(m.apiComposition);
									this._setUpdateFader(updateFader);
								},
							)),
						]),
					]),
				]),
			]),
			n.component(new ModelCollapser(this.model, [{
				condition: m => m.realm == this.realm,
				factory: m => new RouteRealmsRealmBadgeContent(this.module, this.realm),
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

	_setUpdateFader(fader) {
		let show = this.realm.apiState != 'offline' &&
			this.realm.apiType == 'node' &&
			this.realm.apiComposition &&
			this.realm.apiComposition.hash != this.realm.apiHash;

		fader.setComponent(show
			? fader.getComponent() || new Txt(l10n.l('routeRealms.updateRequired', "Update required"))
			: null,
		);
	}
}

export default RouteRealmsRealmBadge;
