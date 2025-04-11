import { Elem, Txt } from 'modapp-base-component';
// import { ModelComponent } from 'modapp-resource-component';
// import Fader from 'components/Fader';

/**
 * ScriptEditorComponent renders the script editor.
 */
class ScriptEditorComponent {

	constructor(module, model, user) {
		this.module = module;
		this.model = model;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'scripteditor' }, [
			n.component(new Txt("Script editor")),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default ScriptEditorComponent;
