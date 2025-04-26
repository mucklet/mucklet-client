import { ModelComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';

/**
 * EditorLayoutComponent renders the main app layout.
 */
class EditorLayoutComponent {

	constructor(module, model, user) {
		this.module = module;
		this.model = model;
		this.user = user;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.module.router.getModel(),
			new Fader(null, { className: 'editorlayout' }),
			(m, c) => {
				let routeComponent = m.route ? m.route.component : null;
				c.setComponent(routeComponent || null);
			},
		);
		let rel = this.elem.render(el);
		if (this.route) {
			this.module.router.setRoute(this.route);
		}
		return rel;
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default EditorLayoutComponent;
