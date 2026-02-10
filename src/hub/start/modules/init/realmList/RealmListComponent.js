import ModelFader from 'components/ModelFader';
import RealmListPlaceholderList from './RealmListPlaceholderList';
import RealmListNoRealm from './RealmListNoRealm';
import RealmListList from './RealmListList';

/**
 * RealmListComponent draws the list of realms.
 */
class RealmListComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => !m.realms,
				factory: m => new RealmListPlaceholderList(),
			},
			{
				condition: m => m.realms?.length === 0,
				factory: m => new RealmListNoRealm(),
				hash: m => [ m.realms ],
			},
			{
				factory: m => new RealmListList(this.module, this.model, m.realms),
				hash: m => [ m.realms ],
			},
		]);
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
