import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import PageList from 'components/PageList';
import RealmListRealm from './RealmListRealm';
import RealmListPlaceholder from './RealmListPlaceholder';

/**
 * RealmListComponent draws the list of realms.
 */
class RealmListComponent {
	constructor(module, model, realms) {
		this.module = module;
		this.model = model;
		this.realms = realms;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new PageList({
				fetchCollection: (offset, limit) => this.realms.slice(offset, offset + limit),
				componentFactory: (realm) => realm
					? new RealmListRealm(this.module, this.model, realm)
					: new RealmListPlaceholder(),
				itemName: l10n.l('realmList.realm', "Realm"),
				page: this.model.pageNr || 0,
				limit: 3,
				total: this.realms ? this.realms.length : 3,
				className: 'realmlist-list',
				headClassName: 'realmlist-list--head',
				listClassName: 'realmlist-list--list',
				listSubClassName: () => 'realmlist-list--realm',
			}),
			(m, c) => {
				if (m.realms == this.realms) {
					c.setPage(m.pageNr || 0);
				}
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
