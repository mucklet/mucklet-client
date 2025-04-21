import ModelFader from 'components/ModelFader';
import EditScriptComponent from './EditScriptComponent';

class EditScriptContainer {

	/**
	 * Initializes an EditScriptContainer
	 * @param {import('./EditScript').default["module"]} module EditScript modules.
	 * @param {import('./EditScript').default["model"]} model EditScript model.
	 */
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [{
			condition: (m) => m.roomScript,
			factory: (m) => new EditScriptComponent(this.module, m.roomScript, m.source),
			hash: (m) => m.roomScript,
		}], {
			className: 'editscript-container',
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default EditScriptContainer;
