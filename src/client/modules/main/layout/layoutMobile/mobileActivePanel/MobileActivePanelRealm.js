import ModelFader from 'components/ModelFader';

class ActivePanelRealm {
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [{
			condition: m => m.resources,
			factory: m => this.module.realmInfo.newRealmInfo(m.resources, { withSupporter: true }),
		}]);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default ActivePanelRealm;
