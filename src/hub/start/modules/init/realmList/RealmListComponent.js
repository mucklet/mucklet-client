import { CollectionList } from 'modapp-resource-component';
import ModelFader from 'components/ModelFader';
import RealmListRealm from './RealmListRealm';

/**
 * RealmListComponent draws the list of realms.
 */
class RealmListComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [{
			factory: (m) => new CollectionList(
				m.realms || [ null, null, null ],
				realm => new RealmListRealm(this.module, this.model, realm),
				{
					horizontal: true,
					className: 'realmlist--list',
					subClassName: () => 'realmlist--realm',
				},
			),
			hash: m => m.realms,
		}]);
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
