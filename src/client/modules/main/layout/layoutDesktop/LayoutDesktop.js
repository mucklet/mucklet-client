import { Elem } from 'modapp-base-component';
import Fader from 'components/Fader';
import './layoutDesktop.scss';

/**
 * LayoutDesktop draws the main layout wireframe for desktop (default).
 */
class LayoutDesktop {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'layout' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.elem = new Elem(n => (
			n.elem('div', { className: 'layoutdesktop' }, [
				n.elem('div', { className: 'layoutdesktop--container' }, [
					n.component('playerPanel', new Fader(null, { className: 'layoutdesktop--playerpanel' })),
					n.component('activePanel', new Fader(null, { className: 'layoutdesktop--activepanel' })),
				]),
			])
		));

		this.module.layout.setDefaultLayout(this.elem);
	}

	setNode(node, component) {
		this.elem.getNode(node).setComponent(component);
	}


	dispose() {
		this.module.layout.setDefaultLayout(null);
	}
}

export default LayoutDesktop;
